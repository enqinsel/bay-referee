"""Episode-relative file paths must stay inside their episode, even via symlinks."""

from pathlib import Path, PurePosixPath


def episode_path(root: Path, relative: str) -> Path:
    if not isinstance(relative, str) or not relative.strip():
        raise ValueError("expected a non-empty episode-relative path")
    parts = PurePosixPath(relative)
    if parts.is_absolute() or ".." in parts.parts or "\\" in relative or ":" in relative:
        raise ValueError(f"unsafe episode-relative path: {relative!r}")
    root = root.resolve()
    candidate = (root / relative).resolve()
    if candidate == root or not candidate.is_relative_to(root):
        raise ValueError(f"path escapes episode: {relative!r}")
    return candidate
