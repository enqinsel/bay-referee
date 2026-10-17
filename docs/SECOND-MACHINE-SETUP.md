# BAY REFEREE on a second machine

The portable checkout contains the production source, maintained skill, templates and approved reusable visual assets. Historical episode media, personal voice/photo references, credentials, caches and `videolar/` outputs stay outside Git. The existing home-machine archive is not required for the portable import check.

## Install

1. Clone the approved **private** source repository, then open that checkout in Codex. This preparation phase does not create or push a remote repository.
2. Install Node.js **22 or newer**, npm and **Python 3.12**. The Python lock is validated on **macOS Apple Silicon**; another operating system/architecture needs a separately verified lock. The working environment used to derive the scoped lock was Python 3.12.14 on macOS arm64.
3. From the checkout root, run:

   ```sh
   node scripts/setup-bay-referee.mjs
   ```

   If Python 3.12 is not on `PATH`, pass `--python /path/to/python3.12`. Setup creates the checkout’s `.venv`, restores the Node lock with lifecycle scripts disabled, installs the scoped Python requirements, prepares FFmpeg/ffprobe links and local caches, validates Whisper’s `production` profile, and runs the import-only portable smoke check. It creates no video, narration, cover, subtitles or provider job.
4. Setup copies the maintained `brand/bay-referee/channel-skill/bay-referee/` into `$CODEX_HOME/skills/bay-referee`, or `~/.codex/skills/bay-referee` when `CODEX_HOME` is unset. It validates local references and SHA-256 hashes. Restart/refresh Codex’s skill discovery if necessary. Invoke `$bay-referee` from the open checkout.
5. In Codex, connect the official **Higgsfield** plugin and sign in manually to the workspace containing the **Engin** custom voice. Setup neither creates credentials nor verifies remote account access. No project API-key environment variable is required. Revalidate voice/model availability through the connector before a real authorized production request.
6. The local Whisper **medium** weights are not in Git. When ready to provision that large public model download, run:

   ```sh
   node scripts/setup-bay-referee.mjs --download-whisper-model
   ```

   This only prepares the model cache; it does not transcribe or generate audio. A setup report can pass local package checks while marking the cache `NOT_CACHED`; production transcription needs valid weights.
7. Confirm readiness, then initialize a new episode:

   ```sh
   node scripts/setup-bay-referee.mjs --check
   node scripts/portable-smoke.mjs
   node scripts/bay-referee-new-episode.mjs example-topic
   ```

   The initializer writes empty/text/JSON scaffolding under `videolar/example-topic/`; it is not a video generator. It refuses an existing slug without modifying it. Provide a real topic and canonical Turkish script, or explicitly request research/script preparation within full Production Mode. Covers, social text and EN/ES packages follow the maintained skill’s delivery contract.

## Safe reruns and isolated checks

Setup is idempotent: matching packages and managed skill files are reused. It does not delete episode media or R&D files. Replaced managed skill files are backed up under `.cache/skill-backups/`; extra installed skill files are retained and reported. An existing inconsistent `node_modules` is not automatically discarded: inspect it and use `--restore-node` only when a clean dependency restore is intended.

Lifecycle scripts remain disabled. Normal setup repairs missing executable permission on the locked FFmpeg/ffprobe binaries only after verifying their physical paths are inside this checkout’s `node_modules`; check/dry-run only reports missing permission. Setup refuses symlinked cache/tool directory ancestry, and skill synchronization rejects unsafe marker files or aliases into its maintained source.

```sh
# No installation, synchronization or local-directory writes.
node scripts/setup-bay-referee.mjs --dry-run
node scripts/setup-bay-referee.mjs --check

# Reuse installed dependencies; sync only into a sandbox destination.
node scripts/setup-bay-referee.mjs --skip-install \
  --skill-dir /private/tmp/bay-referee-test/skills/bay-referee

# Validate the maintained skill independently.
node scripts/skill-bay-referee.mjs --source-only
```

`--skill-dir` names the exact destination **skill folder**, not its parent. `--skip-install` still prepares local directories/tool links and synchronizes the selected skill target; it does not mean read-only. `--skip-smoke` is available for diagnostics and produces an explicitly incomplete verification status. Normal setup records `.cache/setup/bay-referee-setup.json`; check/dry-run modes report to stdout without writing that file.

`requirements-production.txt` includes the existing `requirements-lock-macos-arm64.txt`: the 23-package Whisper/PyTorch/NumPy dependency closure. This is not a global Python package dump. Historical Pillow, scipy, soundfile, ONNX segmentation and rejected local voice experiments are outside the current portable runtime. Node dependencies are controlled by `package-lock.json`; do not copy `node_modules/`, `.venv/` or downloaded binaries from another machine.

The reusable source inventory is `config/bay-referee-portable-assets.json`. Licensed local SFX may be absent from a source checkout and are reported separately. Do not commit isolated library sound files just to satisfy a smoke check. Follow the asset acquisition/provenance policy before an actual production that needs them; `NONE` remains a valid editorial SFX choice.

## Outputs and archives

**Source travels through Git; outputs travel through shared storage or a manual archive.** `videolar/` is ignored and is not synchronized by `git pull`. Each machine owns its local episode directories. Use a new versioned slug for a new iteration; do not merge two independently generated episode folders in place.

For transferring completed episodes, use an approved iCloud Drive, Google Drive, Dropbox, external disk or NAS location. Copy the finished episode package and verify its delivery hashes on the receiving machine. Keep raw private identity/voice sources and credentials under separate access controls. No cloud integration is configured by setup or by this repository-preparation phase.

Historical labs, rendered videos, old voice takes, frame dumps and review exports remain on the original machine. They may later be archived separately with explicit authorization; setup does not move or remove them.
