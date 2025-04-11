#!/bin/bash

# This script is a simple wrapper around patch-package that fails if any errors or warnings are detected.
# This is useful because patch-package does not fail on errors or warnings by default,
# which means that broken patches are easy to miss, and leads to developer frustration and wasted time.

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
source "$SCRIPTS_DIR/shellUtils.sh"

# Wrapper to run patch-package.
function patchPackage {
  # See if we're in the HybridApp repo
  IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app.sh)
  NEW_DOT_FLAG="${STANDALONE_NEW_DOT:-false}"

  OS="$(uname)"
  if [[ "$OS" == "Darwin" || "$OS" == "Linux" ]]; then
    if [[ "$IS_HYBRID_APP_REPO" == "true" && "$NEW_DOT_FLAG" == "false" ]]; then
      TEMP_PATCH_DIR=$(mktemp -d ./tmp-patches-XXX)
      cp -r ./patches/* "$TEMP_PATCH_DIR"
      cp -r ./Mobile-Expensify/patches/* "$TEMP_PATCH_DIR"

      npx patch-package --patch-dir "$TEMP_PATCH_DIR" --error-on-fail --color=always
      EXIT_CODE=$?

      rm -rf "$TEMP_PATCH_DIR"
    else
      npx patch-package --error-on-fail --color=always
      EXIT_CODE=$?
    fi
    exit $EXIT_CODE
  else
    error "Unsupported OS: $OS"
    exit 1
  fi
}

# Run patch-package and capture its output and exit code, while still displaying the original output to the terminal
TEMP_OUTPUT="$(mktemp)"
patchPackage 2>&1 | tee "$TEMP_OUTPUT"
EXIT_CODE=${PIPESTATUS[0]}
OUTPUT="$(cat "$TEMP_OUTPUT")"
FAILED_PATCHES=$(cat "$TEMP_OUTPUT" | sed 's/\x1b\[[0-9;]*m//g')
rm -f "$TEMP_OUTPUT"

# Check if the output contains a warning message
echo "$OUTPUT" | grep -q "Warning:"
WARNING_FOUND=$?

printf "\n"

# Determine the final exit code
if [ "$EXIT_CODE" -eq 0 ]; then
  if [ $WARNING_FOUND -eq 0 ]; then
    # patch-package succeeded but warning was found
    error "It looks like you upgraded a dependency without upgrading the patch. Please review the patch, determine if it's still needed, and port it to the new version of the dependency."
    exit 1
  else
    # patch-package succeeded and no warning was found
    success "patch-package succeeded without errors or warnings"
    exit 0
  fi
else
  ERROR_PATCHES_HAVE_FAILED=$(echo "$FAILED_PATCHES" | awk '/The patches for/ {print $4}' | sort -u)

  if [ -n "$ERROR_PATCHES_HAVE_FAILED" ]; then
      error "patch-package failed to apply a patch, cleaning failed package and trying once again."

    # Pass the failed package(s) to cleanFailedPatch.sh
    for PACKAGE in $ERROR_PATCHES_HAVE_FAILED; do
      if [ -n "$PACKAGE" ]; then
      echo "Detected patch change for package: $PACKAGE. Reinstalling $PACKAGE..."
      ./scripts/cleanFailedPatch.sh "$PACKAGE"
      fi
    done

  else
    # patch-package failed
    error "patch-package failed to apply a patch"
    exit "$EXIT_CODE"
  fi
fi
