#!/bin/bash
# Runs as a prelude inside react-native's '[RNCore] Replace ...' build phase (prepended by
# PatchedIOSArtifacts.add_sync_prebuilt_script_phase). When the extracted framework is a
# different patched artifact version than the tarballs in Pods, invalidates react-native's
# .last_build_configuration marker: 'stale' matches no configuration, so
# replace-rncore-version.js, running right after this in the same phase, re-extracts from
# the tarballs — the same swap it performs on every Debug/Release switch, retried until an
# extraction succeeds and writes a real configuration back.
#
# The tarballs themselves are guaranteed fresh by pod install: PatchedIOSArtifacts.setup
# forces the React-Core-prebuilt podspec to re-evaluate (re-download + dSYM merge) whenever
# the resolved artifacts change, and stamps them with .artifacts-version.
set -euo pipefail

TARBALLS_STAMP="$PODS_ROOT/ReactNativeCore-artifacts/.artifacts-version"
PREBUILT_DIR="$PODS_ROOT/React-Core-prebuilt"

# No stamp: the last install built react-native from source — nothing to sync.
[ -f "$TARBALLS_STAMP" ] || exit 0

TARBALLS=$(cat "$TARBALLS_STAMP")
EXTRACTED=$(cat "$PREBUILT_DIR/.patched-version" 2>/dev/null || true)
[ "$TARBALLS" = "$EXTRACTED" ] && exit 0

echo "[PatchedArtifacts] Extracted prebuilt React Core is '${EXTRACTED:-<none>}', tarballs are '$TARBALLS' — marking for re-extraction."
mkdir -p "$PREBUILT_DIR"
# No trailing newlines: replace-rncore-version.js compares its marker verbatim.
printf 'stale' > "$PREBUILT_DIR/.last_build_configuration"
printf '%s' "$TARBALLS" > "$PREBUILT_DIR/.patched-version"
