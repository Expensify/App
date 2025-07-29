#!/bin/bash

# Checks for usage of iframe and non-cloudflare URL for videos in documentation.

source ./scripts/shellUtils.sh
title 'Enforce no iframe usage for videos and cloudflare CDN links'
folder="./docs"
regex="(?:<iframe[^>]*?)(?:\s*width=[\"\"'](?<width>[^\"\"']+)[\"\"']|\s*height=[\"\"'](?<height>[^'\"\"]+)[\"\"']|\s*src=[\"\"'](?<src>[^'\"\"]+[\"\"']))+[^>]*?>"
find "$folder" -type f -name "*.md" ! -iname "README.md" | while read -r file; do
    pcregrep -n "$regex" "$file" | while read -r match; do
        error "Do not use iframes for video embeds: $file:$match"
    done
done

regex="{%\s*include\s+video\.html\s+(?:\s*thumbnail=[\"\"'](?<thumbnail>[^'\"\"]+)[\"\"']|\s*src=[\"\"'](?<src>[^'\"\"]+[\"\"']))+\s*%}"
cdn_regex="https:\/\/(?:\S+)\.cloudflarestream.com\/(?:\S*)"
find "$folder" -type f -name "*.md" ! -iname "README.md" | while read -r file; do
    pcregrep -n "$regex" "$file" | while read -r match; do
    if ! echo "$match" | pcregrep -q "$cdn_regex"; then
        error "Video URL must be from Cloudflare CDN: $match"
    fi
    done
done
