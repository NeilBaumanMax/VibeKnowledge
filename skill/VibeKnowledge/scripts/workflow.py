#!/usr/bin/env python3
"""Record real human approvals and reject stale script/video revisions.

This is a local workflow guard, not an authorization source. Never manufacture
an approval quote to pass a gate. All artifacts must remain inside the project.
"""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess

SKILL = Path(__file__).resolve().parents[1]

def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()

def write_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def now():
    return datetime.now(timezone.utc).isoformat()

def inside(project, value):
    path = (project / value).resolve()
    path.relative_to(project.resolve())
    if not path.is_file():
        raise ValueError(f'文件不存在：{path}')
    return path

def script_hash(project):
    parts = []
    for name in ('docs/script.md', 'docs/sources.md'):
        path = inside(project, name)
        if not path.read_text().strip():
            raise ValueError(f'请先完成 {name}')
        parts.append(name + ':' + digest(path))
    return hashlib.sha256('\n'.join(parts).encode()).hexdigest()

def load(project):
    return json.loads((project / 'workflow.json').read_text())

def assert_bgm(project, state):
    expected = json.loads((SKILL / 'assets/audio/manifest.json').read_text())
    source = inside(project, state['bgm']['path'])
    if digest(source) != expected['sha256'] or state['bgm']['sha256'] != expected['sha256']:
        raise ValueError('固定BGM校验失败；不能静默换歌')

def assert_preview_current(project, state):
    record = state.get('preview')
    if not record or record['script_sha256'] != script_hash(project):
        raise ValueError('缺少当前脚本的样片；先渲染并记录30秒样片')
    for key in ('video', 'review'):
        if digest(inside(project, record[key])) != record[key + '_sha256']:
            raise ValueError('样片或Review已变更；请重新记录并提交用户确认')
    return record

def require(project, state, stage):
    assert_bgm(project, state)
    approval = state.get('script_approval')
    if not approval or approval['sha256'] != script_hash(project):
        raise ValueError('当前脚本尚未获用户批准，或批准后已修改；停在脚本审核阶段')
    if stage == 'full':
        record = assert_preview_current(project, state)
        approved = state.get('preview_approval', {})
        if approved.get('video_sha256') != record['video_sha256'] or approved.get('review_sha256') != record['review_sha256']:
            raise ValueError('当前30秒样片尚未获用户批准；不能制作完整版')

