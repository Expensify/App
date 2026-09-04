#!/bin/bash

# Check if GREEN has already been defined
if [ -z "${GREEN+x}" ]; then
  declare -r GREEN=$'\e[1;32m'
fi

# Check if RED has already been defined
if [ -z "${RED+x}" ]; then
  declare -r RED=$'\e[1;31m'
fi

# Check if BLUE has already been defined
if [ -z "${BLUE+x}" ]; then
  declare -r BLUE=$'\e[1;34m'
fi

# Check if TITLE has already been defined
if [ -z "${TITLE+x}" ]; then
  declare -r TITLE=$'\e[1;4;34m'
fi

# Check if RESET has already been defined
if [ -z "${RESET+x}" ]; then
  declare -r RESET=$'\e[0m'
fi

function success {
  echo -e "🎉 $GREEN$1$RESET" >&2
}

function error {
  echo -e "💥 $RED$1$RESET" >&2
}

function info {
  echo -e "$BLUE$1$RESET" >&2
}

function title {
  printf "\n%s%s%s\n" "$TITLE" "$1" "$RESET" >&2
}

# Function to clear the last printed line
clear_last_line() {
  echo -ne "\033[1A\033[K" >&2
}

# Function to check if Cloudflare WARP is installed and running
# Returns 0 if WARP is active, 1 otherwise
is_warp_active() {
  if ! command -v warp-cli &>/dev/null; then
    return 1
  fi

  local WARP_STATUS
  WARP_STATUS=$(warp-cli status 2>/dev/null | grep -i "status update" || echo "")

  if [[ "${WARP_STATUS}" == *"Connected"* ]]; then
    return 0
  else
    return 1
  fi
}

function assert_equal {
  if [[ "$1" != "$2" ]]; then
    error "Assertion failed: $1 is not equal to $2"
    exit 1
  else
    success "Assertion passed: $1 is equal to $1"
  fi
}

# Usage: join_by_string <delimiter> ...strings
# example: join_by_string ' + ' 'string 1' 'string 2'
# example: join_by_string ',' "${ARRAY_OF_STRINGS[@]}"
function join_by_string {
  local separator="$1"
  shift
  local first="$1"
  shift
  printf "%s" "$first" "${@/#/$separator}"
}

# Usage: get_abs_path <path>
# Will make a path absolute, resolving any relative paths
# example: get_abs_path "./foo/bar"
get_abs_path() {
    local the_path=$1
    local -a path_elements
    IFS='/' read -ra path_elements <<< "$the_path"

    # If the path is already absolute, start with an empty string.
    # We'll prepend the / later when reconstructing the path.
    if [[ "$the_path" = /* ]]; then
        abs_path=""
    else
        abs_path="$(pwd)"
    fi

    # Handle each path element
    for element in "${path_elements[@]}"; do
        if [ "$element" = "." ] || [ -z "$element" ]; then
            continue
        elif [ "$element" = ".." ]; then
            # Remove the last element from abs_path
            abs_path=$(dirname "$abs_path")
        else
            # Append element to the absolute path
            abs_path="${abs_path}/${element}"
        fi
    done

    # Remove any trailing '/'
    while [[ $abs_path == */ ]]; do
        abs_path=${abs_path%/}
    done

    # Special case for root
    [ -z "$abs_path" ] && abs_path="/"

    # Special case to remove any starting '//' when the input path was absolute
    abs_path=${abs_path/#\/\//\/}

    echo "$abs_path"
}

# Fetches origin/main and prints the merge-base SHA between it and HEAD.
# This is the single definition of "base" shared by the *-changed scripts
# (lintChanged.sh, knip-changed.sh, spellChanged.sh) so they all agree on
# what "changed" means.
# Usage: get_merge_base_with_main
get_merge_base_with_main() {
  if ! git fetch origin main --no-tags >&2; then
    error "git fetch origin main failed"
    return 1
  fi

  local merge_base_sha_hash
  merge_base_sha_hash="$(git merge-base origin/main HEAD)" || {
    error "git merge-base failed"
    return 1
  }

  if ! [[ "$merge_base_sha_hash" =~ ^[a-fA-F0-9]{40}$ ]]; then
    error "git merge-base returned unexpected output: $merge_base_sha_hash"
    return 1
  fi

  echo "$merge_base_sha_hash"
}

# Prints files changed relative to a base commit, diffed against the working
# tree (so committed, staged and unstaged changes are all included), plus
# any untracked files. Excludes deletions.
# Usage: get_changed_files <base_sha> [path spec...]
get_changed_files() {
  local base_sha="$1"
  shift

  git -c core.quotepath=false -c diff.relative=false diff --diff-filter=AMR --name-only "$base_sha" -- "$@" || return 1
  git -c core.quotepath=false ls-files --full-name --others --exclude-standard -- "$@"
}

# Function to read lines from standard input into an array.
# This is a bash 3 polyfill for readarray. Uses printf -v (not eval) on each
# line so special shell characters in the input (e.g. from git-derived filenames)
# aren't executed.
# Arguments:
#   $1: Name of the array variable to store the lines
# Usage:
#   read_lines_into_array array_name
read_lines_into_array() {
  local array_name="$1"
  local line
  local index
  eval "index=\${#${array_name}[@]}"
  while IFS= read -r line || [ -n "$line" ]; do
    printf -v "${array_name}[$index]" '%s' "$line"
    index=$((index + 1))
  done
}
