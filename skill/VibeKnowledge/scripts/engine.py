#!/usr/bin/env python3
"""Self-contained toolchain entry. Resolves all paths from the chosen project."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import venv
from workflow import load, require, write_json, probe_video, digest

def executable(name):
    path=shutil.which(name)
    if not path: raise ValueError(f'缺少{name}，请先安装Node.js 22+（含npm）和Python 3.10+')
    return path

def run(cmd, project, env=None, **kwargs):
    if os.name=='nt' and str(cmd[0]).lower().endswith(('.cmd','.bat')):
        return subprocess.run(subprocess.list2cmdline(list(map(str,cmd))),cwd=project,env=env,shell=True,check=True,**kwargs)
    return subprocess.run(list(map(str,cmd)),cwd=project,env=env,check=True,**kwargs)

def dependencies(project):
    node=executable('node')
    js="const r=require('module').createRequire(process.cwd()+'/package.json');console.log(JSON.stringify({ffprobe:r('@ffprobe-installer/ffprobe').path}));"
    dep=json.loads(run([node,'-e',js],project,capture_output=True,text=True).stdout)
    dep['ffmpeg']=str(project/'.runtime/media'/('ffmpeg.exe' if os.name=='nt' else 'ffmpeg'))
    package=project/'node_modules/hyperframes/package.json'
    meta=json.loads(package.read_text());binary=meta['bin'];binary=binary['hyperframes'] if isinstance(binary,dict) else binary
    dep.update(node=node,cli=str(package.parent/binary),version=meta['version'])
    for key in ['ffmpeg','ffprobe','cli']:
        if not dep[key] or not Path(dep[key]).is_file():raise ValueError(f'缺少{key}，请运行setup')
    env=os.environ.copy()
    env['PATH']=os.pathsep.join([str(Path(dep['ffmpeg']).parent),str(Path(dep['ffprobe']).parent),env.get('PATH','')])
    for name,path in [('TMPDIR','review/tmp'),('TMP','review/tmp'),('TEMP','review/tmp'),('HYPERFRAMES_EXTRACT_CACHE_DIR','.cache/extract'),('PUPPETEER_CACHE_DIR','.cache/browser')]:
        folder=project/path;folder.mkdir(parents=True,exist_ok=True);env[name]=str(folder)
    env['FFMPEG_PATH']=dep['ffmpeg'];env['FFPROBE_PATH']=dep['ffprobe']
    return dep,env

def build(project,stage,dep,env):
    require(project,load(project),stage)
    config=json.loads((project/'film/src/config.json').read_text())
    duration=30 if stage=='preview' else config['fullDuration']
    if stage=='full' and not 60<=duration<=90:raise ValueError('完整版时长需为60–90秒')
    run([sys.executable,Path(__file__).with_name('prepare_bgm.py'),project,'--stage',stage,'--duration',duration,'--ffmpeg',dep['ffmpeg']],project,env)
    write_json(project/'runtime.json',{'stage':stage,'duration':duration,'fps':30,'width':1920,'height':1080})
    run([dep['node'],project/'tools/build.mjs'],project,env)
    return duration

def cli(project,dep,env,args,report=None):
    cmd=[dep['node'],dep['cli'],*args]
    if report:
        with report.open('w',encoding='utf8') as f:run(cmd,project/'film',env,stdout=f)
    else:run(cmd,project/'film',env)

def validate(project,dep,video,expected):
    metadata=probe_video(video,dep['ffprobe'],expected)
    run([dep['ffmpeg'],'-v','error','-i',video,'-f','null','-'],project,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    info=json.loads(run([dep['ffprobe'],'-v','error','-show_streams','-show_format','-of','json',video],project,capture_output=True,text=True).stdout)
    report={'passed':True,'metadata':metadata,'streams':info['streams'],'full_decode':'pass','sha256':digest(video),'bytes':video.stat().st_size}
    destination=project/'review'/f'{video.stem}-technical.json';write_json(destination,report)
    times=[0,1.6,2.8,7.6,16.6,17.5,22,26.8,expected-1/30]
    if expected>30:times += [40,expected*.75]
    frames=project/'review'/f'{video.stem}-frames';frames.mkdir(exist_ok=True)
    for i,t in enumerate(sorted(set(times))):
        run([dep['ffmpeg'],'-v','error','-ss',t,'-i',video,'-frames:v','1','-y',frames/f'{i:02d}-{t:.3f}.png'],project)
    with (project/'review'/f'{video.stem}-loudness.txt').open('w') as log:
        run([dep['ffmpeg'],'-hide_banner','-i',video,'-vn','-af','ebur128=peak=true','-f','null','-'],project,stdout=log,stderr=log)
    print(json.dumps({'passed':True,'duration':expected,'frames':metadata['frames'],'report':str(destination)},ensure_ascii=False))

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('action',choices=['setup','doctor','build','check','snapshot','preview','render','verify'])
    p.add_argument('project',type=Path);p.add_argument('--stage',choices=['preview','full'],default='preview')
    p.add_argument('--at',default='1.6,2.8,7.6,16.6,17.5,22,26.8,29.5')
    p.add_argument('--output',help='项目内的MP4相对路径；不覆盖现有成片')
    args=p.parse_args();project=args.project.resolve()
    if args.action=='setup':
        node=executable('node');version=run([node,'-p','process.versions.node'],project,capture_output=True,text=True).stdout.strip()
        if int(version.split('.')[0])<22:raise ValueError('需要Node.js 22或更高版本')
        run([executable('npm'),'ci','--no-audit','--no-fund','--cache',project/'.cache/npm'],project)
        runtime=project/'.runtime/python'
        venv.EnvBuilder(with_pip=True).create(runtime)
        python=runtime/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
        run([python,'-m','pip','install','--cache-dir',project/'.cache/pip','imageio-ffmpeg==0.6.0'],project)
        media=project/'.runtime/media';media.mkdir(parents=True,exist_ok=True)
        install_env=os.environ.copy();install_env.pop('IMAGEIO_FFMPEG_EXE',None)
        ffmpeg=run([python,'-c','import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],project,install_env,capture_output=True,text=True).stdout.strip()
        Path(ffmpeg).resolve().relative_to(runtime.resolve())
        shutil.copy2(ffmpeg,media/('ffmpeg.exe' if os.name=='nt' else 'ffmpeg'))
    dep,env=dependencies(project)
    if args.action in ['setup','doctor']:
        versions={}
        for key in ['ffmpeg','ffprobe']:
            versions[key]=run([dep[key],'-version'],project,capture_output=True,text=True).stdout.splitlines()[0]
        font=project/'film/assets/fonts/NotoSansSC.ttf'
        if font.stat().st_size<1000000:raise ValueError('完整中文字体缺失')
        write_json(project/'review/environment.json',{'node':run([dep['node'],'-v'],project,capture_output=True,text=True).stdout.strip(),'hyperframes':dep['version'],'media':versions,'font_sha256':digest(font)})
        print('依赖已就绪；没有读取原作品、系统字体或原工作区工具。');return
    require(project,load(project),args.stage)
    if args.action=='verify':
        duration=30 if args.stage=='preview' else json.loads((project/'film/src/config.json').read_text())['fullDuration']
    else:duration=build(project,args.stage,dep,env)
    if args.action=='build':return
    if args.action=='check':
        cli(project,dep,env,['check','--json'],project/'review'/f'check-{args.stage}.json');return
    if args.action=='snapshot':
        if any(not 0<=float(t)<duration for t in args.at.split(',')):raise ValueError('截图时间超出视频范围')
        cli(project,dep,env,['snapshot','--at',args.at,'--output',str(project/'review'/f'snapshots-{args.stage}')]);return
    if args.action=='preview':
        cli(project,dep,env,['preview','--background']);return
    video=(project/(args.output or f'output/{args.stage}/video.mp4')).resolve();video.relative_to(project)
    if args.action=='render':
        if video.exists():raise ValueError('成片已存在；通过 --output 使用新版本文件名')
        video.parent.mkdir(parents=True,exist_ok=True)
        cli(project,dep,env,['check','--json'],project/'review'/f'check-{args.stage}.json')
        cli(project,dep,env,['render','--quality','delivery','--fps','30','--workers','1','--output',str(video)])
    validate(project,dep,video,duration)

if __name__=='__main__':
    try:main()
    except (ValueError,FileNotFoundError,KeyError,subprocess.CalledProcessError) as exc:
        raise SystemExit(f'停止：{exc}') from exc
