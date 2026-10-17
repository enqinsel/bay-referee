"""Cost boundaries must fail before any remote command or analysis is launched."""
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class LocalCommandTests(unittest.TestCase):
    def denied(self, *args):
        result = subprocess.run(
            ['node', 'scripts/hyperframes.mjs', *args], cwd=ROOT,
            capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
        return result.stderr

    def test_hosted_and_paid_paths_are_not_exposed(self):
        for command in ('publish', 'cloud', 'lambda', 'cloudrun', 'tts', 'transcribe'):
            with self.subTest(command=command):
                self.assertIn('Unsupported engine command', self.denied(command))

    def test_remote_snapshot_analysis_is_denied(self):
        self.assertIn('Remote AI snapshot analysis is disabled', self.denied('snapshot', '--describe', 'true'))
        self.assertIn('Remote AI snapshot analysis is disabled', self.denied('snapshot', '--describe=Check this frame'))

    def test_duplicate_options_cannot_reenable_paid_analysis(self):
        self.assertIn('Duplicate --describe', self.denied('snapshot', '--describe', 'false', '--describe=true'))
