#!/bin/bash
#
# Prettier can intermittently fail due to a stale cache. This wrapper runs
# prettier once, and if it fails, clears the cache and retries.

set -eu

TOP="$(realpath "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)/..")"
readonly TOP
source "${TOP}/scripts/shellUtils.sh"

declare -r PRETTIER_CACHE_DIR="${TOP}/node_modules/.cache/prettier"

function run_prettier() {
    npx prettier --experimental-cli --write . "$@"
}

function clear_cache() {
    if [[ -d "${PRETTIER_CACHE_DIR}" ]]; then
        info "Clearing prettier cache at ${PRETTIER_CACHE_DIR}"
        rm -rf "${PRETTIER_CACHE_DIR}"
    fi
}

function main() {
    if run_prettier "$@"; then
        success "Prettier finished successfully"
        return
    fi

    error "Prettier failed — clearing cache and retrying"
    clear_cache

    if run_prettier "$@"; then
        success "Prettier finished successfully after clearing cache"
    else
        error "Prettier failed again after clearing cache"
        exit 1
    fi
}

main "$@"
