#!/bin/bash
#
# Validates the Github Actions and workflows using the json schemas provided by https://www.schemastore.org/json/

# Track exit codes separately so we can run a full validation, report errors, and exit with the correct code
declare EXIT_CODE=0

# Download the up-to-date json schemas for github actions and workflows
cd ./.github && mkdir ./tempSchemas || exit 1
curl https://json.schemastore.org/github-action.json --output ./tempSchemas/github-action.json --silent || exit 1
curl https://json.schemastore.org/github-workflow.json --output ./tempSchemas/github-workflow.json --silent || exit 1

# Validate the actions and workflows using the JSON schemas and ajv https://github.com/ajv-validator/ajv-cli
find ./actions/ -type f -name "*.yml" -print0 | xargs -0 -I file ajv -s ./tempSchemas/github-action.json -d file --strict=false || EXIT_CODE=1
find ./workflows/ -type f -name "*.yml" -print0 | xargs -0 -I file ajv -s ./tempSchemas/github-workflow.json -d file --strict=false || EXIT_CODE=1

# Cleanup after ourselves and delete the schemas
rm -rf ./tempSchemas

exit $EXIT_CODE
