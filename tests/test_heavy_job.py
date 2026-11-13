"""Lock safety tests use tiny print/sleep children; no models, codecs or renders."""
import fcntl
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from engine.runtime import heavy_job as guard

ROOT = Path(__file__).resolve().parents[1]


class HeavyJobTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='bay-heavy-test-')
        self.addCleanup(self.temp.cleanup)
        self.lock = Path(self.temp.name) / 'job.lock'
        self.processes = patch.object(guard, 'process_table', return_value=[])
        self.processes.start()
        self.addCleanup(self.processes.stop)

    def test_second_process_is_excluded_without_mutating_live_lock(self):
        code = '''
import sys
from pathlib import Path
from engine.runtime import heavy_job as g
g.process_table=lambda: []
try:
    with g.heavy_job('contender', lock_path=Path(sys.argv[1])): pass
except g.HeavyJobBusy: sys.exit(75)
'''
        with guard.heavy_job('first', lock_path=self.lock):
            before = self.lock.read_bytes()
            inode = self.lock.stat().st_ino
            child = subprocess.run([sys.executable, '-c', code, str(self.lock)], cwd=ROOT)
            self.assertEqual(child.returncode, 75)
            self.assertEqual(before, self.lock.read_bytes())
            self.assertEqual(inode, self.lock.stat().st_ino)

    def test_stale_metadata_reuses_same_inode_without_unlinking(self):
        self.lock.write_text(json.dumps({'owner_pid': 999999999, 'label': 'old'}))
        inode = self.lock.stat().st_ino
        with guard.heavy_job('new', lock_path=self.lock):
            self.assertEqual(self.lock.stat().st_ino, inode)
            self.assertEqual(json.loads(self.lock.read_text())['label'], 'new')
        self.assertTrue(self.lock.exists())

    def test_crashed_supervisor_keeps_inherited_child_lock(self):
        code = '''
import sys, subprocess, time
from pathlib import Path
from engine.runtime import heavy_job as g
g.process_table=lambda: []
with g.heavy_job('supervisor', lock_path=Path(sys.argv[1])) as lease:
    child=subprocess.Popen([sys.executable,'-c','import time; time.sleep(10)'], pass_fds=(lease['fd'],), stdout=subprocess.DEVNULL)
    print(child.pid, flush=True)
    time.sleep(10)
'''
        parent = subprocess.Popen([sys.executable, '-c', code, str(self.lock)], cwd=ROOT, stdout=subprocess.PIPE, text=True)
        child_pid = int(parent.stdout.readline())
        try:
            parent.kill()
            parent.wait(timeout=5)
            with self.assertRaises(guard.HeavyJobBusy):
                with guard.heavy_job('contender', lock_path=self.lock):
                    self.fail('Inherited lock was lost after supervisor crash')
        finally:
            try:
                os.kill(child_pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            parent.stdout.close()

    def test_live_orphan_group_and_unwrapped_ffmpeg_block_start(self):
        self.lock.write_text(json.dumps({'owner_pid': 999999, 'child_pgid': 1234}))
        for row in [dict(uid=os.getuid(), pid=1235, ppid=1, pgid=1234, state='S', command='worker'), dict(uid=os.getuid(), pid=5678, ppid=1, pgid=5678, state='R', command='/opt/bin/ffmpeg -i movie.mp4 out.mp4')]:
            with patch.object(guard, 'process_table', return_value=[row]):
                with self.assertRaises(guard.HeavyJobBusy):
                    with guard.heavy_job('new', lock_path=self.lock):
                        self.fail('Existing heavy process was ignored')

    def test_stolen_environment_token_does_not_bypass_flock(self):
        self.lock.write_text(json.dumps({'owner_pid': 999999, 'token': 'not-an-ancestor'}))
        with patch.dict(os.environ, {guard.TOKEN_ENV: 'not-an-ancestor'}):
            with guard.heavy_job('new', lock_path=self.lock) as lease:
                self.assertFalse(lease['nested'])
                self.assertNotEqual(lease['metadata']['token'], 'not-an-ancestor')

    def test_verified_nested_helper_reuses_live_ancestor_lease(self):
        code = """
import os,sys
from pathlib import Path
from engine.runtime import heavy_job as g
g.process_table=lambda: [dict(pid=os.getpid(),ppid=os.getppid(),uid=os.getuid(),pgid=os.getpgrp(),state='R',command='test child')]
with g.heavy_job('nested', lock_path=Path(sys.argv[1])) as lease:
    print('nested' if lease['nested'] else 'new')
"""
        with guard.heavy_job('parent', lock_path=self.lock):
            child = subprocess.run([sys.executable, '-c', code, str(self.lock)], cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(child.returncode, 0, child.stderr)
            self.assertEqual(child.stdout.strip(), 'nested')

    def test_stale_ancestor_token_never_reuses_an_unheld_lock(self):
        parent_pid = os.getppid()
        self.lock.write_text(json.dumps({'owner_pid': parent_pid, 'token': 'stale-ancestor'}))
        row = dict(uid=os.getuid(), pid=os.getpid(), ppid=parent_pid, pgid=os.getpgrp(), state='R', command='unit test')
        with patch.dict(os.environ, {guard.TOKEN_ENV: 'stale-ancestor'}), patch.object(guard, 'process_table', return_value=[row]):
            with guard.heavy_job('new', lock_path=self.lock) as lease:
                self.assertFalse(lease['nested'])
                self.assertNotEqual(lease['metadata']['token'], 'stale-ancestor')

    def test_symlink_lock_is_rejected_without_touching_target(self):
        target = Path(self.temp.name) / 'keep.txt'
        target.write_text('keep')
        self.lock.symlink_to(target)
        with self.assertRaises(OSError):
            with guard.heavy_job('new', lock_path=self.lock): pass
        self.assertEqual(target.read_text(), 'keep')

    def test_process_table_failure_fails_closed(self):
        with patch.object(guard, 'process_table', side_effect=PermissionError('denied')):
            with self.assertRaises(PermissionError):
                with guard.heavy_job('new', lock_path=self.lock): pass

    def test_detection_ignores_prose_and_lightweight_probes(self):
        self.assertTrue(guard.looks_heavy('/opt/bin/python3 scripts/transcribe.py episode --profile production'))
        self.assertTrue(guard.looks_heavy('node _work/render.mjs'))
        self.assertFalse(guard.looks_heavy('zsh -c "echo ffmpeg whisper render.mjs"'))
        self.assertFalse(guard.looks_heavy('/opt/bin/ffmpeg -version'))
        self.assertFalse(guard.looks_heavy('/opt/bin/ffprobe -show_format video.mp4'))


if __name__ == '__main__':
    unittest.main()
