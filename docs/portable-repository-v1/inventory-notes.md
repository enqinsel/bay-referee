# Portable repository V1 — inventory audit

Scan: 2026-10-17T11:25:37.544413+03:00 → 2026-10-17T11:25:41.704690+03:00
Root: `/Users/engin/Desktop/video-fabrikası/video-engine`

- Regular files: **102,480**; symlinks: **22**; directories: **11,618**.
- Logical regular-file size: **15,420,277,295 bytes (14.361 GiB)**.
- Allocated regular-file sum: **15,660,253,184 bytes (14.585 GiB)**.
- Allocated unique inodes, including directories: **15,650,316,288 bytes (14.575 GiB)**.
- Scan errors: **0**. No symlink target was traversed.

The snapshot is not atomic: concurrent work can add/change files after an entry is read. These four audit output files are excluded to avoid recursively inventorying their own growth. Directory totals overlap; category tags overlap. Exclusive categories and per-file records are available in `inventory.json`. Allocated bytes use `st_blocks × 512`; this does not measure unique physical APFS clone/dedup storage.

## Requested category tags

| Tag | File entries | Logical size | Allocated size |
|---|---:|---:|---:|
| model | 4,512 | 4.495 GiB | 4.505 GiB |
| frames_or_snapshots | 9,913 | 3.618 GiB | 3.637 GiB |
| brand | 8,739 | 3.029 GiB | 3.046 GiB |
| cache | 25,284 | 2.176 GiB | 2.230 GiB |
| old_motion_labs | 2,657 | 2.024 GiB | 2.029 GiB |
| python_venv | 76,285 | 2.173 GiB | 2.343 GiB |
| templates_and_formats | 4,525 | 0.570 GiB | 0.580 GiB |
| node_modules | 5,108 | 0.179 GiB | 0.192 GiB |
| sfx | 140 | 0.061 GiB | 0.061 GiB |
| skills | 250 | 0.003 GiB | 0.003 GiB |
| scripts | 354 | 0.002 GiB | 0.003 GiB |
| videolar | 0 | 0.000 GiB | 0.000 GiB |

## Top-level directories

| Directory | Regular files | Logical size |
|---|---:|---:|
| `voice` | 46,548 | 4.633 GiB |
| `brand` | 8,739 | 3.029 GiB |
| `episodes` | 5,597 | 2.704 GiB |
| `.cache` | 607 | 1.695 GiB |
| `.venv` | 24,802 | 0.832 GiB |
| `formats` | 2,208 | 0.529 GiB |
| `qa` | 568 | 0.323 GiB |
| `.tools` | 6,325 | 0.181 GiB |
| `node_modules` | 5,098 | 0.179 GiB |
| `references` | 1,204 | 0.135 GiB |
| `audio` | 65 | 0.050 GiB |
| `mascot` | 57 | 0.040 GiB |
| `engine` | 238 | 0.019 GiB |
| `research` | 151 | 0.009 GiB |
| `scripts` | 184 | 0.001 GiB |
| `tests` | 40 | 0.000 GiB |
| `sfx-review` | 6 | 0.000 GiB |
| `renders` | 2 | 0.000 GiB |
| `docs` | 7 | 0.000 GiB |
| `.git` | 19 | 0.000 GiB |
| `schemas` | 5 | 0.000 GiB |
| `config` | 2 | 0.000 GiB |

## Largest 50 regular files

