"""Synthetic in-memory unit fixtures only: no model downloads or recorded speech."""

from __future__ import annotations

import copy
from contextlib import nullcontext
import hashlib
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from engine.transcription import local_whisper as module


def synthetic_whisper_result():
    """Explicitly synthetic timing fixture, never an episode deliverable."""
    return {
        "language": "tr",
        "text": "  ıı  şey şey\n deneme. ",
        "segments": [{
            "id": 0, "seek": 0, "start": 0.0, "end": 2.0,
            "text": "  ıı  şey şey\n deneme. ",
            "tokens": [123, 456], "temperature": 0.0, "avg_logprob": -0.4,
            "compression_ratio": 1.0, "no_speech_prob": 0.02,
            "words": [
                {"word": " ıı", "start": 0.0, "end": 0.3, "probability": 0.8},
                {"word": " şey", "start": 0.4, "end": 0.6, "probability": 0.9},
                {"word": " şey", "start": 0.6, "end": 0.8, "probability": 0.9},
                {"word": " deneme. ", "start": 0.9, "end": 2.0, "probability": 0.99},
            ],
        }],
    }


def synthetic_raw():
    raw = synthetic_whisper_result()
    raw["duration"] = 3.25  # Recorded silence remains part of source duration.
    raw["_engine"] = {"schemaVersion": "1.0", "kind": "raw"}
    return raw


