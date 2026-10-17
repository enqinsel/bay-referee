# Portable Repository V1 — canonical size and history audit

Original scan: **2026-10-17T11:25:37.544413+03:00 → 2026-10-17T11:25:41.704690+03:00**. Report generated: 2026-10-17T11:40:21.800903+03:00. Workspace: `/Users/engin/Desktop/video-fabrikası/video-engine`.

The original workspace contains **102,480 regular files**, **22 symlinks** and **11,618 directories**. Regular-file logical size is **15,420,277,295 bytes (14.361 GiB)**. No existing content was moved, deleted, rendered, uploaded or downloaded for this audit.

This is an immutable summary of `docs/portable-repository-v1/inventory.json`, not a fresh scan of the newly changed tree. New audit documents, portability implementation and clean-clone outputs do not become original snapshot content. The scan was not atomic and did not follow symlinks. The four initial inventory/Git audit files were excluded from their own inventory.

## Exact totals and measurement limits

| Measure | Count / exact bytes | Readable size |
| --- | --- | --- |
| Regular files | 102,480 |  |
| Symlinks | 22 |  |
| All file entries | 102,502 |  |
| Directories including root | 11,618 |  |
| Regular-file logical bytes | 15,420,277,295 | 14.361 GiB |
| Symlink link-string bytes | 806 | 806 B |
| All file-entry logical bytes | 15,420,278,101 | 14.361 GiB |
| Allocated file-entry sum | 15,660,253,184 | 14.585 GiB |
| Allocated directory sum | 0 | 0 B |
| Allocated unique inode sum | 15,650,316,288 | 14.575 GiB |
| Scan errors | 0 |  |
| Out-of-root/absolute symlinks | 10 |  |

Logical bytes use `lstat.st_size`; symlink bytes count the link string, not target contents. Allocated bytes use `st_blocks × 512`; APFS clone/dedup ownership is not measured. Unique-inode allocation removes hardlink double counting only. All human sizes use powers of 1024.

## Requested category views — overlapping

| Tag | Entries | Logical bytes | Logical size | Allocated bytes |
| --- | --- | --- | --- | --- |
| raster_image | 16,439 | 5,482,607,878 | 5.106 GiB | 5,515,829,248 |
| model | 4,512 | 4,826,273,119 | 4.495 GiB | 4,836,884,480 |
| frames_or_snapshots | 9,913 | 3,885,296,351 | 3.618 GiB | 3,905,286,144 |
| brand | 8,739 | 3,252,188,112 | 3.029 GiB | 3,270,107,136 |
| cache | 25,284 | 2,336,819,732 | 2.176 GiB | 2,394,075,136 |
| python_venv | 76,285 | 2,333,505,847 | 2.173 GiB | 2,515,640,320 |
| old_motion_labs | 2,657 | 2,173,186,403 | 2.024 GiB | 2,178,564,096 |
| video | 169 | 1,076,294,578 | 1.002 GiB | 1,076,649,984 |
| templates_and_formats | 4,525 | 612,300,468 | 583.935 MiB | 623,067,136 |
| audio | 350 | 586,749,664 | 559.568 MiB | 587,509,760 |
| source_code | 30,139 | 506,300,017 | 482.845 MiB | 574,967,808 |
| node_modules | 5,108 | 192,326,468 | 183.417 MiB | 206,217,216 |
| vector_image | 97 | 107,660,739 | 102.673 MiB | 107,880,448 |
| sfx | 140 | 65,195,785 | 62.176 MiB | 65,511,424 |
| document_pdf | 4 | 17,846,846 | 17.020 MiB | 17,854,464 |
| skills | 250 | 2,909,128 | 2.774 MiB | 3,444,736 |
| scripts | 354 | 2,523,442 | 2.407 MiB | 3,235,840 |
| git_metadata | 48 | 1,534,234 | 1.463 MiB | 1,679,360 |
| videolar | 0 | 0 | 0 B | 0 |

These tags **overlap** and cannot be summed. A model inside `.cache/whisper`, a PNG in an old motion lab, or a script inside a virtual environment can appear in several rows. Filename/path-based tags such as `skills`, `model` and `templates_and_formats` also include dependency files; use the exact root views below to distinguish the maintained project material.

## Exact requested directory roots

