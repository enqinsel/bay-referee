# Editorial design capability

This layer translates a narrative problem into a deliberate composition, material treatment and relationship between shots. It defines no channel style, palette, font token or permanent template. Research preceded implementation: [study and research gate](../../research/art-direction/ART_DIRECTION_STUDY.md).

- [17 technique contracts](techniques/catalog.json): when/when-not, assets, advisory text, motion and transition choices.
- [9 layout recipes](layout-recipes/catalog.json): relationships and alternatives, not fixed boxes.
- [`editorial.js`](editorial.js): the two original route mechanics actually used by Michelin V004b Meanings.
- [Layout diversity diagnostic](../qa/layout-diversity.mjs): soft review of repeated meaningful shot signatures.
- [On-demand SFX](../audio/ON_DEMAND.md): scene event first; silence is valid.

Write the scene's `design-plan.md` before code. Record primary/secondary/tertiary, text responsibility, chosen pattern and technique, asset roles, establish/action/hold, transition relation, motion owner, SFX intent and critique questions. The new design sidecar leaves previous storyboard/production records immutable. The contract catalog is not a claim that every technique has a ready-made implementation; existing primitives compose them when a scene needs one.

## Route mechanics

Load `editorial.js` as a classic script after the existing motion primitives. It exposes `window.EngineEditorial`; Node also receives CommonJS exports. There is no new renderer or dependency.

```js
const p = EngineEditorial.routeProgress(time, actionStart, actionDuration);
const pose = EngineEditorial.sampleRoute(path, p);
path.style.strokeDashoffset = pose.length * (1 - p);
marker.setAttribute('transform', `translate(${pose.x} ${pose.y}) rotate(${pose.angle})`);
```

`routeProgress(time,start,duration)` is clamped absolute-time smoothstep, with exact endpoints and no accumulated state. `sampleRoute(SVGPathElement,progress)` returns `{x,y,angle,progress,length}` in the path's local coordinates; `angle` is forward tangent **in degrees**. Sampling uses a one-sided tangent at endpoints and reads current geometry without a stale cache. Keep path and marker in the same coordinate system. The helper does not declare that a route is factual, choose its shape or approve its look.

## Diversity integration

```js
import {analyzeLayoutDiversity} from '../qa/layout-diversity.mjs';
const report = analyzeLayoutDiversity(design.shots);
```

Supply an ordered list of unique shots/scenes, not one record for every frame. Each has `id`/`scene_id`, `layout_signature`, and optional `repetition_rationale`/`justification`. Preferred signature roles: `frame`, `headline`, `material`, `caption`. `primary`/`image`, `header`/`title`, and `secondary: 'caption-lower'` are accepted aliases. Explicit `none` is valid; missing roles require review. Key order, common placement synonyms and content-specific route/star wording cannot suppress a repeated arrangement. If `primary_geometry: [x,y,width,height]` is supplied, it contributes a coarse material region, not a pixel-perfect comparison.

A run of **three consecutive equivalent signatures** emits `LAYOUT_REPETITION_WARNING` and `status: REVIEW_REQUIRED`; never a hard aesthetic error. The report retains the full run and supplied explanations. An intentional shared geography is a reasonable explanation, but is still visible for human review. Distinct recipe names cannot clear identical geometry. A plan-based signature is not image similarity: compare actual output too.

Missing/duplicate shot IDs and incomplete signatures request review so a bad or frame-level plan does not silently pass. `PASS` means no declared-pattern warning, not professional aesthetic approval. The default three-shot threshold may be raised deliberately, never lowered below three.

Tests: `node --test tests/layout_diversity.mjs`; the Python bridge includes them in `npm test`. They cover false-negative aliasing, consecutive versus nonconsecutive runs, explicit justification, frame duplication, route endpoints, tangent geometry and invalid path rejection.
