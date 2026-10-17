"""Provenance and editorial checks, separate from research-source evidence."""

import hashlib
from urllib.parse import urlparse

from engine.qa.paths import episode_path


def validate_sources(data):
    errors = []
    identifiers = [source["source_id"] for source in data["sources"]]
    if len(set(identifiers)) != len(identifiers):
        errors.append("research: source_id values must be unique")
    for source in data["sources"]:
        if not valid_url(source["url"]):
            errors.append(f"{source['source_id']}: research URL must be HTTP(S)")
    return errors


def valid_url(value):
    parsed = urlparse(value or "")
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def validate_assets(data, scene_ids, root, production=False):
    errors = []
    identifiers = [asset["asset_id"] for asset in data["assets"]]
    if len(set(identifiers)) != len(identifiers):
        errors.append("asset_plan: asset_id values must be unique")
    for asset in data["assets"]:
        aid = asset["asset_id"]
        for sid in asset["scene_ids"]:
            if sid not in scene_ids:
                errors.append(f"{aid}: unknown scene {sid}")
        source, generation = asset["source"], asset["generation"]
        if source["url"] is not None and not valid_url(source["url"]):
            errors.append(f"{aid}: asset source URL must be HTTP(S)")
        for field in ("direct_file_url", "license_url"):
            if source.get(field) is not None and not valid_url(source[field]):
                errors.append(f"{aid}: asset {field} must be HTTP(S)")
        if asset["origin"] == "ai_generated":
            if generation is None:
                errors.append(f"{aid}: AI asset requires provider, justification and allowed reason")
            if asset["type"] not in ("image", "video"):
                errors.append(f"{aid}: AI generation must be typed image or video")
        elif generation is not None:
            errors.append(f"{aid}: real/motion_graphic asset cannot carry AI generation metadata")
        path = None
        if asset["local_filepath"]:
            try:
                path = episode_path(root, asset["local_filepath"])
                if not asset["local_filepath"].startswith("assets/"):
                    errors.append(f"{aid}: local_filepath must be under assets/")
            except ValueError as error:
                errors.append(f"{aid}: {error}")
        if asset.get("sha256") and path is not None and path.is_file():
            digest = hashlib.sha256()
            with path.open("rb") as handle:
                for block in iter(lambda: handle.read(1024 * 1024), b""):
                    digest.update(block)
            if digest.hexdigest() != asset["sha256"]:
                errors.append(f"{aid}: sha256 does not match the local asset file")
        selected = asset.get("selection_status", "selected") == "selected"
        ready = (production and selected) or asset["status"] == "ready"
        if ready:
            if "rights_status" in asset and asset["rights_status"] != "approved_clear_rights":
                errors.append(f"{aid}: ready asset requires rights_status approved_clear_rights")
            if asset["status"] != "ready":
                errors.append(f"{aid}: production requires status ready")
            if path is None or not path.is_file():
                errors.append(f"{aid}: ready asset needs an existing local file")
            if not source["license_notes"] or not source["attribution"]:
                errors.append(f"{aid}: ready asset needs license notes and attribution (or explicit none-required note)")
            if not source["title"]:
                errors.append(f"{aid}: ready asset needs a source title")
            if asset["origin"] == "real" and not source["url"] and not source["provenance_notes"]:
                errors.append(f"{aid}: real asset needs source URL or documented local provenance")
            if asset["type"] in ("image", "video", "archive", "map") and asset["resolution"] is None:
                errors.append(f"{aid}: ready visual asset needs resolution metadata")
    return errors
