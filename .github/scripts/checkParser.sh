#!/bin/bash

set -e

ROOT_DIR=$(dirname "$(dirname "$(dirname "${BASH_SOURCE[0]}")")")
cd "$ROOT_DIR" || exit 1

autocomplete_parser_backup="src/libs/SearchParser/autocompleteParser.js.bak"
search_parser_backup="src/libs/SearchParser/searchParser.js.bak"

#Copying the current .js parser files
cp src/libs/SearchParser/autocompleteParser.js "$autocomplete_parser_backup" 2>/dev/null
cp src/libs/SearchParser/searchParser.js "$search_parser_backup" 2>/dev/null

#Running the scripts that generate the .js parser files
npm run generate-search-parser
npm run generate-autocomplete-parser

#Checking if the saved files differ from the newly generated
if ! diff -q "$autocomplete_parser_backup" src/libs/SearchParser/autocompleteParser.js >/dev/null ||
   ! diff -q "$search_parser_backup" src/libs/SearchParser/searchParser.js >/dev/null; then
    echo "The files generated from the .peggy files using the commands: generate-search-parser and generate-autocomplete-parser are not identical to those currently on this branch."
    echo "The parser .js files should never be edited manually. Make sure you’ve run locally: npm run generate-search-parser and npm run generate-autocomplete-parser, and committed the changes."
    exit 1
else
    echo "The files generated from the .peggy files using the commands: generate-search-parser and generate-autocomplete-parser are identical to those currently on this branch."
    exit 0
fi
