#!/usr/bin/env bash
set -euo pipefail

if ! command -v osascript >/dev/null 2>&1; then
  echo "This helper needs macOS osascript to copy the zip as a clipboard file." >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$repo_root" ]]; then
  echo "Run this from inside the antzoo git repo." >&2
  exit 1
fi

repo_name="$(basename "$repo_root")"
short_sha="$(git -C "$repo_root" rev-parse --short HEAD)"
zip_path="${TMPDIR:-/tmp}/${repo_name}-source-${short_sha}.zip"

if [[ -n "$(git -C "$repo_root" status --porcelain --untracked-files=normal)" ]]; then
  echo "Note: archiving HEAD only; uncommitted changes are not included." >&2
fi

git -C "$repo_root" archive --format=zip -o "$zip_path" HEAD

ZIP_PATH="$zip_path" osascript <<'APPLESCRIPT'
set zipPath to system attribute "ZIP_PATH"
set the clipboard to (POSIX file zipPath)
APPLESCRIPT

bytes="$(wc -c < "$zip_path" | tr -d '[:space:]')"
echo "Copied $zip_path ($bytes bytes) to the clipboard as a file."
