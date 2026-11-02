import { converter, differenceCiede2000 } from "culori";
import { SHADES, type Tone } from "./catalog";

export type Colours = { skin_color: string; eyebrow_color: string; hair_color?: string; eye_color: string; lip_color: string };

const lch = converter("lch");
const dE = differenceCiede2000();
const CLOSE = 15;

// shortcut: undertone estimated from skin hue angle (YouCam does not return one); swap if a direct signal appears.
export function undertone(skinHex: string): Tone {
  const h = lch(skinHex)?.h ?? 55;
  return h > 62 ? "warm" : h < 48 ? "cool" : "neutral";
}

/** Three wig shades closest to the person's brows, each with the reasons it was picked.
 *  YouCam's hair_color is not used: it came back empty for people with hair and "Auburn" for a shaved head. */
export function pickShades(c: Colours) {
  const tone = undertone(c.skin_color);
  return SHADES.map((s) => {
    const brow = dE(s.hex, c.eyebrow_color);
    const toneFit = s.tone === tone || s.tone === "neutral";
    const why = [brow < CLOSE && "matches your brows", toneFit && `suits your ${tone} undertone`].filter(Boolean) as string[];
    return { ...s, why: why.length ? why : ["closest to your natural colouring"], score: brow - (toneFit ? 5 : 0) };
  })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}