def probe_video(path, executable, expected):
    cmd = executable or shutil.which('ffprobe')
    if not cmd:
        raise ValueError('找不到ffprobe，请指定 --ffprobe；不能跳过视频规格检查')
    info = json.loads(subprocess.check_output([cmd, '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', str(path)]))
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    a = next(s for s in info['streams'] if s['codec_type'] == 'audio')
    n, d = map(int, v['r_frame_rate'].split('/'))
    if not (v['width'] == 1920 and v['height'] == 1080 and n / d == 30 and v['codec_name'] == 'h264'
            and v.get('pix_fmt') == 'yuv420p' and a['codec_name'] == 'aac' and a['channels'] == 2
            and abs(float(info['format']['duration']) - expected) < .08
            and int(v['nb_read_frames']) == round(expected * 30) and path.suffix.lower() == '.mp4'):
        raise ValueError('视频规格不符：需指定时长、1920×1080/30fps、MP4/H.264 yuv420p、AAC双声道')
    return {'duration': float(info['format']['duration']), 'frames': int(v['nb_read_frames']), 'width': v['width'], 'height': v['height'], 'fps': 30}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['init', 'status', 'approve-script', 'check', 'record-preview', 'approve-preview', 'record-full'])
    parser.add_argument('project', type=Path)
    parser.add_argument('--topic')
    parser.add_argument('--quote', help='真实用户针对当前版本的批准原话')
    parser.add_argument('--stage', choices=['preview', 'full'])
    parser.add_argument('--video')
    parser.add_argument('--review')
    parser.add_argument('--duration', type=float, default=78)
    parser.add_argument('--ffprobe')
    args = parser.parse_args()
    project = args.project.resolve()
    if args.action == 'init':
        if not args.topic or not args.topic.strip():
            parser.error('init需要 --topic')
        if project.exists():
            parser.error('目标目录已存在；请继续该项目或选择新目录，禁止覆盖')
        manifest = json.loads((SKILL / 'assets/audio/manifest.json').read_text())
        source = SKILL / manifest['path']
        if digest(source) != manifest['sha256']:
            parser.error('技能内BGM校验失败')
        shutil.copytree(SKILL / 'assets/starter', project, ignore=shutil.ignore_patterns('node_modules', '.cache', '__pycache__'))
        for folder in ['docs', 'assets/audio', 'film/src', 'film/assets/fonts', 'output/preview', 'output/full', 'review']:
            (project / folder).mkdir(parents=True, exist_ok=True)
        for font in (SKILL / 'assets/fonts').iterdir():
            if font.is_file():
                shutil.copy2(font, project / 'film/assets/fonts' / font.name)
        config_path = project / 'film/src/config.json'
        config = json.loads(config_path.read_text())
        config['title'] = args.topic
        write_json(config_path, config)
        source_target = project / 'assets/audio/千年之后_氛围版.ogg'
        shutil.copy2(source, source_target)
        shutil.copy2(SKILL / 'assets/audio/full-cues.json', project / 'assets/audio/music-cues.json')
        (project / 'docs/script.md').write_text('')
        (project / 'docs/sources.md').write_text('')
        state = {'schema_version': 1, 'topic': args.topic, 'stage': 'script_review', 'created_at': now(),
                 'bgm': {'path': str(source_target.relative_to(project)), 'sha256': manifest['sha256']}, 'events': []}
        write_json(project / 'workflow.json', state)
        print('已建立脚本阶段项目；先完成脚本与来源，等待用户批准。')
        return
    state = load(project)
    if args.action == 'status':
        print(json.dumps(state, ensure_ascii=False, indent=2))
        return
    if args.action == 'check':
        if not args.stage:
            parser.error('check需要 --stage')
        require(project, state, args.stage)
        print(f'{args.stage} 阶段允许继续；脚本、配乐及必要批准版本匹配。')
        return
    if args.action.startswith('approve-') and (not args.quote or not args.quote.strip()):
        parser.error('只在真实用户批准当前版本后使用 --quote 记录原话')
    if args.action == 'approve-script':
        assert_bgm(project, state)
        state['script_approval'] = {'sha256': script_hash(project), 'quote': args.quote, 'at': now()}
        for key in ['preview', 'preview_approval', 'full']:
            state.pop(key, None)
        state['stage'] = 'preview_production'
    elif args.action == 'approve-preview':
        require(project, state, 'preview')
        record = assert_preview_current(project, state)
        state['preview_approval'] = {'video_sha256': record['video_sha256'], 'review_sha256': record['review_sha256'], 'quote': args.quote, 'at': now()}
        state['stage'] = 'full_production'
    else:
        stage = 'preview' if args.action == 'record-preview' else 'full'
        require(project, state, stage)
        if not args.video or not args.review:
            parser.error('记录交付需要 --video 和 --review')
        expected = 30 if stage == 'preview' else args.duration
        if stage == 'full' and not 60 <= expected <= 90:
            parser.error('本技能默认完整版为60–90秒，其他长度需按用户指示修改配置')
        video = inside(project, args.video)
        review = inside(project, args.review)
        if not review.read_text().strip():
            parser.error('Review不能为空')
        media_probe = args.ffprobe
        if not media_probe and (project / 'node_modules').exists():
            from engine import dependencies
            media_probe = dependencies(project)[0]['ffprobe']
        metadata = probe_video(video, media_probe, expected)
        state[stage] = {'video': str(video.relative_to(project)), 'review': str(review.relative_to(project)),
                        'video_sha256': digest(video), 'review_sha256': digest(review),
                        'script_sha256': script_hash(project), 'metadata': metadata, 'at': now()}
        state['stage'] = 'preview_review' if stage == 'preview' else 'complete'
        if stage == 'preview':
            state.pop('preview_approval', None)
            state.pop('full', None)
    state['events'].append({'action': args.action, 'at': now(), 'quote': args.quote})
    write_json(project / 'workflow.json', state)
    print(f'已记录：{args.action}；当前阶段：{state["stage"]}')

if __name__ == '__main__':
    try:
        main()
    except (ValueError, FileNotFoundError, KeyError, StopIteration, subprocess.CalledProcessError) as exc:
        raise SystemExit(f'停止：{exc}') from exc
