# Secret / privacy scan — Portable Repository V1

**PASS_CANDIDATE_HEURISTIC_SCAN** · 2026-10-17. No secret values are reproduced. No credential was deleted, rotated, transmitted or created.

Exact boundary: `docs/portable-repo-manifest.json`, 256 candidates, 214 text files scanned and 42 approved/classified binary files. Candidate-list SHA-256: `72ce4cc7c85261f203b20442eac7990efe87d27e1e08d2001071980f71443ea6`. Manifest snapshot SHA-256: `9561e5677bbb15ffed34802ee60e48391cce4ca0ca4f8ba322999080c451f5dd`. Full metadata-only results: [secret-scan.json](secret-scan.json).

## Raw privacy boundary

- `mascot/engin-avatar-v1/provenance/user-identity-reference.png` — raw_personal_identity_photo; excluded.
- `voice/reference/raw/benimses.wav` — personal_voice_clone_reference; excluded.
- `voice/reference/candidates/ref-a.wav` — personal_voice_clone_reference; excluded.
- `voice/reference/candidates/ref-b.wav` — personal_voice_clone_reference; excluded.
- `voice/reference/candidates/ref-c.wav` — personal_voice_clone_reference; excluded.

Approved transformed illustrated masters, final referee poses, brand images and licensed fonts are separately permitted reusable source assets. Their inclusion does not authorize tracking raw personal photo/voice sources. `voice/decision.json` contains a logical remote voice identity, not authentication; each machine connects through its own authorized Higgsfield account/workspace.

## Findings

0 unresolved candidate findings; 0 reviewed synthetic/placeholder matches. `.npmrc` contains only cache/fund/audit configuration keys, with no credential assignment.


The broader local workspace contains historical opaque provider-media URLs and saved third-party HTML with credential-shaped fields. Those are excluded artifacts, not current tracked credentials. Mixkit saved HTML includes an access-token-shaped public-page field; Getty evidence includes a session field. Public-safe SFX license summaries/links are retained instead of those page snapshots. None of those values are copied here.

## Limits

Private keys, common API/GitHub/AWS/JWT shapes, bearer literals, credential assignments, signed URL query fields, opaque provider-media routes and sensitive filenames were screened. Binary files were checked against the explicit privacy/asset classification rather than represented as text. This bounded scan is not proof that arbitrary unknown secrets cannot exist. A changed candidate list requires another scan. No remote repository, cloud upload or push occurred.
