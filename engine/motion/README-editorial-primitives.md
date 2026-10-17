# Editorial motion primitives

`editorial-primitives.mjs` is browser-compatible ESM with no dependency, clock, DOM query, accumulated transform, or hidden state. Sampling the same absolute time gives the same result after any seek order.

## Object tracks

`objectEnter(time, track)`, `objectExit(time, track)`, and `sharedObjectTransition(time, track)` all return the existing `sampleObjectTrack` contract:

```js
{object_id, owner, progress, values: {x, y, scale, opacity /* supplied properties */}}
```

A track has `object_id`, `owner`, a nonempty narrative `purpose`, `start`, `end`, matched numeric `from`/`to` properties, and optional `easing`. The three names communicate editorial intention; their shared numerical implementation does not silently add drift, bounce, or fades. The caller supplies desired endpoints. Scale cannot be negative; opacity must be 0…1. Times clamp before/after a positive interval. Existing easings are `linear`, `smoothstep`, `easeOutCubic`, and `easeInOutSine`.

Use `validateMotionOwners(tracks)` from `editorial-state.mjs` before rendering. One object must not receive simultaneous owners or overlapping tracks for the same property. Sequential tracks may touch at a boundary. The composition must select the intended track at a time; applying every clamped track one after another would overwrite the intended pose and is not supported orchestration.

## Path and relation primitives

`pathDraw(time,{start,end,points,easing})` returns `{progress,pathLength,visibleLength,marker:{x,y,angle},visiblePoints}`. `angle` is degrees. `samplePolyline(points,progress)` supplies identical geometry when progress is already known. Connector, Arrow and RouteObject use this exact geometry authority. Uneven segment lengths are respected; consecutive duplicate vertices are removed. All-coincident, nonfinite, or fewer-than-two-point paths are rejected. Progress is clamped. At an exact corner the incoming segment sets the tangent; after the corner the next segment does. This is an authored polyline, not an estimated smooth curve.

`labelAttach({x,y,width,height},{dx=0,dy=0})` returns the right-edge midpoint plus offsets as `{x,y}`. It recomputes from current object bounds, so a label follows an object's current role/layout without a competing independent movement track. It does not pack labels, resolve overlaps, or animate text on its own.

No camera motion is required by these functions. Whether a visual change is meaningful must be authored and reviewed; reaching a timestamp is not evidence of an editorial improvement.
