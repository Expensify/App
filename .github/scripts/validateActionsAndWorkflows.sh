#!/bin/bash
#
# 1) Lints the yaml style
# 2) Validates the Github Actions and workflows using the json schemas provided by https://www.schemastore.org/json/

# Download the up-to-date json schemas for github actions and workflows
cd ./.github && mkdir ./tempSchemas || exit 1;
curl https://json.schemastore.org/github-action.json --output ./tempSchemas/github-action.json --silent
curl https://json.schemastore.org/github-workflow.json --output ./tempSchemas/github-workflow.json --silent

# Validate the actions and workflows using the JSON schemas and ajv https://github.com/ajv-validator/ajv-cli
find ./actions/ -type f -name "*.yml" -print0 | xargs -I file ajv -s ./tempSchemas/github-action.json -d file --strict=false
find ./workflows/ -type f -name "*.yml" -print0 | xargs -I file ajv -s ./tempSchemas/github-workflow.json -d file --strict=false

# Cleanup after ourselves and delete the schemas
rm -rf ./tempSchemas
