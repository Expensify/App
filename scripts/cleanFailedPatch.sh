#!/bin/bash

# Check if a package name has been passed
if [ $# -eq 0 ]; then
  echo "No package name provided. Exiting."
  exit 1
fi

# Loop through all the passed package names
for PACKAGE in "$@"; do

  # Remove the package directory from node_modules
  rm -rf "node_modules/$PACKAGE"

  echo "$PACKAGE removed successfully."

  # Reinstall the package
  echo "Reinstalling $PACKAGE..."

  npm install "$PACKAGE" --no-save

  echo "$PACKAGE reinstalled successfully."

  # After reinstalling the failed packages, reapply all patches
  echo "Reapplying patches..."
  npx patch-package
done
