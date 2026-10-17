"""Planning contracts use synthetic temporary fixtures, never episode media."""

import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from engine.assets.models import validate_assets
from engine.qa.episode import DOCUMENTS, read_json, validate_episode
from engine.transcription import clean_transcript
from scripts.new_episode import create_episode


class PlanningTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = create_episode("planning-fixture", Path(self.temp.name))
        voice = self.root / "audio/voice_original.wav"
        voice.write_bytes(b"synthetic contract fixture; not recorded speech")
        self.raw = {
            "language": "tr", "text": " Lastik yol rehberi.", "duration": 4,
            "segments": [{"id": 0, "start": 0.5, "end": 2.5, "text": " Lastik yol rehberi.",
                          "words": [{"word": " Lastik", "start": 0.5, "end": 1, "probability": 0.9},
                                    {"word": " yol", "start": 1, "end": 1.5, "probability": 0.9},
                                    {"word": " rehberi.", "start": 1.5, "end": 2.5, "probability": 0.9}]}],
            "_engine": {"kind": "raw", "audio": {"path": "audio/voice_original.wav",
                        "sha256": hashlib.sha256(voice.read_bytes()).hexdigest(),
                        "durationSeconds": 4, "timingAuthority": True}},
        }
        raw_path = self.root / "transcript/transcript_raw.json"
        raw_path.write_text(json.dumps(self.raw))
        clean = clean_transcript(self.raw, hashlib.sha256(raw_path.read_bytes()).hexdigest())
        (self.root / "transcript/transcript_clean.json").write_text(json.dumps(clean))
        self.raw_bytes = raw_path.read_bytes()
        self.asset = {
            "asset_id": "asset_fixture", "title": "Contract fixture", "description": "Temporary bytes",
            "type": "graphic", "scene_ids": ["scene_01"], "origin": "motion_graphic",
            "source": {"kind": "asset", "url": None, "title": "Fixture title", "attribution": "Fixture author",
                       "license_notes": "Test fixture only", "provenance_notes": "Generated in TemporaryDirectory",
                       "direct_file_url": None, "institution": None, "date": None,
                       "classification": "test fixture", "license_url": None},
            "local_filepath": "assets/graphics/fixture.bin", "resolution": None, "status": "ready",
            "selection_status": "selected", "rights_status": "approved_clear_rights", "treatment": "", "generation": None,
        }
        asset_path = self.root / self.asset["local_filepath"]
        asset_path.parent.mkdir(parents=True, exist_ok=True)
        asset_path.write_bytes(b"asset fixture")
        self.asset["sha256"] = hashlib.sha256(asset_path.read_bytes()).hexdigest()
        self.scene = {
            "scene_id": "scene_01", "start": 0, "end": 4, "narration": "Master reference wording.",
            "transcript_segment_ids": [0], "research_source_ids": [], "classification": ["concept"],
            "visual_strategy": "explanatory_graphic", "primary_asset": "asset_fixture", "secondary_assets": [],
            "graphics": [], "text_overlay": None, "text_overlays": [
                {"text": "Rehber", "start": 1.5, "end": 3, "research_source_ids": []}],
            "ai_generation": False, "treatment_notes": "", "motion_plan": "Reveal the guide.",
            "master_narration_reference": {"path": "script/script_master.md", "paragraph_indices": [1]},
            "critical_sync_points": [{"sync_id": "sync_guide", "label": "Guide reveal", "start": 1,
                                      "end": 2.5, "segment_id": 0, "word_indices": [1, 2],
                                      "transcript_text": "yol rehberi.", "recognition_note": None}],
        }
        self.save()

    def save(self):
        for name, extra in (("storyboard", {"scenes": [self.scene], "audio_duration": 4}),
                            ("asset-plan", {"assets": [self.asset]})):
            path = self.root / DOCUMENTS[name]
            data = read_json(path)
            data.update(extra)
            path.write_text(json.dumps(data))

    def errors(self):
        return "\n".join(validate_episode(self.root)["errors"])

    def test_raw_word_plan_is_valid_and_validation_preserves_raw_file(self):
        self.assertEqual(self.errors(), "")
        self.assertEqual((self.root / "transcript/transcript_raw.json").read_bytes(), self.raw_bytes)

    def test_sync_rejects_inferred_timing_corrected_speech_and_invalid_indices(self):
        original = copy.deepcopy(self.scene["critical_sync_points"][0])
        changes = [({"start": 1.1}, "original raw word bounds"),
                   ({"transcript_text": "doğru metin"}, "preserve original raw words"),
                   ({"word_indices": [1, 9]}, "unknown raw word indices"),
                   ({"word_indices": [0, 2]}, "contiguous and ordered"),
                   ({"segment_id": 8}, "original raw transcript segment"),
                   ({"end": 5}, "must fit its scene time range")]
        for change, message in changes:
            with self.subTest(change=change):
                self.scene["critical_sync_points"] = [dict(original, **change)]
                self.save()
                self.assertIn(message, self.errors())

    def test_additional_overlays_obey_scene_bounds_and_source_references(self):
        self.scene["text_overlays"][0].update(end=5, research_source_ids=["source_missing"])
        self.save()
        errors = self.errors()
        self.assertIn("information layer must fit", errors)
        self.assertIn("unknown research source", errors)

    def test_candidate_inventory_does_not_require_production_files(self):
        candidate = copy.deepcopy(self.asset)
        candidate.update(asset_id="asset_candidate", selection_status="candidate", rights_status="candidate_rights_review",
                         status="planned", local_filepath=None, sha256=None)
        data = {"assets": [self.asset, candidate]}
        self.assertEqual(validate_assets(data, {"scene_01"}, self.root, production=True), [])
        candidate["selection_status"] = "selected"
        errors = "\n".join(validate_assets(data, {"scene_01"}, self.root, production=True))
        self.assertIn("production requires status ready", errors)
        self.assertIn("existing local file", errors)
        self.assertIn("rights_status approved_clear_rights", errors)

    def test_scene_asset_selection_and_ready_rights_are_enforced(self):
        for selection in ("candidate", "rejected", "unavailable"):
            with self.subTest(selection=selection):
                self.asset.update(selection_status=selection, rights_status="candidate_rights_review")
                self.save()
                errors = self.errors()
                self.assertIn("must have selection_status selected", errors)
                self.assertIn("rights_status approved_clear_rights", errors)

    def test_local_asset_checksum_detects_changed_download(self):
        (self.root / self.asset["local_filepath"]).write_bytes(b"changed asset bytes")
        self.assertIn("sha256 does not match", self.errors())

    def test_sync_requires_raw_evidence_and_audio_duration_matches_recording(self):
        path = self.root / DOCUMENTS["storyboard"]
        data = read_json(path)
        data["audio_duration"] = 5
        path.write_text(json.dumps(data))
        self.assertIn("audio_duration must match", self.errors())
        (self.root / "transcript/transcript_raw.json").unlink()
        self.assertIn("requires its original raw transcript segment", self.errors())


if __name__ == "__main__":
    unittest.main()
