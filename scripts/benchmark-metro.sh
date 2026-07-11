#!/usr/bin/env bash
# Benchmark Metro dev bundle times (cold = --reset-cache, warm = cached).
set -euo pipefail

LABEL="${1:-baseline}"
PLATFORM="${2:-ios}"
OUT_DIR="$(mktemp -d)"
BUNDLE_OUT="${OUT_DIR}/main.jsbundle"

echo "=== Metro benchmark: ${LABEL} (${PLATFORM}) ==="
echo "Output dir: ${OUT_DIR}"

run_bundle() {
    local reset_flag="$1"
    local run_label="$2"
    /usr/bin/time -p npx react-native bundle \
        --entry-file index.js \
        --platform "${PLATFORM}" \
        --dev true \
        --bundle-output "${BUNDLE_OUT}" \
        --assets-dest "${OUT_DIR}/assets" \
        ${reset_flag} \
        2>&1 | tee "${OUT_DIR}/${run_label}.log" | tail -5
}

echo ""
echo "--- Cold build (--reset-cache) ---"
run_bundle "--reset-cache" "cold"

echo ""
echo "--- Warm build (cached) ---"
run_bundle "" "warm"

BUNDLE_SIZE=$(wc -c < "${BUNDLE_OUT}" | tr -d ' ')
echo ""
echo "Bundle size: ${BUNDLE_SIZE} bytes"
echo "Logs: ${OUT_DIR}"
