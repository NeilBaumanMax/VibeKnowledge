#!/usr/bin/env python3
"""Offline regression tests for version invalidation; fixture approvals are synthetic."""
import argparse
import json
from pathlib import Path
import tempfile
import shutil
import unittest
from workflow import SKILL, digest, write_json, script_hash, require

class Gates(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=TEST_ROOT)
        self.project = Path(self.temp.name)
        (self.project / 'docs').mkdir()
        (self.project / 'docs/script.md').write_text('测试夹具：脚本内容')
        (self.project / 'docs/sources.md').write_text('测试夹具：资料来源')
        # Copy so relocated skills and test folders can live on different volumes.
        source = SKILL / 'assets/audio/千年之后_氛围版.ogg'
        shutil.copyfile(source, self.project / 'bgm.ogg')
        self.state = {'bgm': {'path': 'bgm.ogg', 'sha256': digest(source)}}

    def tearDown(self):
        self.temp.cleanup()

    def approve_script_fixture(self):
        self.state['script_approval'] = {'sha256': script_hash(self.project), 'quote': 'SYNTHETIC TEST ONLY'}

    def preview_fixture(self):
        (self.project / 'preview.mp4').write_bytes(b'gate-test-only-not-video')
        (self.project / 'review.md').write_text('SYNTHETIC TEST ONLY')
        self.state['preview'] = {'video': 'preview.mp4', 'review': 'review.md', 'video_sha256': digest(self.project/'preview.mp4'),
                                  'review_sha256': digest(self.project/'review.md'), 'script_sha256': script_hash(self.project)}

    def approve_preview_fixture(self):
        self.state['preview_approval'] = {k:self.state['preview'][k] for k in ['video_sha256','review_sha256']}

    def test_preview_blocked_without_approval(self):
        with self.assertRaises(ValueError): require(self.project,self.state,'preview')

    def test_current_script_allows_preview(self):
        self.approve_script_fixture();require(self.project,self.state,'preview')

    def test_edited_script_invalidates_approval(self):
        self.approve_script_fixture();(self.project/'docs/script.md').write_text('修订脚本')
        with self.assertRaises(ValueError): require(self.project,self.state,'preview')

    def test_edited_sources_invalidates_approval(self):
        self.approve_script_fixture();(self.project/'docs/sources.md').write_text('修订来源')
        with self.assertRaises(ValueError): require(self.project,self.state,'preview')

    def test_full_blocked_without_preview_approval(self):
        self.approve_script_fixture();self.preview_fixture()
        with self.assertRaises(ValueError): require(self.project,self.state,'full')

    def test_current_preview_allows_full(self):
        self.approve_script_fixture();self.preview_fixture();self.approve_preview_fixture();require(self.project,self.state,'full')

    def test_changed_preview_invalidates_approval(self):
        self.approve_script_fixture();self.preview_fixture();self.approve_preview_fixture();(self.project/'preview.mp4').write_bytes(b'revision2')
        with self.assertRaises(ValueError): require(self.project,self.state,'full')

    def test_changed_review_invalidates_approval(self):
        self.approve_script_fixture();self.preview_fixture();self.approve_preview_fixture();(self.project/'review.md').write_text('revision2')
        with self.assertRaises(ValueError): require(self.project,self.state,'full')

    def test_changed_bgm_rejected(self):
        self.approve_script_fixture();self.state['bgm']['sha256']='wrong'
        with self.assertRaises(ValueError): require(self.project,self.state,'preview')

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--workdir',required=True,type=Path)
    args=parser.parse_args();TEST_ROOT=args.workdir.resolve();TEST_ROOT.mkdir(parents=True,exist_ok=True)
    result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Gates))
    raise SystemExit(0 if result.wasSuccessful() else 1)
