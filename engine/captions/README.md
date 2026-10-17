# Phrase captions and text responsibility

`phrases.mjs` groups original timed words using an injected real-font width measurement. It preserves spelling, order, source word references and onset/offset timestamps; wrapping is at whole words and at most two lines. Display tails are bounded by the next phrase; the caller also caps at scene/audio boundaries. There is no karaoke or per-word animation.

`responsibility.js` is a browser helper with `EngineTextResponsibility.validateWindows`, `at` and `apply`. Allowed primary tasks are `caption`, `hero`, `graphic`, `document`. Invalid or overlapping windows fail. `apply` keeps the full phrase string while hiding only the duplicate on-screen caption during a non-caption task.

Selective caption suppression requires a complete accessibility transcript/subtitle deliverable. Michelin V3 includes all148 words in complete Turkish SRT/VTT sidecars. The bundled FFmpeg4.4 forcibly enables the first MP4 subtitle track, so V3 omits embedded subtitles to avoid player-dependent duplicate overlays. A visual hero is not a substitute for the full accessible text.

Mark all critical overlays and meaningful objects with `data-critical-safe`; give independent text tasks `data-text-group` IDs and actual roles. Review generic `engine/qa/platform-safety.mjs` output. The chosen project safe rectangle is a technical QA policy, not a permanent channel design.

Regression tests: `node --test tests/captions-v3.test.mjs` (included through `tests/test_visual_engine.py` in the existing `npm test` command).
