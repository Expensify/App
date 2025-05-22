#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up New Expensify development environment..."

# Update package list
echo "📦 Updating package list..."
sudo apt update

# Install required system packages
echo "📦 Installing required system packages..."
sudo apt install -y curl git build-essential libnss3-tools

# Install nvm (Node Version Manager)
echo "📦 Installing nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Source the shell to load nvm
echo "🔄 Sourcing shell to load nvm..."

# Load nvm in current shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

source ~/.bashrc || source ~/.zshrc || source ~/.profile

# Install Node.js using nvm from .nvmrc
echo "📦 Installing Node.js version from .nvmrc..."
nvm install

# Ensure we're using the correct Node.js version
echo "🔄 Switching to Node.js version from .nvmrc..."
nvm use

# Verify Node.js version
echo "🔍 Verifying Node.js version..."
EXPECTED_VERSION=$(cat .nvmrc)
CURRENT_VERSION=$(node -v | cut -d'v' -f2)

if [ "$CURRENT_VERSION" = "$EXPECTED_VERSION" ]; then
    echo "✅ Node.js version $CURRENT_VERSION is correct"
else
    echo "❌ Node.js version mismatch. Expected $EXPECTED_VERSION but got $CURRENT_VERSION"
    echo "Please run 'nvm use' to switch to the correct version"
    exit 1
fi

# Install project dependencies first
echo "📦 Installing project dependencies..."
npm install

# Now rebuild native modules
echo "🔨 Rebuilding native modules..."
npm rebuild

# Verify canvas module is working
echo "🔍 Verifying canvas module..."
if node -e "try { require('canvas'); console.log('✅ Canvas module loaded successfully'); } catch(e) { console.error('❌ Canvas module error:', e.message); process.exit(1); }" > /tmp/canvas.log 2>&1; then
    echo "✅ Setup verification complete"
else
    echo "❌ Canvas module verification failed. Attempting to fix..."
    # Remove node_modules and reinstall
    rm -rf node_modules
    npm install
    npm rebuild
    echo "🔄 Verifying canvas module again..."
    if node -e "try { require('canvas'); console.log('✅ Canvas module loaded successfully'); } catch(e) { console.error('❌ Canvas module error:', e.message); process.exit(1); }" > /tmp/canvas.log 2>&1; then
        echo "✅ Canvas module now working after rebuild"
    else
        echo "❌ Canvas module still not working. Please check /tmp/canvas.log for details"
        exit 1
    fi
fi

# Install mkcert for HTTPS setup
echo "📦 Installing mkcert..."
sudo apt install -y mkcert

# Setup HTTPS certificates
echo "🔒 Setting up HTTPS certificates..."
npm run setup-https

# Add dev.new.expensify.com to hosts file
echo "🌐 Adding dev.new.expensify.com to hosts file..."
if ! grep -q "dev.new.expensify.com" /etc/hosts; then
    echo "127.0.0.1 dev.new.expensify.com" | sudo tee -a /etc/hosts
fi

echo "✅ Setup complete! You can now start the web app with 'npm run web'"
echo "📝 Note: You may need to restart your terminal for nvm to be properly loaded if you encounter any issues"
