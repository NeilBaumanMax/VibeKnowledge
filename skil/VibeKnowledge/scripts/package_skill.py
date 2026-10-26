#!/usr/bin/env python3
"""Create or verify a complete relocatable skill ZIP, using only stdlib."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

IGNORED={'.git','node_modules','__pycache__','.cache','.DS_Store'}

def files(root):
    result=[]
    for path in root.rglob('*'):
        if any(part in IGNORED for part in path.relative_to(root).parts):continue
        if path.is_symlink():raise ValueError(f'禁止依赖软链接：{path}')
        if path.is_file() and path.name!='bundle-manifest.json':result.append(path)
    return sorted(result)

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('action',choices=['build','verify']);p.add_argument('skill',type=Path);p.add_argument('--output',type=Path)
    a=p.parse_args();root=a.skill.resolve();manifest=root/'bundle-manifest.json'
    if a.action=='build':
        if not a.output:p.error('build需要 --output <zip>')
        destination=a.output.resolve()
        if destination.is_relative_to(root):p.error('压缩包必须放在技能目录之外')
        entries={str(path.relative_to(root).as_posix()):{'sha256':sha(path),'bytes':path.stat().st_size} for path in files(root)}
        manifest.write_text(json.dumps({'format':1,'name':'VibeKnowledge','files':entries},ensure_ascii=False,indent=2)+'\n')
        destination.parent.mkdir(parents=True,exist_ok=True)
        with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
            for path in [*files(root),manifest]:archive.write(path,'VibeKnowledge/'+path.relative_to(root).as_posix())
        print(json.dumps({'zip':str(destination),'bytes':destination.stat().st_size,'sha256':sha(destination)},indent=2))
    else:
        expected=json.loads(manifest.read_text())['files'];actual={p.relative_to(root).as_posix():p for p in files(root)}
        if set(actual)!=set(expected):raise ValueError('文件清单不符')
        for name,path in actual.items():
            if path.stat().st_size!=expected[name]['bytes'] or sha(path)!=expected[name]['sha256']:raise ValueError('内容校验失败：'+name)
        print(f'验证通过：{len(expected)}个文件，无外部软链接。')

if __name__=='__main__':
    try:main()
    except (ValueError,FileNotFoundError,KeyError) as exc:raise SystemExit(str(exc)) from exc
