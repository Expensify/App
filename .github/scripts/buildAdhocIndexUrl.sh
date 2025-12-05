#!/bin/bash

# Transform artifact URL to clean installation page URL (index.html)
# Usage: ./buildAdhocIndexUrl.sh <full_url>
# Output: Prints the clean URL to stdout

FULL_URL="$1"

if [ -z "$FULL_URL" ]; then
    echo "Error: No URL provided" >&2
    echo "Usage: $0 <full_url>" >&2
    exit 1
fi

echo "=== URL Transform Debug ==="
echo "Input URL: $FULL_URL"

# Remove query string (everything after ?)
CLEAN_URL="${FULL_URL%%\?*}"
echo "After removing query string: $CLEAN_URL"

# Remove .zip extension
CLEAN_URL="${CLEAN_URL%.zip}"
echo "After removing .zip: $CLEAN_URL"

# Extract base URL (everything up to the artifact name)
BASE_URL="${CLEAN_URL%/*}"
echo "Base URL: $BASE_URL"

# Extract artifact name (last part of path)
ARTIFACT_NAME="${CLEAN_URL##*/}"
echo "Artifact name: $ARTIFACT_NAME"

# Build final URL: base + /ad-hoc/ + artifact name + /index.html
CLEAN_URL="${BASE_URL}/ad-hoc/${ARTIFACT_NAME}/index.html"
echo "=== Final URL ==="
echo "Clean URL: $CLEAN_URL"


echo "::notice::📄 File URL (IPA/APK): $FULL_URL"
echo "::notice::🔗 Adhoc Index URL: $CLEAN_URL"


# Output for GitHub Actions
if [ -n "$GITHUB_OUTPUT" ]; then
    echo "clean-url=$CLEAN_URL" >> "$GITHUB_OUTPUT"
fi

