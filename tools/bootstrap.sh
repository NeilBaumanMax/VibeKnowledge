#!/bin/sh
set -eu
workspace_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$workspace_dir"
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npm ci --prefix film
./tools/bin/ffmpeg -version
./tools/bin/ffprobe -version
