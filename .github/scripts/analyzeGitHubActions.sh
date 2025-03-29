#!/bin/bash

GITHUB_DIR="$(dirname "$(dirname "$0")")"
TRUSTED_ORGS=(
  '^1password/'
  '^actions/'
  '^aws-actions/'
  '^cloudflare/'
  '^Expensify/'
  '^gradle/'
  '^ruby/'
)

find "$GITHUB_DIR" -type f \( -name "*.yml" -o -name "*.yaml" \) -print0 \
  | xargs -0 grep --no-filename "uses:" \
  | sed 's/\- uses:/uses:/g' \
  | tr '"' ' ' \
  | awk '{print $2}' \
  | sed 's/\r//g' \
  | grep -vE '\.github\/' \
  | sort \
  | uniq \
  > /tmp/actionUsages.txt

echo -e "\033[1mAll action usages:\033[0m"
cat /tmp/actionUsages.txt

echo ""
echo -e "\033[1mUntrusted action usages:\033[0m"
grep -vE "$(IFS='|'; echo "${TRUSTED_ORGS[*]}")" /tmp/actionUsages.txt > /tmp/untrustedActionUsages.txt
cat /tmp/untrustedActionUsages.txt

echo ""
echo -e "\033[1mUnsafe action usages:\033[0m"
GIT_HASH_REGEX='\b[0-9a-f]{40}\b'
grep -vE "$GIT_HASH_REGEX" /tmp/untrustedActionUsages.txt
