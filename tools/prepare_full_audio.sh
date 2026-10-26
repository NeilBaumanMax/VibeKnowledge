#!/bin/zsh
set -e
workspace_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$workspace_dir"
mkdir -p output/完整版
./tools/bin/ffmpeg -v error -ss 1.562811791383222 -i film/assets/audio/source.ogg -t 78 -ar 48000 -af 'aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=9,afade=t=in:d=0.035,afade=t=out:st=76.2:d=1.8' -y film/assets/audio/score-full.wav
./tools/bin/ffmpeg -v error -i film/assets/audio/score-full.wav -c:a aac -b:a 256k -y output/完整版/配乐_78秒.m4a
