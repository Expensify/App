#!/bin/bash
# Run full-repo ESLint with cache disabled N times and write JSON timings.
# Usage: ./scripts/benchmark-eslint-no-cache.sh <output.json> [iterations]

set -euo pipefail

OUTPUT="${1:?output json path required}"
ITERATIONS="${2:-3}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT"

GIT_SHA="$(git rev-parse HEAD)"
NODE_VERSION="$(node -v)"
CPU_MODEL="$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo unknown)"
RAM_BYTES="$(sysctl -n hw.memsize 2>/dev/null || echo 0)"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

runs=()
for ((i = 1; i <= ITERATIONS; i++)); do
    rm -rf node_modules/.cache/eslint
    tmp="$(mktemp)"
    set +e
    /usr/bin/time -p npm run lint -- --no-cache >"$tmp" 2>&1
    exit_code=$?
    set -e
    real="$(awk '/^real / {print $2}' "$tmp")"
    user="$(awk '/^user / {print $2}' "$tmp")"
    sys="$(awk '/^sys / {print $2}' "$tmp")"
    runs+=("{\"iteration\":$i,\"exitCode\":$exit_code,\"real\":$real,\"user\":$user,\"sys\":$sys}")
    rm -f "$tmp"
    echo "iteration $i: real=${real}s exit=$exit_code"
done

mkdir -p "$(dirname "$OUTPUT")"
cat >"$OUTPUT" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "gitSha": "$GIT_SHA",
  "nodeVersion": "$NODE_VERSION",
  "cpuModel": "$CPU_MODEL",
  "ramBytes": $RAM_BYTES,
  "iterations": $ITERATIONS,
  "runs": [$(IFS=,; echo "${runs[*]}")]
}
EOF

echo "Wrote $OUTPUT"
