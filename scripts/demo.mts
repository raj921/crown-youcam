// Pre-generate every look for the demo photo so the demo runs from cache with zero live units.
// Run with the dev server up: node --import tsx scripts/demo.mts
import fs from "node:fs/promises";
import { CATALOG } from "../lib/catalog.ts";
import { pickShades } from "../lib/shades.ts";

const BASE = "http://localhost:3000";
const post = async (path: string, body: FormData | object) => {
  const res = await fetch(BASE + path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path}: ${json.error}`);
  return json;
};

const photo = new Blob([await fs.readFile("public/demo.jpg")]);
const withPhoto = (fields: Record<string, string>) => {
  const form = new FormData();
  form.append("photo", photo, "demo.jpg");
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return form;
};
const { colours, fit = "f" } = await post("/api/selfie", withPhoto({}));
console.log("selfie", fit, colours);

const mine = (kind: keyof typeof CATALOG) => CATALOG[kind].filter((p) => !p.for || p.for === (fit ?? "f"));
for (const p of mine("wig")) console.log("wig", p.name, (await post("/api/look", withPhoto({ kind: "wig", productId: p.id }))).key);
const shaded = mine("wig").slice(1, 3); // two wigs shown with every recommended shade in the demo
for (const p of shaded) for (const s of pickShades(colours)) console.log("shade", p.name, s.name, (await post("/api/look", withPhoto({ kind: "wig", productId: p.id, shade: s.hex }))).key);
for (const p of mine("cover")) console.log("cover", p.name, (await post("/api/look", withPhoto({ kind: "cover", productId: p.id, fit: fit ?? "f" }))).key);
