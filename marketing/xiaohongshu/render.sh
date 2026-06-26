#!/usr/bin/env bash
# Render every cover-*.html in this folder to a 1080×1440 PNG using
# headless Chrome. No npm deps, no Puppeteer — just the Chrome you
# already have installed.
#
# Usage:  ./render.sh
# Output: cover-1-indie.png, cover-2-hst.png, ...
#
# Re-run after edits — instant Cmd+S → re-render iteration loop.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "❌ Chrome not found at $CHROME"
  echo "   Edit this script to point to your browser, or install Chrome."
  exit 1
fi

cd "$(dirname "$0")"

shopt -s nullglob
files=( cover-*.html )

if [ ${#files[@]} -eq 0 ]; then
  echo "❌ No cover-*.html files in $(pwd)"
  exit 1
fi

for html in "${files[@]}"; do
  png="${html%.html}.png"
  echo "→ Rendering $html → $png"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size=1080,1440 \
    --screenshot="$(pwd)/$png" \
    "file://$(pwd)/$html" \
    > /dev/null 2>&1
done

echo ""
echo "✅ Done. Files:"
ls -lh cover-*.png | awk '{print "   " $NF, "(" $5 ")"}'
echo ""
echo "Open in Preview:  open cover-*.png"
