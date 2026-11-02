import fs from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import path from "node:path";
import { CATALOG, SHADES, type Fit } from "@/lib/catalog";
import { YouCamError, cached, fail, imageType, keyOf, readImage, run } from "@/lib/youcam";

type Kind = keyof typeof CATALOG;
export const maxDuration = 60;

/** Returns the cache key of the look. A shaded wig recolours the cached plain wig, so each costs one call.
 *  Head coverings are fitted per style set (YouCam's hat task takes a gender), so that set is part of their key. */
async function look(selfie: Buffer, id: string, kind: Kind, productId: string, shade = "", fit: Fit = "f"): Promise<string> {
  const key = keyOf(id, kind, productId, shade, ...(kind === "cover" ? [fit] : []));
  await cached(key, async () => {
    if (shade) return run("shade", { src: await readImage(await look(selfie, id, kind, productId)) }, { palettes: [{ color: shade, color_intensity: 80 }] });
    const ref = CATALOG[kind].find((p) => p.id === productId)!.ref;
    return kind === "wig"
      ? run("wig", { src: selfie }, { template_id: ref })
      : run("cover", { src: selfie, ref: await fs.readFile(path.join(process.cwd(), "public", ref)) }, { gender: fit === "m" ? "male" : "female" });
  });
  return key;
}

export async function POST(req: Request) {
  try {
    // Stateless: the selfie travels with every request (serverless instances share no disk), and its hash is the id.
    const form = await req.formData();
    const [kind, productId, shade, fit] = ["kind", "productId", "shade", "fit"].map((k) => (form.get(k) as string | null) ?? undefined);
    const valid =
      kind !== undefined &&
      Object.hasOwn(CATALOG, kind) &&
      CATALOG[kind as Kind].some((p) => p.id === productId && p.ref) &&
      (shade === undefined || (kind === "wig" && SHADES.some((s) => s.hex === shade))) &&
      (fit === undefined || fit === "f" || fit === "m");
    if (!valid) throw new YouCamError("invalid_request");
    const photo = form.get("photo");
    if (!(photo instanceof File)) throw new YouCamError("bad_image");
    const selfie = Buffer.from(await photo.arrayBuffer());
    await imageType(selfie);
    const key = await look(selfie, keyOf(selfie), kind as Kind, productId!, shade, fit as Fit | undefined);
    // The image goes back in the response: on Vercel another route's instance can't read this one's /tmp.
    const img = await readImage(key);
    const type = (await fileTypeFromBuffer(img))?.mime ?? "image/jpeg";
    return Response.json({ key, src: `data:${type};base64,${img.toString("base64")}` });
  } catch (e) {
    return fail(e);
  }
}
