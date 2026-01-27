#!/bin/bash

# This script is a simple wrapper around patch-package that fails if any errors or warnings are detected.
# This is useful because patch-package does not fail on errors or warnings by default,
# which means that broken patches are easy to miss, and leads to developer frustration and wasted time.

OS="$(uname)"
if [[ "$OS" != "Darwin" && "$OS" != "Linux" ]]; then
    error "Unsupported OS: $OS"
    return 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
readonly SCRIPT_DIR
source "$SCRIPT_DIR/shellUtils.sh"

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app.sh)
readonly IS_HYBRID_APP_REPO
readonly NEW_DOT_FLAG="${STANDALONE_NEW_DOT:-false}"

# Wrapper to run patch-package.
function patchPackage() {
  TEMP_PATCH_DIR=$(mktemp --directory ./tmp-patches-XXX)
  trap 'rm -rf "$TEMP_PATCH_DIR"' RETURN

  find ./patches -type f -name '*.patch' -exec cp {} "$TEMP_PATCH_DIR" \;
  if [[ "$IS_HYBRID_APP_REPO" == "true" && "$NEW_DOT_FLAG" == "false" ]]; then
    find ./Mobile-Expensify/patches -type f -name '*.patch' -exec cp {} "$TEMP_PATCH_DIR" \;
  fi

  if ! npx patch-package --patch-dir "$TEMP_PATCH_DIR" --error-on-fail --color=always; then
    return 1
  fi
}

# Run patch-package and capture its output and exit code, while still displaying the original output to the terminal
OUTPUT="$(mktemp)"
trap 'rm -rf "$OUTPUT"' EXIT
patchPackage 2>&1 | tee "$OUTPUT"
EXIT_CODE=${PIPESTATUS[0]}
echo

# Determine the final exit code
if [[ "$EXIT_CODE" -eq 0 ]]; then
    # patch-package succeeded, but check for warnings
    if grep -q "Warning:" "$OUTPUT"; then
        error "It looks like you upgraded a dependency without upgrading the patch. Please review the patch, determine if it's still needed, and port it to the new version of the dependency."
        exit 1
    else
        success "patch-package succeeded without errors or warnings"
        exit 0
    fi
else
    ERROR_PATCHES_HAVE_FAILED=$(sed 's/\x1b\[[0-9;]*m//g' < "$OUTPUT" | awk '/The patches for/ {print $4}' | grep -v '^$' | sort -u)
    if [[ -n "$ERROR_PATCHES_HAVE_FAILED" ]]; then
        error "patch-package failed to apply one or more patches, cleaning failed packages and trying once again."
        for PACKAGE in $ERROR_PATCHES_HAVE_FAILED; do
            info "patch failed to apply for $PACKAGE. Removing it before reinstall..."
            rm -rf "$SCRIPT_DIR/../node_modules/$PACKAGE"
        done

        npm install --ignore-scripts
        if ! patchPackage; then
            error "patch-package failed after retry, giving up"
            exit 1
        fi

        success "patch-package succeeded after retry"
        exit 0
    fi
    error "patch-package failed"
    exit 1
fi
