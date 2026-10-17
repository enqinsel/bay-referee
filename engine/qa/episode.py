"""Validate planned or production episodes without downloading or editing media."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from engine.assets.models import validate_assets, validate_sources
from engine.audio.pickups import validate_pickups
from engine.qa.paths import episode_path
from engine.qa.schema import validate_schema
from engine.storyboard.models import validate_storyboard

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DOCUMENTS = {
    "storyboard": "storyboard/storyboard.json",
    "asset-plan": "storyboard/asset_plan.json",
    "research-sources": "research/sources.json",
    "pickups": "audio/pickups/pickups.json",
}


def _reject_constant(value):
    raise ValueError(f"Invalid JSON numeric constant: {value}")


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON property: {key}")
        result[key] = value
    return result


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"), parse_constant=_reject_constant, object_pairs_hook=_unique_object)


def _sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def validate_episode(root, production=False):
    root = Path(root).resolve()
    errors, warnings, documents = [], [], {}
    if not root.is_dir():
        return {"valid": False, "mode": "production" if production else "planned", "errors": [f"Not an episode directory: {root}"], "warnings": []}
    for name, relative in DOCUMENTS.items():
        try:
            data = read_json(episode_path(root, relative))
            schema = read_json(PROJECT_ROOT / "schemas" / f"{name}.schema.json")
            issues = validate_schema(data, schema, path=relative)
            errors.extend(issues)
            if not issues:
                documents[name] = data
                if production and data["status"] != "ready":
                    errors.append(f"{relative}: production requires status ready")
        except (OSError, ValueError) as error:
            errors.append(f"{relative}: {error}")
    expected_id = "episode-template" if root.name == "_template" else root.name
    for name, data in documents.items():
        if data["episode_id"] != expected_id:
            errors.append(f"{name}: episode_id must match folder name {expected_id!r}")

    transcripts = {}
    voice = None
    try:
        voice = episode_path(root, "audio/voice_original.wav")
        if not voice.is_file():
            (errors if production else warnings).append("Original human recording is absent: audio/voice_original.wav")
    except ValueError as error:
        errors.append(str(error))
    for kind in ("raw", "clean"):
        relative = f"transcript/transcript_{kind}.json"
        try:
            path = episode_path(root, relative)
            if not path.is_file():
                (errors if production else warnings).append(f"Transcript is absent until real audio is transcribed: {relative}")
                continue
            from engine.transcription import validate_transcript

            data = read_json(path)
            issues = validate_transcript(data, kind=kind)
            errors.extend(f"{relative}: {issue}" for issue in issues)
            if not issues:
                transcripts[kind] = data
                metadata = data.get("_engine", {})
                recorded = metadata.get("audio", {})
                if not isinstance(recorded, dict):
                    errors.append(f"{relative}: _engine.audio must be an object")
                    continue
                if recorded.get("path") != "audio/voice_original.wav":
                    errors.append(f"{relative}: original recording path must be audio/voice_original.wav")
                if recorded.get("timingAuthority") is not True or recorded.get("durationSeconds") != data["duration"]:
                    errors.append(f"{relative}: duration must match authoritative recorded audio metadata")
                if voice and voice.is_file() and recorded.get("sha256") != _sha256(voice):
                    errors.append(f"{relative}: audio hash differs from the original recording")
        except (OSError, ValueError, ImportError) as error:
            errors.append(f"{relative}: {error}")
    raw, clean = transcripts.get("raw"), transcripts.get("clean")
    if clean and not raw:
        errors.append("Clean transcript requires its raw source")
    if raw and clean:
        clean_source = clean.get("_engine", {}).get("rawSource", {})
        if not isinstance(clean_source, dict):
            errors.append("Clean transcript rawSource must be an object")
            clean_source = {}
        if clean_source.get("path") != "transcript_raw.json":
            errors.append("Clean transcript must reference transcript_raw.json")
        if clean_source.get("sha256") != _sha256(episode_path(root, "transcript/transcript_raw.json")):
            errors.append("Clean transcript rawSource hash does not match raw transcript")
        raw_times = [(s["id"], s["start"], s["end"], [(w["start"], w["end"]) for w in s["words"]]) for s in raw["segments"]]
        clean_times = [(s["id"], s["start"], s["end"], [(w["start"], w["end"]) for w in s["words"]]) for s in clean["segments"]]
        if raw_times != clean_times or raw["duration"] != clean["duration"]:
            errors.append("Clean transcript must preserve raw segment and word timing/order")
        from engine.transcription import clean_transcript

        expected = clean_transcript(raw, _sha256(episode_path(root, "transcript/transcript_raw.json")))
        if clean["text"] != expected["text"] or clean["segments"] != expected["segments"]:
            errors.append("v0.1 clean transcript permits only traced whitespace cleanup; speech/native data must be preserved")
        if clean.get("_engine", {}).get("editDecisions") != expected["_engine"]["editDecisions"]:
            errors.append("Clean transcript editDecisions do not trace its whitespace changes")

    duration = raw["duration"] if raw else None
    if len(documents) == len(DOCUMENTS):
        storyboard = documents["storyboard"]
        assets = documents["asset-plan"]
        sources = documents["research-sources"]
        asset_lookup = {asset["asset_id"]: asset for asset in assets["assets"]}
        source_lookup = {source["source_id"]: source for source in sources["sources"]}
        scene_ids = {scene["scene_id"] for scene in storyboard["scenes"]}
        errors.extend(validate_sources(sources))
        errors.extend(validate_assets(assets, scene_ids, root, production))
        errors.extend(validate_storyboard(storyboard, asset_lookup, source_lookup, production, duration, raw))
        errors.extend(validate_pickups(documents["pickups"], root, duration, production))
        if raw:
            segment_lookup = {segment["id"]: segment for segment in raw["segments"]}
            for scene in storyboard["scenes"]:
                for segment_id in scene["transcript_segment_ids"]:
                    if segment_id not in segment_lookup:
                        errors.append(f"{scene['scene_id']}: unknown transcript segment {segment_id}")
                    else:
                        segment = segment_lookup[segment_id]
                        if segment["end"] <= scene["start"] or segment["start"] >= scene["end"]:
                            errors.append(f"{scene['scene_id']}: transcript segment {segment_id} does not overlap this scene")
    return {"valid": not errors, "mode": "production" if production else "planned", "errors": errors, "warnings": warnings}
