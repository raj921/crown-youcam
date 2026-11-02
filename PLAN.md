# Crown — build plan

Try on your wig before chemo takes your hair.
Deadline: 2026-11-02 22:15 IST (submit by 21:00). Track: eCommerce VTO.

## Verified from the official S2S OpenAPI spec (not guessed)

Base `https://yce-api-01.makeupar.com`, header `Authorization: Bearer <key>`.

| Use | Endpoint | Body we send |
|---|---|---|
| Upload | `POST /s2s/v2.0/file/<feature>` → PUT bytes to `files[0].requests[0].url` | `{files:[{content_type,file_name,file_size}]}`, max 10 MB |
| Colours | `POST /s2s/v2.0/task/skin-tone-analysis` | `src_file_id, face_angle_strictness_level:"flexible"` |
| Wig shape | `POST /s2s/v2.1/task/hair-transfer` | `src_file_id, template_id, hair_color:"ref"` (or `ref_file_id`) |
| Wig catalog | `GET /s2s/v2.1/task/template/hair-transfer` | YouCam's own templates + thumbnails = no image rights problem |
| Wig shade | `POST /s2s/v2.0/task/hair-color` | `src_file_url` (the transfer result), `palettes:[{color:"#RRGGBB",color_intensity}]` |
| Scarf | `POST /s2s/v2.0/task/scarf` | `src_file_id, ref_file_id, gender, style` |
| Cap | `POST /s2s/v2.0/task/hat` | `src_file_id, ref_file_id, gender, style` |
| Poll | `GET /s2s/<ver>/task/<feature>/<task_id>` every 2 s | until `data.task_status` is `success`/`error`; result `data.results.url` |
| Privacy | `POST /s2s/v2.0/task/delete` | `{task_id}` after the result is cached |
| Budget | `GET /s2s/v1.0/client/credit`, `GET /s2s/v2.0/credit/feature-cost` | |

skin-tone-analysis returns skin, eye, lip, eyebrow **and current hair** colour (hex + name).
That powers the "matches your own hair / brows" reasons with real data.
Undertone is derived from the skin hex (warm/cool/neutral), and the UI labels it as derived.

## Stack (libraries, per brief)

- Server: Node + Express, `multer` (upload), `file-type` (magic bytes), `dotenv`. Key never leaves the server.
- Web: Vite + React + TypeScript + Tailwind v4, shadcn base + Spectrum UI components
  (Drop Files, Loading Button, Toast, Responsive Modal, Product Card, Status Badge, Skeleton, Share, Nothing Saved),
  `react-compare-slider` (before/after), `@radix-ui/colors` + Inter + a free serif (Interfere-style tokens), `lucide-react`.
- Tests: `node --test` for the cache key, poller (stubbed fetch) and upload validator.
- Deploy: one Render web service (`npm run build && npm start`).

## Screens

1. Selfie: Drop Files + camera capture, consent line, validation errors in plain words.
2. Your colours: swatches (skin, eyes, brows, lips, hair) + 3 wig shades with reasons.
3. Wig shop: 8 wigs (templates) with price, cap type, "non-returnable" badge → try on → before/after slider, shade chips.
4. Wig-off days: 4 scarves + 2 caps on the same selfie.
5. Shortlist: saved looks side by side, why picked, badge, download/share image.

## Unit budget (1,000)

- Cache by `sha256(selfie) + feature + productId + shade`; never call twice.
- Pre-generate the demo persona once and ship it in `demo/` so judges see it with zero units.
- Live calls stop below 150 credits → demo fallback.
- Exact unit costs read from `feature-cost` in the first test call.

## Order of work

1. You: claim units + create API key (see below). Me meanwhile: scaffold server, UI, tests with stubbed YouCam.
2. First real calls: tone, 1 hair-transfer template, 1 hair-color, 1 scarf, 1 hat. Check quality, read unit costs.
3. Wire everything, pre-generate the demo persona, deploy, phone test.
4. README + Devpost text; you record the video.

## Open risks

- `perfectcorp.com` (docs + console) times out on this network. The API host works.
- Hair-transfer on someone with long hair may keep their own hair; fallback is hair-style/hair-ext templates + hair-color.
- Scarf/hat need product photos as reference: use CC0/own photos, no brands.
- Demo persona selfie: must be you (with consent) or a properly licensed photo.
