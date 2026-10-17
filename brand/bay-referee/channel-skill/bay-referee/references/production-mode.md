# BAY REFEREE — Production Mode

Daily production means a usable publishing package with concise delivery, not another laboratory. Preserve the existing brand, football world, Engin voice, Whisper timing, referee avatar, captions, sound kit, watermark, sign-off and dubbing authorities. Motion Lab stays closed. Historical VAR/SAOT and backpass-1992 files stay untouched; do not migrate, rerender or copy them into a new episode.

## Trigger and input

Enter this mode when the user requests an actual full episode: “üret”, “videoyu hazırla”, “production yap”, “tam bölüm” or equivalent in an episode context. A skill invocation, a topic alone, script review, or a request to install/configure Production Mode does not authorize voice, cover generation or rendering.

Normal minimum input is a real **topic + canonical Turkish script**. Optional inputs are slug, hook and special notes. Infer routine choices without a questionnaire:

- Derive an absent hook from the canonical script's viewer question; do not add an unspoken claim or silently rewrite supplied canonical wording.
- Derive an absent slug as short lowercase ASCII words separated by hyphens. Transliterate Turkish letters; omit `.mp4`, spaces, slashes and punctuation. Examples: `backpass-1992`, `false-nine-vs-ten`, `bosman-rule`.
- If full production is explicitly requested with a real topic but no script, research and write the script within that scope, then save its canonical authority before speech generation. A topic-only request without full-production intent stays at its requested editorial/planning scope.
- Ask only for a genuinely missing essential input or a material factual/authority conflict. Literal placeholders are not a topic or canonical script.

Canonical text supplied by the user is the speech authority. Fact-check it before spending/rendering; resolve substantive inaccuracies or ambiguity without silently changing meaning. Routine slug, layout, hook selection and package choices need no separate approval. Covers are part of authorized full production, not a separate permission gate. Still honor current spending/upload authorization and provider requirements; do not treat the skill as unlimited credits or permission to publish.

## Episode root and safe initialization

All **new real publishing episodes** live in `videolar/<slug>/` under the project root. This overrides historical `brand/bay-referee/production/...` output examples. Existing historical files remain where they are. The episode directory never ends with `.mp4`.

From the project root:

```sh
node scripts/bay-referee-new-episode.mjs <slug>
```

The initializer creates directories and blank/text/JSON templates only. It does not create audio, video, cover pixels, transcripts or subtitles; planned files are not generated deliverables. Existing targets must fail without mutation. Do not bypass a collision with deletion, merge or `--force`. Use a distinct versioned slug such as `<slug>-v2` for a new iteration, or resume an existing episode only when the user has requested that existing work.

Portable setup: `node scripts/setup-bay-referee.mjs`; second-machine instructions: `docs/SECOND-MACHINE-SETUP.md`. Source assets and readiness are recorded by `config/bay-referee-portable-assets.json`; missing local sound sources are reported without generating or downloading them during an import-only smoke check.

Reusable runtime: `engine/bay-referee/production.mjs`. Reusable templates: `brand/bay-referee/production-template/`. The initializer is a packaging scaffold, not an automated topic-to-video renderer. Adapt reusable engine components to the new episode's states and paths; never run a fixed VAR/SAOT/backpass helper unchanged against its old output paths.

## Standard package

```text
videolar/<slug>/
  00_brief/
    topic.txt
    brief.md
    episode.json
  01_script/
    script-tr.txt
    script-en.txt
    script-es.txt
    claims-sources.json
  02_audio/
    tr/
      narration-tr.wav
      narration-tr.mp3
      whisper-tr.json
      word-map-tr.json
    en/
      narration-en.wav
      narration-en.mp3
      whisper-en.json
      word-map-en.json
    es/
      narration-es.wav
      narration-es.mp3
      whisper-es.json
      word-map-es.json
  03_video/
    <slug>-bay-referee-tr.mp4
  04_captions/
    captions-tr.srt
    captions-en.srt
    captions-es.srt
  05_cover/
    cover-reels-1080x1920.png
    cover-youtube-1280x720.png
    cover-title.txt
    cover-brief.md
  06_social/
    instagram-caption.txt
    hashtags.txt
    youtube-title.txt
    youtube-description.txt
    youtube-tags.txt
  07_assets/
    sources.md
    credits.txt
    asset-manifest.json
  08_delivery/
    delivery-summary.txt
    manifest.json
    qa-summary.txt
  _work/
```