| Directory | File entries | Logical bytes | Logical size | Allocated bytes |
| --- | --- | --- | --- | --- |
| `node_modules` | 5,108 | 192,326,468 | 183.417 MiB | 206,217,216 |
| `.venv` | 24,805 | 893,727,116 | 852.325 MiB | 952,791,040 |
| `voice/chatterbox/env` | 45,154 | 1,249,767,052 | 1.164 GiB | 1,358,618,624 |
| `.tools/asset-treatment-venv` | 6,326 | 190,011,679 | 181.209 MiB | 204,230,656 |
| `.cache` | 607 | 1,819,853,255 | 1.695 GiB | 1,821,433,856 |
| `voice/chatterbox/cache` | 669 | 367,175,479 | 350.166 MiB | 368,754,688 |
| `voice/chatterbox/model` | 8 | 3,208,854,761 | 2.988 GiB | 3,208,876,032 |
| `.cache/whisper` | 1 | 1,528,008,539 | 1.423 GiB | 1,528,008,704 |
| `brand/bay-referee/motion-lab-v1` | 1,028 | 862,697,890 | 822.733 MiB | 864,866,304 |
| `brand/bay-referee/motion-lab-v1-1` | 800 | 647,192,421 | 617.211 MiB | 648,847,360 |
| `brand/bay-referee/motion-lab-v1-2` | 829 | 663,296,092 | 632.568 MiB | 664,850,432 |
| `brand` | 8,739 | 3,252,188,112 | 3.029 GiB | 3,270,107,136 |
| `audio/sfx` | 65 | 53,253,846 | 50.787 MiB | 53,403,648 |
| `audio/sfx/football-core-v1-1` | 32 | 26,622,931 | 25.390 MiB | 26,693,632 |
| `brand/bay-referee/channel-skill` | 10 | 92,866 | 90.689 KiB | 114,688 |
| `scripts` | 184 | 1,385,812 | 1.322 MiB | 1,728,512 |
| `formats` | 2,208 | 568,457,175 | 542.123 MiB | 573,079,552 |
| `engine/templates` | 0 | 0 | 0 B | 0 |
| `videolar` | 0 | 0 | 0 B | 0 |
| `.git` | 19 | 33,407 | 32.624 KiB | 90,112 |

Each row recursively counts descendants; nested rows overlap. Recognized Python environments, each with `pyvenv.cfg`: `.venv`, `voice/chatterbox/env`, `.tools/asset-treatment-venv`. `videolar` was absent in the repository and the inspected parent directory; the parent contained this repository and `.DS_Store`. A zero row is absence at the original snapshot, not a deletion recommendation.

## Media and font extensions

| Extension | Entries | Logical bytes | Logical size | Allocated bytes |
| --- | --- | --- | --- | --- |
| .mp4 | 169 | 1,076,294,578 | 1.002 GiB | 1,076,649,984 |
| .wav | 277 | 564,224,038 | 538.086 MiB | 564,834,304 |
| .mp3 | 34 | 8,600,829 | 8.202 MiB | 8,667,136 |
| .m4a | 7 | 7,849,919 | 7.486 MiB | 7,864,320 |
| .mov | 0 | 0 | 0 B | 0 |
| .webm | 0 | 0 | 0 B | 0 |
| .png | 5,532 | 3,794,487,080 | 3.534 GiB | 3,805,716,480 |
| .jpg | 10,903 | 1,682,966,990 | 1.567 GiB | 1,704,951,808 |
| .svg | 97 | 107,660,739 | 102.673 MiB | 107,880,448 |
| .ttf | 71 | 16,249,720 | 15.497 MiB | 16,351,232 |

All 171 extension groups are retained in the aggregate JSON. MP4/WAV/MP3 totals include final files, drafts, references and dependencies wherever they occurred; extension alone is not a retention decision.

## Exclusive categories — additive

| Category | Entries | Logical bytes | Logical size |
| --- | --- | --- | --- |
| frames_or_snapshots | 9,906 | 3,885,274,510 | 3.618 GiB |
| model | 94 | 3,211,992,539 | 2.991 GiB |
| python_venv | 76,285 | 2,333,505,847 | 2.173 GiB |
| cache | 649 | 1,820,333,803 | 1.695 GiB |
| brand | 5,638 | 1,021,969,574 | 974.626 MiB |
| raster_image | 692 | 946,452,509 | 902.607 MiB |
| video | 91 | 492,419,678 | 469.608 MiB |
| other | 1,845 | 452,702,115 | 431.730 MiB |
| templates_and_formats | 849 | 358,092,791 | 341.504 MiB |
| old_motion_labs | 553 | 292,237,015 | 278.699 MiB |
| audio | 64 | 230,689,019 | 220.002 MiB |
| node_modules | 5,108 | 192,326,468 | 183.417 MiB |
| vector_image | 18 | 107,069,101 | 102.109 MiB |
| sfx | 119 | 63,890,394 | 60.931 MiB |
| source_code | 342 | 6,760,873 | 6.448 MiB |
| document_pdf | 1 | 1,555,572 | 1.484 MiB |
| git_metadata | 48 | 1,534,234 | 1.463 MiB |
| scripts | 187 | 1,363,738 | 1.301 MiB |
| skills | 13 | 108,321 | 105.782 KiB |

