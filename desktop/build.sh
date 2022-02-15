#!/bin/bash
set -e

ELECTRON_ENV=${1:-development}

if [[ "$ELECTRON_ENV" == "staging" ]]; then
  ENV_FILE=".env.staging"
elif [[ "$ELECTRON_ENV" == "production" ]]; then
  ENV_FILE=".env.production"
else
  ENV_FILE=".env"
fi

echo "Bundling webpack desktop (ELECTRON_ENV: $ELECTRON_ENV, using: $ENV_FILE)"
echo ""
webpack --config config/webpack/webpack.desktop.js --env.envFile=$ENV_FILE
echo ""
echo "Building Desktop App"
echo ""
shift 1
electron-builder --config config/electronBuilder/electronBuilder.config.js "$@"
