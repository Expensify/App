#!/bin/bash

OS="$(uname)"
if [[ "$OS" != "Darwin" && "$OS" != "Linux" ]]; then
    echo "Unsupported OS: $OS" >&2
    exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
readonly SCRIPT_DIR
source "$SCRIPT_DIR/shellUtils.sh"

IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app.sh)
readonly IS_HYBRID_APP_REPO
#readonly NEW_DOT_FLAG="${STANDALONE_NEW_DOT:-false}"

# Create a temporary directory for input patches
TEMP_PATCH_DIR=$(mktemp -d ./patches/tmp-patches-XXX)
trap 'rm -rf "$TEMP_PATCH_DIR"' EXIT

# Copy existing patches into temp dir
find ./patches -type f -name '*.patch' -exec cp {} "$TEMP_PATCH_DIR" \;
if [[ "$IS_HYBRID_APP_REPO" == "true" ]]; then
  find ./Mobile-Expensify/patches -type f -name '*.patch' -exec cp {} "$TEMP_PATCH_DIR" \;
fi

existing_patches=($(ls "$TEMP_PATCH_DIR"))

if ! npx patch-package --patch-dir "$TEMP_PATCH_DIR" "$@"; then
  error "Failed to create patch"
  exit 1
fi

# Find new patch file by comparing filenames
new_patch=""
for f in "$TEMP_PATCH_DIR"/*.patch; do
  filename=$(basename "$f")
  if [[ ! " ${existing_patches[*]} " =~ ${filename} ]]; then
    new_patch="$f"
    break
  fi
done

if [[ -z "$new_patch" ]]; then
  error "No new patch file was created"
  exit 1
fi

# Move the new patch into the real patches directory
mv "$new_patch" ./patches/

success "Patch created successfully in ./patches directory"
info "Remember to follow the patch naming convention and update details.md as described in contributingGuides/PATCHES.md"
exit 0