Each entry belongs to one exclusive category. Their logical-byte sum equals the all-file-entry total. The category order explains why, for example, a cached model is counted as cache here while also receiving the model tag above.

## Largest 50 regular files

| Path | Logical bytes | Size | Allocated bytes | Category |
| --- | --- | --- | --- | --- |
| `voice/chatterbox/model/t3_mtl23ls_v3.safetensors` | 2,143,989,928 | 1.997 GiB | 2,143,993,856 | model |
| `.cache/whisper/medium.pt` | 1,528,008,539 | 1.423 GiB | 1,528,008,704 | cache |
| `voice/chatterbox/model/s3gen.pt` | 1,057,165,844 | 1008.192 MiB | 1,057,169,408 | model |
| `.venv/lib/python3.12/site-packages/torch/lib/libtorch_cpu.dylib` | 386,016,816 | 368.134 MiB | 386,019,328 | python_venv |
| `voice/chatterbox/env/lib/python3.12/site-packages/torch/lib/libtorch_cpu.dylib` | 186,195,520 | 177.570 MiB | 186,195,968 | python_venv |
| `voice/chatterbox/env/lib/python3.12/site-packages/llvmlite/binding/libllvmlite.dylib` | 129,871,888 | 123.855 MiB | 129,875,968 | python_venv |
| `.venv/lib/python3.12/site-packages/llvmlite/binding/libllvmlite.dylib` | 129,871,888 | 123.855 MiB | 129,875,968 | python_venv |
| `.cache/pip/http-v2/a/c/f/5/b/acf5bddc78a2e0c5577043231b851e4d937a01e9ac2fac18b954a4fb.body` | 127,307,099 | 121.410 MiB | 127,307,776 | cache |
| `formats/football-production-kit-v1-1.zip` | 93,380,476 | 89.055 MiB | 93,380,608 | templates_and_formats |
| `brand/bay-referee/motion-research/evidence/diagrams-code/PM17/source.mp4` | 80,915,826 | 77.167 MiB | 80,916,480 | brand |
| `voice/chatterbox/cache/pip/http-v2/b/4/b/5/f/b4b5fe9076af612804377ed5da5eaa78b37b53b2c6796b1f2c348b74.body` | 66,532,538 | 63.450 MiB | 66,535,424 | other |
| `episodes/episode-michelin/assets/maps/france-road-map-de-dion-bouton-1900.jpg` | 52,429,046 | 50.000 MiB | 52,432,896 | raster_image |
| `brand/bay-referee/motion-research/evidence/characters-photos/PM25/source.mp4` | 51,131,704 | 48.763 MiB | 51,134,464 | brand |
| `episodes/episode-michelin/renders/previews/michelin-v004.mp4` | 50,274,757 | 47.946 MiB | 50,278,400 | video |
| `episodes/episode-michelin/renders/previews/michelin-v004-picture.mp4` | 48,389,452 | 46.148 MiB | 48,390,144 | video |
| `voice/chatterbox/cache/pip/http-v2/7/e/0/1/3/7e0139bb744da111cf1c16b080919d0387ca004d8dc37698d30513ec.body` | 40,534,277 | 38.656 MiB | 40,538,112 | other |
| `.cache/pip/http-v2/7/e/0/1/3/7e0139bb744da111cf1c16b080919d0387ca004d8dc37698d30513ec.body` | 40,534,277 | 38.656 MiB | 40,538,112 | cache |
| `brand/bay-referee/motion-research/evidence/characters-photos/PM26/source.mp4` | 37,756,817 | 36.008 MiB | 37,756,928 | brand |
| `voice/chatterbox/cache/pkuseg/spacy_ontonotes/weights.npz` | 37,508,754 | 35.771 MiB | 37,511,168 | other |
| `voice/chatterbox/env/lib/python3.12/site-packages/perth/perth_net/pretrained/implicit/perth_net_250000.pth.tar` | 37,429,684 | 35.696 MiB | 37,433,344 | python_venv |
| `node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg` | 36,766,920 | 35.064 MiB | 36,769,792 | node_modules |
| `voice/chatterbox/cache/pkuseg/spacy_ontonotes.zip` | 34,567,143 | 32.966 MiB | 34,570,240 | other |
| `.tools/asset-treatment-venv/lib/python3.12/site-packages/onnxruntime/capi/onnxruntime_pybind11_state.so` | 33,651,824 | 32.093 MiB | 33,652,736 | python_venv |
| `brand/bay-referee/motion-research/evidence/type-shapes/gizakdag-cf4ae6/source.mp4` | 33,361,936 | 31.816 MiB | 33,366,016 | brand |
| `voice/reference/raw/benimses.wav` | 32,774,666 | 31.256 MiB | 32,776,192 | audio |
| `brand/bay-referee/motion-research/evidence/diagrams-code/PM22/source.mp4` | 31,643,835 | 30.178 MiB | 31,645,696 | brand |
| `.venv/lib/python3.12/site-packages/torch/lib/libtorch_python.dylib` | 31,036,048 | 29.598 MiB | 31,039,488 | python_venv |
| `brand/bay-referee/motion-research/evidence/characters-photos/PM28/source.mp4` | 28,369,082 | 27.055 MiB | 28,372,992 | brand |
| `brand/bay-referee/motion-research/evidence/diagrams-code/PM20/source.mp4` | 28,357,326 | 27.044 MiB | 28,360,704 | brand |
| `.tools/asset-treatment-venv/lib/python3.12/site-packages/onnxruntime/capi/libonnxruntime.1.23.2.dylib` | 27,623,992 | 26.344 MiB | 27,627,520 | python_venv |
| `voice/chatterbox/env/lib/python3.12/site-packages/torch/lib/libtorch_python.dylib` | 26,150,760 | 24.939 MiB | 26,152,960 | python_venv |
| `voice/chatterbox/cache/pip/http-v2/5/c/0/4/4/5c044f1ae92f31e33741de691b9fa3394d9aff732674449ec0d32616.body` | 24,162,460 | 23.043 MiB | 24,166,400 | other |
| `voice/chatterbox/env/lib/python3.12/site-packages/numpy/.dylibs/libopenblas64_.0.dylib` | 23,198,400 | 22.124 MiB | 23,199,744 | python_venv |
| `voice/chatterbox/cache/pkuseg/spacy_ontonotes/features.msgpack` | 22,685,181 | 21.634 MiB | 22,687,744 | other |
| `qa/editorial-motion-kit-v1-side-by-side.mp4` | 20,617,343 | 19.662 MiB | 20,619,264 | video |
| `voice/chatterbox/cache/pip/http-v2/2/5/d/7/9/25d7962d86addab78a7008f5c415b3570b444855c4f86fd60dba6948.body` | 20,344,366 | 19.402 MiB | 20,344,832 | other |
| `episodes/episode-michelin/renders/experiments/editorial-motion-kit-v1-benchmark-v2.mp4` | 19,372,117 | 18.475 MiB | 19,374,080 | video |
| `episodes/episode-bosman/qa/full-internal-v1/first-encode/bosman-full-internal-v1.mp4` | 18,995,937 | 18.116 MiB | 18,997,248 | video |
| `episodes/episode-bosman/renders/drafts/bosman-full-internal-v1.mp4` | 18,957,253 | 18.079 MiB | 18,960,384 | video |
| `episodes/episode-michelin/renders/experiments/editorial-motion-kit-v1-benchmark-v2-picture.mp4` | 18,790,718 | 17.920 MiB | 18,792,448 | video |
| `node_modules/@img/sharp-libvips-darwin-arm64/lib/libvips-cpp.8.18.7.dylib` | 18,231,688 | 17.387 MiB | 18,235,392 | node_modules |
| `node_modules/@ffprobe-installer/darwin-arm64/ffprobe` | 18,187,448 | 17.345 MiB | 18,190,336 | node_modules |
| `brand/bay-referee/motion-research/evidence/type-shapes/shneural-2abdfa/source.mp4` | 17,435,601 | 16.628 MiB | 17,436,672 | brand |
| `episodes/episode-bosman/renders/drafts/bosman-full-internal-v1-picture.mp4` | 16,995,752 | 16.208 MiB | 16,998,400 | video |
| `episodes/episode-michelin/qa/v4c-sequence-references/OS-003.mp4` | 16,966,652 | 16.181 MiB | 16,969,728 | video |
| `qa/editorial-motion-kit-v1-old-window.mp4` | 16,146,210 | 15.398 MiB | 16,146,432 | video |
| `qa/benchmark-v2-typography/archivo-900-75-travel.svg` | 16,039,190 | 15.296 MiB | 16,039,936 | vector_image |
| `qa/benchmark-v2-typography/manrope-medium-travel.svg` | 16,038,779 | 15.296 MiB | 16,039,936 | vector_image |
| `qa/benchmark-v2-typography/bebas-neue-travel.svg` | 16,037,956 | 15.295 MiB | 16,039,936 | vector_image |
| `brand/bay-referee/motion-research/evidence/type-shapes/lukasersil-0ed38e/source.mp4` | 15,972,860 | 15.233 MiB | 15,974,400 | brand |

