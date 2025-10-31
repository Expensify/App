#!/bin/bash

# Script to build a development version of the desktop app
# This creates a properly signed .app with correct entitlements for SecureStore

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔨 Building desktop app for development..."

# Build the secure-store native addon
echo "🔧 Building secure-store native addon..."
cd desktop/secure-store && npm install --silent && cd "$ROOT_DIR"

# Build the webpack bundles in development mode
echo "📦 Building webpack bundles..."
NODE_ENV=development webpack --config config/webpack/webpack.desktop.ts --mode=development --env platform=desktop

# Build the Electron app with electron-builder
echo "🏗️  Building Electron app with development config..."
npx electron-builder --mac --config config/electronBuilder.dev.config.js

echo ""
echo "✅ Development build complete!"
echo ""
echo "📂 Output location: desktop-build-dev/"
echo "🚀 To run: open desktop-build-dev/mac/New\\ Expensify\\ Dev.app"
echo ""
