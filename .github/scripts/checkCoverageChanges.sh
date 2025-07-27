#!/bin/bash

# Check if src files changed and filter out excluded directories/files

# Get changed files in src directory
readarray -t ALL_CHANGED_FILES < <(git diff --name-only origin/main...HEAD | grep '^src/' | grep -E '\.(ts|tsx|js|jsx)$' || true)

# Filter out excluded directories and files
CHANGED_FILES=()
for file in "${ALL_CHANGED_FILES[@]}"; do
  # Skip excluded directories
  if [[ "$file" =~ ^src/(CONST|languages|setup|stories|styles|types)/ ]]; then
    echo "Skipping excluded directory: $file"
    continue
  fi
  
  # Skip excluded files in src root
  filename=$(basename "$file")
  if [[ "$filename" =~ ^(App\.tsx|CONFIG\.ts|Expensify\.tsx|HybridAppHandler\.tsx|NAICS\.ts|NAVIGATORS\.ts|ONYXKEYS\.ts|ROUTES\.ts|SCREENS\.ts|SplashScreenStateContext\.tsx|TIMEZONES\.ts)$ ]]; then
    echo "Skipping excluded file: $file"
    continue
  fi
  
  # Add to coverage collection
  CHANGED_FILES+=("$file")
done

# Check if any files remain for coverage
if [ ${#CHANGED_FILES[@]} -eq 0 ]; then
  echo "No relevant src files changed (all changes were in excluded directories/files), skipping coverage"
  echo "run_coverage=false" >> "$GITHUB_OUTPUT"
  exit 0
fi

echo "Changed src files for coverage:"
printf '%s\n' "${CHANGED_FILES[@]}"
echo "run_coverage=true" >> "$GITHUB_OUTPUT"

# Save changed files for coverage collection
printf '%s\n' "${CHANGED_FILES[@]}" > changed_files.txt