Use `_work/` for raw provider outputs, requests/job records, rejected takes, alignment intermediates, motion plans, render code, frame sequences and detailed QA. Put the actual final files at the named public-facing package paths above, never only in `_work/`. Keep raw identity references outside any review server. Existing shared approved assets may remain referenced by the asset manifest; do not duplicate the entire asset library.

## Production sequence

Use [production-workflow.md](production-workflow.md) for research, authority and delivery quality, with these daily-package stages:

1. Define topic and viewer question.
2. Research and fact-check the actual claims; record sources and applicable dates.
3. Freeze the canonical Turkish script in `01_script/script-tr.txt`.
4. Produce the Turkish Engin take through the locked Higgsfield / ElevenLabs v4 preset; preserve job/settings/source evidence.
5. Run Whisper on the exact final Turkish WAV and map canonical words to measured spans.
6. Identify semantic beats.
7. Design inherited visual states.
8. Write the motion plan before rendering: **SCRIPT → FINAL VOICE → WHISPER → SEMANTIC BEATS → VISUAL STATES → MOTION PLAN**.
9. Build the Turkish master composition.
10. Integrate full-speech Turkish captions and restrained semantic editorial highlights.
11. Place meaningful SFX at actual motion events.
12. Apply BAY REFEREE host and quiet watermark/brand attribution.
13. Add the approved short sign-off after the payoff; no intro bumper.
14. Adapt the meaning into natural global English.
15. Adapt the meaning into natural broad/LatAm Spanish.
16. Produce English Engin narration, Whisper and word map.
17. Produce Spanish Engin narration, Whisper and word map.
18. Produce both required covers and their short title/brief.
19. Write the five social text files.
20. Complete internal technical and perceptual QA.
21. Finalize manifest and the two concise delivery/QA summaries.

Stages 9–13 belong to the same final composition/mix; do not deliver a bare render then treat captions, sound or branding as optional extras. The final master is `1080×1920`, `30 fps`, H.264/AAC MP4. Use [format-and-brand.md](format-and-brand.md), [motion-grammar.md](motion-grammar.md) and [engine-and-qa.md](engine-and-qa.md) as appropriate. V1.1 visible choreography remains the reference; V1.2 principles are conditional. Do not copy VAR/SAOT layout or micro-easing constants. The avatar directs the explanation through meaningful pointing, card, whistle or decision gestures when warranted; props are not mandatory decoration.

## Narration, captions and dubs

Use [voice-and-dubbing.md](voice-and-dubbing.md) for the actual preset, natural adaptation and timing discipline. The historical package filenames and fixed-topic helper commands in that reference are examples, not targets for this mode.

Deliver the final natural narration in WAV and MP3 for each language under `02_audio/<lang>/narration-<lang>.*`. Preserve narrator identity; never silently use a rejected engine or new clone. Each language's Whisper/word map must refer to its own final WAV/hash. Turkish burned captions cover all canonical speech in meaningful short chunks using the approved style and actual frame membership; `captions-tr.srt` reflects those final caption chunks. EN/ES SRTs use their own adapted canonical words and actual native timing.

One Turkish visual master is the default. EN/ES are alternate narration packages, not separately rendered videos. Measure concept alignment to the Turkish picture, not just total duration. No artificial time-stretch or fabricated word spans. Preserve natural-source timing; label any aligned derivative, document silence edits, and regenerate/derive the matching timing authority. Declare in the manifest whether each SRT is timed to its narration or an explicitly aligned derivative. `narration-*.wav/mp3` are narration-only; do not silently turn them into full mixed soundtracks. If a separately requested platform-ready mix is produced, give it distinct names and manifest records. A materially drifting dub is REVIEW_NEEDED, not silently approved.

## Required covers

Every real full-production episode includes **both** `cover-reels-1080x1920.png` and `cover-youtube-1280x720.png`. Recompose for each aspect ratio; a careless crop is not a finished second cover.

