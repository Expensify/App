#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_DIR="$ROOT_DIR/.github/scripts/nitroSQLiteDatabaseLocation"
NITRO_SQLITE_DIR="${NITRO_SQLITE_DIR:-$ROOT_DIR/node_modules/react-native-nitro-sqlite}"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# Run the installed iOS directory selector, rather than copying its plist logic.
# Only the bridge headers are replaced; the native selector runs unchanged.
xcrun clang++ -std=c++20 -fobjc-arc -framework Foundation \
  -I "$TEST_DIR" \
  -DNITRO_SQLITE_ONLOAD_PATH="\"$NITRO_SQLITE_DIR/ios/OnLoad.mm\"" \
  "$TEST_DIR/verifyLocation.mm" -o "$WORK_DIR/verifyLocation"

PLISTS=(
  "$ROOT_DIR/ios/NewExpensify/Info.plist"
)
if [[ "$#" -gt 0 ]]; then
  PLISTS=("$@")
fi

for PLIST in "${PLISTS[@]}"; do
  # Each plist runs in a fresh process because NitroSQLite selects its directory
  # in Objective-C +load, before main() and before Onyx opens the database.
  APP_DIR="$WORK_DIR/DatabaseLocation.app"
  mkdir -p "$APP_DIR/Contents/MacOS"
  cp "$WORK_DIR/verifyLocation" "$APP_DIR/Contents/MacOS/verifyLocation"
  python3 - "$PLIST" "$APP_DIR/Contents/Info.plist" <<'PY'
import plistlib
import sys
from pathlib import Path

info = plistlib.loads(Path(sys.argv[1]).read_bytes())
# Bundle metadata contains build substitutions in the source host plists.
# Keep every database setting as supplied by the host, including unknown keys.
info.update(CFBundleExecutable='verifyLocation', CFBundleIdentifier='com.expensify.database-location-test', CFBundlePackageType='APPL')
Path(sys.argv[2]).write_bytes(plistlib.dumps(info))
PY
  echo "Checking native database location for $PLIST"
  "$APP_DIR/Contents/MacOS/verifyLocation"
done
