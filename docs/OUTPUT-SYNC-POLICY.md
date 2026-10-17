# Source and output storage policy

Git carries the selected production source: engine code, safe configuration, scripts, tests, maintained skills, Motion Grammar, templates, public source metadata, license text and the approved reusable brand assets listed in the portable manifest. The Git source set is the authority for setting up another machine. It does not contain installed environments, caches, model weights, raw SFX libraries or historical rendered episodes.

Episode outputs live separately from source synchronization. Suitable operator-selected destinations include a private iCloud Drive, Google Drive or Dropbox folder, an external disk, or an authenticated NAS. These are storage options only: **no connector, remote folder, account, share, upload or synchronization integration was invoked or configured in this task.** Existing local directories were not moved or deleted.

## Package boundary

A review/delivery package can contain the final branded video, alternate dub review videos, final narration and dub audio needed for that episode, captions/SRT, canonical scripts, timing, research/claims, motion plan, production report, QA and review page. Include source-file hashes, source revision/manifest identity, episode slug and version so another machine can identify the corresponding source. Keep a checksum list alongside a completed package and verify after copying.

Licensed SFX source files and isolated derived cues stay in the private local asset cache and are not bundled with source/tools/templates. Share the larger finished audiovisual work according to its source licenses and the episode's approval state. Raw personal photographs, voice-reference/training recordings and credentials are excluded from portable source and ordinary review packages; any separate personal backup requires an explicitly selected private destination and access scope.

## Slug, version and collision handling

Use a stable topic slug and a new version directory for each distinct deliverable, for example `backpass-1992/v1`. Before creating or transferring a package, inspect the destination. If the same slug/version already exists with matching hashes, preserve it and treat the operation as already complete. If bytes differ, do not overwrite or merge silently: the operator chooses the next unused version (`v2`, `v3`, ...) or an explicitly named separate branch of the work. A source-code clone on another machine does not automatically choose or change an episode version.

Write a new package to a temporary sibling destination, finish it, verify its checksum list, then mark it complete. Avoid two machines writing the same active output version. Use one writer per version and copy completed packages; a sync provider's conflict copy is not a new approved production version. Keep local production work until the operator confirms a verified backup and explicitly authorizes any deletion.

## Local archive

Keep old labs, rejected encodes and prior episodes in their existing local paths during this portability work. A later archive can group them under an operator-selected output/archive destination without changing source authority. That archive/migration is a separate action; this policy does not execute it or imply permission to delete local copies. Dependency directories and caches are recreated through setup when needed, not uploaded as the portable source tree.

Never put `.env`, saved sessions, access tokens or connector credentials into Git or an episode share. Do not publish or grant additional access merely because a file is synchronized. Human review and publication authorization remain separate from backup or storage.
