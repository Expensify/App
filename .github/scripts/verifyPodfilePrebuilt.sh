#!/bin/bash

# Verifies that a Podfile.lock was resolved against our prebuilt react-native artifacts, not a
# from-source build - the Podfile is identical either way, only the resolved pod list differs.
#
# Usage: verifyPodfilePrebuilt.sh <path-to-Podfile.lock> [rendered-remedy-output-path]
# The optional 2nd arg also saves the rendered remedy (with placeholders filled in) to a file, so a
# caller - e.g. the CI workflow's PR comment step - can reuse the exact same text instead of
# re-deriving it.
# Exit codes: 0 prebuilt, 1 resolved from source, 2 the check could not run at all.

set -e

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
readonly SCRIPT_DIR
ROOT_DIR=$(dirname "$(dirname "$SCRIPT_DIR")")
readonly ROOT_DIR
source "$ROOT_DIR/scripts/shellUtils.sh"

readonly LOCKFILE="$1"
readonly REMEDY_OUTPUT_PATH="$2"

if [[ -z "$LOCKFILE" ]]; then
  error "Usage: $0 <path-to-Podfile.lock>"
  exit 2
fi

if [[ ! -f "$LOCKFILE" ]]; then
  error "$LOCKFILE not found"
  exit 2
fi

# Pods that exist only when react-native is consumed prebuilt.
readonly PREBUILT_MARKERS=(React-Core-prebuilt ReactNativeDependencies)

# Pods that only a source build pulls in (mutually exclusive with the set above).
readonly SOURCE_MARKERS=(boost DoubleConversion fast_float fmt glog RCT-Folly SocketRocket)

# Only PODS: records what actually resolved; DEPENDENCIES: just echoes the Podfile's intent.
PODS_SECTION=$(awk '/^PODS:/{inSection = 1; next} /^[A-Z]/{inSection = 0} inSection' "$LOCKFILE")
readonly PODS_SECTION

if [[ -z "$PODS_SECTION" ]]; then
  error "$LOCKFILE has no PODS: section, so it is not a lockfile this check can read"
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
  success "$LOCKFILE was resolved against the prebuilt react-native artifacts."
  exit 0
fi

error "$LOCKFILE was resolved against a react-native compiled from source."

if [[ ${#FOUND_SOURCE[@]} -gt 0 ]]; then
  echo ""
  info "  Pods that only a source build pulls in:"
  printf '    - %s\n' "${FOUND_SOURCE[@]}"
fi

if [[ ${#MISSING_PREBUILT[@]} -gt 0 ]]; then
  echo ""
  info "  Pods that a prebuilt build must contain, but are missing:"
  printf '    - %s\n' "${MISSING_PREBUILT[@]}"
fi

echo ""

# App's ios/Podfile.lock is the Standalone target; Mobile-Expensify's iOS/Podfile.lock is HybridApp.
if [[ "$LOCKFILE" == iOS/* ]]; then
  ARTIFACT_TARGET='HybridApp'
  POD_INSTALL_CMD='npm run pod-install'
else
  ARTIFACT_TARGET='Standalone'
  POD_INSTALL_CMD='npm run pod-install-standalone'
fi

# Also posted as a PR comment (when REMEDY_OUTPUT_PATH is given), but a fork's token can't write
# comments, so this log is the fallback.
RENDERED_REMEDY=$(sed -e "s/{{ARTIFACT_TARGET}}/$ARTIFACT_TARGET/" -e "s/{{POD_INSTALL_CMD}}/$POD_INSTALL_CMD/" \
  "$ROOT_DIR/.github/VERIFY_PODFILE_PREBUILT_REMEDY.md")
readonly RENDERED_REMEDY

echo "$RENDERED_REMEDY"
[[ -n "$REMEDY_OUTPUT_PATH" ]] && echo "$RENDERED_REMEDY" > "$REMEDY_OUTPUT_PATH"

exit 1
