#!/bin/bash

# Verifies that a Podfile.lock was resolved against our prebuilt react-native artifacts, not a
# from-source build - the Podfile is identical either way, only the resolved pod list differs.
#
# Usage: verifyPodfilePrebuilt.sh <path-to-Podfile.lock>
# Exit codes: 0 prebuilt, 1 resolved from source, 2 the check could not run at all.

set -e

LOCKFILE="$1"

if [[ -z "$LOCKFILE" ]]; then
  echo "Usage: $0 <path-to-Podfile.lock>" >&2
  exit 2
fi

if [[ ! -f "$LOCKFILE" ]]; then
  echo "Error: $LOCKFILE not found" >&2
  exit 2
fi

# Pods that exist only when react-native is consumed prebuilt.
PREBUILT_MARKERS=(React-Core-prebuilt ReactNativeDependencies)

# Pods that only a source build pulls in (mutually exclusive with the set above).
SOURCE_MARKERS=(boost DoubleConversion fast_float fmt glog RCT-Folly SocketRocket)

# Only PODS: records what actually resolved; DEPENDENCIES: just echoes the Podfile's intent.
PODS_SECTION=$(awk '/^PODS:/{inSection = 1; next} /^[A-Z]/{inSection = 0} inSection' "$LOCKFILE")

if [[ -z "$PODS_SECTION" ]]; then
  echo "Error: $LOCKFILE has no PODS: section, so it is not a lockfile this check can read" >&2
  exit 2
fi

# Anchoring on the trailing " (" keeps `React-Core` from matching `React-Core-prebuilt`.
function podIsPresent {
  grep -qE "^  - $1 \(" <<< "$PODS_SECTION"
}

MISSING_PREBUILT=()
for POD in "${PREBUILT_MARKERS[@]}"; do
  if ! podIsPresent "$POD"; then
    MISSING_PREBUILT+=("$POD")
  fi
done

FOUND_SOURCE=()
for POD in "${SOURCE_MARKERS[@]}"; do
  if podIsPresent "$POD"; then
    FOUND_SOURCE+=("$POD")
  fi
done

if [[ ${#MISSING_PREBUILT[@]} -eq 0 && ${#FOUND_SOURCE[@]} -eq 0 ]]; then
  echo "✓ $LOCKFILE was resolved against the prebuilt react-native artifacts."
  exit 0
fi

echo ""
echo "❌ $LOCKFILE was resolved against a react-native compiled from source."
echo ""

if [[ ${#FOUND_SOURCE[@]} -gt 0 ]]; then
  echo "   Pods that only a source build pulls in:"
  printf '     - %s\n' "${FOUND_SOURCE[@]}"
  echo ""
fi

if [[ ${#MISSING_PREBUILT[@]} -gt 0 ]]; then
  echo "   Pods that a prebuilt build must contain, but are missing:"
  printf '     - %s\n' "${MISSING_PREBUILT[@]}"
  echo ""
fi

# Also posted as a PR comment, but a fork's token can't write comments, so this log is the fallback.
cat "$(dirname "$0")/verifyPodfilePrebuiltRemedy.md"

echo ""
exit 1
