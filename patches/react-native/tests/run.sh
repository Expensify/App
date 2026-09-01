#!/bin/bash
# Deterministic, device-free check for the mounting-transaction ordering patch
# (react-native+0.86.0+042). Compiles the REAL, UNMODIFIED
# ReactCommon/react/renderer/mounting/MountingTransaction.cpp against the
# minimal stand-in headers in ./shim, so every merge decision under test comes
# from the shipped source rather than a copy of it.
#
#   ./patches/react-native/tests/run.sh                  # uses ./node_modules
#   ./patches/react-native/tests/run.sh <react-native>   # or an explicit root
set -e

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RN_ROOT="${1:-$HERE/../../../node_modules/react-native}"
SRC="$RN_ROOT/ReactCommon/react/renderer/mounting/MountingTransaction.cpp"

if [[ ! -f "$SRC" ]]; then
  echo "Could not find $SRC" >&2
  echo "Pass the react-native package root as the first argument." >&2
  exit 2
fi

OUT="$(mktemp -d)/MountingTransactionMergeOrderTest"
trap 'rm -rf "$(dirname "$OUT")"' EXIT

c++ -std=c++20 \
  -I "$HERE/shim" \
  -I "$RN_ROOT/ReactCommon" \
  -o "$OUT" \
  "$HERE/MountingTransactionMergeOrderTest.cpp" \
  "$SRC"

"$OUT"
