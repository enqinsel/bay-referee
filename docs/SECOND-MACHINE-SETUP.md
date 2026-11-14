# BAY REFEREE on a second machine

The portable checkout contains the production source, maintained skill, templates and approved reusable visual assets. Historical episode media, personal voice/photo references, credentials, caches and `videolar/` outputs stay outside Git. The existing home-machine archive is not required for the portable import check.

## Install

1. Clone the approved source repository, then open that checkout in Codex. This preparation phase does not create or push a remote repository.
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

New episodes use the multilingual delivery contract: TR master/narration; full-length `youtube-dub-en.wav/.mp3` and `youtube-dub-es.wav/.mp3`; TR/EN/ES SRT, covers, titles, descriptions and hashtags; multilingual YouTube tags; research/credits and QA. Each language uses one editorial description across platforms. Keep source labels, archive stamps and image credits out of the video, covers and social copy. Preserve source records internally and original marks in the footage. If a licence requires public credit, verify a separate, discoverable placement the licence permits or replace the asset before release. All three covers share the same artwork and layout, with translated text inside the centered 1080×1350 safe area.

Run `npm run qa:bay-referee -- videolar/<slug>` on an existing package. The `DUB_DURATION_GATE` probes the actual final media with ffprobe and requires each final dub to match the entire master, including its closure, within ±50 ms. Preserve leading, middle and trailing silence; do not trim the upload file to narration length or time-stretch speech to pass. Separate checks require semantic alignment and no cumulative drift. A duration PASS alone is not delivery approval; follow the [current Production Mode QA contract](../brand/bay-referee/channel-skill/bay-referee/references/production-mode.md).

## Local Rhubarb narrator

Install the [Rhubarb Lip Sync 1.14.0 release](https://github.com/DanielSWolf/rhubarb-lip-sync/releases/tag/v1.14.0) outside the checkout. Keep its adjacent `res/` directory and make the executable available on `PATH`, or pass its path with `--rhubarb`. The macOS release is an Intel binary and requires Rosetta on Apple Silicon. Run `rhubarb --version` to check the installation.

For a new episode, first establish the real picture coverage and publication rights described in [MEDIA-FIRST PRODUCTION](../brand/bay-referee/channel-skill/bay-referee/SKILL.md#media-first-production). For each authorized language take, supply clean speech aligned to the final edit from time zero, including any inserted pauses. Keep the SFX and whistle in the separate final mix. Example for a Turkish take in a 1935-frame edit:

```sh
.venv/bin/python scripts/bay-referee-mouth-cues.py --language tr \
  --source path/to/aligned-tr.wav --total-frames 1935 --output path/to/mouth-tr.json
```

Use the actual episode frame count at 30 fps. Repeat serially with the aligned English and Spanish speech tracks and separate output paths. The helper takes the shared Mac heavy-job lock, converts to 48 kHz mono PCM16, runs the phonetic recognizer with one worker, records the input and analysis hashes, and holds the resting mouth for the remaining frames. It preserves existing cue files.

For the raster host, install its two additional Python dependencies in the existing production environment:

```sh
.venv/bin/python -m pip install -c requirements-lock-macos-arm64.txt 'Pillow==11.3.0' 'scipy==1.18.1'
```

From the checkout root, the compositor can load `engine/bay-referee/rhubarb_host.py` via `importlib.import_module("engine.bay-referee.rhubarb_host")`. Construct `MouthTrack(record["mouthCues"])` from the selected language's JSON. Pass `track.at_frame(frame)` and the shot's `pose`, `width`, `x`, `y` to `draw_host(shot, speech)` to obtain the transparent host and its placement. The host holds its pose by default. Supply optional gesture controls at the storyboard's semantic moments. Run frame rendering through `scripts/heavy-job.py` as described in [resource safety](../brand/bay-referee/channel-skill/bay-referee/references/resource-safety.md).

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

`requirements-production.txt` includes the existing `requirements-lock-macos-arm64.txt`: the 23-package Whisper/PyTorch/NumPy dependency closure. The local raster narrator uses the additional packages listed above. Historical soundfile, ONNX segmentation and local voice experiments remain outside this environment. Node dependencies are controlled by `package-lock.json`; do not copy `node_modules/`, `.venv/` or downloaded binaries from another machine.

The reusable source inventory is `config/bay-referee-portable-assets.json`. Licensed local SFX may be absent from a source checkout and are reported separately. Do not commit isolated library sound files just to satisfy a smoke check. Follow the asset acquisition/provenance policy before an actual production that needs them; `NONE` remains a valid editorial SFX choice.

## Outputs and archives

**Source travels through Git; outputs travel through shared storage or a manual archive.** `videolar/` is ignored and is not synchronized by `git pull`. Each machine owns its local episode directories. Use a new versioned slug for a new iteration; do not merge two independently generated episode folders in place.

For transferring completed episodes, use an approved iCloud Drive, Google Drive, Dropbox, external disk or NAS location. Copy the finished episode package and verify its delivery hashes on the receiving machine. Keep raw private identity/voice sources and credentials under separate access controls. No cloud integration is configured by setup or by this repository-preparation phase.

Historical labs, rendered videos, old voice takes, frame dumps and review exports remain on the original machine. They may later be archived separately with explicit authorization; setup does not move or remove them.
