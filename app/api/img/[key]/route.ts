import { fileTypeFromBuffer } from "file-type";
import { isKey, readImage } from "@/lib/youcam";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const img = isKey(key) ? await readImage(key).catch(() => null) : null;
  if (!img) return new Response("Not found", { status: 404 });
  const type = (await fileTypeFromBuffer(img))?.mime ?? "image/jpeg";
  return new Response(new Uint8Array(img), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
}
