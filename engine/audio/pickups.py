"""Pickup planning only. This module never splices, normalizes or replaces audio."""

from engine.qa.paths import episode_path


def validate_pickups(data, root, duration=None, production=False):
    errors = []
    identifiers = [item["pickup_id"] for item in data["pickups"]]
    if len(set(identifiers)) != len(identifiers):
        errors.append("pickups: pickup_id values must be unique")
    for pickup in data["pickups"]:
        pid = pickup["pickup_id"]
        if pickup["end"] <= pickup["start"]:
            errors.append(f"{pid}: end must be after start")
        if duration is not None and pickup["end"] > duration + 0.05:
            errors.append(f"{pid}: pickup range exceeds original recorded audio duration")
        path = None
        if pickup["replacement_audio"]:
            try:
                path = episode_path(root, pickup["replacement_audio"])
                if not pickup["replacement_audio"].startswith("audio/pickups/"):
                    errors.append(f"{pid}: replacement_audio must be under audio/pickups/")
            except ValueError as error:
                errors.append(f"{pid}: {error}")
        if pickup["status"] == "recorded" and (path is None or not path.is_file()):
            errors.append(f"{pid}: recorded pickup needs an existing replacement audio file")
        if production and pickup["status"] != "cancelled":
            errors.append(f"{pid}: unresolved pickup; splice/timing-map implementation is not available in v0.1")
    return errors
