#!/bin/bash

# Go to project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# Run patch-package
npx patch-package

# Install node_modules in subpackages, unless we're in a CI/CD environment,
# where the node_modules for subpackages are cached separately.
# See `.github/actions/composite/setupNode/action.yml` for more context.
if [[ -z ${CI+x} ]]; then
  cd desktop || exit 1
  npm install
fi
