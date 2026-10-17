# Engine authorities and delivery QA

## Completed branded reference

Resolve the current project root as described in `SKILL.md`; these paths are root-relative. The table records a completed historical reference. Its episode media and fixed-topic helpers are optional local archive material, not required portable dependencies. A clean checkout uses `engine/bay-referee/production.mjs`, the production template and new `videolar/<slug>/` outputs; never import historical render helpers as a portable smoke test.

| Responsibility | Authority |
|---|---|
| Approved prior master | `formats/football-production-kit-v1-1/var-saot/renders/football-comparison-var-saot-avatar-sfx-v1.mp4` |
| Exact canonical Turkish narration | `voice/higgsfield/eleven-v4/var-saot/canonical-script.txt` |
| Approved waveform | `voice/higgsfield/eleven-v4/var-saot/final/narration-final.wav` |
| Turkish word map and state anchors | `voice/higgsfield/eleven-v4/var-saot/sync/word-map.json`, `phase-anchors.json`, `events.json` |
| Core scene renderer | `scripts/eleven-v4-voice-common.mjs` |
| Prior avatar/caption performance | `scripts/production-kit-v11-performance.mjs` |
| Branded avatar performance | `scripts/bay-referee-performance.mjs`, `brand/bay-referee/avatar/placement.json` |
| Branded composition/render | `scripts/bay-referee-brand-composite.mjs`, `scripts/bay-referee-render.mjs` |
| Brand system tokens | `brand/bay-referee/tokens/brand.json`, `watermark.json`, `signoff.json` |
| Caption plan and existing overlays | `formats/football-production-kit-v1/var-saot/captions/` |
| Prior approved three-event mix | `formats/football-production-kit-v1-1/var-saot/audio/mix.wav` |
| SFX sources and rights | `audio/sfx/football-core-v1-1/manifest.json` |
| Brand assets and tokens | `brand/bay-referee/` |
| Approved Turkish master — read only | `brand/bay-referee/production/var-saot/video/tr/football-comparison-var-saot-bay-referee-tr.mp4` |
| Existing audio packages | `brand/bay-referee/production/var-saot/audio/{tr,en,es}/` |
| Review | `brand/bay-referee/review/index.html` and `review-data.json` |
| Preservation snapshot/check | `brand/bay-referee/qa/preserved-inputs.json`, `preservation-check.json` |

The historic `config/engine.config.json` is a bootstrap configuration: its unapproved style, documentary priority and disabled generation flag are not the later channel's editorial authorities. Do not rewrite global bootstrap configuration merely to run this channel. Use the locked production files and live connector state.

## Read-only checks and historical implementation

Motion Lab is closed; do not rerender VAR/SAOT or run its build scripts as a consolidation/validation step. Its completed reference is 44.2 s core + 0.9 s closure = 45.1 s. These clocks are historical, not new-episode defaults. For an authorized new episode create a versioned adapter/output directory after SCRIPT → FINAL VOICE → WHISPER → SEMANTIC BEATS → VISUAL STATES → MOTION PLAN, and derive that episode's clock from its approved narration.

From the project root, the following commands check installed tools or preserved inputs without rendering the master:

```sh
node scripts/python.mjs scripts/transcribe.py --validate-install --profile production
node scripts/portable-smoke.mjs
```

The historical preservation checker is local-archive-only; run it only where its original snapshot and media exist. Do not make a clean checkout depend on that archive.

The historical signoff, performance and branded-render scripts in the authority table are implementation references, not a checklist to execute. Their fixed VAR/SAOT inputs/outputs must not be used for a new episode. Preserve the old master and adapt only into the newly authorized episode's paths. Do not use `--force` against an approved master.

The encoded reference-core check is `scripts/bay-referee-caption-video-qa.py` and requires Python with NumPy/Pillow; it compares the historical 1,326 core frames against the old picture while allowing declared avatar/watermark regions. Its final JSON lives under the completed test bed's `qa/` directory. This fixed comparison is not the visual QA model for a new story.

For a user-requested review of existing files, the historical review server binds only `127.0.0.1:8787`, serves named derivatives with video byte ranges and excludes raw identity photos, clone references and sound libraries. Do not restart it as part of skill maintenance. These scripts are not a parameterized topic-to-video engine.

## Verification before delivery

Apply relevant checks to the authorized deliverable. The fixed counts, masks, clocks and original-picture comparisons below describe the preserved VAR/SAOT brand pass; derive new episodes' geometry, membership and timing from their own approved inputs. Skill-only maintenance uses skill validation and preservation checks, not media regeneration.

- **Preservation:** hash every snapshotted approved file; current brand baseline contains 1,725 files including the earlier 1,471-file preservation set. A pre-render pass is not the final preservation check.
- **Voice/audio:** exact Turkish source hash and prefix samples remain unchanged; the brand whistle starts after spoken audio. Measure final decoded AAC, peak and clipping, delay/correlation with intended mix and stream start/end. A WAV-only check is insufficient.
- **Captions:** all original Turkish words, existing overlays and exact integer frame membership remain on the 1,326-frame core. Inspect decoded frame membership, ghost frames and caption ROI appearance. Appended sign-off does not contain arbitrary new narration/captions. The current core is 44.2 s; 27 closing frames make 45.1 s at 30 fps.
- **Geometry and sequencing:** inspect actual alpha of used referee poses against caption and tactical exclusions over every pose/offset state. Compare unchanged world outside allowed avatar/brand regions. Check before/after transitions, final decision → sign-off, card/whistle meaning and full playing motion; a contact sheet alone is not sufficient.
- **Brand:** head icon readable at small size, exact wordmark spelling, quiet persistent watermark, safe distance from social UI/captions and no unrelated logo. Verify transparent exports actually have alpha.
- **Dubs:** complete meaning and native timestamp coverage for all three languages; standalone source WAV and any aligned derivative clearly labelled. Report per-clause drift, sound identity and unverified listening judgments honestly. No time-stretch shortcut.
- **Final files:** probe 1080×1920, 30 fps, H.264/AAC MP4; full decode with error detection; no missing media or dangling review links. Verify all required profile/bug/watermark/sign-off/pose/dub/skill/report deliverables exist and open.
- **Human review:** brand, likeness, gestures, whistle taste and Engin's English/Spanish identity need human judgment. Machine PASS is not human approval.

The completed brand-system review exposed old/new Turkish video, brand assets, sign-off, avatar pack, EN/ES packages, timing, skill and report. Future delivery should expose only artifacts relevant to the current request; keep the main video in Turkish without a multilingual visual redesign by default. Include evidence and unresolved limitations. The former brand-review status is historical; motion consolidation is `MOTION_GRAMMAR_APPROVED_FOR_NEW_EPISODES`. This state does not authorize a new episode, another lab test or publication.
