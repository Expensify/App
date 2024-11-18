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

  OS="$(uname)"
  if [[ "$OS" == "Darwin" || "$OS" == "Linux" ]]; then
    npx patch-package --error-on-fail --color=always
    if [[ "$IS_HYBRID_APP_REPO" == "true" ]]; then
      npx patch-package --patch-dir 'Mobile-Expensify/patches' --error-on-fail --color=always
    fi
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
  # patch-package failed
  error "patch-package failed to apply a patch"
  exit "$EXIT_CODE"
fi
