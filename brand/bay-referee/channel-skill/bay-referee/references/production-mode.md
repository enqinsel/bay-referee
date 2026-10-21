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
      youtube-dub-en.wav
      youtube-dub-en.mp3
      youtube-dub-alignment-en.json
      youtube-dub-word-map-en.json
      narration-en.wav
      narration-en.mp3
      whisper-en.json
      word-map-en.json
    es/
      youtube-dub-es.wav
      youtube-dub-es.mp3
      youtube-dub-alignment-es.json
      youtube-dub-word-map-es.json
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
    cover-tr-1080x1920.png
    cover-en-1080x1920.png
    cover-es-1080x1920.png
    cover-title.txt
    cover-brief.md
  06_social/
    title-tr.txt
    title-en.txt
    title-es.txt
    description-tr.txt
    description-en.txt
    description-es.txt
    hashtags-tr.txt
    hashtags-en.txt
    hashtags-es.txt
    youtube-tags.txt
  07_assets/
    sources.md
    credits.txt
    asset-manifest.json
  08_delivery/
    delivery-summary.txt
    manifest.json
    qa-summary.txt
    qa-report.json
    semantic-sync.json
  _work/
```

The minimum publishing contract is the TR master and narration; final EN/ES `youtube-dub` WAV/MP3 files; TR/EN/ES SRTs matched to final audio; all three covers and each language's title/description/hashtags; the shared YouTube tags; and credits, internal research/provenance, manifest and QA. EN/ES `narration-*`, native Whisper and word maps are retained **internal sources**, not substitutes for final YouTube dubs. The manifest must distinguish those roles and bind each final SRT to the correct final audio hash and timing authority.

Use `_work/` for raw provider outputs, requests/job records, rejected takes, alignment intermediates, motion plans, render code, frame sequences and detailed QA. Put actual final upload files at the named package paths above, never only in `_work/`. Keep internal research, source narration, licensed library raws and identity references out of automatic publication/review exposure. Existing shared approved assets may remain referenced by the asset manifest; do not duplicate the entire asset library.

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
11. Complete **SFX AUDIT REQUIRED**: record every semantic/motion event's named SFX or reasoned NONE, then place meaningful effects at the actual event times.
12. Apply BAY REFEREE host and quiet watermark/brand attribution.
13. Add the approved short sign-off after the payoff; no intro bumper.
14. Adapt the meaning into natural global English.
15. Adapt the meaning into natural broad/LatAm Spanish.
16. Produce and preserve English Engin narration, native Whisper and word map; build the final full-duration YouTube dub and matching SRT.
17. Produce and preserve Spanish Engin narration, native Whisper and word map; build the final full-duration YouTube dub and matching SRT.
18. Produce the three localized covers from one shared art/layout and record their text/brief.
19. Write each language's title, shared-platform description and hashtags, plus one balanced multilingual YouTube tag list.
20. Complete internal technical/perceptual QA and the mandatory `DUB_DURATION_GATE`.
21. Finalize manifest, `qa-report.json` and the two concise delivery/QA summaries.

Stages 9–13 belong to the same final composition/mix; do not deliver a bare render then treat captions, sound or branding as optional extras. The final master is `1080×1920`, `30 fps`, H.264/AAC MP4. Use [format-and-brand.md](format-and-brand.md), [motion-grammar.md](motion-grammar.md) and [engine-and-qa.md](engine-and-qa.md) as appropriate. V1.1 visible choreography remains the reference; V1.2 principles are conditional. Do not copy VAR/SAOT layout or micro-easing constants. The avatar directs the explanation through meaningful pointing, card, whistle or decision gestures when warranted; props are not mandatory decoration.

## Narration, captions and dubs

Use [voice-and-dubbing.md](voice-and-dubbing.md) for the actual preset, natural adaptation and timing discipline. The historical package filenames and fixed-topic helper commands in that reference are examples, not targets for this mode.

Preserve narrator identity; never silently use a rejected engine or new clone. Keep the approved natural take in `02_audio/<lang>/narration-<lang>.wav/.mp3`, with its own raw Whisper, word map and hashes. Turkish burned captions cover all canonical speech in meaningful short chunks using the approved style and actual frame membership; `captions-tr.srt` reflects the final master caption chunks.

Every new full-production episode requires `02_audio/en/youtube-dub-en.wav` and `.mp3`, and `02_audio/es/youtube-dub-es.wav` and `.mp3`. These are the **final alternate soundtracks** for the one Turkish visual master, not narration-only exports or separately rendered EN/ES videos. Each starts at the master's t=0 and spans its full measured duration, including the closing sign-off and approved three-whistle closure. Keep required shared event SFX in the alternate mix; replace the Turkish soundtrack with it rather than layering both or adding a second whistle.

Preserve or intentionally insert silence at the beginning, between clauses and at the end. Do not automatically trim leading/trailing silence or export only the spoken portion. Adapt translated phrasing and natural pauses to the picture. No time-stretch, arbitrary speed-up/slow-down, pitch changes or fabricated word spans. Any move of intact speech across a measured quiet boundary needs recorded cuts/offsets and verified speech preservation. Regenerate a natural take within the user's authorization if translation/pause adaptation cannot fit.

`captions-en.srt` and `captions-es.srt` must follow the **final `youtube-dub` audio timeline**, including intentional silence offsets. Preserve native source timing separately. Derive final word timing from verified edits or transcribe the exact final audio; record `02_audio/<lang>/youtube-dub-alignment-<lang>.json` and `youtube-dub-word-map-<lang>.json`. Bind final audio, mapping/alignment and native-source evidence in the manifest's `youtube_dub_aligned` authority. Matching total duration alone does not establish semantic alignment: check each concept's start/end, key visual events and cumulative drift; retain this separate hash-bound evidence in `08_delivery/semantic-sync.json`. A materially drifting dub stays REVIEW_NEEDED even if its duration gate passes.

Before delivery, run:

```sh
node scripts/bay-referee-delivery-qa.mjs <episode-path> --output
```

Retain `08_delivery/qa-report.json`. **`DUB_DURATION_GATE`** uses ffprobe on the actual final TR video and **each of the four final EN/ES WAV/MP3 files**. For every file require `abs(audio_duration - final_video_duration) <= 0.05` seconds. Measure the final encoded MP3 too; a WAV-only duration check is insufficient. Missing files, missing measurements or a difference above 0.05 s fail the gate and block READY. Report semantic/cumulative alignment, SRT authority, audible mix and human listening separately; this numeric gate cannot pass them.

The QA command without `--output` is a read-only stdout check; `--output` writes a fresh fixed `08_delivery/qa-report.json` independently of the previous report. Neither mode generates or repairs media. The report's PASS covers its automated delivery gates, not human listening, same-art/crop judgment or copy quality. Use the finalization order below to bind the stored report without a self-hash loop.

## Required covers

Every new full-production episode includes **three 1080×1920 covers**: `cover-tr-1080x1920.png`, `cover-en-1080x1920.png` and `cover-es-1080x1920.png`. They use exactly the same background/art, avatar, object positions, layout and colors. Localize only the text; adapt line breaks and typography within the shared text area for natural fit. Do not regenerate or recompose the art separately by language. This replaces the older two-aspect/platform-cover default for new episodes; preserve historical outputs.

Use the approved BAY REFEREE palette and type family, one strong focal idea/object and the existing avatar when helpful. Write an accurate, curiosity-building short title in natural TR/EN/ES, typically 2–6 words; record all three versions in `cover-title.txt`. Do not place a paragraph or fabricated football event on the image. Keep high contrast, clean mobile hierarchy and few purposeful assets. No generic AI poster, tiny explanatory text, unnecessary glow, five competing objects or emoji clutter.

Record localized title text, shared focal object/assets, typography/palette and crop intent in `cover-brief.md`. Critical title, face and focal objects must fit the **centered 1080×1350 region at y=285..1635** within each 1080×1920 image. This is the required safety check, not a promise about every platform's crop. Inspect all three at mobile size and verify the shared-art layout and central crop before delivery. Compose with approved local assets or an authorized image tool when useful; any new common artwork is created once and reused across languages.

## Required social files

| File under `06_social/` | Content |
|---|---|
| `title-tr.txt`, `title-en.txt`, `title-es.txt` | Accurate, curiosity-building title in each language's natural search phrasing, preferably around 60 characters or fewer. No misleading clickbait. |
| `description-tr.txt`, `description-en.txt`, `description-es.txt` | One short description per language, shared across platforms. Make the first 1–2 sentences strong, natural and topic-specific; use relevant keywords in normal prose. No source URLs, source names or bibliography. |
| `hashtags-tr.txt`, `hashtags-en.txt`, `hashtags-es.txt` | Usually 5–10 relevant topic/football/rule/history/tactic hashtags suited to that language. No spam list. |
| `youtube-tags.txt` | One comma-separated, balanced TR + EN + ES list of relevant terms. Use natural language-specific search variants; no stuffing or misleading unrelated terms. |

Titles and descriptions should earn curiosity without promising an unsupported event or claim. Adapt search language rather than copying a literal translation or stacking every keyword. Keep descriptions concise, conversational and useful; at most one brief CTA when it serves the episode. Do not create separate Instagram/YouTube descriptions for a language. Factual references belong in `01_script/claims-sources.json` and `07_assets/sources.md`, not public descriptions. Empty scaffolds or template instructions do not count as final copy.

## Sources, manifest and delivery

`07_assets/sources.md` records internal factual sources, real media/historical evidence and generated asset classes. `credits.txt` contains only genuinely required attribution (or a clear statement that none is required); honor license-required placement through a compatible credit surface without turning public descriptions into source lists. Select compatible assets if their required credit terms conflict with the user's description rule; never silently omit a required credit. `asset-manifest.json` records role, source, rights, SHA-256 and resolvable local path. Do not invent permission or source URLs.

Use the reusable `manifest.schema.json` in the production template. `08_delivery/manifest.json` records episode, slug, status, generated_at; actual master/audio/SRT/cover/social file records; voice provider/engine/identity; video resolution/fps/measured duration; watermark/sign-off; claim/source counts; QA status and limitations. Planned records retain null hashes and are not evidence of generated media. Before READY, verify files exist, nonempty final text contains no scaffolding, hashes match, and required media passes its actual checks. Schema validation alone does not establish delivery completeness or media quality.

Finalize in two phases:

1. Finish the real input files and review evidence, including non-report metadata and summaries. Run `node scripts/bay-referee-delivery-qa.mjs <episode-path> --output` to generate a fresh report from those exact files. The previous report is not an input. Resolve a failed gate before claiming READY.
2. Record the new report's actual hash, bytes and generated status in the manifest. Record the other real QA results; only mark READY when all required checks, including separate editorial/perceptual review, justify it. Then run `node scripts/bay-referee-delivery-qa.mjs <episode-path>` without `--output`. For READY this final read-only check requires the stored report, its matching manifest hash/bytes, PASS status/gates and an exact current input-hash set.

After phase 1, change only the manifest's final report/QA/status records. If any hashed input changes — including `episode.json`, brief, summaries, SRT, audio, cover or social copy — repeat phase 1 and register the replacement report before the final read-only check. Rewriting a report does not automatically update its manifest hash or promote an episode to READY.

Keep `delivery-summary.txt` readable in about ten seconds: episode, TR master/narration, final EN/ES YouTube dubs, matched SRTs, three covers, three-language social package and PASS/REVIEW_NEEDED. Keep `qa-summary.txt` to **research, voice, timing, captions, motion, SFX, cover, dub, DUB_DURATION_GATE and decode** with PASS/WARNING/FAIL and a short reason for non-PASS. Retain the machine-readable `08_delivery/qa-report.json` with measured duration evidence; setup templates use NOT_RUN, never fake PASS. Detailed frame sequences and other measurements belong in `_work/`.

## Internal QA and review policy

**Normal successful daily production creates no review website and opens no review server.** Do not create a dashboard merely to demonstrate that QA occurred. Still inspect research, final voice/timing, motion plan and real 1× playback, actual caption/host geometry, SFX event audit and audible final mix, complete decode, DUB_DURATION_GATE plus semantic/cumulative EN/ES alignment, and all three covers' shared artwork/dimensions/mobile readability/crop. Use internal frame sequences, scripts, direct media playback and concise evidence records. Do not weaken quality checks because the delivery is concise, and do not claim listening if audio was not auditioned.

The CLI can check actual PNG dimensions, required files/hashes, audio timeline/duration, final caption-audio authority and source-URL/scaffold errors. It does not establish that all three covers use identical art, that their critical content fits the central crop, that descriptions contain no source-name attribution in ordinary prose, or that localized SEO copy is natural. Inspect those separately and retain evidence; automated PASS cannot stand in for them.

Create only a minimal review artifact when a meaningful human decision, new-system test, serious visual ambiguity or timing/dub problem needs it, or the user explicitly requests review. Explain the unresolved point and show the relevant evidence. A routine recoverable failure does not require a public site; keep actionable diagnostics in `_work/`. Any review is local by default. External publishing is a separate authorized action.

Finish with the final package paths and a short summary. Do not start another topic, render a multilingual visual redesign, reopen Motion Lab or keep producing after the requested delivery. For **Production Mode setup only**, validate scaffolding/skill with dummy data and stop at `BAY_REFEREE_PRODUCTION_MODE_READY`; no real episode, voice, cover, dub, research or social copy is produced.
