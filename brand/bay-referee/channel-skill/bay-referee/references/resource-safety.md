# Mac mini M4 / 16 GB — shared heavy-job safety

This is a permanent production rule on this Mac, across all Codex sessions and
repository checkouts using the same OS account. Run **one heavy job at a time**.
TR, EN and ES Whisper runs are sequential. FFmpeg decoding/encoding/mixing,
video rendering, Whisper/model inference and other memory-intensive processing
must not overlap as independent jobs. Finish one stage before starting the next;
never hide parallel heavy subprocesses inside one locked orchestration script.
Lightweight research, source editing, metadata probes and network I/O may continue.

Quality stays locked: **Whisper medium with segment + word timestamps**, all
three languages, **1080×1920 at 30 FPS**, the approved audio quality, codec/output
settings, motion and all QA gates. Do not reduce model size, resolution, frame
rate, audio quality or validation to fit memory. Only concurrency changes.

## Required shared lease

From the located project root, run every custom render, direct FFmpeg command,
Whisper helper or other heavy entrypoint through:

```sh
python3 scripts/heavy-job.py --label calais-whisper-tr -- .venv/bin/python path/to/whisper-helper.py
python3 scripts/heavy-job.py --label calais-render -- node path/to/render.mjs
python3 scripts/heavy-job.py --label calais-encode -- .tools/bin/ffmpeg <arguments>
```

These are syntax examples; use the current episode's actual helper and arguments.
The existing Hyperframes render/check/snapshot/preview wrappers and reusable
`transcribe_episode` API acquire the same lease. Direct third-party tools or new
custom scripts are not automatically intercepted: the agent must use the wrapper.

The stable POSIX `flock` file is `/private/tmp/bay-referee-heavy-<uid>.lock` on
macOS (`/tmp/bay-referee-heavy-<uid>.lock` on Linux), deliberately outside any
checkout or Codex session directory. Its inode is **never deleted**, including
when the diagnostic JSON is stale. Only the kernel lock grants ownership.
Inheriting child descriptors retain ownership after a supervisor crash; an
orphaned live process group also blocks reuse. Never remove, truncate, kill or
"clean up" another running process's lock to make progress. Do not change the
lock path to evade contention. `BAY_REFEREE_HEAVY_TOKEN` is internal lease state,
not a bypass flag; only an actual ancestor-owned lease may be reused by a
sequential nested helper.

Contention returns `HEAVY_JOB_BUSY` / exit 75 without starting the new job. Wait
for that process to finish, then rerun the same intended command. Process-table
access is required to check unwrapped existing heavy processes; if the sandbox
denies `ps`, the guard fails closed. Use the authorized elevated execution path
for the same guarded command. Do not disable the check or fall back to an
unguarded command. Never stop another session's work merely to obtain the lock.

The scanner recognizes FFmpeg, Whisper/transcription and common render
entrypoints. It is a safety net, not universal interception of arbitrary
third-party binaries. All sessions must follow this shared-wrapper rule.

This rule does not authorize extra paid jobs, uploads or publishing. It only
serializes already-authorized local production and leaves output quality intact.
