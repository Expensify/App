#!/bin/bash

set -e

START_DIR=$(pwd)
ROOT_DIR=$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")
cd "$ROOT_DIR" || exit 1


pwd
git fetch origin main

js_changed=$(git diff --name-only origin/main -- "src/libs/SearchParser/*.js")
peggy_changed=$(git diff --name-only origin/main -- "src/libs/SearchParser/*.peggy")

autocomplete_parser_backup="src/libs/SearchParser/autocompleteParser.js.bak"
search_parser_backup="src/libs/SearchParser/searchParser.js.bak"

cp src/libs/SearchParser/autocompleteParser.js "$autocomplete_parser_backup" 2>/dev/null
cp src/libs/SearchParser/searchParser.js "$search_parser_backup" 2>/dev/null

npm run generate-search-parser
npm run generate-autocomplete-parser

if ! diff -q "$autocomplete_parser_backup" src/libs/SearchParser/autocompleteParser.js >/dev/null ||
   ! diff -q "$search_parser_backup" src/libs/SearchParser/searchParser.js >/dev/null; then
    exit 1
else
    exit 0
fi
