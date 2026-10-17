"""API-free transcription from the original recording, with immutable raw output.

Only transcription loads/downloads model weights. Validation and --help do not.
Whisper may omit speech or misrecognize words; review against the original audio.
This layer never removes recognized words, repetitions, or hesitations.
"""

from __future__ import annotations

import copy
from datetime import datetime, timezone
import gc
import hashlib
import importlib
import inspect
import json
import math
import os
from pathlib import Path
import platform
import shutil
import subprocess
import tempfile
from typing import Any
import warnings


class TranscriptionError(RuntimeError):
    """A recoverable configuration, dependency, audio, or output problem."""


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_settings(config_path: Path, profile: str | None = None) -> dict[str, Any]:
    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
        settings = config["transcription"]
        selected = profile or settings["defaultProfile"]
        model = settings["models"][selected]
        language = settings["language"]
        device = settings["device"]
        cache = settings["modelCache"]
    except (OSError, ValueError, KeyError, TypeError) as exc:
        raise TranscriptionError(f"Invalid transcription config {config_path}: {exc}") from exc
    if not isinstance(model, str) or not model.strip():
        raise TranscriptionError("transcription.models must name a model for the selected profile.")
    if not isinstance(language, str) or not language:
        raise TranscriptionError("transcription.language must be a language code, e.g. tr.")
    if language != "en" and model.endswith(".en"):
        raise TranscriptionError("English-only .en models cannot transcribe the configured language.")
    if settings.get("wordTimestamps") is not True:
        raise TranscriptionError("transcription.wordTimestamps must be true; word timing is required.")
    if device not in {"auto", "cpu", "cuda"}:
        raise TranscriptionError("transcription.device must be auto, cpu, or cuda; MPS is not assumed.")
    if not isinstance(cache, str) or not cache:
        raise TranscriptionError("transcription.modelCache must be a directory path.")
    root = config_path.resolve().parent.parent
    cache_path = Path(cache).expanduser()
    if not cache_path.is_absolute():
        cache_path = root / cache_path
    return {
        "profile": selected,
        "model": model,
        "language": language,
        "device": device,
        "model_cache": cache_path,
    }


def _dependencies() -> tuple[Any, Any]:
    try:
        whisper = importlib.import_module("whisper")
        torch = importlib.import_module("torch")
    except Exception as exc:
        raise TranscriptionError(
            "Local Whisper/PyTorch import failed. Install with "
            ".venv/bin/python -m pip install -r requirements-whisper.txt. "
            f"{type(exc).__name__}: {exc}"
        ) from exc
    if not callable(getattr(whisper, "load_model", None)):
        raise TranscriptionError("The imported whisper package is not OpenAI Whisper (openai-whisper).")
    return whisper, torch


def select_device(requested: str, torch: Any) -> tuple[str, str | None]:
    if requested == "cpu" or (requested == "auto" and platform.system() == "Darwin"):
        return "cpu", None
    try:
        available = bool(torch.cuda.is_available())
    except Exception as exc:
        return "cpu", f"CUDA detection failed ({type(exc).__name__}); using CPU."
    if available:
        return "cuda", None
    if requested == "cuda":
        return "cpu", "Requested CUDA is unavailable; using CPU."
    return "cpu", None


def _tool_version(name: str) -> dict[str, str]:
    executable = shutil.which(name)
    if not executable:
        raise TranscriptionError(f"{name} not found on PATH. Add the project's .tools/bin to PATH.")
    try:
        result = subprocess.run(
            [executable, "-version"], capture_output=True, text=True, check=True, timeout=30
        )
    except (OSError, subprocess.SubprocessError) as exc:
        raise TranscriptionError(f"Cannot execute {name}: {exc}") from exc
    first_line = (result.stdout or result.stderr).splitlines()
    return {"path": executable, "version": first_line[0] if first_line else "unknown"}


