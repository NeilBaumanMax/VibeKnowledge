#!/usr/bin/env python3
"""Prepare the fixed soundtrack only after the relevant real approval."""
import argparse
from pathlib import Path
import shutil
import subprocess
from workflow import SKILL, inside, load, require, write_json, digest
import json

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', type=Path)
    parser.add_argument('--stage', required=True, choices=['preview', 'full'])
    parser.add_argument('--duration', required=True, type=float)
    parser.add_argument('--ffmpeg')
    args = parser.parse_args()
    project = args.project.resolve()
    state = load(project)
    require(project, state, args.stage)
    duration = args.duration
    if args.stage == 'preview' and duration != 30 or args.stage == 'full' and not 60 <= duration <= 90:
        parser.error('样片必须30秒；完整版60–90秒')
    executable = args.ffmpeg or shutil.which('ffmpeg')
    if not executable:
        parser.error('找不到ffmpeg，请指定 --ffmpeg')
    manifest = json.loads((SKILL / 'assets/audio/manifest.json').read_text())
    source = inside(project, state['bgm']['path'])
    start = manifest['excerpt_start_seconds']
    fade = .5 if args.stage == 'preview' else 1.8
    destination = project / f'film/assets/audio/score-{args.stage}.wav'
    destination.parent.mkdir(parents=True, exist_ok=True)
    filters = f'aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=9,afade=t=in:d=0.035,afade=t=out:st={duration-fade}:d={fade}'
    subprocess.run([executable, '-v', 'error', '-ss', str(start), '-i', str(source), '-t', str(duration), '-ar', '48000', '-af', filters, '-y', str(destination)], check=True)
    write_json(project / f'review/music-{args.stage}.json', {'source_sha256': digest(source), 'excerpt_start': start, 'duration': duration,
                'filters': filters, 'output': str(destination.relative_to(project)), 'output_sha256': digest(destination)})
    print(destination)

if __name__ == '__main__':
    try:
        main()
    except (ValueError, FileNotFoundError, KeyError, subprocess.CalledProcessError) as exc:
        raise SystemExit(f'停止：{exc}') from exc
