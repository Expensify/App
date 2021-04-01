#!/bin/bash
#
# 1) Lints the yaml style
# 2) Validates the Github Actions and workflows using the json schemas provided by https://www.schemastore.org/json/

# Track exit codes so we can run a full lint, report errors, and exit with the correct code
declare EXIT_CODE=0

# Download the up-to-date json schemas for github actions and workflows
cd ./.github && mkdir ./tempSchemas || exit 1
curl https://json.schemastore.org/github-action.json --output ./tempSchemas/github-action.json --silent
curl https://json.schemastore.org/github-workflow.json --output ./tempSchemas/github-workflow.json --silent

# Validate the actions and workflows using the JSON schemas and ajv https://github.com/ajv-validator/ajv-cli
find ./actions/ -type f -name "*.yml" -print0 | xargs -0 -I file ajv -s ./tempSchemas/github-action.json -d file --strict=false || EXIT_CODE=1
find ./workflows/ -type f -name "*.yml" -print0 | xargs -0 -I file ajv -s ./tempSchemas/github-workflow.json -d file --strict=false || EXIT_CODE=1

echo $EXIT_CODE

# Cleanup after ourselves and delete the schemas
rm -rf ./tempSchemas

exit $EXIT_CODE
