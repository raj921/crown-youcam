# Devpost submission

**Name:** Crown

**Tagline (≤200):** See the wig on you before you buy: wig, headscarf and cap try-on from one selfie, for people starting chemotherapy.

**Links:** live app https://crown-youcam.vercel.app · code https://github.com/raj921/crown-youcam · video https://youtu.be/XwVJW7QMd6s

**Built with:** youcam-api, next.js, react, typescript, tailwindcss, shadcn-ui, vercel, node.js

---

## Inspiration
People starting chemotherapy are told to choose a wig before their hair goes, while there is still hair to match. That is exactly the hard part: a wig costs hundreds to thousands of dollars, most are final sale for hygiene reasons, and the choice happens in the weeks after a diagnosis. Today it is a guess from a mannequin photo or a trip to a fitting. A virtual try-on is not a gimmick for this buyer; it is the only safe way to see the purchase before committing.

## What it does
From one selfie, Crown:
- reads skin, brow, eye and lip colour (YouCam skin-tone analysis) and pre-selects feminine or masculine styles (YouCam face-attribute analysis, changeable by the person);
- recommends three wig shades matched to the brows and undertone, each with its reason;
- puts 16 wigs (8 feminine, 8 masculine, including afro, locs and a silver taper) on the person's own face with YouCam hair transfer, with a before/after slider, and recolours them with YouCam hair color;
- shows turbans, wraps and caps for wig-off days with the YouCam hat task;
- keeps a shortlist marked "Final sale · previewed on you" that can be shared with family or a stylist.

A demo photo runs the whole flow from cached results, so judges see it working without spending API units.

## How we built it
Next.js 15 with two server routes (selfie, try-on) that wrap the YouCam S2S API: upload, run task, poll, save the result, then `task/delete` so the photo does not stay on YouCam. Results are cached by a hash of the photo, product and shade, so a look is never paid for twice, even when two requests race, and live calls stop when credit drops below 150 units. The try-on route is stateless (the photo travels with each request and the image comes back inline), which is what makes it work on Vercel's serverless functions. The product photos and the demo persona were generated with YouCam text-to-image, so the catalog has no third-party brands. UI: React 19, Tailwind v4, shadcn/ui, Spectrum UI components, a dark theme on the Interfere design system. 13 tests cover the upload validator, the poller, the cache, shade picks and route validation.

## Challenges we ran into
- The `scarf` task wraps the neck, so it cannot show a headscarf; every head covering uses the `hat` task instead.
- `hair-color` rejected `palettes` without `pattern: {name: "full"}`, although the spec marks it optional.
- `skin-tone-analysis` returned no `hair_color` for people with hair and "Auburn" for a shaved head, so shades are ranked by brows, the stylist's own rule, instead of a claim about the person's hair.
- On Vercel each route runs in its own instance, so a result saved by one route was a 404 in another; the try-on now returns the image itself.

## Accomplishments that we're proud of
Six YouCam AI APIs working together in one honest flow, mostly ones other entries skip (hair transfer, hair color, hat, face attributes), with real results on screen, a privacy delete after every task and equal choice for men and women.

## What we learned
How far hair transfer goes: it fully replaced long wavy hair with a pixie while leaving the face untouched, which is what makes a wig preview believable.

## What's next for Crown
Real wig retailers' catalogs with their own photos, saving the shortlist between visits, and a stylist view so a fitter can see the client's previewed picks before an appointment.
