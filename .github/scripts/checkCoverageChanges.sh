#!/bin/bash
set -euo pipefail

# -----------------------------
# 1. Ensure upstream remote exists
# -----------------------------
# The PR branch comes from either the base repo or a fork.
# We need the base repository's main branch for comparison.
git remote add upstream "https://github.com/${GITHUB_REPOSITORY}.git" 2>/dev/null || true

# -----------------------------
# 2. Attempt shallow fetch first
# -----------------------------
# Start with a depth of 50 commits, which covers most PRs.
DEPTH=50
echo "Fetching upstream/main with depth=$DEPTH..."
git fetch upstream main --depth=$DEPTH

# -----------------------------
# 3. Check if a merge-base exists
# -----------------------------
# merge-base finds the common ancestor between the PR branch and main.
# If this fails, it means our shallow history didn't go back far enough.
if ! git merge-base upstream/main HEAD >/dev/null 2>&1; then
  echo "No merge base found with depth=$DEPTH, fetching full history..."
  
  # Try unshallowing the entire repo (pulls full commit history).
  # If already full, this will be a no-op.
  git fetch --unshallow upstream || git fetch upstream main
fi

# -----------------------------
# 4. Define the diff range
# -----------------------------
# Using three-dot notation (A...B) shows only the commits in HEAD
# that aren't in upstream/main (i.e. just the PR changes).
DIFF_RANGE="upstream/main...HEAD"

# -----------------------------
# 5. Collect changed src/ files
# -----------------------------
readarray -t ALL_CHANGED_FILES < <(
  git diff --name-only "$DIFF_RANGE" \
    | grep '^src/' \
    | grep -E '\.(ts|tsx|js|jsx)$' || true
)

# -----------------------------
# 6. Filter excluded files/dirs
# -----------------------------
CHANGED_FILES=()
for file in "${ALL_CHANGED_FILES[@]}"; do
  # Exclude directories
  if [[ "$file" =~ ^src/(CONST|languages|setup|stories|styles|types)/ ]]; then
    echo "Skipping excluded directory: \"$file\""
    continue
  fi

  # Exclude specific files in src root
  filename="$(basename "$file")"
  if [[ "$filename" =~ ^(App\.tsx|CONFIG\.ts|Expensify\.tsx|HybridAppHandler\.tsx|NAICS\.ts|NAVIGATORS\.ts|ONYXKEYS\.ts|ROUTES\.ts|SCREENS\.ts|SplashScreenStateContext\.tsx|TIMEZONES\.ts)$ ]]; then
    echo "Skipping excluded file: \"$file\""
    continue
  fi
  
  CHANGED_FILES+=("$file")
done

# -----------------------------
# 7. Output results
# -----------------------------
if [ ${#CHANGED_FILES[@]} -eq 0 ]; then
  echo "No relevant src files changed, skipping coverage"
  echo "run_coverage=false" >> "$GITHUB_OUTPUT"
  exit 0
fi

echo "Changed src files for coverage:"
printf '%s\n' "${CHANGED_FILES[@]}"
echo "run_coverage=true" >> "$GITHUB_OUTPUT"

# Save changed files for later coverage steps
printf '%s\n' "${CHANGED_FILES[@]}" > changed_files.txt
