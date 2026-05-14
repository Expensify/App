#!/usr/bin/env bash
set -u

cd "$(dirname "$0")"

REPORT="knip.full.report.txt"
CLEAN="knip.full.report.clean.txt"
EXIT="knip.full.exitcode.txt"

set +e
npm run knip:full >"$REPORT" 2>&1
code=$?
set -e
echo "$code" >"$EXIT"

# Strip ANSI escape sequences for the clean copy
sed -E 's/\x1B\[[0-9;]*[A-Za-z]//g' "$REPORT" >"$CLEAN"

python3 parse_knip.py
python3 build_summary.py

echo "knip exit code: $code"
echo "Outputs: $REPORT, $CLEAN, $EXIT, knip.full.parsed.tsv, knip.full.summary.md"
