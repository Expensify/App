#!/bin/bash
set -e

export ELECTRON_ENV=${1:-development}

if [[ "$ELECTRON_ENV" == "staging" ]]; then
  ENV_FILE=".env.staging"
elif [[ "$ELECTRON_ENV" == "adhoc" ]]; then
  ENV_FILE=".env.adhoc"
elif [[ "$ELECTRON_ENV" == "production" ]]; then
  ENV_FILE=".env.production"
else
  ENV_FILE=".env"
fi

if [[ -n "$GCP_GEOLOCATION_API_KEY" ]]; then
  if grep -qE "^GCP_GEOLOCATION_API_KEY=" "$ENV_FILE"; then
      # Replace the value for the existing key
      sed -i "s|^GCP_GEOLOCATION_API_KEY=.*$|GCP_GEOLOCATION_API_KEY=$GCP_GEOLOCATION_API_KEY|g" "$ENV_FILE"
  else
      # Add the key-value pair to the config file
      echo "GCP_GEOLOCATION_API_KEY=$GCP_GEOLOCATION_API_KEY" >> "$ENV_FILE"
  fi
fi

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
source "$SCRIPTS_DIR/shellUtils.sh"

title "Bundling Desktop js Bundle Using Webpack"
info " • ELECTRON_ENV: $ELECTRON_ENV"
info " • ENV file: $ENV_FILE"
info ""
npx webpack --config config/webpack/webpack.desktop.ts --env file=$ENV_FILE

title "Combining web sourcemaps"
info ""
ts-node scripts/combine-web-sourcemaps.ts --path="desktop/dist/www"

title "Building Desktop App Archive Using Electron"
info ""
shift 1
npx electron-builder --config config/electronBuilder.config.js --publish always "$@"
