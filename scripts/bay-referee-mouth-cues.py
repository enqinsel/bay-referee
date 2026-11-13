#!/usr/bin/env python3
"""Measure one language's aligned, speech-only track under the shared production lock."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from engine.runtime.heavy_job import HeavyJobBusy, heavy_job


def sha256(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def measure(args):
    if os.path.lexists(args.output):
        raise ValueError(f'Output already exists: {args.output}')
    if not args.source.is_file():
        raise ValueError(f'Missing aligned speech track: {args.source}')
    rhubarb = shutil.which(args.rhubarb)
    if not rhubarb:
        raise ValueError('Install Rhubarb Lip Sync or pass --rhubarb /path/to/rhubarb.')
    ffmpeg = ROOT / '.tools/bin/ffmpeg'
    if not os.access(ffmpeg, os.X_OK):
        raise ValueError('Project FFmpeg is missing. Run node scripts/setup-bay-referee.mjs.')
    if args.total_frames is not None and args.total_frames <= 0:
        raise ValueError('--total-frames must be positive.')

    with heavy_job(f'rhubarb-{args.language}') as lease:
        # Keep the kernel lock alive through an orphaned FFmpeg or Rhubarb worker.
        fds = () if lease['nested'] else (lease['fd'],)
        version = subprocess.check_output([rhubarb, '--version'], text=True).strip()
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=args.output.parent) as scratch:
            work = Path(scratch)
            speech = work / 'speech.wav'
            raw = work / 'cues.json'
            source_hash = sha256(args.source)
            subprocess.run([ffmpeg, '-nostdin', '-v', 'error', '-i', args.source, '-map', '0:a:0',
                            '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', speech],
                           check=True, pass_fds=fds)
            if sha256(args.source) != source_hash:
                raise ValueError('Source changed during PCM conversion.')
            with wave.open(str(speech), 'rb') as pcm:
                samples = pcm.getnframes()
            if not samples:
                raise ValueError('The speech input has no samples.')
            if args.total_frames is not None and args.total_frames * 1600 < samples:
                raise ValueError('The picture timeline ends before the aligned speech track.')
            duration = samples / 48000
            total = args.total_frames / 30 if args.total_frames is not None else duration
            subprocess.run([rhubarb, '-q', '-r', 'phonetic', '-f', 'json', '--extendedShapes', 'GHX',
                            '--threads', '1', '-o', raw, speech], check=True, pass_fds=fds)
            record = json.loads(raw.read_text())
            # Rhubarb reports seconds at centisecond precision.
            if not math.isclose(record['metadata']['duration'], duration, abs_tol=0.011, rel_tol=0):
                raise ValueError('Recognizer duration differs from the PCM analysis window.')
            cues = record['mouthCues']
            previous = 0
            for cue in cues:
                start, end = cue['start'], cue['end']
                if not (previous <= start < end <= duration and cue['value'] in tuple('ABCDEFGHX')):
                    raise ValueError('Invalid mouth cue shape or time range.')
                previous = end
            if not cues or duration - previous > 0.011:
                raise ValueError('Recognizer did not cover the speech track.')
            if previous < total:
                cues.append({'start': previous, 'end': total, 'value': 'X'})
            record['metadata'] = {
                'language': args.language, 'duration': total, 'speech_core_duration': duration,
                'closure': [duration, total], 'source_sha256': source_hash,
                'analysis_pcm16_wav_sha256': sha256(speech), 'recognizer': 'phonetic',
                'version': version, 'threads': 1,
            }
            ready = work / 'ready.json'
            ready.write_text(json.dumps(record, indent=2, ensure_ascii=False) + '\n')
            # Publish the complete file atomically without replacing an existing take.
            os.link(ready, args.output)
    print(args.output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--language', required=True, choices=('tr', 'en', 'es'))
    parser.add_argument('--source', type=Path, required=True, help='Clean speech aligned from picture time zero')
    parser.add_argument('--output', type=Path, required=True, help='New JSON file for this language')
    parser.add_argument('--total-frames', type=int, help='Optional final 30 fps picture length, including closure')
    parser.add_argument('--rhubarb', default='rhubarb', help='Executable name on PATH or absolute path')
    args = parser.parse_args()
    try:
        measure(args)
    except HeavyJobBusy as exc:
        print(f'HEAVY_JOB_BUSY: {exc}', file=sys.stderr)
        return 75
    except (OSError, ValueError, subprocess.SubprocessError) as exc:
        print(exc, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
