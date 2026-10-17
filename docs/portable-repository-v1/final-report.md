# BAY REFEREE Portable Repository V1

**READY_FOR_PORTABLE_REPO_HUMAN_REVIEW**

The source system is prepared for a private repository. The current workspace and archives remain in place. No push, remote creation, upload, history rewrite, media migration, production render or paid generation was performed.

## Size and boundaries

| Set | Logical size | Files |
| --- | ---: | ---: |
| Original workspace snapshot | 15.420 GB (15,420,277,295 bytes) | 102,480 regular +22 symlinks |
| Proposed Git source tree | 34.00 MB (34,002,040 bytes) | 256 |
| Proposed LFS | 0 bytes | 0 |
| Original local-only content | 15.389 GB (15,388,941,987 bytes) | See manifest |

The source tree is approximately **0.22%** of the original workspace. Source bytes include new portable helpers and review documents, so subtracting the new total from the original snapshot is not the local-only calculation. Dependency restore, model downloads, Git internals and temporary test copies are excluded from the proposed source size.

The prepared source export is `video-engine-portable-v1/` beside the original `video-engine/`. It has no remote or copied dependencies. The tested clean clone and detailed logs are separate temporary evidence described in [second-machine-smoke.json](second-machine-smoke.json). No files were staged or committed in the original repository.

## Validation

| Area | Result |
| --- | --- |
| Setup script | `scripts/setup-bay-referee.mjs` — PASS_LOCAL_SETUP |
| Clean-clone simulation | PASS — fresh npm80 + scoped Python23 dependency restore |
| Tests | PASS — 121 unit tests;6 import-only smoke checks |
| Production initializer | PASS —13 directories;20 text/JSON scaffolds;no media |
| Skill validation/install | PASS —10 managed files;20 references;hashes match |
| Candidate secret/privacy scan | PASS —no unresolved findings;values omitted |
| Active runtime home paths | PASS —zero;historical documentation preserved |
| Case/NFC/path closure | PASS static audit;tested checkout path includes spaces |
| Git history | CLEAN —unborn repository;0 tracked files,commits,refs,objects,remotes |
| Existing media/archive preservation | PASS —0 missing or unexpected changes |
| GitHub push | NOT PERFORMED |

The first isolated restore exposed a real FFprobe permission issue; the setup repair was verified in a fresh restore. Symlink write-boundary and idempotence regressions cover setup, skill sync, source export and local asset acquisition. [Smoke evidence](second-machine-smoke.md) records the tested scope and fixes.

## Source and assets retained

The curated source contains the maintained BAY REFEREE skill and approved Motion Grammar, Production Mode template/initializer, reusable production/typography/highlight helpers, captions/motion/audio/QA modules, schemas/configuration, Node/Python locks and relevant tests. It includes24 approved referee poses, illustrated master/profile/brand assets, watermark/wordmark and Archivo/Manrope with font licenses. Engin remains a logical remote voice authority; authentication is not copied.

Raw personal photo/voice sources, provider job records/private URLs, `node_modules`,venvs,caches,model weights,old labs,frame dumps,rendered episodes and `videolar/` are excluded. The classification manifest has **0 unknown REVIEW_REQUIRED entries**. Existing files were not deleted or moved.

Mixkit raw audio and isolated derived whistle audio are excluded from Git and LFS. Public provenance/license/hash metadata and an explicit local bootstrap/import path are retained. **LFS is not recommended:**42 selected source binaries total30,543,250 bytes;the largest is6.90 MiB and none reaches the25 MiB review threshold. See [LFS decision](lfs-recommendation.md) and [SFX policy](sfx-policy.md).

## Largest exclusions

| File | Size |
| --- | ---: |
| `voice/chatterbox/model/t3_mtl23ls_v3.safetensors` | 2143.99 MB (2,143,989,928 bytes) |
| `.cache/whisper/medium.pt` | 1528.01 MB (1,528,008,539 bytes) |
| `voice/chatterbox/model/s3gen.pt` | 1057.17 MB (1,057,165,844 bytes) |
| `.venv/lib/python3.12/site-packages/torch/lib/libtorch_cpu.dylib` | 386.02 MB (386,016,816 bytes) |
| `voice/chatterbox/env/lib/python3.12/site-packages/torch/lib/libtorch_cpu.dylib` | 186.20 MB (186,195,520 bytes) |
| `.venv/lib/python3.12/site-packages/llvmlite/binding/libllvmlite.dylib` | 129.87 MB (129,871,888 bytes) |
| `voice/chatterbox/env/lib/python3.12/site-packages/llvmlite/binding/libllvmlite.dylib` | 129.87 MB (129,871,888 bytes) |
| `.cache/pip/http-v2/a/c/f/5/b/acf5bddc78a2e0c5577043231b851e4d937a01e9ac2fac18b954a4fb.body` | 127.31 MB (127,307,099 bytes) |

## Largest Git candidates

| File | Size |
| --- | ---: |
| `mascot/engin-avatar-v1/master/master-identity.png` | 7.23 MB (7,233,850 bytes) |
| `brand/bay-referee/avatar/master/referee-master.png` | 6.72 MB (6,716,719 bytes) |
| `brand/bay-referee/profile/profile-square.png` | 1.20 MB (1,204,812 bytes) |
| `brand/bay-referee/brand-bug/head.png` | 1.10 MB (1,097,809 bytes) |
| `docs/portable-repo-manifest.json` | 0.77 MB (771,593 bytes) |

## Before production on the second Mac

No unresolved source-review blocker remains. The clean simulation used macOS Apple Silicon,Node26 and Python3.12;other architectures need their own lock validation. A real second physical machine and case-sensitive volume were not tested.

1. Run setup using Node>=22 and Python3.12;use documented `--python` if the interpreter is not on PATH.
2. Connect Higgsfield manually and confirm Engin in the intended workspace.
3. Provision Whisper medium weights with `--download-whisper-model` before transcription.
4. Acquire the approved closing-whistle source into the private local cache before branded production.

These provisioning steps are reported explicitly by setup;`productionReady` remains false until live access/assets are confirmed. No transcription inference,cover rendering or dub generation was performed in this phase. `videolar/` never travels through Git:use approved shared storage or manual archives per [output sync policy](../OUTPUT-SYNC-POLICY.md).

## Review evidence

- [Original size audit](audit.md) and [JSON](audit.json)
- [Curated manifest](manifest.md) and [JSON](manifest.json)
- [.gitignore review](gitignore-review.md)
- [Secret scan](secret-scan.md) and [absolute paths](absolute-path-audit.md)
- [Second-machine setup](../SECOND-MACHINE-SETUP.md) and [clean-clone proof](second-machine-smoke.md)
- [Preservation evidence](preservation-check.md)

Preservation uses original type,size,mtime and symlink-target metadata,not a retroactive content-hash baseline;mutable dependency/cache trees are excluded. Secret checks are bounded pattern/classification audits,not a mathematical proof that every possible secret is absent. The exact manifest/export defines the candidate boundary;review changed files again before a future push.