## Largest 30 recursive directories

| Directory | Regular files | Logical bytes | Size | Allocated file bytes |
| --- | --- | --- | --- | --- |
| `voice` | 46,548 | 4,974,915,995 | 4.633 GiB | 5,086,851,072 |
| `voice/chatterbox` | 45,998 | 4,837,923,965 | 4.506 GiB | 4,948,803,584 |
| `brand` | 8,739 | 3,252,188,112 | 3.029 GiB | 3,270,107,136 |
| `brand/bay-referee` | 8,738 | 3,252,179,916 | 3.029 GiB | 3,270,094,848 |
| `voice/chatterbox/model` | 7 | 3,208,854,761 | 2.988 GiB | 3,208,876,032 |
| `episodes` | 5,597 | 2,903,676,887 | 2.704 GiB | 2,915,053,568 |
| `episodes/episode-michelin` | 2,039 | 2,293,113,571 | 2.136 GiB | 2,297,294,848 |
| `.cache` | 607 | 1,819,853,255 | 1.695 GiB | 1,821,433,856 |
| `.cache/whisper` | 1 | 1,528,008,539 | 1.423 GiB | 1,528,008,704 |
| `voice/chatterbox/env` | 45,151 | 1,249,767,052 | 1.164 GiB | 1,358,618,624 |
| `voice/chatterbox/env/lib` | 45,109 | 1,249,729,264 | 1.164 GiB | 1,358,430,208 |
| `voice/chatterbox/env/lib/python3.12` | 45,108 | 1,249,723,116 | 1.164 GiB | 1,358,422,016 |
| `voice/chatterbox/env/lib/python3.12/site-packages` | 45,107 | 1,249,716,968 | 1.164 GiB | 1,358,413,824 |
| `episodes/episode-michelin/qa` | 1,374 | 1,206,584,771 | 1.124 GiB | 1,209,384,960 |
| `.venv` | 24,802 | 893,727,116 | 852.325 MiB | 952,791,040 |
| `.venv/lib/python3.12/site-packages` | 24,782 | 893,695,860 | 852.295 MiB | 952,692,736 |
| `.venv/lib/python3.12` | 24,782 | 893,695,860 | 852.295 MiB | 952,692,736 |
| `.venv/lib` | 24,782 | 893,695,860 | 852.295 MiB | 952,692,736 |
| `brand/bay-referee/motion-lab-v1` | 1,028 | 862,697,890 | 822.733 MiB | 864,866,304 |
| `brand/bay-referee/motion-research` | 5,391 | 689,519,219 | 657.577 MiB | 700,559,360 |
| `brand/bay-referee/motion-research/evidence` | 5,372 | 688,976,367 | 657.059 MiB | 699,985,920 |
| `brand/bay-referee/motion-lab-v1-2` | 829 | 663,296,092 | 632.568 MiB | 664,850,432 |
| `brand/bay-referee/motion-lab-v1-1` | 800 | 647,192,421 | 617.211 MiB | 648,847,360 |
| `episodes/episode-bosman` | 3,537 | 610,551,411 | 582.267 MiB | 617,709,568 |
| `.venv/lib/python3.12/site-packages/torch` | 14,963 | 574,024,207 | 547.432 MiB | 610,816,000 |
| `formats` | 2,208 | 568,457,175 | 542.123 MiB | 573,079,552 |
| `episodes/episode-bosman/qa` | 3,298 | 472,833,437 | 450.929 MiB | 479,481,856 |
| `.venv/lib/python3.12/site-packages/torch/lib` | 12 | 419,171,836 | 399.753 MiB | 419,209,216 |
| `episodes/episode-bosman/qa/full-internal-v1` | 2,665 | 406,886,434 | 388.037 MiB | 412,286,976 |
| `brand/bay-referee/motion-lab-v1/b-process` | 454 | 400,580,980 | 382.024 MiB | 401,682,432 |