def validate_installation(config_path: Path, profile: str | None = None) -> dict[str, Any]:
    """Import actual dependencies and inspect support without loading model weights."""
    settings = load_settings(config_path, profile)
    whisper, torch = _dependencies()
    transcription_api = importlib.import_module("whisper.transcribe").transcribe
    if "word_timestamps" not in inspect.signature(transcription_api).parameters:
        raise TranscriptionError("Installed OpenAI Whisper does not expose word_timestamps.")
    if settings["model"] not in whisper.available_models():
        raise TranscriptionError(f"Unknown configured Whisper model: {settings['model']}")
    device, note = select_device(settings["device"], torch)
    return {
        "status": "PASS",
        "implementation": "openai-whisper (local Python)",
        "whisperVersion": getattr(whisper, "__version__", "unknown"),
        "torchVersion": str(torch.__version__),
        "profile": settings["profile"],
        "model": settings["model"],
        "language": settings["language"],
        "device": device,
        "deviceNote": note,
        "wordTimestamps": True,
        "ffmpeg": _tool_version("ffmpeg"),
        "ffprobe": _tool_version("ffprobe"),
        "modelLoaded": False,
        "modelDownloaded": False,
        "audioTranscribed": False,
    }


def probe_audio(audio: Path) -> dict[str, Any]:
    """Get the source duration from ffprobe, never from the script or last word."""
    executable = shutil.which("ffprobe")
    if not executable:
        raise TranscriptionError("ffprobe not found on PATH.")
    try:
        completed = subprocess.run(
            [
                executable, "-v", "error", "-select_streams", "a:0", "-show_entries",
                "format=duration:stream=duration,sample_rate,channels,codec_name",
                "-of", "json", str(audio),
            ],
            check=True, capture_output=True, text=True, timeout=30,
        )
        result = json.loads(completed.stdout)
        streams = result.get("streams", [])
        if not streams:
            raise ValueError("No audio stream found")
        stream = streams[0]
        duration = stream.get("duration")
        if duration in {None, "N/A"}:
            duration = result.get("format", {}).get("duration")
        duration = float(duration)
        if not math.isfinite(duration) or duration <= 0:
            raise ValueError("Audio duration must be finite and positive")
    except (OSError, subprocess.SubprocessError, ValueError, TypeError, KeyError) as exc:
        detail = getattr(exc, "stderr", None) or str(exc)
        raise TranscriptionError(f"Cannot inspect source audio {audio}: {detail}") from exc
    return {"durationSeconds": duration, "probe": result}


def _number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate_transcript(data: Any, *, kind: str | None = None) -> list[str]:
    """Return timing/schema errors, while permitting all native Whisper fields."""
    errors: list[str] = []
    if not isinstance(data, dict):
        return ["Transcript must be an object."]
    if not isinstance(data.get("language"), str) or not data["language"]:
        errors.append("language must be a non-empty string.")
    if not isinstance(data.get("text"), str):
        errors.append("text must be a string.")
    duration = data.get("duration")
    if not _number(duration) or duration <= 0:
        errors.append("duration must be the positive ffprobe source duration.")
        duration = None
    metadata = data.get("_engine", {})
    if not isinstance(metadata, dict):
        errors.append("_engine must be an object.")
        metadata = {}
    if kind is not None and metadata.get("kind") != kind:
        errors.append(f"_engine.kind must be {kind!r}.")
    segments = data.get("segments")
    if not isinstance(segments, list):
        return errors + ["segments must be an array."]

    def check_range(item: dict[str, Any], path: str) -> bool:
        start, end = item.get("start"), item.get("end")
        if not _number(start) or not _number(end) or not 0 <= start <= end:
            errors.append(f"{path}: start/end must be finite, non-negative, ordered seconds.")
            return False
        # Whisper uses rounded alignment times; permit one small rounding margin.
        if duration is not None and end > duration + 0.05:
            errors.append(f"{path}: end exceeds the source recording duration.")
        return True

    previous_start = -1.0
    ids: set[int] = set()
    for index, segment in enumerate(segments):
        prefix = f"segments[{index}]"
        if not isinstance(segment, dict):
            errors.append(f"{prefix} must be an object.")
            continue
        identifier = segment.get("id")
        if not isinstance(identifier, int) or isinstance(identifier, bool) or identifier in ids:
            errors.append(f"{prefix}.id must be a unique integer.")
        else:
            ids.add(identifier)
        segment_range_valid = check_range(segment, prefix)
        if segment_range_valid:
            if segment["start"] < previous_start:
                errors.append(f"{prefix}: segments are out of temporal order.")
            previous_start = segment["start"]
        if not isinstance(segment.get("text"), str):
            errors.append(f"{prefix}.text must be a string.")
        words = segment.get("words")
        if not isinstance(words, list):
            errors.append(f"{prefix}.words must be an array; word timestamps are required.")
            continue
        if segment.get("text", "") and not words:
            errors.append(f"{prefix}: non-empty text has no word timestamps.")
        previous_word_start = -1.0
        for word_index, word in enumerate(words):
            word_path = f"{prefix}.words[{word_index}]"
            if not isinstance(word, dict):
                errors.append(f"{word_path} must be an object.")
                continue
            if not isinstance(word.get("word"), str):
                errors.append(f"{word_path}.word must be a string.")
            probability = word.get("probability")
            if not _number(probability) or not 0 <= probability <= 1:
                errors.append(f"{word_path}.probability must be within [0, 1].")
            if check_range(word, word_path):
                if word["start"] < previous_word_start:
                    errors.append(f"{word_path}: words are out of temporal order.")
                previous_word_start = word["start"]
                if segment_range_valid and (
                    word["start"] < segment["start"] - 0.05
                    or word["end"] > segment["end"] + 0.05
                ):
                    errors.append(f"{word_path}: timing falls outside its segment.")
    return errors


