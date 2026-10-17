"""Synthetic fixtures stay in TemporaryDirectory; no production media is created."""

import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from engine.qa.episode import DOCUMENTS, PROJECT_ROOT, read_json, validate_episode
from engine.qa.schema import validate_schema
from scripts.new_episode import create_episode, episode_id


def scene(identifier="scene_01", start=0, end=2):
    return {
        "scene_id": identifier, "start": start, "end": end, "narration": "Fixture only.",
        "transcript_segment_ids": [], "research_source_ids": [], "classification": ["concept"],
        "visual_strategy": "explanatory_graphic", "primary_asset": None, "secondary_assets": [],
        "graphics": [], "text_overlay": None, "ai_generation": False, "treatment_notes": "",
    }


def asset(identifier="asset_01"):
    return {
        "asset_id": identifier, "description": "Fixture asset.", "type": "image", "scene_ids": ["scene_01"],
        "origin": "real", "source": {"kind": "asset", "url": None, "title": None, "attribution": None,
        "license_notes": None, "provenance_notes": None}, "local_filepath": None,
        "resolution": None, "status": "planned", "treatment": "", "generation": None,
    }


class EpisodeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = create_episode("test-topic", Path(self.temp.name))

    def write(self, name, mutate):
        path = self.root / DOCUMENTS[name]
        data = read_json(path)
        mutate(data)
        path.write_text(json.dumps(data), encoding="utf-8")

    def errors(self, production=False):
        return "\n".join(validate_episode(self.root, production=production)["errors"])

    def test_template_and_generation_are_valid_without_fabricated_recording(self):
        self.assertTrue(validate_episode(PROJECT_ROOT / "episodes/_template")["valid"])
        result = validate_episode(self.root)
        self.assertTrue(result["valid"], result)
        self.assertEqual(self.root.name, "episode-test-topic")
        self.assertFalse((self.root / "audio/voice_original.wav").exists())
        self.assertFalse((self.root / "transcript/transcript_raw.json").exists())
        self.assertFalse((self.root / "transcript/transcript_clean.json").exists())
        self.assertTrue((self.root / "assets/generated").is_dir())
        self.assertEqual(len(result["warnings"]), 3)

    def test_slug_is_deterministic_and_collision_preserves_existing_episode(self):
        self.assertEqual(episode_id("  İSTANBUL: Işık  "), "episode-istanbul-isik")
        self.assertEqual(episode_id("episode-michelin"), "episode-michelin")
        marker = self.root / "keep.txt"
        marker.write_text("must survive")
        with self.assertRaises(FileExistsError):
            create_episode("TEST TOPIC", Path(self.temp.name))
        self.assertEqual(marker.read_text(), "must survive")
        with self.assertRaises(ValueError):
            episode_id("***")

    def test_unknown_fields_and_booleans_as_numbers_are_rejected(self):
        one = scene()
        one["start"] = True
        one["invented"] = 4
        self.write("storyboard", lambda doc: doc.update(scenes=[one]))
        errors = self.errors()
        self.assertIn("expected number", errors)
        self.assertIn("unexpected property", errors)

    def test_scene_order_and_information_layer_timing_are_checked(self):
        one = scene()
        one["text_overlay"] = {"text": "Fixture", "start": 1, "end": 3, "research_source_ids": []}
        self.write("storyboard", lambda doc: doc.update(scenes=[one, scene("scene_02", 1, 4)]))
        errors = self.errors()
        self.assertIn("must fit its scene", errors)
        self.assertIn("must not overlap", errors)

    def test_duplicate_ids_and_unknown_references_are_checked(self):
        one = scene()
        one["primary_asset"] = "asset_missing"
        one["research_source_ids"] = ["source_missing"]
        self.write("storyboard", lambda doc: doc.update(scenes=[one, copy.deepcopy(one)]))
        errors = self.errors()
        self.assertIn("scene_id values must be unique", errors)
        self.assertIn("unknown asset", errors)
        self.assertIn("unknown research source", errors)

    def test_research_and_asset_sources_remain_distinct(self):
        self.write("research-sources", lambda doc: doc.update(source_kind="asset"))
        self.assertIn("expected 'research'", self.errors())

    def test_real_generated_distinction_and_asset_scene_backreferences(self):
        one, image = scene(), asset()
        one["primary_asset"] = "asset_01"
        image["origin"] = "ai_generated"
        self.write("storyboard", lambda doc: doc.update(scenes=[one]))
        self.write("asset-plan", lambda doc: doc.update(assets=[image]))
        errors = self.errors()
        self.assertIn("requires provider", errors)
        self.assertIn("ai_generation must match", errors)
        image["generation"] = {"provider": "higgsfield", "reason": "abstract_concept", "rationale": "Fixture reason."}
        image["scene_ids"] = ["scene_missing"]
        self.write("asset-plan", lambda doc: doc.update(assets=[image]))
        self.assertIn("does not list this scene", self.errors())

    def test_paths_cannot_traverse_or_escape_through_symlinks(self):
        image = asset()
        image["local_filepath"] = "assets/../../outside.jpg"
        self.write("asset-plan", lambda doc: doc.update(assets=[image]))
        self.assertIn("unsafe episode-relative path", self.errors())
        outside = Path(self.temp.name) / "outside.jpg"
        outside.write_text("fixture")
        (self.root / "assets/images/link.jpg").symlink_to(outside)
        image["local_filepath"] = "assets/images/link.jpg"
        self.write("asset-plan", lambda doc: doc.update(assets=[image]))
        self.assertIn("path escapes episode", self.errors())

    def test_ready_asset_requires_provenance_and_existing_media(self):
        image = asset()
        image["status"] = "ready"
        self.write("asset-plan", lambda doc: doc.update(assets=[image]))
        errors = self.errors()
        self.assertIn("existing local file", errors)
        self.assertIn("license notes", errors)
        self.assertIn("resolution", errors)

    def test_pickups_keep_original_time_ranges_and_do_not_claim_splicing(self):
        pickup = {"pickup_id": "pickup_01", "start": 3, "end": 2, "reason": "Fixture", "suggested_line": "Fixture", "replacement_audio": "../escape.wav", "status": "recorded"}
        self.write("pickups", lambda doc: doc.update(pickups=[pickup]))
        errors = self.errors(production=True)
        self.assertIn("end must be after start", errors)
        self.assertIn("unsafe episode-relative path", errors)
        self.assertIn("splice/timing-map implementation is not available", errors)

    def test_production_rejects_an_empty_plan(self):
        result = validate_episode(self.root, production=True)
        self.assertFalse(result["valid"])
        self.assertIn("production requires at least one scene", "\n".join(result["errors"]))
        self.assertIn("Original human recording is absent", "\n".join(result["errors"]))

    def test_duplicate_json_properties_and_nonfinite_numbers_fail(self):
        path = self.root / DOCUMENTS["storyboard"]
        path.write_text('{"scenes": [], "scenes": []}')
        self.assertIn("Duplicate JSON property", self.errors())
        path.write_text('{"start": NaN}')
        self.assertIn("Invalid JSON numeric constant", self.errors())

    def test_schema_reader_fails_on_unsupported_validation_keywords(self):
        with self.assertRaisesRegex(ValueError, "Unsupported schema"):
            validate_schema("fixture", {"type": "string", "maxLength": 1})

    def test_raw_clean_integration_preserves_recorded_time_and_traces(self):
        from engine.transcription import clean_transcript

        # Pure contract fixture, never a production transcript or a Whisper test.
        audio = self.root / "audio/voice_original.wav"
        audio.write_bytes(b"synthetic test bytes")
        raw = {"language": "tr", "text": "  Fixture  ", "duration": 2,
               "segments": [{"id": 0, "start": 0, "end": 1, "text": " Fixture ",
                             "words": [{"word": " Fixture", "start": 0, "end": 1, "probability": 1}]}],
               "_engine": {"kind": "raw", "audio": {"path": "audio/voice_original.wav",
                           "sha256": hashlib.sha256(audio.read_bytes()).hexdigest(),
                           "durationSeconds": 2, "timingAuthority": True}}}
        raw_path = self.root / "transcript/transcript_raw.json"
        raw_path.write_text(json.dumps(raw))
        clean = clean_transcript(raw, hashlib.sha256(raw_path.read_bytes()).hexdigest())
        clean_path = self.root / "transcript/transcript_clean.json"
        clean_path.write_text(json.dumps(clean))
        self.assertEqual(self.errors(), "")
        clean["segments"][0]["words"][0]["end"] = 0.9
        clean["_engine"]["editDecisions"] = []
        clean_path.write_text(json.dumps(clean))
        errors = self.errors()
        self.assertIn("preserve raw segment and word timing", errors)
        self.assertIn("editDecisions do not trace", errors)

    def test_invalid_transcript_audio_metadata_reports_errors(self):
        raw = {"language": "tr", "text": "", "duration": 2, "segments": [],
               "_engine": {"kind": "raw", "audio": "invalid"}}
        (self.root / "transcript/transcript_raw.json").write_text(json.dumps(raw))
        self.assertIn("_engine.audio must be an object", self.errors())


if __name__ == "__main__":
    unittest.main()