Directory rows overlap and cannot be added.

## Top-level directories

| Directory | Regular files | Logical bytes | Size |
| --- | --- | --- | --- |
| `voice` | 46,548 | 4,974,915,995 | 4.633 GiB |
| `brand` | 8,739 | 3,252,188,112 | 3.029 GiB |
| `episodes` | 5,597 | 2,903,676,887 | 2.704 GiB |
| `.cache` | 607 | 1,819,853,255 | 1.695 GiB |
| `.venv` | 24,802 | 893,727,116 | 852.325 MiB |
| `formats` | 2,208 | 568,457,175 | 542.123 MiB |
| `qa` | 568 | 347,076,693 | 330.998 MiB |
| `.tools` | 6,325 | 194,592,802 | 185.578 MiB |
| `node_modules` | 5,098 | 192,326,468 | 183.417 MiB |
| `references` | 1,204 | 144,816,061 | 138.107 MiB |
| `audio` | 65 | 53,253,846 | 50.787 MiB |
| `mascot` | 57 | 42,648,529 | 40.673 MiB |
| `engine` | 238 | 20,848,079 | 19.882 MiB |
| `research` | 151 | 9,717,203 | 9.267 MiB |
| `scripts` | 184 | 1,385,812 | 1.322 MiB |
| `tests` | 40 | 242,284 | 236.605 KiB |
| `sfx-review` | 6 | 226,506 | 221.197 KiB |
| `renders` | 2 | 85,413 | 83.411 KiB |
| `docs` | 7 | 47,177 | 46.071 KiB |
| `.git` | 19 | 33,407 | 32.624 KiB |
| `schemas` | 5 | 21,091 | 20.597 KiB |
| `config` | 2 | 14,088 | 13.758 KiB |

