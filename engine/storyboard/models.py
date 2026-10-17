"""Semantic storyboard checks; recordings, never scripts, define the clock."""

CLASSIFICATIONS = (
    "person", "place", "historical_event", "object", "company", "quote", "statistic",
    "date", "timeline", "location_change", "comparison", "process", "concept",
    "cause_effect", "reveal", "transition",
)


def validate_storyboard(data, assets, sources, production=False, duration=None, raw=None):
    errors = []
    scenes = data["scenes"]
    identifiers = [scene["scene_id"] for scene in scenes]
    if len(set(identifiers)) != len(identifiers):
        errors.append("storyboard: scene_id values must be unique")
    if production and not scenes:
        errors.append("storyboard: production requires at least one scene")
    if "audio_duration" in data and duration is not None and abs(data["audio_duration"] - duration) > 0.001:
        errors.append("storyboard: audio_duration must match the original recorded audio")
    segments = {segment["id"]: segment for segment in raw["segments"]} if raw else {}
    sync_ids = set()
    previous_end = 0.0
    for scene in scenes:
        sid, start, end = scene["scene_id"], scene["start"], scene["end"]
        if end <= start:
            errors.append(f"{sid}: end must be after start")
        if start < previous_end:
            errors.append(f"{sid}: scenes must be ordered and must not overlap")
        previous_end = end
        if duration is not None and end > duration + 0.05:
            errors.append(f"{sid}: scene exceeds recorded audio duration")
        refs = ([scene["primary_asset"]] if scene["primary_asset"] else []) + scene["secondary_assets"]
        for aid in refs:
            if aid not in assets:
                errors.append(f"{sid}: unknown asset {aid}")
            elif sid not in assets[aid]["scene_ids"]:
                errors.append(f"{sid}: asset {aid} does not list this scene")
            if aid in assets and assets[aid].get("selection_status", "selected") != "selected":
                errors.append(f"{sid}: referenced asset {aid} must have selection_status selected")
        generated = any(assets[aid]["origin"] == "ai_generated" for aid in refs if aid in assets)
        if scene["ai_generation"] != generated:
            errors.append(f"{sid}: ai_generation must match referenced AI assets")
        for rid in scene["research_source_ids"]:
            if rid not in sources:
                errors.append(f"{sid}: unknown research source {rid}")
        layers = list(scene["graphics"])
        layers.extend(scene.get("text_overlays", []))
        if scene["text_overlay"]:
            layers.append(scene["text_overlay"])
        graphic_ids = [graphic["graphic_id"] for graphic in scene["graphics"]]
        if len(set(graphic_ids)) != len(graphic_ids):
            errors.append(f"{sid}: graphic_id values must be unique within a scene")
        for layer in layers:
            if not start <= layer["start"] < layer["end"] <= end:
                errors.append(f"{sid}: information layer must fit its scene time range")
            for rid in layer["research_source_ids"]:
                if rid not in sources:
                    errors.append(f"{sid}: information layer references unknown research source {rid}")
        for sync in scene.get("critical_sync_points", []):
            sync_id = sync["sync_id"]
            if sync_id in sync_ids:
                errors.append(f"{sid}: critical sync_id {sync_id} must be unique")
            sync_ids.add(sync_id)
            if not start <= sync["start"] < sync["end"] <= end:
                errors.append(f"{sid}: critical sync {sync_id} must fit its scene time range")
            segment_id = sync["segment_id"]
            if segment_id not in scene["transcript_segment_ids"]:
                errors.append(f"{sid}: critical sync {sync_id} segment must be referenced by its scene")
            if segment_id not in segments:
                errors.append(f"{sid}: critical sync {sync_id} requires its original raw transcript segment")
                continue
            words = segments[segment_id]["words"]
            indices = sync["word_indices"]
            if not indices or any(index < 0 or index >= len(words) for index in indices):
                errors.append(f"{sid}: critical sync {sync_id} references unknown raw word indices")
                continue
            if indices != list(range(indices[0], indices[-1] + 1)):
                errors.append(f"{sid}: critical sync {sync_id} word indices must be contiguous and ordered")
                continue
            selected = [words[index] for index in indices]
            if abs(sync["start"] - selected[0]["start"]) > 0.001 or abs(sync["end"] - selected[-1]["end"]) > 0.001:
                errors.append(f"{sid}: critical sync {sync_id} timing must match original raw word bounds")
            original_text = " ".join("".join(word["word"] for word in selected).split())
            if sync["transcript_text"] != original_text:
                errors.append(f"{sid}: critical sync {sync_id} transcript_text must preserve original raw words")
        if production:
            if not refs and not layers:
                errors.append(f"{sid}: production scene needs an asset or information layer")
            if not scene["narration"].strip() or not scene["transcript_segment_ids"]:
                errors.append(f"{sid}: production needs narration and recorded transcript references")
    return errors
