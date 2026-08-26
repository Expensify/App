#!/bin/bash

# Asserts that a Podfile.lock resolved react-native the way its Podfile declares.
#
# The two modes produce entirely different dependency graphs, and a pod install that degrades from
# prebuilt to source writes the wrong one without changing the Podfile — so PODFILE CHECKSUM still
# matches and verifyPodfile.sh passes. This checks the resolved content instead, by looking for the
# pods that only exist in one graph.
#
# Mobile-Expensify keeps its own copy of this check, because that one has to run without an App
# checkout. Marker pod names are coupled to the react-native version, so a bump that renames one has
# to be applied in both places.
#
# Deliberately just grep: no pod install, no credentials and no submodule clone, so it can run
# anywhere, including on pull requests from forks. App invokes it from verifyPodfile.sh, which needs
# a macOS runner for its own reasons; Mobile-Expensify runs its copy on Linux.
#
# Usage: verifyPodfileMode.sh <path/to/Podfile.lock> <source|prebuilt>

set -euo pipefail

START_DIR=$(pwd)
ROOT_DIR=$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")
cd "$ROOT_DIR" || exit 1

source scripts/shellUtils.sh

function cleanupAndExit {
  cd "$START_DIR" || exit 1
  exit "$1"
}

LOCKFILE="${1:-}"
EXPECTED_MODE="${2:-}"

if [[ -z "$LOCKFILE" || -z "$EXPECTED_MODE" ]]; then
  error "Usage: $0 <path/to/Podfile.lock> <source|prebuilt>"
  cleanupAndExit 1
fi

if [[ ! -f "$LOCKFILE" ]]; then
  error "Error: $LOCKFILE not found"
  cleanupAndExit 1
fi

# Pods compiled only when react-native is built from source. Anchored to the PODS list so a
# substring in another pod's name or an EXTERNAL SOURCES path cannot satisfy the match.
readonly SOURCE_MARKERS=('boost' 'glog' 'RCT-Folly' 'fmt' 'SocketRocket' 'fast_float')
# Pods that appear only when a prebuilt react-native is consumed.
readonly PREBUILT_MARKERS=('React-Core-prebuilt' 'ReactNativeDependencies')

case "$EXPECTED_MODE" in
  source)
    REQUIRED=("${SOURCE_MARKERS[@]}")
    FORBIDDEN=("${PREBUILT_MARKERS[@]}")
    ;;
  prebuilt)
    REQUIRED=("${PREBUILT_MARKERS[@]}")
    FORBIDDEN=("${SOURCE_MARKERS[@]}")
    ;;
  *)
    error "Error: unknown mode '$EXPECTED_MODE' (expected 'source' or 'prebuilt')"
    cleanupAndExit 1
    ;;
esac

title "Verifying $LOCKFILE is in $EXPECTED_MODE mode"

# Only the PODS: section lists what actually resolved. DEPENDENCIES: repeats the same shape for what
# the Podfile asked for, so matching there would let a lockfile pass on a declaration alone.
PODS_SECTION="$(awk '/^PODS:/{inSection=1; next} /^[A-Z]/{inSection=0} inSection' "$LOCKFILE")"
readonly PODS_SECTION

function podIsPresent {
  grep -qE "^  - $1 \(" <<< "$PODS_SECTION"
}

FAILED=false

for POD in "${REQUIRED[@]}"; do
  if podIsPresent "$POD"; then
    success "found $POD"
  else
    error "missing $POD — expected in a $EXPECTED_MODE-mode lockfile"
    FAILED=true
  fi
done

for POD in "${FORBIDDEN[@]}"; do
  if podIsPresent "$POD"; then
    error "found $POD — that pod only exists in the other mode"
    FAILED=true
  fi
done

# A hermes-engine fallback leaves every marker pod untouched — it only rewrites hermes-engine's own
# EXTERNAL SOURCES entry from a pinned tag to a git commit. Both Podfile.lock files pin the prebuilt tarball,
# so this applies in either mode, and it is the only committed evidence of the hermes probe's outcome.
HERMES_SOURCE="$(awk '/^  hermes-engine:/{inBlock=1; next} /^  [A-Za-z]/{inBlock=0} inBlock' "$LOCKFILE")"
readonly HERMES_SOURCE

if grep -qE '^    :tag: hermes-v' <<< "$HERMES_SOURCE"; then
  success "hermes-engine is pinned to a prebuilt tag"
else
  error "hermes-engine is not pinned to a prebuilt tag — it resolved to a source build"
  info "The hermes probe failed at install time. See the [RNMode] warning in the install output."
  FAILED=true
fi

if [[ "$FAILED" == true ]]; then
  error "$LOCKFILE is not in $EXPECTED_MODE mode."
  info "A pod install that could not reach the prebuilt artifacts falls back to building react-native"
  info "from source, and writes that fallback into Podfile.lock. Regenerate it with working credentials"
  info "and network, and commit the result. See contributingGuides/PREBUILT_REACT_NATIVE_ARTIFACTS.md."
  cleanupAndExit 1
fi

success "$LOCKFILE is in $EXPECTED_MODE mode."
cleanupAndExit 0