| Path | Logical size | Category |
|---|---:|---|
| `voice/chatterbox/model/t3_mtl23ls_v3.safetensors` | 2044.67 MiB | model |
| `.cache/whisper/medium.pt` | 1457.22 MiB | cache |
| `voice/chatterbox/model/s3gen.pt` | 1008.19 MiB | model |
| `.venv/lib/python3.12/site-packages/torch/lib/libtorch_cpu.dylib` | 368.13 MiB | python_venv |
| `voice/chatterbox/env/lib/python3.12/site-packages/torch/lib/libtorch_cpu.dylib` | 177.57 MiB | python_venv |
| `voice/chatterbox/env/lib/python3.12/site-packages/llvmlite/binding/libllvmlite.dylib` | 123.86 MiB | python_venv |
| `.venv/lib/python3.12/site-packages/llvmlite/binding/libllvmlite.dylib` | 123.86 MiB | python_venv |
| `.cache/pip/http-v2/a/c/f/5/b/acf5bddc78a2e0c5577043231b851e4d937a01e9ac2fac18b954a4fb.body` | 121.41 MiB | cache |
| `formats/football-production-kit-v1-1.zip` | 89.05 MiB | templates_and_formats |
| `brand/bay-referee/motion-research/evidence/diagrams-code/PM17/source.mp4` | 77.17 MiB | brand |
| `voice/chatterbox/cache/pip/http-v2/b/4/b/5/f/b4b5fe9076af612804377ed5da5eaa78b37b53b2c6796b1f2c348b74.body` | 63.45 MiB | other |
| `episodes/episode-michelin/assets/maps/france-road-map-de-dion-bouton-1900.jpg` | 50.00 MiB | raster_image |
| `brand/bay-referee/motion-research/evidence/characters-photos/PM25/source.mp4` | 48.76 MiB | brand |
| `episodes/episode-michelin/renders/previews/michelin-v004.mp4` | 47.95 MiB | video |
| `episodes/episode-michelin/renders/previews/michelin-v004-picture.mp4` | 46.15 MiB | video |
| `voice/chatterbox/cache/pip/http-v2/7/e/0/1/3/7e0139bb744da111cf1c16b080919d0387ca004d8dc37698d30513ec.body` | 38.66 MiB | other |
| `.cache/pip/http-v2/7/e/0/1/3/7e0139bb744da111cf1c16b080919d0387ca004d8dc37698d30513ec.body` | 38.66 MiB | cache |
| `brand/bay-referee/motion-research/evidence/characters-photos/PM26/source.mp4` | 36.01 MiB | brand |
| `voice/chatterbox/cache/pkuseg/spacy_ontonotes/weights.npz` | 35.77 MiB | other |
| `voice/chatterbox/env/lib/python3.12/site-packages/perth/perth_net/pretrained/implicit/perth_net_250000.pth.tar` | 35.70 MiB | python_venv |
| `node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg` | 35.06 MiB | node_modules |
| `voice/chatterbox/cache/pkuseg/spacy_ontonotes.zip` | 32.97 MiB | other |
| `.tools/asset-treatment-venv/lib/python3.12/site-packages/onnxruntime/capi/onnxruntime_pybind11_state.so` | 32.09 MiB | python_venv |
| `brand/bay-referee/motion-research/evidence/type-shapes/gizakdag-cf4ae6/source.mp4` | 31.82 MiB | brand |
| `voice/reference/raw/benimses.wav` | 31.26 MiB | audio |
| `brand/bay-referee/motion-research/evidence/diagrams-code/PM22/source.mp4` | 30.18 MiB | brand |
| `.venv/lib/python3.12/site-packages/torch/lib/libtorch_python.dylib` | 29.60 MiB | python_venv |
| `brand/bay-referee/motion-research/evidence/characters-photos/PM28/source.mp4` | 27.05 MiB | brand |
| `brand/bay-referee/motion-research/evidence/diagrams-code/PM20/source.mp4` | 27.04 MiB | brand |
| `.tools/asset-treatment-venv/lib/python3.12/site-packages/onnxruntime/capi/libonnxruntime.1.23.2.dylib` | 26.34 MiB | python_venv |
| `voice/chatterbox/env/lib/python3.12/site-packages/torch/lib/libtorch_python.dylib` | 24.94 MiB | python_venv |
| `voice/chatterbox/cache/pip/http-v2/5/c/0/4/4/5c044f1ae92f31e33741de691b9fa3394d9aff732674449ec0d32616.body` | 23.04 MiB | other |
| `voice/chatterbox/env/lib/python3.12/site-packages/numpy/.dylibs/libopenblas64_.0.dylib` | 22.12 MiB | python_venv |
| `voice/chatterbox/cache/pkuseg/spacy_ontonotes/features.msgpack` | 21.63 MiB | other |
| `qa/editorial-motion-kit-v1-side-by-side.mp4` | 19.66 MiB | video |
| `voice/chatterbox/cache/pip/http-v2/2/5/d/7/9/25d7962d86addab78a7008f5c415b3570b444855c4f86fd60dba6948.body` | 19.40 MiB | other |
| `episodes/episode-michelin/renders/experiments/editorial-motion-kit-v1-benchmark-v2.mp4` | 18.47 MiB | video |
| `episodes/episode-bosman/qa/full-internal-v1/first-encode/bosman-full-internal-v1.mp4` | 18.12 MiB | video |
| `episodes/episode-bosman/renders/drafts/bosman-full-internal-v1.mp4` | 18.08 MiB | video |
| `episodes/episode-michelin/renders/experiments/editorial-motion-kit-v1-benchmark-v2-picture.mp4` | 17.92 MiB | video |
| `node_modules/@img/sharp-libvips-darwin-arm64/lib/libvips-cpp.8.18.7.dylib` | 17.39 MiB | node_modules |
| `node_modules/@ffprobe-installer/darwin-arm64/ffprobe` | 17.34 MiB | node_modules |
| `brand/bay-referee/motion-research/evidence/type-shapes/shneural-2abdfa/source.mp4` | 16.63 MiB | brand |
| `episodes/episode-bosman/renders/drafts/bosman-full-internal-v1-picture.mp4` | 16.21 MiB | video |
| `episodes/episode-michelin/qa/v4c-sequence-references/OS-003.mp4` | 16.18 MiB | video |
| `qa/editorial-motion-kit-v1-old-window.mp4` | 15.40 MiB | video |
| `qa/benchmark-v2-typography/archivo-900-75-travel.svg` | 15.30 MiB | vector_image |
| `qa/benchmark-v2-typography/manrope-medium-travel.svg` | 15.30 MiB | vector_image |
| `qa/benchmark-v2-typography/bebas-neue-travel.svg` | 15.29 MiB | vector_image |
| `brand/bay-referee/motion-research/evidence/type-shapes/lukasersil-0ed38e/source.mp4` | 15.23 MiB | brand |