def clean_transcript(raw: dict[str, Any], raw_sha256: str) -> dict[str, Any]:
    """Normalize whitespace only; retain every token, timing, probability and field."""
    clean = copy.deepcopy(raw)
    metadata = clean.setdefault("_engine", {})
    metadata["kind"] = "clean"
    metadata["rawSource"] = {"path": "transcript_raw.json", "sha256": raw_sha256}
    metadata["cleanupPolicy"] = "whitespace_only_no_speech_deletion"
    metadata["pickupPlan"] = "audio/pickups/pickups.json"
    decisions: list[dict[str, Any]] = []

    def normalize(item: dict[str, Any], field: str, path: str) -> None:
        before = item[field]
        after = " ".join(before.split())
        if before != after:
            item[field] = after
            decisions.append({
                "id": f"edit_{len(decisions) + 1:04d}",
                "operation": "normalize_whitespace",
                "path": path,
                "before": before,
                "after": after,
                "reason": "Presentation-only whitespace normalization; no words removed.",
                "timingChanged": False,
            })

    normalize(clean, "text", "/text")
    for segment_index, segment in enumerate(clean["segments"]):
        normalize(segment, "text", f"/segments/{segment_index}/text")
        for word_index, word in enumerate(segment["words"]):
            normalize(word, "word", f"/segments/{segment_index}/words/{word_index}/word")
    metadata["editDecisions"] = decisions
    return clean


def _json_bytes(value: dict[str, Any]) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode("utf-8")


def _write_new(path: Path, content: bytes) -> None:
    """Publish a complete file atomically and never replace an existing path."""
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary: str | None = None
    try:
        with tempfile.NamedTemporaryFile(prefix=".transcript-", dir=path.parent, delete=False) as handle:
            temporary = handle.name
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        # A hard link publishes without overwriting, including a concurrent writer.
        os.link(temporary, path)
    except FileExistsError as exc:
        raise TranscriptionError(f"Refusing to overwrite existing transcript: {path}") from exc
    finally:
        if temporary is not None:
            Path(temporary).unlink(missing_ok=True)


def _infer(whisper: Any, audio: Path, settings: dict[str, Any], device: str) -> dict[str, Any]:
    model = whisper.load_model(
        settings["model"], device=device, download_root=str(settings["model_cache"])
    )
    return model.transcribe(
        str(audio), language=settings["language"], task="transcribe",
        word_timestamps=True, fp16=device == "cuda", verbose=None,
    )


