#!/bin/zsh
set -e
workspace_dir="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$workspace_dir/tools/bin:$PATH"
export HYPERFRAMES_EXTRACT_CACHE_DIR="$workspace_dir/review/render-cache"
export TMPDIR="$workspace_dir/review/tmp"
mkdir -p "$TMPDIR" "$HYPERFRAMES_EXTRACT_CACHE_DIR"
cd "$workspace_dir/film"
exec npx --yes hyperframes@0.8.186 "$@"
