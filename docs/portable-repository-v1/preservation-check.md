# Preservation verification — Portable Repository V1

**Status: PASS_WITH_EXPECTED_SOURCE_EDITS**. Checked 2026-10-17T11:43:39.224182+03:00 → 2026-10-17T11:43:39.472084+03:00 against the immutable original inventory of 2026-10-17T11:25:41.704690+03:00.

**19,793 pre-existing entries checked; 19,783 unchanged, 10 expected source edits, 0 missing, 0 unexpected changes, 0 read errors.** Existing media, archived material, episode/lab outputs, SFX, voice references and the non-cache model store show no changed or missing entries under the comparisons below. No original file was moved or deleted by this check.

## Expected source edits

| File | Before bytes | Current bytes | Purpose |
| --- | --- | --- | --- |
| `.gitignore` | 1,108 | 11,792 | Portable source allowlist and local-only exclusions. |
| `README.md` | 14,747 | 15,687 | Portable setup and source/output documentation. |
| `brand/bay-referee/channel-skill/bay-referee/SKILL.md` | 4,990 | 5,243 | Maintained skill portability guidance. |
| `brand/bay-referee/channel-skill/bay-referee/references/engine-and-qa.md` | 6,940 | 7,475 | Portable engine/setup authority. |
| `brand/bay-referee/channel-skill/bay-referee/references/format-and-brand.md` | 8,200 | 9,091 | Portable brand/component authority. |
| `brand/bay-referee/channel-skill/bay-referee/references/production-mode.md` | 13,653 | 14,026 | Portable production prerequisites. |
| `brand/bay-referee/channel-skill/bay-referee/references/voice-and-dubbing.md` | 7,002 | 7,262 | Portable voice/dub prerequisites. |
| `package-lock.json` | 71,510 | 71,565 | Lockfile corresponding to portable direct dependencies. |
| `package.json` | 1,385 | 1,868 | Portable scripts and direct runtime dependencies. |
| `requirements-lock-macos-arm64.txt` | 394 | 659 | Reproducible Python environment pinning. |

All ten changes alter size and modification time. They are the explicitly maintained portability source/configuration/documentation files, separate from historical media and outputs. New source files are not part of the old inventory and are outside this preservation comparison.

## Protected historical views

| View | Entries checked | Baseline bytes | Changed or missing |
| --- | --- | --- | --- |
| existing_media_and_archives | 16,910 | 7,354,309,842 | 0 |
| historical_episode_lab_and_voice_output_trees | 9,264 | 5,470,890,804 | 0 |
| historical_brand_outro | 16 | 20,810,049 | 0 |
| raw_sfx_catalog_and_files | 65 | 53,253,846 | 0 |
| personal_voice_reference | 6 | 36,220,590 | 0 |
| non_cache_model_store | 8 | 3,208,854,761 | 0 |
| root_git_metadata | 19 | 33,407 | 0 |

These views overlap and cannot be added. The `existing_media_and_archives` view includes audiovisual files, raster/vector images, PDF and ZIP extensions across all checked roots. The complete checked set extends beyond these named views and has no unexpected changes.

## Mutable dependencies and caches excluded

| Excluded root/rule | Baseline entries | Baseline bytes |
| --- | --- | --- |
| node_modules | 5,108 | 192,326,468 |
| .venv | 24,805 | 893,727,116 |
| voice/chatterbox/env | 45,154 | 1,249,767,052 |
| .tools/asset-treatment-venv | 6,326 | 190,011,679 |
| .cache | 607 | 1,819,853,255 |
| voice/chatterbox/cache | 669 | 367,175,479 |
| other __pycache__ | 40 | 369,639 |

A total of **82,709 baseline entries** was excluded. These are installed dependencies and mutable caches rebuilt by setup, including package caches, cached Whisper weights, `__pycache__` files and any clean-clone cache work. Their current size/mtime was not compared, so this report makes no preservation or change claim for them. No dependency/cache content was deleted by this check.

## Original Git repository

The original repository still has an unborn HEAD on `refs/heads/main`, **0 tracked files, 0 refs, 0 remote names, 0 objects and 0 packs**. Root `.git` has no baseline metadata changes. Read-only Git commands ran with `GIT_OPTIONAL_LOCKS=0`; no commit, index, ref, remote, history or upload command was performed. This describes observed local state, not hypothetical remote history.

## Evidence and limits

- Original inventory SHA-256 remains `cf8c8c9b83170d369f7ed340a432711d72766a0319a0aab7e747a22953db25fe`, identical to the hash bound by the canonical audit.
- Compared entry type, exact `lstat` byte size, nanosecond modification time, and symlink target. Symlinks were not traversed for preservation inventory.
- The original inventory has no per-file content hashes. Equal metadata is evidence of preservation, **not a cryptographic content comparison** or proof that no intermediate edit ever occurred.
- Both scans are non-atomic; the timestamps bound these observations. New audit/implementation documents were not retroactively counted as original content.
- Machine-readable evidence: `docs/portable-repository-v1/preservation-check.json`.
