# Voice and multilingual delivery

## Engin voice authority

`voice/decision.json` is the provider/identity lock. Current ID: `01c99385-4fe9-41e7-867f-f9bab00617db`, `voice_type: element`, name Engin. Provider wrapper Higgsfield; model `elevenlabs_v4`; stability `0.5`, similarity boost `0.75`, batch size `1`. Revalidate live model schema and voice availability when generating; this record is not proof that a remote schema remains unchanged. Do not replace the speaker or re-clone by default.

Use the Higgsfield connector, not undocumented endpoints or invented API credentials. Inspect available tools/model schema, estimate the exact requested jobs, submit within the current user's authorization, then retain job IDs and submitted parameters. Download the returned output for production; save the original before conversion. Record quoted credits separately from verified billing. Existing user authorization persists; a reusable skill alone does not authorize future spending or upload of private identity media.

For maintenance of the optional historical VAR/SAOT Turkish master only, reuse `voice/higgsfield/eleven-v4/var-saot/final/narration-final.wav`: SHA-256 `d5e169d294471fdd60389bce76a6a19529d14ad5021ae6aaed3ca7dff1c3fbed`, 48 kHz mono PCM24, 2,121,561 samples, 44.1991875 s. The Bay Referee TR copy is byte-identical. Do not regenerate or normalize an already approved take during branding work.

## Translation and timing

English is global/neutral; Spanish is broad international/LatAm. Preserve the canonical Turkish claims, qualifications, conclusion and order while choosing natural spoken phrasing. This is meaning-preserving adaptation, not literal token replacement. Keep a 12-paragraph concept map for the VAR/SAOT example so each dub can be compared with the same visual state.

Generate a natural take first. Whisper must process that exact final WAV with `language: en` or `es` and word timestamps. Raw ASR text is evidence, not the script authority. Map canonical target-language text to actual native spans; preserve spelling/acronym discrepancies and unmatched tokens. Do not inherit aliases or timings from another language/take. Missing words do not get interpolated spans.

Compare concept-start/end drift to the Turkish picture. Overall equal duration is not sufficient: the spoken review, kick, line, alert and final-decision clauses must land within sensible visual windows. Naturalness is not established by ASR coverage. Listen separately for identity, acronym pronunciation, accent and unnatural joins.

No mechanical speed-up, time compression, pitch shifting or syllable stretch. If needed, revise translated phrasing and generate a new authorized take. A separately labelled picture-aligned derivative may move intact clauses only through measured boundary silence, without cutting speech; keep natural source audio and its Whisper authority intact. Record every cut/offset, validate boundaries and derive/re-run timings for that derivative rather than presenting raw timestamps as aligned ones. If a dub still materially drifts, label that limitation rather than claiming platform-ready sync.

## Package contract

Historical example base: `brand/bay-referee/production/var-saot/audio/`. This completed package and its fixed-topic helpers are optional local archives, not dependencies of a portable checkout. New Production Mode work uses `videolar/<slug>/` and its own audio/timing authorities.

Each `tr`, `en`, `es` folder contains:

- `narration-<lang>.wav`: natural final narration (TR exact approved copy; EN/ES 48 kHz mono PCM24).
- `script-<lang>.txt` and `.json`: canonical/adapted text and concept segments.
- `whisper-<lang>.json`: immutable local Whisper medium segment + native word timestamps.
- `words-<lang>.json`, `segments-<lang>.json`, `word-map-<lang>.json`: accessible timestamp views and canonical mapping.
- `whisper-<lang>.srt`: native transcription; `script-<lang>.srt`: canonical words over mapped actual spans. External subtitle support only; neither replaces the main Turkish burned captions.
- `audio-qa.json`, `phase-fit-qa.json`: codec/duration/peak and timing fit evidence.
- EN/ES `generation.json`: provider, voice, settings, job and output hashes; TR `preservation.json`: exact source-copy proof.

The current EN/ES package also includes `narration-<lang>-core-aligned.wav` (44.2 s), `core-alignment-edits.json`, fresh `whisper-<lang>-core-aligned.json/.srt`, matching `words-`, `segments-`, `word-map-`, `script-` derivatives, `phase-fit-core-qa.json` and `audio-core-qa.json`. Each of the twelve source speech chunks remains byte-identical; only measured quiet boundaries move. Fresh ASR records remaining paragraph-start drift: EN up to 0.44 s, ES up to 1.06 s. These are useful alternative narration candidates, not a claim of frame-exact localization. Engineering cut offsets and fresh ASR timing are separate measurements; use the latter when reporting audible concept alignment. Inspect the Spanish third clause and all meaningful transition boundaries before platform use.

The per-language `delivery.json` is the final file/hash entrypoint. Current platform candidates are `alternate-audio-<lang>-45p1-full-mix.wav` and `.m4a`, both 45.1 seconds. Their matching `-narration-only.wav` excludes effects. Replace the Turkish soundtrack with the full mix; do not layer both, and do not add the whistle twice. EN/ES full mixes retain the shared UI/dock cues and closing whistle. Only kick level is adjusted for local voice context (EN −1.823 dB, ES −0.992 dB relative to the TR kick); voice gain remains one. The external subtitle suited to the shared master is `script-<lang>-core-aligned.srt`. TR paragraph SRT is an audit artifact; never substitute it for the approved 28 caption chunks.

Do not confuse natural narration with a full alternate soundtrack. A platform alternate mix needs the visual's duration, correct start, appropriate silence and retained sound closure. Deliver both with explicit names when such a derivative exists. Do not turn a Turkish-captioned alternate audio delivery into a redesigned English/Spanish visual master.

## Existing local helpers

From the project root:

```sh
.venv/bin/python scripts/bay-referee-dubs-package.py tr en es
```

This packages existing files and writes this test bed's metadata/QA; it does not generate speech. Read it before adapting to a new episode. `scripts/bay-referee-dubs-prepare.py` creates the current pre-generation script/request files; do not rerun it over human-edited translations or a completed package. The original `scripts/transcribe.py` runs local Whisper against an episode-shaped directory containing `audio/voice_original.wav`; language/profile come from the supplied engine config. The channel's production profile is `medium`, with native word timestamps enabled. Do not use the historical bootstrap `smoke/tiny` default for final timing.

An existing installed `.venv` contains Whisper/PyTorch; local ffmpeg is `.tools/bin/ffmpeg`. Use `node scripts/python.mjs scripts/transcribe.py --validate-install --profile production` for an import/tool check without model download. Model cache is `.cache/whisper`. Preserve the immutable raw ASR output before creating clean or mapped derivatives.
