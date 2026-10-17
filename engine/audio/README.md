# Local restrained SFX mixer

`mix-sfx.mjs` mixes selected, licensed local effects into a native PCM narration track at unity gain. It introduces no generation, provider dependency, music, normalization, limiter or narration resampling. Source files remain immutable. Effects alone may be downmixed, resampled, trimmed, faded and attenuated.

`mixSfx({root,planPath,manifestPath,ffmpeg,ffprobe,bedPath,mixPath,reportPath})` validates a private library manifest and source SHA-256 hashes, decodes native narration to float without changing its sample rate, creates a sample-indexed effect bed, and writes separate IEEE-float WAV bed/mix files. A cue at `time` seconds starts at `round(time × sample_rate)`; absent `trim_seconds`, its entire decoded duration is used. Cue fades are applied only within those samples.

The plan explicitly requires `voice_gain:1`, `music:false`, native `sample_rate`, mono `channels:1`, `peak_cap_dbfs` no higher than −32, and `voice_rms_margin_db` at least 18. Each effect is attenuated to both limits; gain never exceeds 1. A concurrent voice interval below −50 dBFS RMS is classified silent and uses peak protection only. Overlapping effects cannot bypass the whole-bed peak cap. All cue intervals must fit inside the original narration's exact sample count.

Output is decoded again. Checks cover exact sample count, no clipping, original/source hashes, cue level margins, and recovery of the original narration by subtracting the bed from the mix (float tolerance 1.2×10⁻⁷). The narration is encoded only once to AAC during delivery mux. Numerical validation does not establish perceptual quality; reports retain the audition limitation.

Licensed sources and isolated bed/stems stay private and are not reusable public bundles. Creator fields are preserved as provided, including `null` where the provider does not identify a creator.

Run focused regressions: `node --test tests/test_audio_mix.mjs`. Numerical fixture signals are temporary tests only and never enter the production SFX library.
