import { YouCamError, cached, fail, imageType, keyOf, run } from "@/lib/youcam";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const photo = (await req.formData()).get("photo");
    if (!(photo instanceof File)) throw new YouCamError("bad_image");
    const buf = Buffer.from(await photo.arrayBuffer());
    await imageType(buf);
    const id = keyOf(buf);
    // Gender only pre-selects a style set the person can change, so a failed detection must not block the upload.
    const [tone, face] = await Promise.all([
      cached(keyOf(id, "tone"), () => run("tone", { src: buf })) as Promise<{ color: object }>,
      (cached(keyOf(id, "face"), () => run("face", { src: buf })) as Promise<{ agegender?: { gender?: string } }>).catch(() => null),
    ]);
    const gender = face?.agegender?.gender;
    return Response.json({ colours: tone.color, fit: gender === "male" ? "m" : gender === "female" ? "f" : null });
  } catch (e) {
    return fail(e);
  }
}
