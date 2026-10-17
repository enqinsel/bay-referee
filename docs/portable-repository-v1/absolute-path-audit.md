# Absolute path audit — Portable Repository V1

Audit date: 2026-10-17. 2075 literal home-prefix occurrences in 339 files within the stated project-text scope. Each occurrence has path, line, column and category in [absolute-path-audit.json](absolute-path-audit.json); matched path values and surrounding content are omitted.

| Category | Meaning | Occurrences |
|---|---|---:|
| A | Historical reports, acquisition provenance, review data and archived QA implementations | 2072 |
| B | Executable legacy utilities with hard-coded home inputs | 3 |
| C | Host-local skill authority/discovery notes | 0 |

B findings: `scripts/local-voice-reference-qa.py:35` (two occurrences) and `engine/assets/sfx/provenance/prepare-library.py:47` (one). Both belong to legacy local-reference/acquisition workflows; neither is needed by current Production Mode. If excluded from portable source, retain unchanged locally. If retained as runnable utilities, parameterize paths before promising portability. No literal home prefix was found in the current generic engine runtime outside provenance/demo records.

The initial read found host-root instructions in maintained skill `brand/bay-referee/channel-skill/bay-referee/SKILL.md` and `references/engine-and-qa.md` (category C at discovery). The setup owner updated the maintained instructions during this audit; the final scan no longer finds those literals. Historical copies/reports remain unchanged.

`original_filepath` provenance fields are historical source-location evidence, not runtime paths. Public-safe runtime manifests must use repository-relative `local_filepath` or an explicit local asset directory. Generated FFprobe command paths and old playback URLs do not become new runtime dependencies by being documented.

Scope: 2787 UTF-8 files; max 16 MiB per text file. Binary payloads and dependency/cache directories are excluded and enumerated in the JSON. The new audit directory is excluded to avoid recursive self-matches. No old file was edited by this audit. **Final candidate-set rescan pending**; the root producer's exact manifest is the portability boundary.

[Filesystem portability](filesystem-portability.json) records case/Unicode collisions, spaces, symlinks, modes and interpreter assumptions. No file was renamed or chmodded.

## Final candidate rescan

PASS_NO_ACTIVE_HOME_PATH_BUG. Exact proposed set: 256 files; list SHA-256 `72ce4cc7c85261f203b20442eac7990efe87d27e1e08d2001071980f71443ea6`. Remaining candidate home literals occur in historical README/docs or the audit search literal, category A. Both legacy executable B files are excluded from the proposed set. Maintained skill no longer contains the old host-root literal. No historical file was rewritten for this audit. Re-run after the candidate set changes.
