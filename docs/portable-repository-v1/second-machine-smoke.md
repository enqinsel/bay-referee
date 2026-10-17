# Second-machine simulation — PASS

A new temporary directory with spaces received **only the proposed source candidates**: 246 files / 33,911,126 bytes. No dependency folder, old episode, personal source, stock audio, model cache or previous narration was copied. Evidence: [second-machine-smoke.json](second-machine-smoke.json), [setup](second-machine-setup.json), [read-only rerun](second-machine-check.json).

## Executed validation

| Check | Result |
| --- | --- |
| Fresh `npm ci --ignore-scripts` | PASS — 80 packages |
| Fresh Python3.12 venv and scoped lock | PASS — 23 packages; `pip check` clean |
| FFmpeg and ffprobe execution | PASS |
| Whisper production profile | PASS — medium; native word timestamps |
| Maintained skill → isolated Codex installation | PASS — 10 files;20 references;matching hashes |
| Import-only production/brand/voice/template smoke | PASS — 6 checks |
| Production initializer | PASS —13 directories;20 text/JSON files;zero media |
| Portable regression tests | PASS —31/31 |
| Generic runtime tests | PASS —51/51 |
| Python unit tests | PASS —39/39 |
| Read-only setup rerun | PASS_LOCAL_SETUP |

**121 tests passed;0 failed.** The original Git index and refs were untouched. An empty Git repository was initialized only in the temporary copy so `.gitignore` tests could run. No commit or remote was created.

The first restore found a real FFprobe execute-permission defect while lifecycle scripts were disabled. Setup now checks physical containment within `node_modules` before adding execute permission; read-only mode never changes it. Fresh restore and negative tests passed. Python3.12 was not on PATH, so the documented `--python` option selected an available interpreter; dependencies were installed into a new venv.

## Scope and remaining machine provisioning

This is **macOS arm64 source/runtime portability evidence**, not full episode rendering evidence. The tested path includes spaces. Static checks found no candidate case/NFC collisions, non-ASCII paths or active hard-coded home paths; a second physical Mac/case-sensitive filesystem was not available.

Whisper weights are intentionally `NOT_CACHED`; use `node scripts/setup-bay-referee.mjs --download-whisper-model` before transcription. Connect Higgsfield/Engin manually. Acquire the approved closing whistle locally through `scripts/bay-referee-assets.mjs` before branded production. Setup reports these gaps and leaves `productionReady=false`.

No video, audio, cover, paid generation, provider job, cloud upload or publication was performed. Initializer files are blank/text scaffolding. Covers/social/dub structure and the production workflow remain in the template and maintained skill.

## Source identity

Tested non-documentation source fingerprint: `ab59e75b1387d30b9f521522344f06a1e20415c519000f8dbc8d31fcddedb3a0` (216 files). Current runtime, scripts, lockfiles, templates, skill and assets match it. After the fresh dependency restore, two files (the asset bootstrapper and its regression test) received the final ancestor-symlink fix; the full portable suite and smoke were rerun successfully. Original pre-fix files and the initial export record remain preserved in the test evidence. Final review documents may be added afterward without changing this executable source set. The complete tested export hashes and raw logs remain under the local temporary test directory recorded in JSON; they are not production dependencies.
