#!/usr/bin/env python3
"""Transcribe an episode locally; --validate-install does not download models."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
os.environ["PATH"] = str(ROOT / ".tools" / "bin") + os.pathsep + os.environ.get("PATH", "")

from engine.runtime.heavy_job import HeavyJobBusy

from engine.transcription import (  # noqa: E402
    TranscriptionError,
    transcribe_episode,
    validate_installation,
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Local OpenAI Whisper transcription from audio/voice_original.wav. No API."
    )
    parser.add_argument("episode", nargs="?", type=Path, help="Episode directory containing a real voice recording")
    parser.add_argument("--profile", choices=("smoke", "production"), help="Model profile from engine config")
    parser.add_argument("--config", type=Path, default=ROOT / "config" / "engine.config.json")
    parser.add_argument(
        "--validate-install", action="store_true",
        help="Import Whisper/PyTorch and check tools; do not download/load models or transcribe audio",
    )
    args = parser.parse_args(argv)
    if not args.validate_install and args.episode is None:
        parser.error("episode is required unless --validate-install is used")
    try:
        if args.validate_install:
            result = validate_installation(args.config, args.profile)
        else:
            result = transcribe_episode(args.episode, args.config, args.profile)
    except (TranscriptionError, HeavyJobBusy, OSError, ValueError) as exc:
        print(f"Transcription error: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
