#!/bin/bash

# Verifies that a Podfile.lock was resolved against our prebuilt react-native artifacts rather
# than a react-native compiled from source.
#
# `pod install` picks between the two while the Podfile is evaluated and records the result in the
# resolved pod list. The Podfile is identical either way, so only the pod list can tell them apart -
# and the fallback to a source build only logs a warning, never fails, so it is easy to commit by
# accident.
#
# Usage: verifyPodfilePrebuilt.sh <path-to-Podfile.lock>
#
# Exit codes are: 0 prebuilt, 1 resolved from source, 2 the check could not run at all.

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

# Pods that only a source build pulls in. This set and the one above are mutually exclusive.
SOURCE_MARKERS=(boost DoubleConversion fast_float fmt glog RCT-Folly SocketRocket)

# Only the PODS: section records what actually resolved. DEPENDENCIES: echoes what the Podfile asked
# for, so matching there would check intent instead of result.
PODS_SECTION=$(awk '/^PODS:/{inSection = 1; next} /^[A-Z]/{inSection = 0} inSection' "$LOCKFILE")

# An empty section means the file did not parse as a lockfile at all.
if [[ -z "$PODS_SECTION" ]]; then
  echo "Error: $LOCKFILE has no PODS: section, so it is not a lockfile this check can read" >&2
  exit 2
fi

# A pod is present when the PODS: section lists it as a top-level entry: "  - <name> (<version>)".
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

# The workflow also posts this as a pull request comment, but that needs a writable token - which a
# fork does not get. This log is then the only place the author can read it.
cat "$(dirname "$0")/verifyPodfilePrebuiltRemedy.md"

echo ""
exit 1
