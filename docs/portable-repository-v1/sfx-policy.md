# SFX storage policy — Portable Repository V1

**Decision: B — metadata in Git; licensed audio acquired locally.** Audit date: 2026-10-17. Neither raw SFX nor the standalone derived whistle cue belongs in Git/LFS. A private repository is not treated as a redistribution exemption.

## Provider authority

Mixkit permits its SFX inside larger creative end products, but its source restriction is explicit: “You can’t redistribute the Item on its own, as stock, in a tool or template, or with source files.” The current Sound Effects Free License was checked directly. This production source repository is not the finished video. [Mixkit SFX license](https://mixkit.co/license/modal/sfxFree/)

Mixkit's current terms also restrict stock/inventory redistribution and scripted mass downloading. A bootstrap should request only specifically selected, hash-verified assets, never scrape the library. [Mixkit terms, sections 9–10](https://mixkit.co/terms/)

The single Pixabay item is already ineligible in the local kit. Its license also prohibits standalone distribution; it is not part of the minimal bootstrap. [Pixabay terms, section 5](https://pixabay.com/service/terms/) · [License summary](https://pixabay.com/service/license-summary/)

The derived 0.9 s closure remains an isolated audio source made from licensed material. Excluding it from Git is the conservative repository policy; this is not a claim that adding edits grants standalone redistribution rights. The larger finished episode may contain the mixed cue under the source license.

## Measured current kit

`audio/sfx/football-core-v1-1/`: 26,622,931 bytes across 32 files. Its raw directory: 26,393,110 bytes across 23 files. Sources: 22 Mixkit + 1 Pixabay; 21 assets are currently pilot-eligible. These are local catalog states, not new human audition approvals.

- Required brand dependency: `mixkit-police-short-whistle-615`. The title is “Police short whistle”; do not claim recorded referee/match provenance.
- Common football optional dependency: `mixkit-soccer-ball-quick-kick-2108`. Effects remain semantic and optional; `NONE` is valid.
- Other 19 currently eligible catalog entries: optional local library restoration, only when selected for an actual event.
- `mixkit-hitting-soccer-ball-2112` and `pixabay-net-hit-313216`: ineligible; do not promote them during setup.

The exact per-asset list, local relative paths, hashes, eligibility, sizes and bootstrap tiers are in [privacy-assets.json](privacy-assets.json). The full historical manifest stays local; a portable safe manifest should retain only public provenance fields, expected hashes, relative destination paths and license URLs. Historical absolute download paths are evidence, not runtime inputs.

## Verified public acquisition endpoints

Live HTML was read on 2026-10-17; no audio was downloaded during this audit. Official download pages expose these original WAV URLs:

| Item | Official page | Original WAV |
|---|---|---|
| 615 | [Mixkit download page](https://mixkit.co/free-sound-effects/download/615/?context=item+grid) | `https://assets.mixkit.co/active_storage/sfx/615/615.wav` |
| 2108 | [Mixkit download page](https://mixkit.co/free-sound-effects/download/2108/?context=item+grid) | `https://assets.mixkit.co/active_storage/sfx/2108/2108.wav` |

The category pages also expose preview MP3s. Those are not substitutes for the approved WAVs or their hashes. A future downloader must allowlist the provider host, verify the destination path stays inside the local asset root, reject changed hashes, preserve an already valid local file, and never require or save connector credentials. Local file import with the same checksum is an equally suitable bootstrap method. Network retrieval itself was not exercised in this task.

## Closure reconstruction

Keep `brand/bay-referee/tokens/signoff.json` as recipe authority; ignore its historical VAR/SAOT core timing when applying it to a new episode. Source item 615 starts at 0.095 s. The three excerpts are 0.19 / 0.19 / 0.28 s, placed at local 0.10 / 0.34 / 0.58 s in the 0.9 s closure. Preserve the documented fades, static gains and source hash; do not change pitch or stretch speech. The existing `scripts/bay-referee-signoff.mjs` full audio builder also requires the old VAR/SAOT voice/mix, so portable setup must use the new episode-neutral closure utility rather than run that builder unchanged.

`brand/bay-referee/outro/audio/referee-triple-final.wav` is 172,856 bytes and remains local/regeneratable. Long mixed/stem/context WAVs in the same folder are historical outputs and are excluded too. Visual head/wordmark assets are separate approved transformed brand files and may be included in the source repository.

## Evidence and privacy

Keep item title/provider, public item/category URLs, license URL, acquisition date, byte size, SHA-256, eligibility and actual usage record. Do not copy saved provider HTML into the candidate source set merely to preserve license evidence: existing page snapshots contain credential-shaped public telemetry fields. A concise policy with exact official links avoids those fields; old snapshots remain untouched locally. Do not expose library raws through a review server, claim ownership or register isolated licensed items with rights-management services.
