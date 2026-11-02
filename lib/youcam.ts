import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";

const BASE = "https://yce-api-01.makeupar.com/s2s";
const MIN_CREDIT = 150;
const SHIPPED = path.join(process.cwd(), "cache"); // demo results committed with the app
// shortcut: Vercel's disk is read-only apart from per-instance /tmp, so live results only live as long as an instance; move to blob storage if traffic grows.
export const CACHE_DIR = process.env.VERCEL ? "/tmp/crown-cache" : SHIPPED;
const readCache = (name: string) => fs.readFile(path.join(CACHE_DIR, name)).catch(() => fs.readFile(path.join(SHIPPED, name)));

// Paths and fixed params from the S2S OpenAPI spec.
export const FEATURES = {
  tone: { path: "v2.0/task/skin-tone-analysis", extra: { face_angle_strictness_level: "flexible" } },
  face: { path: "v2.0/task/face-attr-analysis", extra: { face_angle_strictness_level: "flexible", features: ["gender"] } },
  wig: { path: "v2.1/task/hair-transfer", extra: { hair_color: "ref" } },
  shade: { path: "v2.0/task/hair-color", extra: { pattern: { name: "full" } } },
  // Headscarves and caps both use the hat task: the scarf task wraps the neck, not the head.
  cover: { path: "v2.0/task/hat", extra: { gender: "female", style: "style_warm_cozy" } },
  product: { path: "v2.0/task/text-to-image/youcam", extra: { model: "youcam-image-v2", size: "1328*1328", prompt_extend: false } },
} as const;
export type Feature = keyof typeof FEATURES;

const PLAIN: Record<string, string> = {
  error_no_face: "We couldn't find a face. Try a front-facing photo in good light.",
  error_pose: "Please face the camera straight on.",
  error_face_parsing: "Your face wasn't clear enough. Try brighter, even light.",
  exceed_max_filesize: "That photo is too large. Please use one under 8 MB.",
  error_nsfw_content_detected: "That photo can't be used. Please try another.",
  CreditInsufficiency: "Live try-on is paused right now. The demo still works.",
  paused: "Live try-on is paused right now. The demo still works.",
  bad_image: "Please upload a JPEG or PNG under 8 MB.",
  invalid_request: "That item isn't available to try on yet.",
};
export class YouCamError extends Error {
  constructor(public code: string, public detail?: string) {
    super(PLAIN[code] ?? "Something went wrong with the try-on. Please try again.");
  }
}

async function api(p: string, body?: object) {
  const res = await fetch(`${BASE}/${p}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${process.env.YOUCAM_API_KEY}`, "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new YouCamError(json.error_code ?? `http_${res.status}`, json.error);
  return json;
}

/** Trust boundary: real JPEG/PNG by magic bytes, under 8 MB. Returns the mime type. */
export async function imageType(buf: Buffer) {
  const t = await fileTypeFromBuffer(buf);
  if (!t || !["image/jpeg", "image/png"].includes(t.mime) || buf.length > 8 * 1024 * 1024) throw new YouCamError("bad_image");
  return t.mime;
}

async function upload(buf: Buffer) {
  const content_type = await imageType(buf);
  const { data } = await api("v2.0/file", { files: [{ content_type, file_name: "photo", file_size: buf.length }] });
  const { file_id, requests: [req] } = data.files[0];
  const { "Content-Length": _drop, ...headers } = req.headers; // fetch sets its own length
  const put = await fetch(req.url, { method: req.method ?? "PUT", headers, body: new Uint8Array(buf) });
  if (!put.ok) throw new YouCamError("error_upload");
  return file_id as string;
}

export async function poll(p: string, taskId: string, everyMs = 2000) {
  for (let i = 0; i < 90; i++) {
    const { data } = await api(`${p}/${taskId}`);
    if (data.task_status === "success") return data.results;
    if (data.task_status === "error") throw new YouCamError(data.error);
    await new Promise((r) => setTimeout(r, everyMs));
  }
  throw new YouCamError("timeout");
}

/** Upload images, run one task, wait, keep the result, then delete it from YouCam (privacy promise). */
export async function run(feature: Feature, images: { src?: Buffer; ref?: Buffer }, params: object = {}): Promise<Buffer | object> {
  const f = FEATURES[feature];
  const body: Record<string, unknown> = { ...f.extra, ...params };
  for (const [name, buf] of Object.entries(images)) if (buf) body[`${name}_file_id`] = await upload(buf);
  const { data } = await api(f.path, body);
  try {
    const results = await poll(f.path, data.task_id);
    if (!results?.url) return results;
    return Buffer.from(await (await fetch(results.url)).arrayBuffer());
  } finally {
    api("v2.0/task/delete", { task_id: data.task_id }).catch(() => {});
  }
}

export async function credit() {
  const { results } = await api("v1.0/client/credit");
  return (results as { amount_dec: number }[]).reduce((sum, r) => sum + r.amount_dec, 0);
}

export const keyOf = (...parts: (string | Buffer)[]) => {
  const h = createHash("sha256");
  for (const p of parts) h.update(p).update("|");
  return h.digest("hex").slice(0, 32);
};
export const readImage = (key: string) => readCache(`${key}.img`);

/** One JSON error shape for every route; YouCam codes become plain words. */
export function fail(e: unknown) {
  console.error(e instanceof YouCamError ? `youcam: ${e.code} ${e.detail ?? ""}` : e);
  const msg = e instanceof YouCamError ? e.message : "Something went wrong. Please try again.";
  return Response.json({ error: msg }, { status: e instanceof YouCamError ? 400 : 500 });
}

const inflight = new Map<string, Promise<unknown>>();
/** Disk cache: a key is never paid for twice, even when two requests race. */
export function cached<T extends Buffer | object>(key: string, make: () => Promise<T>): Promise<T> {
  const file = (ext: string) => path.join(CACHE_DIR, `${key}.${ext}`);
  const job = inflight.get(key) ?? (async () => {
    const hit = await readImage(key).catch(() => readCache(`${key}.json`).then((b) => JSON.parse(b.toString())).catch(() => null));
    if (hit) return hit;
    if ((await credit()) < MIN_CREDIT) throw new YouCamError("paused");
    const value = await make();
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(Buffer.isBuffer(value) ? file("img") : file("json"), Buffer.isBuffer(value) ? value : JSON.stringify(value));
    return value;
  })().finally(() => inflight.delete(key));
  inflight.set(key, job);
  return job as Promise<T>;
}