## Root Git repository and history

At 2026-10-17T11:25:41.704690+03:00, HEAD did not exist; symbolic HEAD was `refs/heads/main`. There were **0 commits**, **0 refs**, **0 tracked files**, **0 reachable objects/blobs**, **0 loose objects**, **0 packs** and **0 committed large media**. The largest-history-blob list is empty. **No history rewrite is indicated.** This says nothing about a remote repository; no remote was contacted and no remote URL was emitted.

Root `.git`: **33,407 logical bytes**, **90,112 allocated bytes**, 19 files. The broader `git_metadata` category includes nested metadata and must not be substituted for root `.git` size.

Git listing: **19,138 visible untracked** and **83,196 ignored untracked** entries. Inventory Git-state counts: `{"git_internal": 19, "ignored_untracked": 83195, "unclassified": 150, "untracked_visible": 19138}`. These are separate observations in a non-atomic scan; concurrent files and listing scope can cause small differences. Untracked working-copy media is not committed history.

## Later portable candidate selection

The separate manifest read for this report selects **240 files / 33,710,838 bytes (32.149 MiB)**. Binary candidates total **30,543,250 bytes across 42 files**; the largest is `mascot/engin-avatar-v1/master/master-identity.png` at 7,233,850 bytes. None reaches the local **25 MiB review threshold**. **Git LFS is not recommended for V1.** Raw licensed SFX and standalone derived cues are outside Git and LFS.

This candidate selection is later than the original inventory and can change when final audit documents are added. Read `docs/portable-repo-manifest.json` for the final exact source-set total, and `docs/portable-repository-v1/lfs-recommendation.md` for the exact binary list. Clean-clone installation and smoke results are separate validation evidence supplied by the main report; this size audit does not claim an unperformed render.

## Evidence binding

- Inventory SHA-256: `cf8c8c9b83170d369f7ed340a432711d72766a0319a0aab7e747a22953db25fe`.
- Git history SHA-256: `da2028ff04761d82196fabcf21f23288d15cb53b8f96bf74ecbc54e77958bf83`.
- Candidate manifest SHA-256 at report generation: `bbc148eaf3435e3276d4e73b04dc20409914fd74be72929186c7458ddf52b4d0`.
- Canonical aggregate JSON: `docs/portable-repo-audit.json`; versioned copy: `docs/portable-repository-v1/audit.json`.
- Full per-file metadata remains in local `docs/portable-repository-v1/inventory.json`; it is deliberately omitted from the aggregate JSON.