class TranscriptionTests(unittest.TestCase):
    def test_cleanup_keeps_hesitations_repetitions_and_all_timing(self):
        raw = synthetic_raw()
        original = copy.deepcopy(raw)
        clean = module.clean_transcript(raw, "a" * 64)
        self.assertEqual(raw, original)
        self.assertEqual(clean["text"], "ıı şey şey deneme.")
        self.assertEqual(len(clean["segments"][0]["words"]), 4)
        for before, after in zip(raw["segments"][0]["words"], clean["segments"][0]["words"]):
            self.assertEqual((before["start"], before["end"], before["probability"]),
                             (after["start"], after["end"], after["probability"]))
        self.assertEqual(clean["segments"][0]["tokens"], [123, 456])
        self.assertEqual(clean["duration"], raw["duration"])
        self.assertEqual(clean["_engine"]["rawSource"]["sha256"], "a" * 64)
        self.assertEqual(clean["_engine"]["pickupPlan"], "audio/pickups/pickups.json")
        self.assertTrue(clean["_engine"]["editDecisions"])
        for edit in clean["_engine"]["editDecisions"]:
            self.assertFalse(edit["timingChanged"])
            self.assertEqual(edit["operation"], "normalize_whitespace")
            self.assertNotEqual(edit["before"], edit["after"])

    def test_validator_accepts_native_fields_and_catches_missing_word_timing(self):
        raw = synthetic_raw()
        self.assertEqual(module.validate_transcript(raw, kind="raw"), [])
        del raw["segments"][0]["words"][0]["start"]
        self.assertTrue(module.validate_transcript(raw))

    def test_validator_rejects_nonfinite_and_out_of_audio_range(self):
        for value in [float("nan"), float("inf"), True, -1, 100]:
            with self.subTest(value=value):
                raw = synthetic_raw()
                raw["segments"][0]["words"][0]["end"] = value
                self.assertTrue(module.validate_transcript(raw))

    def test_validator_rejects_missing_words_and_bad_probability(self):
        raw = synthetic_raw()
        raw["segments"][0]["words"] = []
        self.assertTrue(module.validate_transcript(raw))
        raw = synthetic_raw()
        raw["segments"][0]["words"][0]["probability"] = 2.0
        self.assertTrue(module.validate_transcript(raw))

    @patch.object(module.platform, "system", return_value="Darwin")
    def test_macos_auto_does_not_assume_mps_or_cuda(self, _platform):
        torch = Mock()
        device, _ = module.select_device("auto", torch)
        self.assertEqual(device, "cpu")
        torch.cuda.is_available.assert_not_called()

    @patch.object(module.platform, "system", return_value="Linux")
    def test_device_detection_and_unavailable_cuda_fallback(self, _platform):
        torch = Mock()
        torch.cuda.is_available.return_value = True
        self.assertEqual(module.select_device("auto", torch)[0], "cuda")
        torch.cuda.is_available.return_value = False
        device, note = module.select_device("cuda", torch)
        self.assertEqual(device, "cpu")
        self.assertIn("unavailable", note)

    def test_config_selects_model_and_enforces_word_timestamps(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            config_path = root / "config" / "engine.config.json"
            config_path.parent.mkdir()
            config = {"transcription": {
                "language": "tr", "models": {"smoke": "tiny", "production": "medium"},
                "defaultProfile": "smoke", "device": "auto", "modelCache": ".cache/whisper",
                "wordTimestamps": True,
            }}
            config_path.write_text(json.dumps(config))
            self.assertEqual(module.load_settings(config_path)["model"], "tiny")
            self.assertEqual(module.load_settings(config_path, "production")["model"], "medium")
            self.assertEqual(module.load_settings(config_path)["model_cache"], root.resolve() / ".cache/whisper")
            config["transcription"]["wordTimestamps"] = False
            config_path.write_text(json.dumps(config))
            with self.assertRaisesRegex(module.TranscriptionError, "wordTimestamps"):
                module.load_settings(config_path)

    def test_raw_writer_never_overwrites_existing_bytes(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "raw.json"
            module._write_new(path, b"SYNTHETIC TEST CONTENT")
            with self.assertRaisesRegex(module.TranscriptionError, "overwrite"):
                module._write_new(path, b"REPLACEMENT")
            self.assertEqual(path.read_bytes(), b"SYNTHETIC TEST CONTENT")
            self.assertEqual(list(path.parent.glob(".transcript-*")), [])

    @patch.object(module.shutil, "which", return_value="/synthetic/ffprobe")
    @patch.object(module.subprocess, "run")
    def test_probe_uses_audio_duration_including_trailing_silence(self, run, _which):
        run.return_value.stdout = json.dumps({
            "streams": [{"duration": "3.25", "sample_rate": "48000", "channels": 1}],
            "format": {"duration": "100.0"},
        })
        probe = module.probe_audio(Path("/synthetic/voice_original.wav"))
        self.assertEqual(probe["durationSeconds"], 3.25)
        self.assertIn("a:0", run.call_args.args[0])

    @patch.object(module.shutil, "which", return_value="/synthetic/ffprobe")
    @patch.object(module.subprocess, "run")
    def test_probe_rejects_no_audio(self, run, _which):
        run.return_value.stdout = '{"streams":[],"format":{"duration":"3"}}'
        with self.assertRaisesRegex(module.TranscriptionError, "No audio stream"):
            module.probe_audio(Path("/synthetic/no-audio"))

    def test_inference_uses_explicit_local_options(self):
        whisper = Mock()
        settings = {"model": "tiny", "language": "tr", "model_cache": Path("/synthetic/cache")}
        module._infer(whisper, Path("/synthetic/voice.wav"), settings, "cpu")
        whisper.load_model.assert_called_once_with("tiny", device="cpu", download_root="/synthetic/cache")
        whisper.load_model.return_value.transcribe.assert_called_once_with(
            "/synthetic/voice.wav", language="tr", task="transcribe", word_timestamps=True,
            fp16=False, verbose=None,
        )

    def test_cuda_failure_retries_cpu_and_records_provenance_without_files(self):
        settings = {"model": "tiny", "profile": "smoke", "language": "tr", "device": "cuda"}
        native = synthetic_whisper_result()
        whisper = Mock(__version__="SYNTHETIC")
        whisper.available_models.return_value = ["tiny"]
        torch = Mock()
        writes = {}
        with (
            patch.object(Path, "resolve", return_value=Path("/synthetic-episode")),
            patch.object(Path, "is_dir", return_value=True),
            patch.object(Path, "exists", return_value=False),
            patch.object(Path, "is_symlink", return_value=False),
            patch.object(Path, "is_file", return_value=True),
            patch.object(Path, "stat", return_value=SimpleNamespace(st_size=100)),
            patch.object(module, "load_settings", return_value=settings),
            patch.object(module, "heavy_job", return_value=nullcontext()),
            patch.object(module, "_sha256", return_value="b" * 64),
            patch.object(module, "probe_audio", return_value={"durationSeconds": 3.25, "probe": {}}),
            patch.object(module, "_dependencies", return_value=(whisper, torch)),
            patch.object(module.shutil, "which", return_value="/synthetic/ffmpeg"),
            patch.object(module, "select_device", return_value=("cuda", None)),
            patch.object(module, "_infer", side_effect=[RuntimeError("SYNTHETIC CUDA failure"), native]) as infer,
            patch.object(module, "_write_new", side_effect=lambda path, data: writes.update({path.name: data})),
            self.assertWarnsRegex(RuntimeWarning, "reran on CPU"),
        ):
            result = module.transcribe_episode(Path("/synthetic-episode"), Path("/synthetic-config"))
        self.assertEqual([call.args[3] for call in infer.call_args_list], ["cuda", "cpu"])
        self.assertEqual(result["device"], "cpu")
        raw = json.loads(writes["transcript_raw.json"])
        clean = json.loads(writes["transcript_clean.json"])
        for field, value in native.items():
            self.assertEqual(raw[field], value)
        self.assertEqual(raw["duration"], 3.25)
        self.assertEqual(raw["_engine"]["audio"]["sha256"], "b" * 64)
        self.assertEqual(clean["_engine"]["rawSource"]["sha256"], hashlib.sha256(writes["transcript_raw.json"]).hexdigest())
        self.assertEqual(module.validate_transcript(clean, kind="clean"), [])

    def test_rerun_refuses_before_loading_any_model(self):
        with tempfile.TemporaryDirectory() as directory:
            episode = Path(directory)
            (episode / "transcript").mkdir()
            path = episode / "transcript" / "transcript_raw.json"
            path.write_bytes(b"SYNTHETIC TEST RAW")
            with patch.object(module, "_dependencies") as dependencies:
                with self.assertRaisesRegex(module.TranscriptionError, "Refusing to overwrite"):
                    module.transcribe_episode(episode, Path("/unused-config"))
            dependencies.assert_not_called()
            self.assertEqual(path.read_bytes(), b"SYNTHETIC TEST RAW")

    def test_install_validation_never_loads_models(self):
        whisper = Mock(__version__="SYNTHETIC")
        whisper.available_models.return_value = ["tiny"]
        torch = Mock(__version__="SYNTHETIC")

        def synthetic_transcribe(*, word_timestamps=False):
            pass

        settings = {"model": "tiny", "profile": "smoke", "language": "tr", "device": "cpu"}
        with (
            patch.object(module, "load_settings", return_value=settings),
            patch.object(module, "_dependencies", return_value=(whisper, torch)),
            patch.object(module.importlib, "import_module", return_value=SimpleNamespace(transcribe=synthetic_transcribe)),
            patch.object(module, "_tool_version", return_value={"version": "SYNTHETIC"}),
        ):
            result = module.validate_installation(Path("/synthetic-config"))
        self.assertEqual(result["status"], "PASS")
        self.assertFalse(result["modelLoaded"])
        self.assertFalse(result["modelDownloaded"])
        self.assertFalse(result["audioTranscribed"])
        whisper.load_model.assert_not_called()


if __name__ == "__main__":
    unittest.main()
