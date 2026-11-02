// One-off: generate brand-free head-covering product photos with YouCam text-to-image (1 unit each).
// Run: node --env-file=.env --import tsx scripts/products.mts
import fs from "node:fs/promises";
import path from "node:path";
import { CATALOG } from "../lib/catalog.ts";
import { run } from "../lib/youcam.ts";

const STYLE = "Studio product photo, single item centered, flat lay on plain warm off-white background, soft daylight, high detail, no person, no logo, no text.";
const PROMPTS: Record<string, string> = {
  s1: "A folded breathable cotton head wrap scarf in terracotta clay colour",
  s2: "A ready-to-wear soft bamboo jersey turban head covering in sage green",
  s3: "A pre-shaped silk-lined head wrap turban with a small botanical print in cream, rust and navy",
  s4: "A pre-tied stretch jersey chemo head wrap in charcoal grey",
  h1: "A soft ribbed knit beanie hat in oatmeal colour",
  h2: "A wide-brim cotton sun bucket hat in natural linen colour",
  c1: "A soft fitted cotton skull cap beanie in heather grey, thin and seamless",
  c2: "A plain unstructured six-panel baseball cap in navy cotton twill, no logo",
  c3: "A smooth silky durag head wrap in black with long tails",
  c4: "A classic wool tweed flat cap in brown herringbone",
};

for (const p of CATALOG.cover) {
  const out = path.join("public", p.ref);
  if (await fs.stat(out).catch(() => null)) continue;
  const img = (await run("product", {}, { prompt: `${PROMPTS[p.id]}. ${STYLE}`, negative_prompt: "person, face, mannequin, logo, brand, text, watermark" })) as Buffer;
  await fs.writeFile(out, img);
  console.log("wrote", out);
}
