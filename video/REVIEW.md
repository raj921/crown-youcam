# REVIEW: Crown, "Two weeks before"

## Creative calls
- Built storyline A (STORYLINES.md). Not built: B "Result first" and C "One frame that rebuilds".
- Persona "Asha" is generated with YouCam text-to-image (not a real person, so no likeness rights and no implied diagnosis of a real person). The film says so on the "How it works" screen.
- Every app screen is a real capture of Crown at 390 px (assets/screens), and every look is a real cached YouCam result (assets/looks). Punch-ins are the same screenshots magnified 1.8x.
- Voiceover: Kokoro `af_heart`, free and on device (VOICEOVER.md), one clip per scene, loudness-normalised to -16 LUFS / -1.5 dBTP. The voice adds to the titles, never reads them.
- No music bed: no music source on this machine (no HeyGen sign-in, no local model). Bundled SFX on visible actions, under the voice.
- Head coverings: the film shows the sage turban only; the cotton wrap and beanie results were poor (the wrap read as a cap, the beanie added hair).

## Measured vs looked at
- `check`: passes, no errors. Contrast fixed (text accent #0a58a5), API labels raised to the 28 px floor, SFX slots match their media.
- Looked at: QA frames, scene starts/mids, all 7 seams (continuous: the portrait and the bob photo hold position across cuts), phone sheet.
- Render measured: -18.1 LUFS integrated, -1.5 dBFS peak, voice present at every scene start, silence in the gaps. The sound was measured, not heard.

## Weakest shot
- 29-34 s ("One selfie."): the phone holds on the colours screen while two short lines read; a real upload progress state would be stronger.

## Warnings kept
- `dead_stretch` on reading holds: marked `data-hold`, deliberate.
- `duplicate_media_discovery_risk`: the same screenshot is used in the phone and in punch-in panels on purpose.
- `timeline_track_too_dense` (payoff): eight montage cuts belong together in one scene.
