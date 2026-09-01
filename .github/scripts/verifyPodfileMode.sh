#!/bin/bash

# Verifies which react-native build mode a Podfile.lock was resolved in.
#
# `pod install` picks between compiling react-native from source and consuming our prebuilt
# artifacts while the Podfile is evaluated, and writes the result into Podfile.lock. The Podfile
# itself is identical either way, so the PODFILE CHECKSUM comparison in verifyPodfile.sh cannot
# tell the two apart — only the resolved pod list can.
#
# Usage: verifyPodfileMode.sh <path-to-Podfile.lock> <source|prebuilt>

set -e

LOCKFILE="$1"
EXPECTED_MODE="$2"

if [[ -z "$LOCKFILE" || -z "$EXPECTED_MODE" ]]; then
  echo "Usage: $0 <path-to-Podfile.lock> <source|prebuilt>" >&2
  exit 1
fi

if [[ ! -f "$LOCKFILE" ]]; then
  echo "Error: $LOCKFILE not found" >&2
  exit 1
fi

# Pods that only a source build of react-native pulls in: its vendored C++ dependencies, which a
# prebuilt React Core already contains.
SOURCE_MARKERS=(boost DoubleConversion fast_float fmt glog RCT-Folly SocketRocket)

# Pods that only exist when react-native is consumed prebuilt.
PREBUILT_MARKERS=(React-Core-prebuilt ReactNativeDependencies)

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
    echo "Error: unknown mode '$EXPECTED_MODE' (expected 'source' or 'prebuilt')" >&2
    exit 1
    ;;
esac

# Only the PODS: section records what actually resolved. DEPENDENCIES: echoes what the Podfile
# asked for, so matching there would check intent instead of result.
PODS_SECTION=$(awk '/^PODS:/{inSection = 1; next} /^[A-Z]/{inSection = 0} inSection' "$LOCKFILE")

# A pod is present when the PODS: section lists it as a top-level entry: "  - <name> (<version>)".
# Anchoring on the trailing " (" keeps `React-Core` from matching `React-Core-prebuilt`.
function podIsPresent {
  grep -qE "^  - $1 \(" <<< "$PODS_SECTION"
}

MISSING=()
for POD in "${REQUIRED[@]}"; do
  if ! podIsPresent "$POD"; then
    MISSING+=("$POD")
  fi
done

UNEXPECTED=()
for POD in "${FORBIDDEN[@]}"; do
  if podIsPresent "$POD"; then
    UNEXPECTED+=("$POD")
  fi
done

# Hermes is resolved from react-native's own CDN, independently of our artifacts, so it is checked
# on its own rather than as a mode marker.
HERMES_PREBUILT_MISSING=false
if ! podIsPresent 'hermes-engine/Pre-built'; then
  HERMES_PREBUILT_MISSING=true
fi

if [[ ${#MISSING[@]} -eq 0 && ${#UNEXPECTED[@]} -eq 0 && "$HERMES_PREBUILT_MISSING" == false ]]; then
  echo "✓ $LOCKFILE was resolved in $EXPECTED_MODE mode."
  exit 0
fi

echo ""
echo "❌ $LOCKFILE was not resolved in the expected '$EXPECTED_MODE' mode."
echo ""

if [[ ${#MISSING[@]} -gt 0 ]]; then
  echo "   Missing pods that a '$EXPECTED_MODE' build must contain:"
  printf '     - %s\n' "${MISSING[@]}"
  echo ""
fi

if [[ ${#UNEXPECTED[@]} -gt 0 ]]; then
  echo "   Pods that must not appear in a '$EXPECTED_MODE' build:"
  printf '     - %s\n' "${UNEXPECTED[@]}"
  echo ""
fi

if [[ "$HERMES_PREBUILT_MISSING" == true ]]; then
  echo "   'hermes-engine/Pre-built' is missing, so Hermes was not resolved as a prebuilt."
  echo "   Check for a local Hermes override (REACT_NATIVE_OVERRIDE_HERMES_DIR, HERMES_COMMIT, a"
  echo "   .hermesversion file), or a failed Maven Central lookup during pod install."
  echo ""
fi

case "$EXPECTED_MODE" in
  prebuilt)
    cat <<'MESSAGE'
   This lockfile was produced by a pod install that fell back to compiling react-native from
   source. The fallback only logs a warning and never fails the install, so it is easy to miss
   and commit by accident. Usual causes:

     1. Your GitHub token cannot read our package registry.
        Run `gh auth status` and confirm `read:packages` is among the scopes. If it is not,
        create a new token with it and re-run `echo "YOUR_TOKEN" | gh auth login --with-token`.

     2. Your machine is missing `bun` or the GitHub CLI, so the resolver cannot run at all.

     3. You edited patches/ or Mobile-Expensify/patches/ and no artifact has been published for
        the new patches hash yet. Land the patch change first and wait for the publishing
        workflow, then reinstall the pods.

     4. The registry was briefly unreachable during your pod install.
        Just reinstall the pods.

     5. BUILD_RN_FROM_SOURCE=1 was set in your shell.
        Unset it, then reinstall the pods.

   Once the cause is fixed, regenerate this lockfile:

     npm run pod-install

   The resolver logs `[PatchedArtifacts] Using patched react-native artifacts` to stderr on a
   successful match; check for it before committing.
   See contributingGuides/PREBUILT_REACT_NATIVE_ARTIFACTS.md.
MESSAGE
    ;;
  source)
    cat <<'MESSAGE'
   Standalone NewDot must compile react-native from source: under
   `use_frameworks! :linkage => :static` (required by Firebase) a prebuilt React Core cannot
   expose React_RCTAppDelegate as an importable Swift module, which the standalone Swift
   AppDelegate needs.

   react-native defaults RCT_USE_RN_DEP and RCT_USE_PREBUILT_RNCORE to 1, so a bare
   `bundle exec pod install` in ios/ produces a prebuilt lockfile. Regenerate this lockfile with
   the standalone wrapper, which passes the zeros:

     npm run pod-install-standalone

   See contributingGuides/PREBUILT_REACT_NATIVE_ARTIFACTS.md.
MESSAGE
    ;;
esac

echo ""
exit 1
