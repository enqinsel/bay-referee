"""Local Whisper transcription; importing this package never loads a model."""

from .local_whisper import (
    TranscriptionError,
    clean_transcript,
    transcribe_episode,
    validate_installation,
    validate_transcript,
)

__all__ = [
    "TranscriptionError",
    "clean_transcript",
    "transcribe_episode",
    "validate_installation",
    "validate_transcript",
]
