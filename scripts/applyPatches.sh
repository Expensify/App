#!/bin/bash

# This script is a simple wrapper around patch-package that fails if any errors or warnings are detected.
# This is useful because patch-package does not fail on errors or warnings by default,
# which means that broken patches are easy to miss, and leads to developer frustration and wasted time.

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
source "$SCRIPTS_DIR/shellUtils.sh"

# Wrapper to run patch-package.
# We use `script` to preserve colorization when the output of patch-package is piped to tee
# and we provide /dev/null to discard the output rather than sending it to a file
# `script` has different syntax on macOS vs linux, so that's why we need a wrapper function
function patchPackage {
  OS="$(uname)"
  if [[ "$OS" == "Darwin" ]]; then
    # macOS
    script -q /dev/null npx patch-package --error-on-fail
  elif [[ "$OS" == "Linux" ]]; then
    # Ubuntu/Linux
    script -q -c "npx patch-package --error-on-fail" /dev/null
  else
    error "Unsupported OS: $OS"
  fi
}

# Run patch-package and capture its output and exit code, while still displaying the original output to the terminal
# (we use `script -q /dev/null` to preserve colorization in the output)
TEMP_OUTPUT="$(mktemp)"
patchPackage 2>&1 | tee "$TEMP_OUTPUT"
EXIT_CODE=${PIPESTATUS[0]}
OUTPUT="$(cat "$TEMP_OUTPUT")"
rm -f "$TEMP_OUTPUT"

# Check if the output contains a warning message
echo "$OUTPUT" | grep -q "Warning:"
WARNING_FOUND=$?

printf "\n";

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