Use the approved BAY REFEREE color palette and typography family, one strong focal idea/object and the existing avatar when helpful. Write an accurate, curiosity-building **2–6 word** title in `cover-title.txt`; do not place a paragraph or a fabricated football event on the image. Keep high contrast, clean mobile hierarchy and few purposeful assets. No generic AI poster, tiny explanatory text, unnecessary glow, five competing objects or emoji clutter.

Record title, focal object, asset roles, typography/palette and crop intent in `cover-brief.md`. On the vertical cover keep the title/face/focal object meaningful inside the **centered approximately 4:5 crop** as well as the full 9:16 canvas. At 1080×1920 that check is the centered 1080×1350 region; it is a design check, not a claim that every platform always uses that crop. Keep critical text away from edges. Inspect both covers at mobile size and verify the crop before delivery. Cover generation may use approved local assets/composition or an authorized image tool; select it for the visual need, not to spend credits by default.

## Required social files

| File under `06_social/` | Content |
|---|---|
| `instagram-caption.txt` | Short, natural BAY REFEREE description. Do not spoil the whole answer in the first line; at most one brief CTA if useful. No corporate voice. |
| `hashtags.txt` | Usually 5–10 genuinely relevant hashtags for topic, football and the rule/history/tactic. No spam list. |
| `youtube-title.txt` | Clear topic and honest curiosity, preferably around 60 characters or fewer. Avoid exaggerated clickbait. |
| `youtube-description.txt` | 1–3 short paragraphs explaining the subject and needed context. Not a source dump. |
| `youtube-tags.txt` | Comma-separated relevant keywords only; no keyword stuffing. |

These are final publishable text at delivery. Empty scaffold files or template instructions do not count as completed social outputs.

## Sources, manifest and delivery

`07_assets/sources.md` records factual sources, real media/historical evidence and generated asset classes. `credits.txt` contains only genuinely required attribution (or a clear statement that none is required); carry any license-required placement through to the actual publishing copy. `asset-manifest.json` records role, source, rights, SHA-256 and resolvable local path. Do not invent permission or source URLs.

Use the reusable `manifest.schema.json` in the production template. `08_delivery/manifest.json` records episode, slug, status, generated_at; actual master/audio/SRT/cover/social file records; voice provider/engine/identity; video resolution/fps/measured duration; watermark/sign-off; claim/source counts; QA status and limitations. Planned records retain null hashes and are not evidence of generated media. Before READY, verify files exist, nonempty final text contains no scaffolding, hashes match, and required media passes its actual checks. Schema validation alone does not establish delivery completeness or media quality.

Keep `delivery-summary.txt` readable in about ten seconds: episode, TR master, EN/ES narration, covers, Instagram text, YouTube package and PASS/REVIEW_NEEDED. Keep `qa-summary.txt` to **research, voice, timing, captions, motion, SFX, cover, dub and decode** with PASS/WARNING/FAIL and a short reason for non-PASS. Setup templates use NOT_RUN, never fake PASS. Detailed measurements and screenshots belong in `_work/`.

## Internal QA and review policy

**Normal successful daily production creates no review website and opens no review server.** Do not create a dashboard merely to demonstrate that QA occurred. Still inspect research, final voice/timing, motion plan and real 1× playback, actual caption/host geometry, SFX/mix, complete decode, EN/ES alignment, and both covers' dimensions/mobile readability/crop. Use internal frame sequences, scripts, direct media playback and concise evidence records. Do not weaken quality checks because the delivery is concise, and do not claim listening if audio was not auditioned.

Create only a minimal review artifact when a meaningful human decision, new-system test, serious visual ambiguity or timing/dub problem needs it, or the user explicitly requests review. Explain the unresolved point and show the relevant evidence. A routine recoverable failure does not require a public site; keep actionable diagnostics in `_work/`. Any review is local by default. External publishing is a separate authorized action.

Finish with the final package paths and a short summary. Do not start another topic, render a multilingual visual redesign, reopen Motion Lab or keep producing after the requested delivery. For **Production Mode setup only**, validate scaffolding/skill with dummy data and stop at `BAY_REFEREE_PRODUCTION_MODE_READY`; no real episode, voice, cover, dub, research or social copy is produced.