def transcribe_episode(
    episode: Path, config_path: Path, profile: str | None = None
) -> dict[str, Any]:
    """Transcribe a real recording; this is the only path that loads a model."""
    episode = episode.resolve()
    audio = episode / "audio" / "voice_original.wav"
    raw_path = episode / "transcript" / "transcript_raw.json"
    clean_path = episode / "transcript" / "transcript_clean.json"
    if not episode.is_dir():
        raise TranscriptionError(f"Episode directory does not exist: {episode}")
    for path in (raw_path, clean_path):
        if path.exists() or path.is_symlink():
            raise TranscriptionError(
                f"Refusing to overwrite {path}. Preserve this take and its transcripts. "
                "For a new recording/model run, use a separate episode/take directory."
            )
    if not audio.is_file() or audio.stat().st_size == 0:
        raise TranscriptionError(f"Add your real narration recording first: {audio}")
    settings = load_settings(config_path, profile)
    source_hash = _sha256(audio)
    probe = probe_audio(audio)
    whisper, torch = _dependencies()
    if settings["model"] not in whisper.available_models():
        raise TranscriptionError(f"Unknown configured Whisper model: {settings['model']}")
    if not shutil.which("ffmpeg"):
        raise TranscriptionError("ffmpeg not found on PATH; Whisper uses it to decode local audio.")
    device, device_note = select_device(settings["device"], torch)
    if device_note:
        warnings.warn(device_note, RuntimeWarning)
    fallback = None
    try:
        native_result = _infer(whisper, audio, settings, device)
    except RuntimeError as exc:
        if device != "cuda":
            raise TranscriptionError(f"Local Whisper failed on CPU: {exc}") from exc
        fallback = f"CUDA inference failed ({type(exc).__name__}: {exc}); reran on CPU."
        warnings.warn(fallback, RuntimeWarning)
        # Drop traceback references to the failed model before trying CPU.
        exc.__traceback__ = None
        gc.collect()
        try:
            torch.cuda.empty_cache()
        except Exception:
            pass
        device = "cpu"
        try:
            native_result = _infer(whisper, audio, settings, device)
        except RuntimeError as cpu_error:
            raise TranscriptionError(f"Local Whisper CPU fallback failed: {cpu_error}") from cpu_error
    if _sha256(audio) != source_hash:
        raise TranscriptionError("The original audio changed during transcription; no transcript was saved.")
    if not isinstance(native_result, dict) or any(key in native_result for key in ("_engine", "duration")):
        raise TranscriptionError("Unexpected native Whisper output; refusing to overwrite native fields.")
    raw = copy.deepcopy(native_result)
    raw["duration"] = probe["durationSeconds"]
    raw["_engine"] = {
        "schemaVersion": "1.0",
        "kind": "raw",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "implementation": "openai-whisper",
        "whisperVersion": getattr(whisper, "__version__", "unknown"),
        "model": settings["model"],
        "profile": settings["profile"],
        "languageRequested": settings["language"],
        "deviceRequested": settings["device"],
        "deviceUsed": device,
        "deviceNote": device_note,
        "deviceFallback": fallback,
        "wordTimestamps": True,
        "audio": {
            "path": "audio/voice_original.wav",
            "sha256": source_hash,
            "durationSeconds": probe["durationSeconds"],
            "timingAuthority": True,
            "probe": probe["probe"],
        },
    }
    raw_bytes = _json_bytes(raw)
    raw_digest = hashlib.sha256(raw_bytes).hexdigest()
    # Preserve even a malformed/alignment-anomalous native result for inspection.
    _write_new(raw_path, raw_bytes)
    errors = validate_transcript(raw, kind="raw")
    if errors:
        raise TranscriptionError(
            f"Raw Whisper output preserved at {raw_path}; clean output withheld because "
            "timing/schema validation failed: " + "; ".join(errors)
        )
    clean = clean_transcript(raw, raw_digest)
    _write_new(clean_path, _json_bytes(clean))
    return {
        "status": "PASS", "raw": str(raw_path), "clean": str(clean_path),
        "duration": raw["duration"], "model": settings["model"], "device": device,
        "segments": len(raw["segments"]),
        "words": sum(len(segment["words"]) for segment in raw["segments"]),
        "wordTimestamps": True,
    }
