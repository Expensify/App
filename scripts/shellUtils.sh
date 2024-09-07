#!/bin/bash

# Check if GREEN has already been defined
if [ -z "${GREEN+x}" ]; then
  declare -r GREEN=$'\e[1;32m'
fi

# Check if RED has already been defined
if [ -z "${RED+x}" ]; then
  declare -r RED=$'\e[1;31m'
fi

# Check if YELLOW has already been defined
if [ -z "${YELLOW+x}" ]; then
  declare -r YELLOW=$'\e[1;33m'
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
  echo "🎉 $GREEN$1$RESET"
}

function error {
  echo "💥 $RED$1$RESET"
}

function warning {
  echo "⚠️ $YELLOW$1$RESET"
}

function info {
  echo "$BLUE$1$RESET"
}

function title {
  printf "\n%s%s%s\n" "$TITLE" "$1" "$RESET"
}

# Function to clear the last printed line
clear_last_line() {
  echo -ne "\033[1A\033[K"
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

# Function to read lines from standard input into an array using a temporary file.
# This is a bash 3 polyfill for readarray.
# Arguments:
#   $1: Name of the array variable to store the lines
# Usage:
#   read_lines_into_array array_name
read_lines_into_array() {
  local array_name="$1"
  local line
  while IFS= read -r line || [ -n "$line" ]; do
    eval "$array_name+=(\"$line\")"
  done
}

ask_yes_no() {
  local prompt_text="$1"
  local default="$2"
  local response

  # Determine the prompt with the default option shown
  if [[ "$default" == "Y" ]]; then
    prompt_text="$prompt_text [Y/n] "
  elif [[ "$default" == "N" ]]; then
    prompt_text="$prompt_text [y/N] "
  else
    prompt_text="$prompt_text [y/n] "
  fi

  # Loop until a valid response is given
  while true; do
    # Prompt the user for input
    read -r -p "$prompt_text" response

    # If response is empty, use the default
    if [[ -z "$response" ]]; then
      response="$default"
    fi

    # Check if the response is Yes or No
    case "$response" in
      [yY][eE][sS]|[yY]) return 0 ;;  # Yes: Return true (success)
      [nN][oO]|[nN]) return 1 ;;      # No: Return false (failure)
      *) echo "Please answer yes or no." ;;
    esac
  done
}
