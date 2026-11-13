# Voice and multilingual delivery

## Engin voice authority

`voice/decision.json` is the provider/identity lock. Current ID: `01c99385-4fe9-41e7-867f-f9bab00617db`, `voice_type: element`, name Engin. Provider wrapper Higgsfield; model `elevenlabs_v4`; stability `0.5`, similarity boost `0.75`, batch size `1`. Revalidate live model schema and voice availability when generating; this record is not proof that a remote schema remains unchanged. Do not replace the speaker or re-clone by default.

Use the Higgsfield connector, not undocumented endpoints or invented API credentials. Inspect available tools/model schema, estimate the exact requested jobs, submit within the current user's authorization, then retain job IDs and submitted parameters. Download the returned output for production; save the original before conversion. Record quoted credits separately from verified billing. Existing user authorization persists; a reusable skill alone does not authorize future spending or upload of private identity media.

For maintenance of the optional historical VAR/SAOT Turkish master only, reuse `voice/higgsfield/eleven-v4/var-saot/final/narration-final.wav`: SHA-256 `d5e169d294471fdd60389bce76a6a19529d14ad5021ae6aaed3ca7dff1c3fbed`, 48 kHz mono PCM24, 2,121,561 samples, 44.1991875 s. The Bay Referee TR copy is byte-identical. Do not regenerate or normalize an already approved take during branding work.

## Local memory safety

Follow [resource-safety.md](resource-safety.md): Whisper TR, EN and ES run one
after another under the shared cross-session heavy-job lock. No concurrent
FFmpeg, render or model job. Keep Whisper medium and all audio/timing standards.

## Translation and timing

For the local talking host, run `scripts/bay-referee-mouth-cues.py` once per language on that language’s clean speech aligned to the final picture from time zero. Pass the full frame count, including closure. The helper acquires the shared heavy-job lock and writes the Rhubarb mouth cues alongside the source and analysis hashes. Use `engine/bay-referee/rhubarb_host.py` with the corresponding cues and the approved raster poses. The “Local Rhubarb narrator” section in `docs/SECOND-MACHINE-SETUP.md` covers installation and usage.

English is global/neutral; Spanish is broad international/LatAm. Preserve the canonical Turkish claims, qualifications, conclusion and order while choosing natural spoken phrasing. This is meaning-preserving adaptation, not literal token replacement. Build the concept map from the current episode's canonical clauses and visual states; the historical VAR/SAOT example happened to have twelve paragraphs, not a universal count.

Generate a natural take first. Whisper must process that exact final WAV with `language: en` or `es` and word timestamps. Raw ASR text is evidence, not the script authority. Map canonical target-language text to actual native spans; preserve spelling/acronym discrepancies and unmatched tokens. Do not inherit aliases or timings from another language/take. Missing words do not get interpolated spans.

Compare concept-start/end drift to the Turkish picture, cumulative drift across successive clauses and the actual timing of key visual events. Overall equal duration is not sufficient: a spoken kick, line or decision must land within its relevant visual window when that event exists in the story. Preserve pauses that let the audience read or understand. Naturalness is not established by ASR coverage. Listen separately for identity, acronym pronunciation, accent, silence pacing and unnatural joins.

No time-stretch, arbitrary speed changes, time compression, pitch shifting or syllable stretch. If needed, revise translated phrasing/natural pauses and generate a new authorized take. Construct the final full-duration dub from t=0, preserving or inserting required leading, middle and trailing silence. Do not automatically trim silence or export only the spoken range. Move intact clauses only through measured quiet boundaries without cutting speech; keep natural source audio and its Whisper authority intact. Record every cut/offset, verify speech preservation and derive/re-run timings for the final audio rather than presenting raw timestamps as aligned ones. If a dub still materially drifts, disclose it and retain REVIEW_NEEDED rather than claiming platform-ready sync.

## New-episode final YouTube contract

The current paths and minimum publishing package are in [production-mode.md](production-mode.md). Every new full episode requires `02_audio/en/youtube-dub-en.wav` and `.mp3`, and `02_audio/es/youtube-dub-es.wav` and `.mp3`. These four outputs span the **entire final TR master including sign-off**, begin on its t=0 timeline and retain intentional silence. They replace the Turkish soundtrack, with relevant shared SFX and the approved closing whistle already included; never layer both tracks or append the closure again.

Keep `narration-en.*` and `narration-es.*` as clearly marked internal natural-source takes. A narration-only export is not the final YouTube dub. Retain source script, provider/job/settings, raw Whisper and canonical mapping by hash. A final dub changed by verified silence edits can use native word timestamps transformed by recorded sample offsets; otherwise run Whisper on the actual final take. In either case, final `04_captions/captions-en.srt` and `captions-es.srt` match the final `youtube-dub` timeline, not the shorter natural source. Record `02_audio/<lang>/youtube-dub-alignment-<lang>.json` and `youtube-dub-word-map-<lang>.json`; the manifest's `youtube_dub_aligned` authority binds these and the final WAV hash separately from native Whisper/word-map evidence. Semantic alignment and cumulative drift evidence belongs in `08_delivery/semantic-sync.json`.

