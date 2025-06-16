#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly ROOT_DIR
readonly DETAILS_MD="details.md"
ERRORS=()

# Get list of modified patch files in PR (compared to main branch)
CHANGED_PATCHES=$(git diff --diff-filter=AMR --name-only origin/main | grep "^patches/.*\.patch$" || true)
REMOVED_PATCHES=$(git diff --diff-filter=D --name-only origin/main | grep "^patches/.*\.patch$" || true)

if [[ -z "$CHANGED_PATCHES" ]] && [[ -z "$REMOVED_PATCHES" ]]; then
  echo "✅  No modified or removed patch files."
  exit 0
fi

for patch_path in $CHANGED_PATCHES; do
  patch_name=$(basename "$patch_path")
  dep_dir=$(dirname "$patch_path")
  details_file="$ROOT_DIR/$dep_dir/$DETAILS_MD"

  # Check details.md exists
  if [[ ! -f "$details_file" ]]; then
    ERRORS+=("❌  Missing $DETAILS_MD for $patch_path")
    continue
  fi

  # Check patch is referenced in details.md
  if ! grep -q "\[$patch_name\](.*$patch_name)" "$details_file"; then
    ERRORS+=("❌  \`$patch_name\` not referenced in \`$DETAILS_MD\` in \`$dep_dir\`")
  fi
done

# Validate removed patches are not still referenced in details.md
for patch_path in $REMOVED_PATCHES; do
  patch_name=$(basename "$patch_path")
  dep_dir=$(dirname "$patch_path")
  details_file="$ROOT_DIR/$dep_dir/$DETAILS_MD"

  if [[ -f "$details_file" ]]; then
    if grep -q "\[$patch_name\](.*$patch_name)" "$details_file"; then
      ERRORS+=("❌  \`$patch_name\` was removed from \`$dep_dir\` but is still referenced in \`$DETAILS_MD\`")
    fi
  fi
done

if [[ ${#ERRORS[@]} -eq 0 ]]; then
  echo "✅  All changed patches are valid!"
else
  printf "%s\n" "${ERRORS[@]}"
  exit 1
fi
