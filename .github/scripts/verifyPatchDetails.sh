#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DETAILS_MD="details.md"
ERRORS=()

# Get list of modified patch files in PR (compared to main branch)
CHANGED_PATCHES=$(git diff --name-only origin/main...HEAD | grep "^patches/.*\.patch$" || true)

if [ -z "$CHANGED_PATCHES" ]; then
  echo "✅  No modified patch files."
  exit 0
fi

for patch_path in $CHANGED_PATCHES; do
  patch_name=$(basename "$patch_path")
  dep_dir=$(dirname "$patch_path")
  details_file="$ROOT_DIR/$dep_dir/$DETAILS_MD"

  # Check details.md exists
  if [ ! -f "$details_file" ]; then
    ERRORS+=("❌  Missing $DETAILS_MD for $patch_path")
    continue
  fi

  # Check patch is referenced in details.md
  if ! grep -q "\[$patch_name\](.*$patch_name)" "$details_file"; then
    ERRORS+=("❌  \`$patch_name\` not referenced in \`$DETAILS_MD\` in \`$dep_dir\`")
  fi
done

if [ ${#ERRORS[@]} -eq 0 ]; then
  echo "✅  All changed patches are valid!"
else
  printf "%s\n" "${ERRORS[@]}"
  exit 1
fi