## Largest 30 recursive directories

| Directory | Logical size |
|---|---:|
| `voice` | 4.633 GiB |
| `voice/chatterbox` | 4.506 GiB |
| `brand` | 3.029 GiB |
| `brand/bay-referee` | 3.029 GiB |
| `voice/chatterbox/model` | 2.988 GiB |
| `episodes` | 2.704 GiB |
| `episodes/episode-michelin` | 2.136 GiB |
| `.cache` | 1.695 GiB |
| `.cache/whisper` | 1.423 GiB |
| `voice/chatterbox/env` | 1.164 GiB |
| `voice/chatterbox/env/lib` | 1.164 GiB |
| `voice/chatterbox/env/lib/python3.12` | 1.164 GiB |
| `voice/chatterbox/env/lib/python3.12/site-packages` | 1.164 GiB |
| `episodes/episode-michelin/qa` | 1.124 GiB |
| `.venv` | 0.832 GiB |
| `.venv/lib/python3.12/site-packages` | 0.832 GiB |
| `.venv/lib/python3.12` | 0.832 GiB |
| `.venv/lib` | 0.832 GiB |
| `brand/bay-referee/motion-lab-v1` | 0.803 GiB |
| `brand/bay-referee/motion-research` | 0.642 GiB |
| `brand/bay-referee/motion-research/evidence` | 0.642 GiB |
| `brand/bay-referee/motion-lab-v1-2` | 0.618 GiB |
| `brand/bay-referee/motion-lab-v1-1` | 0.603 GiB |
| `episodes/episode-bosman` | 0.569 GiB |
| `.venv/lib/python3.12/site-packages/torch` | 0.535 GiB |
| `formats` | 0.529 GiB |
| `episodes/episode-bosman/qa` | 0.440 GiB |
| `.venv/lib/python3.12/site-packages/torch/lib` | 0.390 GiB |
| `episodes/episode-bosman/qa/full-internal-v1` | 0.379 GiB |
| `brand/bay-referee/motion-lab-v1/b-process` | 0.373 GiB |

## Scope and portability observations

- The parent `video-fabrikası` folder contains only this repository directory and `.DS_Store`; no sibling `videolar` directory was present during the audit.
- Absolute/out-of-root symlinks: **10**. Paths and targets are recorded in JSON; targets were not scanned.
- Dependencies, caches, generated frames and old motion-lab media are separately tagged so the canonical manifest can select them without deriving intent from extension alone.
- No deletion, moving, rendering, Git mutation, remote lookup or upload was performed. File contents and credential values were not inventoried.

Recognized virtual environments: `.venv`, `voice/chatterbox/env`, `.tools/asset-treatment-venv` (each has `pyvenv.cfg`).
