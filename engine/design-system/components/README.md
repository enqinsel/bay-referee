# Editorial SVG components

These renderer-independent ESM functions return `{id, svg, bounds}`. `bounds` is an axis-aligned rectangle `{x,y,width,height}` in SVG coordinates. They contain no scene layout, animation clock, source-reference palette, or brand font. A caller owns composition, semantic roles, track timing, provenance, and final glyph inspection.

Every component requires a persistent valid SVG `id`. Pass one shared `ids: new Set()` to all components in a frame to reject duplicates; create a new set on each seek. All text and attribute values are escaped. Numeric inputs must be finite. Colors come from explicit arguments or the supplied resolved tokens. Object identity belongs to the caller and survives a role/layout change.

| Component | Editorial purpose | Inputs beyond `id`, optional `ids` |
|---|---|---|
| `TechnicalLabel` | Name a specific object or its relationship, close to that object. | `x,y,text,color,size` (38), optional common text options |
| `MicroBadge` | Optional source date or category detail; essential claims must not depend on this small text alone. It is plain text, without an automatic pill. | `x,y,text,color,size` (26), optional common text options |
| `DataTag` | A verified quantity or clearly qualitative state such as `km ↑`. It does not fabricate a numerical count-up. | `x,y,text,color,size` (92), optional common text options |
| `Connector` | Connect two or more existing objects. A connector alone does not imply causal proof. | `points:[[x,y],…],progress` (1), `stroke,width` (4), optional `dashed` (false), `opacity` (1) |
| `Arrow` | Make a stated direction explicit. | Connector inputs plus optional `headLength` (4 × stroke width) |
| `DocumentObject` | Display the actual pretreated raster as a document/evidence object. No implied historical page, new frame, or shadow is added. | `href,x,y,width,height`, optional `opacity` (1), `rotate` degrees (0) |
| `RouteObject` | Build an authored schematic route or link; factual status is stated by the composition. | Connector inputs, width default 7, optional `marker` (true), `markerRadius` (stroke width), `markerColor` |

Common text options: `tokens`, `fontFamily`, `weight`, `opacity`, `anchor: 'start'|'middle'|'end'`, `letterSpacing`, `measureText`. Coordinates use an SVG baseline. Defaults come from the matching token role when supplied, then the numerical defaults above. Font falls back to inherited SVG styling; there is no default channel font. `color` falls back only to `tokens.colors.ink`; lines fall back only to `tokens.colors.episode_accent`.

`measureText(text,{size,fontFamily,weight,letterSpacing})` may return a total width number or `{width,ascent,descent}`. Its width must already include letter spacing. Without it, bounds use a deliberately generous estimate, not a real font measurement. This fallback cannot establish a final typography/safe-zone pass. Actual rendered glyphs still require inspection. Empty text has zero width and a line-height envelope. Multi-line text is deliberately rejected; author separate owned lines or a proper caption system.

`DocumentObject` preserves the raster aspect ratio using `xMidYMid meet`; match the supplied box aspect ratio to the derived raster for an exact fit. Rotation is about the box center. Returned bounds include all four rotated box corners, and therefore conservatively include any letterboxing. The href permits image files/URLs and base64 raster data URLs; executable and SVG data URLs are rejected.

Polyline components use `samplePolyline` from the shared motion primitives. Their visible path and marker are computed from one distance value, including uneven segments and repeated vertices. Progress is clamped to 0…1; at zero, no line or marker is drawn. Paths have round joins/caps. The arrowhead follows the tangent of the current polyline segment; at an exact corner the incoming tangent is used. Bounds include visible stroke, route marker and arrowhead. No invisible full-route bounds are substituted for the currently revealed segment.

The Michelin benchmark calls all seven components. This kit does not claim unused cutout, shader, 3D, label-packing, or auto-layout capabilities.