Run `node scripts/bay-referee-delivery-qa.mjs <episode-path> --output` and keep `08_delivery/qa-report.json`. Its required **DUB_DURATION_GATE** compares ffprobe durations for each of the four final EN/ES WAV/MP3 files to the actual final TR video: `abs(audio_duration - video_duration) <= 0.05` seconds. This includes any MP3 encoding delay/padding present in the measured file. A missing file, missing measurement or mismatch fails; do not hide a mismatch by changing metadata or allowing the player's silence trim. Report semantic/local/cumulative drift and listening separately even when the duration gate passes.

## Historical VAR/SAOT package — read-only reference

Historical example base: `brand/bay-referee/production/var-saot/audio/`. This completed package and its fixed-topic helpers are optional local archives, not dependencies of a portable checkout. New Production Mode work uses `videolar/<slug>/` and its own audio/timing authorities.

In that completed historical archive, each `tr`, `en`, `es` folder contains:

- `narration-<lang>.wav`: natural final narration (TR exact approved copy; EN/ES 48 kHz mono PCM24).
- `script-<lang>.txt` and `.json`: canonical/adapted text and concept segments.
- `whisper-<lang>.json`: immutable local Whisper medium segment + native word timestamps.
- `words-<lang>.json`, `segments-<lang>.json`, `word-map-<lang>.json`: accessible timestamp views and canonical mapping.
- `whisper-<lang>.srt`: native transcription; `script-<lang>.srt`: canonical words over mapped actual spans. External subtitle support only; neither replaces the main Turkish burned captions.
- `audio-qa.json`, `phase-fit-qa.json`: codec/duration/peak and timing fit evidence.
- EN/ES `generation.json`: provider, voice, settings, job and output hashes; TR `preservation.json`: exact source-copy proof.

The historical EN/ES package also includes `narration-<lang>-core-aligned.wav` (44.2 s), `core-alignment-edits.json`, fresh `whisper-<lang>-core-aligned.json/.srt`, matching `words-`, `segments-`, `word-map-`, `script-` derivatives, `phase-fit-core-qa.json` and `audio-core-qa.json`. Each of the twelve source speech chunks remains byte-identical; only measured quiet boundaries move. Fresh ASR records remaining paragraph-start drift: EN up to 0.44 s, ES up to 1.06 s. These are useful alternative narration candidates, not a claim of frame-exact localization. Engineering cut offsets and fresh ASR timing are separate measurements; use the latter when reporting audible concept alignment in this archive. Its Spanish third clause and meaningful transition boundaries were marked for inspection before platform use.

The historical per-language `delivery.json` is that archive's final file/hash entrypoint. Its platform candidates are `alternate-audio-<lang>-45p1-full-mix.wav` and `.m4a`, both 45.1 seconds. Their matching `-narration-only.wav` excludes effects. They replace the Turkish soundtrack rather than layering both or adding the whistle twice. EN/ES full mixes retain the shared UI/dock cues and closing whistle. Only kick level was adjusted for local voice context (EN −1.823 dB, ES −0.992 dB relative to the TR kick); voice gain remained one. The external subtitle suited to that shared master is `script-<lang>-core-aligned.srt`. TR paragraph SRT is an audit artifact; never substitute it for the historical approved 28 caption chunks.

These archived filenames, clocks and optional-candidate labels do not replace the mandatory new-episode YouTube contract above. Preserve the archive rather than migrating it. Do not turn a Turkish-captioned alternate audio delivery into a redesigned English/Spanish visual master.

## Historical local helpers and current transcription runtime

The following fixed-topic helper applies only to the optional historical archive:

```sh
.venv/bin/python scripts/bay-referee-dubs-package.py tr en es
```

This packages existing files and writes that test bed's metadata/QA; it does not generate speech and may be absent from a portable checkout. Read it only if historical maintenance needs it. `scripts/bay-referee-dubs-prepare.py` creates that archive's pre-generation script/request files; do not rerun it over human-edited translations or a completed package. The reusable `scripts/transcribe.py` runs local Whisper against an episode-shaped directory containing `audio/voice_original.wav`; language/profile come from the supplied engine config. The channel's production profile is `medium`, with native word timestamps enabled. Do not use the historical bootstrap `smoke/tiny` default for final timing.

An existing installed `.venv` contains Whisper/PyTorch; local ffmpeg is `.tools/bin/ffmpeg`. Use `node scripts/python.mjs scripts/transcribe.py --validate-install --profile production` for an import/tool check without model download. Model cache is `.cache/whisper`. Preserve the immutable raw ASR output before creating clean or mapped derivatives.
