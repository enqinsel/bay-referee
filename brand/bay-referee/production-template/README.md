# Multilingual production contract — v2

The initializer creates only directories and text/JSON scaffolds. It validates
the v2 manifest before the first write and refuses existing episode paths.
Every artifact remains `PLANNED`; durations, hashes and review identities stay
unknown. The semantic review scaffold is an unanswered checklist, not evidence.

## Final upload files

| Output | Required files |
| --- | --- |
| Turkish visual master | `03_video/<slug>-bay-referee-tr.mp4` |
| English upload dub | `02_audio/en/youtube-dub-en.wav`, `youtube-dub-en.mp3` |
| Spanish upload dub | `02_audio/es/youtube-dub-es.wav`, `youtube-dub-es.mp3` |
| Language captions | `04_captions/captions-tr.srt`, `captions-en.srt`, `captions-es.srt` |
| Covers | `05_cover/cover-tr-1080x1920.png`, `cover-en-1080x1920.png`, `cover-es-1080x1920.png` |
| Social text | `06_social/title-{tr,en,es}.txt`, `description-{tr,en,es}.txt`, `hashtags-{tr,en,es}.txt`, one multilingual `youtube-tags.txt` |

Both formats of both final dubs begin at t=0 and span the full final master,
including its closure, within ±0.05 seconds. Measure the actual master and each
actual audio file; a duration written in the manifest is not timing authority.
Preserve or insert silence. No automatic trimming of beginning, middle or ending
silence, speed change or time stretching is allowed. Deliberate edits at quiet
boundaries and adapted pauses require verified speech preservation and updated
timing. Equal durations do not establish semantic or cumulative synchronization.

Retain `narration-{en,es}.wav/.mp3`, `whisper-{en,es}.json` and
`word-map-{en,es}.json` as **internal native source material**. The final upload
SRT authority is the exact final `youtube-dub-<lang>.wav` plus
`youtube-dub-word-map-<lang>.json`, with `youtube-dub-alignment-<lang>.json`
documenting the transformation and its hashes. Never overwrite raw native
timestamps or label native timing as final upload timing. Turkish captions
continue to follow the final native Turkish narration.

## Covers and public text

All three covers use the same artwork and layout; only the localized title
changes. Keep the title, face and focal object completely inside the central
1080×1350 area at y=285–1635. Inspect this crop for every language. Record the
three approved native titles in `05_cover/cover-title.txt` using TR/EN/ES labels.

Each language has one public description shared by Instagram and YouTube.
Use a strong opening, natural topic keywords and fluent native phrasing. Avoid
keyword stuffing, misleading promises, source names, URLs and bibliographies.
Keep research and attribution in the internal claims/sources/credits files.
Public descriptions are not substitutes for internal research records.

## Evidence and READY

The manifest explicitly separates final dub formats, their duration measurements,
t=0 timeline policy, native source paths, aligned caption authority and QA gates.
The following hash-bound input evidence is required before delivery QA:

- Each `youtube-dub-alignment-<lang>.json` identifies `schema_version: 1`,
  `kind: youtube_dub_alignment`, its `language`, `master_sha256`, `wav_sha256`,
  `mp3_sha256`, `timeline_start_seconds: 0`,
  `full_master_including_closure: true`, `time_stretched: false`,
  `speed_factor: 1`, `auto_trimmed: false`,
  `silence_policy: preserve_or_insert`, and reviewed `status: PASS`.
- `08_delivery/semantic-sync.json` records the master hash and, for EN and ES,
  both final audio hashes, `meaning_preserved`, `clause_order_preserved`,
  `cumulative_sync_reviewed`, `closure_covered`, `status`, `reviewed_by` and
  `reviewed_at`. Only an actual review may set these claims true/PASS.
  `semantic-sync.schema.json` describes the evidence structure.

Run `node scripts/bay-referee-delivery-qa.mjs videolar/<slug>` for a read-only
JSON report; append `--output` to save `08_delivery/qa-report.json`. The report
must verify `DUB_DURATION_GATE`, `TIMELINE_GATE`, `AUDIO_POLICY_GATE`,
`SEMANTIC_GATE`, `REQUIRED_FILES_GATE` and `FILE_INTEGRITY_GATE` against actual
files. The previous report is not an input prerequisite for the first QA run.

A runtime report PASS and a manifest READY are separate steps. After successful
QA and the remaining editorial/visual/audio reviews, register the generated
report's actual size and SHA-256 in the manifest, copy measured durations and
verified gate results, and record the report in `qa.evidence_paths`. Only then
may the manifest become READY. No command here automatically promotes a
manifest. READY schema validation requires every required artifact, including
all language and audio-format variants and the report, to be generated with
integrity metadata, every gate PASS, and all caption authorities aligned.
Any later change to media or evidence invalidates the affected hashes and
requires new QA. Schema validation alone cannot establish media or editorial
correctness.
