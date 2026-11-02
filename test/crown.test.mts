import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

process.chdir(await fs.mkdtemp(path.join(os.tmpdir(), "crown-"))); // cache/ lands in a temp dir
const yc = await import("../lib/youcam.ts");
const { pickShades } = await import("../lib/shades.ts");
const { POST: lookPOST } = await import("../app/api/look/route.ts");

const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010806000000" +
    "1f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a4c80000000049454e44ae426082",
  "hex",
);

/** A multipart try-on request, the way the shop sends it (photo + fields). */
function lookReq(fields: Record<string, string>, photo: Buffer = PNG) {
  const form = new FormData();
  form.append("photo", new Blob([new Uint8Array(photo)]), "selfie.png");
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return new Request("http://x/api/look", { method: "POST", body: form });
}

/** Replace fetch with a queue of JSON replies; returns the list of called URLs. */
function stubFetch(...replies: object[]) {
  const calls: string[] = [];
  globalThis.fetch = (async (url: string) => {
    calls.push(String(url));
    return Response.json(replies.shift() ?? {});
  }) as typeof fetch;
  return calls;
}

test("upload validator: real PNG passes, text and oversize fail", async () => {
  assert.equal(await yc.imageType(PNG), "image/png");
  await assert.rejects(yc.imageType(Buffer.from("not an image")), yc.YouCamError);
  await assert.rejects(yc.imageType(Buffer.concat([PNG, Buffer.alloc(8 * 1024 * 1024)])), yc.YouCamError);
});

test("poller waits through running, returns results on success", async () => {
  const calls = stubFetch({ data: { task_status: "running" } }, { data: { task_status: "success", results: { url: "u" } } });
  assert.deepEqual(await yc.poll("v2.0/task/scarf", "t1", 0), { url: "u" });
  assert.equal(calls.length, 2);
  assert.match(calls[0], /\/s2s\/v2\.0\/task\/scarf\/t1$/);
});

test("poller turns a YouCam error into plain words", async () => {
  stubFetch({ data: { task_status: "error", error: "error_no_face" } });
  await assert.rejects(yc.poll("p", "t", 0), /couldn't find a face/);
});

test("cache: racing requests pay once, later requests read disk", async () => {
  let made = 0;
  const make = async () => (made++, Buffer.from("img"));
  stubFetch({ results: [{ amount_dec: 400 }] });
  const key = yc.keyOf("selfie", "wig", "w1");
  await Promise.all([yc.cached(key, make), yc.cached(key, make)]);
  const calls = stubFetch();
  assert.deepEqual(await yc.cached(key, make), Buffer.from("img"));
  assert.equal(made, 1);
  assert.equal(calls.length, 0);
});

test("cache: live calls stop below 150 credits", async () => {
  stubFetch({ results: [{ amount_dec: 100 }, { amount_dec: 20 }] });
  await assert.rejects(yc.cached(yc.keyOf("new"), async () => ({})), /paused/);
});

test("cache key: same parts same key, any change differs", () => {
  assert.equal(yc.keyOf("a", "b"), yc.keyOf("a", "b"));
  assert.notEqual(yc.keyOf("a", "b"), yc.keyOf("ab", ""));
});

test("shade picks: dark brown brows get Espresso with a brow reason", () => {
  const [top] = pickShades({ skin_color: "#c69878", eyebrow_color: "#3a2a21", hair_color: "#42280E", eye_color: "#5a3a20", lip_color: "#b5605a" });
  assert.equal(top.name, "Espresso");
  assert.ok(top.why.includes("matches your brows"));
});

test("look route: prototype keys like 'constructor' are a 400, not a crash", async () => {
  const res = await lookPOST(lookReq({ kind: "constructor", productId: "w1" }));
  assert.equal(res.status, 400);
});

test("shade picks: missing hair_color (YouCam omits it sometimes) still ranks by brows", () => {
  const picks = pickShades({ skin_color: "#ba9478", eyebrow_color: "#5b3f32", eye_color: "#5f3e2f", lip_color: "#d0847c" });
  assert.ok(picks.every((p) => Number.isFinite(p.score)));
  assert.ok(picks[0].why.includes("matches your brows"));
  assert.ok(!picks.some((p) => p.why.includes("close to your own hair")));
});

test("look route: an unknown style set is a 400", async () => {
  const res = await lookPOST(lookReq({ kind: "cover", productId: "h1", fit: "x" }));
  assert.equal(res.status, 400);
});

test("shade picks: never claim 'your own hair' (YouCam returned Auburn for a shaved head)", () => {
  const picks = pickShades({ skin_color: "#a88061", eyebrow_color: "#805d47", hair_color: "#B56637", eye_color: "#1f1810", lip_color: "#c48f8a" });
  assert.ok(!picks.some((p) => p.why.includes("close to your own hair")));
});

test("look route: a valid request with a non-image 'photo' is a 400 before any YouCam call", async () => {
  const calls = stubFetch();
  const res = await lookPOST(lookReq({ kind: "wig", productId: "w1" }, Buffer.from("not an image")));
  assert.equal(res.status, 400);
  assert.equal(calls.length, 0);
});
