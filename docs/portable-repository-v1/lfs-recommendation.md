# Git LFS recommendation — Portable Repository V1

**Decision: use ordinary Git for the selected V1 source assets; do not initialize Git LFS.** This recommendation is based on candidate manifest SHA-256 `bbc148eaf3435e3276d4e73b04dc20409914fd74be72929186c7458ddf52b4d0`, observed 2026-10-17T11:40:21.800903+03:00. No Git/LFS command was run by this recommendation step.

The candidate source tree at this observation is **240 files / 33,710,838 bytes (32.149 MiB)**. Its **42 binary candidates total 30,543,250 bytes (29.128 MiB)**. The largest file is 7,233,850 bytes (6.899 MiB); no candidate reaches **25 MiB (26,214,400 bytes)**. These are project review thresholds, not a claim about a hosting provider's limits.

Adding LFS here would introduce another retrieval dependency for a small, reusable asset set. Reconsider when binary sources grow materially, frequently change, or a single candidate reaches the warning threshold. The proposed LFS set is **0 files / 0 bytes**. Manifest classification `REQUIRED_BUT_LFS_CANDIDATE` identifies a binary worth evaluating; it does not override the explicit `lfs_recommended: false` decision.

## Exact selected binary candidates

| Repository-relative path | Bytes | Size | Classification |
| --- | --- | --- | --- |
| `mascot/engin-avatar-v1/master/master-identity.png` | 7,233,850 | 6.899 MiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/master/referee-master.png` | 6,716,719 | 6.406 MiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/profile/profile-square.png` | 1,204,812 | 1.149 MiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/brand-bug/head.png` | 1,097,809 | 1.047 MiB | REQUIRED_BUT_LFS_CANDIDATE |
| `formats/football-comparison-v1/fonts/Archivo-variable.ttf` | 658,596 | 643.160 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/brand-bug/head-monochrome.png` | 587,678 | 573.904 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/point-up-left.png` | 565,567 | 552.312 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/point-up-right.png` | 565,060 | 551.816 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/point-right.png` | 548,913 | 536.048 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/neutral.png` | 544,632 | 531.867 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/confirm.png` | 542,528 | 529.812 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/point-left.png` | 537,910 | 525.303 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/compare-both.png` | 531,959 | 519.491 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/point-to-spot.png` | 524,608 | 512.312 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/surprised.png` | 520,829 | 508.622 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/hands-open.png` | 520,001 | 507.813 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/final-decision.png` | 519,455 | 507.280 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/conclusion.png` | 518,138 | 505.994 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/explain-forward.png` | 517,900 | 505.762 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/presenting-object-left.png` | 510,396 | 498.434 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/stop-wait.png` | 506,241 | 494.376 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/presenting-object-right.png` | 503,775 | 491.968 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/calm-down.png` | 497,370 | 485.713 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/whistle-ready.png` | 496,242 | 484.611 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/thinking.png` | 494,472 | 482.883 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/red-card.png` | 492,144 | 480.609 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/var-rectangle.png` | 489,826 | 478.346 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/yellow-card.png` | 487,556 | 476.129 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/advantage.png` | 480,986 | 469.713 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/avatar/poses/whistle-blow.png` | 479,586 | 468.346 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/profile/profile-square-512.png` | 320,183 | 312.679 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `formats/football-comparison-v1/fonts/Manrope-Medium.ttf` | 97,536 | 95.250 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/profile/profile-square-256.png` | 86,275 | 84.253 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/profile/profile-square-128.png` | 24,432 | 23.859 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/watermark/overlay-1080x1920.png` | 22,437 | 21.911 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/brand-bug/corner-128.png` | 21,943 | 21.429 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/wordmark/wordmark.png` | 18,895 | 18.452 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/wordmark/wordmark-dark.png` | 18,885 | 18.442 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/brand-bug/corner-96.png` | 13,488 | 13.172 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/watermark/lockup.png` | 12,837 | 12.536 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/brand-bug/corner-64.png` | 6,641 | 6.485 KiB | REQUIRED_BUT_LFS_CANDIDATE |
| `brand/bay-referee/brand-bug/corner-48.png` | 4,140 | 4.043 KiB | REQUIRED_BUT_LFS_CANDIDATE |

The list is the complete `.png`/`.ttf` binary set in this manifest snapshot. SVG, JSON, scripts, Markdown and license text are ordinary text source and are not counted as binary LFS candidates. Full per-file SHA-256 values are in the candidate manifest. Subsequent generated documentation may change total source bytes without changing these assets; the final manifest remains authoritative.

## Audio and archive boundary

Raw SFX, voice-reference recordings, narrated episode audio, standalone three-whistle cues, rendered MP4s, frame sequences, model weights, caches and installed dependencies are excluded from this source set. **Git LFS is not a licensing workaround.** The documented Mixkit policy keeps original source audio and isolated derived cues out of Git and LFS; portable metadata records public provenance, expected bytes/hash and an explicit local acquisition route. See `docs/portable-repository-v1/sfx-policy.md` and `config/bay-referee-portable-assets.json`.

The approved transformed avatar/identity PNGs are different assets from the raw personal photo and voice references. Only the selected transformed source assets above are included. Existing local originals and historical episode outputs remain in place. See `docs/OUTPUT-SYNC-POLICY.md` for storage separation.
