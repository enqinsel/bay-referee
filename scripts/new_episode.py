#!/usr/bin/env python3
"""Create an empty episode scaffold without changing an existing episode."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil
import sys
import unicodedata

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from engine.qa.episode import validate_episode


def episode_id(topic: str) -> str:
    topic = topic.strip().casefold().replace("ı", "i")
    topic = unicodedata.normalize("NFKD", topic).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", topic).strip("-")
    if slug.startswith("episode-"):
        slug = slug[len("episode-"):]
    if not slug or len(slug) > 80:
        raise ValueError("Topic must produce an ASCII slug of 1–80 characters")
    return f"episode-{slug}"


def create_episode(topic: str, episodes_dir: Path | None = None) -> Path:
    name = episode_id(topic)
    episodes_dir = (episodes_dir or PROJECT_ROOT / "episodes").resolve()
    episodes_dir.mkdir(parents=True, exist_ok=True)
    destination = episodes_dir / name
    # mkdir is exclusive: even concurrent calls cannot replace another episode.
    destination.mkdir(exist_ok=False)
    try:
        shutil.copytree(PROJECT_ROOT / "episodes" / "_template", destination, dirs_exist_ok=True)
        for path in destination.rglob("*.json"):
            data = json.loads(path.read_text(encoding="utf-8"))
            data["episode_id"] = name
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        result = validate_episode(destination)
        if result["errors"]:
            raise ValueError("Invalid template: " + "; ".join(result["errors"]))
    except Exception:
        shutil.rmtree(destination)
        raise
    return destination


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("topic", help="Topic slug, e.g. michelin → episode-michelin")
    parser.add_argument("--episodes-dir", type=Path, default=PROJECT_ROOT / "episodes")
    args = parser.parse_args(argv)
    try:
        destination = create_episode(args.topic, args.episodes_dir)
    except (ValueError, OSError) as error:
        print(f"Episode creation failed: {error}", file=sys.stderr)
        return 1
    print(destination)
    print("Empty plan created. Add the human recording at audio/voice_original.wav.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
