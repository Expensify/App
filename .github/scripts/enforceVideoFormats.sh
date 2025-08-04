#!/bin/bash

# Checks for usage of iframe and non-cloudflare URL for videos in documentation.
set -eu

source ./scripts/shellUtils.sh
title 'Enforce no iframe usage for videos and cloudflare CDN links'
hasViolation=false
regex="(?:<iframe[^>]*?)(?:\s*width=[\"\"'](?<width>[^\"\"']+)[\"\"']|\s*height=[\"\"'](?<height>[^'\"\"]+)[\"\"']|\s*src=[\"\"'](?<src>[^'\"\"]+[\"\"']))+[^>]*?>"
while IFS= read -r file; do
    while IFS= read -r match; do
        error "Do not use iframes for video embeds: $file:$match"
        hasViolation=true
    done < <(pcregrep -n "$regex" "$file")
done < <(git diff origin/main..HEAD --name-only --diff-filter=MAR --pretty=format: ':docs/*.md' ':(exclude,icase)*README.md')

regex="{%\s*include\s+video\.html\s+(?:\s*thumbnail=[\"\"'](?<thumbnail>[^'\"\"]+)[\"\"']|\s*src=[\"\"'](?<src>[^'\"\"]+[\"\"']))+\s*%}"
cdn_regex="https:\/\/(?:\S+)\.cloudflarestream.com\/(?:\S*)"
while IFS= read -r file; do
    while IFS= read -r match; do
        if ! echo "$match" | pcregrep -q "$cdn_regex"; then
            error "Video URL must be from Cloudflare CDN: $match"
            hasViolation=true
        fi
    done < <(pcregrep -n "$regex" "$file")
done < <(git diff origin/main..HEAD --name-only --diff-filter=MAR --pretty=format: ':docs/*.md' ':(exclude,icase)*README.md')

if [[ $hasViolation == true ]]; then
    error "Documentation has video violations"
    exit 1
fi

success "No violations."
exit 0

