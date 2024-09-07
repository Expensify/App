#!/bin/bash

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")

source "$SCRIPTS_DIR/shellUtils.sh"

# Ask to install ccache if it isn't installed already
install_ccache() {
  if ! which ccache; then
    if ask_yes_no "ccache not found. Would you like to install it to speed up your local builds?"; then
      brew install ccache
    fi
  fi
}

# Coming from https://reactnative.dev/docs/build-speed#local-caches, symlink ccache to C compilers used by React Native.
# Typically these packages exist in /usr/bin. Also typical is that `/usr/local/bin` appears before `/usr/bin` in your $PATH.
# So the way this works is to symlink ccache to the `/usr/local/bin` version of the package so it gets picked up by RN build commands.
packagesToSymlink=(
  gcc
  g++
  cc
  c++
  clang
  clang++
)

# Directory to store stashed original files in `/usr/local/bin` if they exist
tempDir=$(mktemp -d)

create_ccache_symlinks() {
  info "Stashing local C++ compilers and symlinking them with ccache"
  for pkg in "${packagesToSymlink[@]}"; do
    # stash the existing binaries if present
    if [[ -f "/usr/local/bin/$pkg" ]]; then
      sudo mv -v "/usr/local/bin/$pkg" "$tempDir/$pkg"
    fi

    # create the symlinks
    sudo ln -sv "$(which ccache)" "/usr/local/bin/$pkg"
  done
}

cleanup_ccache_symlinks() {
  info "Cleaning up ccache symlinks and restoring stashed packages"
  for pkg in "${packagesToSymlink[@]}"; do
    # remove symlinks
    if [[ -L "/usr/local/bin/$pkg" ]]; then
      sudo unlink -v "/usr/local/bin/$pkg"
    fi

    # restore stashed binaries
    if [[ -f "$tempDir/$pkg" ]]; then
      sudo mv -v "$tempDir/$pkg" "/usr/local/bin/$pkg"
    fi
  done

  # Remove the temporary directory
  rmdir "$tempDir"
}
