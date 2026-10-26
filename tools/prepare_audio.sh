#!/bin/zsh
set -e
workspace_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$workspace_dir"
./tools/bin/ffmpeg -v error -ss 1.562811791383222 -i film/assets/audio/source.ogg -t 30 -ar 48000 -af 'aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5:LRA=9,afade=t=in:d=0.035,afade=t=out:st=29.5:d=0.5' -y film/assets/audio/score.wav
./tools/bin/ffmpeg -v error -i film/assets/audio/score.wav -c:a aac -b:a 256k -y output/配乐_30秒.m4a
