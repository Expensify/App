#!/bin/bash
# Prelude of react-native's '[RNCore] Replace ...' build phase (prepended by
# PatchedIOSArtifacts.add_sync_prebuilt_script_phase). When the extracted prebuilt React Core
# is a different patched artifact version than the tarballs in Pods, invalidates the
# .last_build_configuration marker so replace-rncore-version.js, running right after this,
# re-extracts from the tarballs. Needed because our tarball path carries no patches version,
# so a version change is invisible to CocoaPods and it can keep a stale extraction.
#
# Expected Xcode environment variables:
#   PODS_ROOT
set -euo pipefail

TARBALLS_STAMP="$PODS_ROOT/ReactNativeCore-artifacts/.artifacts-version"
PREBUILT_DIR="$PODS_ROOT/React-Core-prebuilt"
readonly TARBALLS_STAMP PREBUILT_DIR

# No stamp: the last install built react-native from source — nothing to sync.
[ -f "$TARBALLS_STAMP" ] || exit 0

TARBALLS=$(cat "$TARBALLS_STAMP")
EXTRACTED=$(cat "$PREBUILT_DIR/.patched-version" 2>/dev/null || true)
# Fast path, taken on every build: what is extracted matches the tarballs.
[ "$TARBALLS" = "$EXTRACTED" ] && exit 0

echo "[PatchedArtifacts] Extracted prebuilt React Core is '${EXTRACTED:-<none>}', tarballs are '$TARBALLS' — marking for re-extraction."
mkdir -p "$PREBUILT_DIR"
# 'stale' matches no configuration, so replace-rncore-version.js re-extracts; it stays until
# an extraction succeeds and writes a real configuration back, so a failed build retries.
# No trailing newlines: replace-rncore-version.js compares its marker verbatim.
printf 'stale' > "$PREBUILT_DIR/.last_build_configuration"
printf '%s' "$TARBALLS" > "$PREBUILT_DIR/.patched-version"
