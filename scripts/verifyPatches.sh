#!/bin/bash

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
source "$SCRIPTS_DIR/shellUtils.sh"

# Run patch-package and capture its output and exit code
OUTPUT="$(npx patch-package --error-on-fail 2>&1)"
EXIT_CODE=$?

# Check if the output contains the warning message
echo "$OUTPUT" | grep -q "patch-package detected a patch file version mismatch"
WARNING_FOUND=$?

# Determine the final exit code
if [ $EXIT_CODE -eq 0 ]; then
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
  exit $EXIT_CODE
fi
