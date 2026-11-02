# SPEC: Crown, "Two weeks before"

GOAL:    a judge understands in 15 s why a wig must be seen on you before you buy, then watches Asha do it in the real app and remembers "her face, eight wigs, final sale avoided".
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps.
TIME:    156 s x 30 = 4680 frames. No music bed (no music source on this machine); bundled SFX on visible actions only.

LOOK:
- Two worlds. Portrait world: Asha's own photo full-bleed, its warm grey backdrop. App world: ground #cdd0ce (sampled from her cool grey backdrop, ~#c4c8c6), flat, no texture, no gradient.
- Ink #141414 on the ground, #f2f2f2 on photos. One accent, Crown blue #0090ff: one word per shot at most, the cursor, the end-card mark.
- Display: Inter 700, 76 px (7% of height), tracking -2.5%, max 6 words a line. Body/captions: Inter 500, 34 px, tracking -1%. Code names: JetBrains Mono 500, 28 px.
- Medium: the real Crown app (screens captured at 390 px, shown at 420 px wide = 1.077x) inside a phone: bezel #0a0a0a 14 px, radius 62 px, island pill 120 x 34 px, shadow 0 40 80 rgba(0,0,0,0.28). No grain, no vignette, no glow.
- Punch-ins are the same screenshot magnified 1.8x in a 28 px-radius panel with the same shadow.

OBJECTS: Asha (portrait), the phone with the real app, a big pointer cursor (60 px, blue fill, white 3 px edge), the eight YouCam results, the shortlist card with its "Final sale · previewed on you" badge, the Crown mark (Iconoir crown).

MOTION:
- Enter: expo.out 0.6 s (18 f). Move/camera: power2.inOut 0.5 s. Exit: power3.in 0.3 s (9 f).
- Titles: per-word blur 6 px -> 0 + opacity, 0.13 s, 0.07 s apart, no translate; then dead still.
- Cursor: enters from off-screen on power3.out 0.6 s, press = scale 0.86 for 3 f, the screen changes on the press frame + 1.
- Payoff montage: hard cuts every 1.6 s on identical framing (eyes locked).

SHOTS (seconds):
- 0-20 hook: Asha full-bleed. "Chemo starts in 14 days." (0.6-4.5) -> "Asha shaved her head early." (5-8.5) -> photo slides to the left half; on the ground: "A wig costs $200 to $3,000." (9.5-13) -> "Most are final sale." (13.5-16) -> "Picked in the weeks after diagnosis." (16.5-19.6). Key ticks on each line.
- 20-34 reveal: the portrait carries across into the phone screen as the app's home screen (carry across). "Crown" + "See the wig on you before you buy." Cursor taps "Choose a photo"; blur swap to the colours screen.
- 34-50 colours: phone left; punch-in right on the four swatches, then on the three shade picks. Captions: "YouCam reads her skin, brows, eyes and lips." / "Shades picked to match her brows." / "Masculine or feminine styles, detected from the photo."
- 50-80 wigs: phone right, wig grid scrolls; cursor taps "Maren French bob"; left: big before/after wipe (bare -> bob), then the Chestnut chip tap recolours it. Captions: "Her face. The wig's shape." / "Then the shade that suits her."
- 80-100 payoff: riser, impact, then all eight wigs full-bleed on her face, 1.6 s each, name + price lower-left. "Eight wigs. One selfie. No guessing."
- 100-126 wig-off + shortlist: colour flood of the ground; phone shows wig-off, cursor taps the sage turban; big result right. Then the shortlist screen, punch-in on the badge, share tap. Captions: "For the days without a wig." / "Final sale, but already seen on her." / "Sent to her sister before she buys."
- 126-146 claim + how: "Know it suits you before you pay." then the call flow drawn as one line: upload -> skin-tone-analysis + face-attr-analysis -> hair-transfer -> hair-color -> hat -> task/delete, each label landing as the line reaches it; last: "Photo deleted from YouCam when results are ready." and "Asha and the product photos: YouCam text-to-image."
- 146-156 end card: cursor clicks the Crown mark, blue fills it, wordmark wipes in; "Built on 7 YouCam APIs" holds 3 s.

BANNED: dark void ground; glow, particles, gradients; cream paper + serif + mono caps labels; three cards in a row; everything centred; fade-and-slide-up on every element; text moving while read; click rings; logo docked in a corner; invented UI (every screen is a real capture).

QA: 2.0 (first title readable), 15.0 (fact line), 26 (phone with home screen), 42 (colours punch-in), 62 (before/after mid-wipe), 70 (chestnut), 88 (payoff wig 3), 110 (turban), 120 (badge), 138 (call flow mid-draw), 152 (end card).
