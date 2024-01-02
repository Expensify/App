#!/bin/bash

# Configurations
declare LIB_PATH
LIB_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && cd ../../ && pwd)"

readonly SRC_DIR="${LIB_PATH}/src"
readonly STYLES_DIR="${LIB_PATH}/src/styles"
readonly STYLES_FILE="${LIB_PATH}/src/styles/index.ts"
readonly UTILS_STYLES_FILE="${LIB_PATH}/src/styles/utils"
readonly UTILS_STYLES_GENERATORS_FILE="${LIB_PATH}/src/styles/utils/generators"
readonly STYLES_KEYS_FILE="${LIB_PATH}/scripts/style_keys_list_temp.txt"
readonly UTIL_STYLES_KEYS_FILE="${LIB_PATH}/scripts/util_keys_list_temp.txt"
readonly REMOVAL_KEYS_FILE="${LIB_PATH}/scripts/removal_keys_list_temp.txt"
readonly AMOUNT_LINES_TO_SHOW=3

readonly FILE_EXTENSIONS=('-name' '*.js' '-o' '-name' '*.jsx' '-o' '-name' '*.ts' '-o' '-name' '*.tsx')

source scripts/shellUtils.sh

# trap ctrl-c and call ctrl_c()
trap ctrl_c INT

delete_temp_files() {
  find "${LIB_PATH}/scripts" -name "*keys_list_temp*" -type f -exec rm -f {} \;
}

# shellcheck disable=SC2317  # Don't warn about unreachable commands in this function
ctrl_c() {
  delete_temp_files
  exit 1
}

count_lines() {
  local file=$1
  if [[ -e "$file" ]]; then
    wc -l < "$file"
  else
    echo "File not found: $file"
  fi
}

# Read the style file with unused keys
show_unused_style_keywords() {
  while IFS=: read -r key file line_number; do
    title "File: $file:$line_number"

    # Get lines before and after the error line
    local lines_before=$((line_number - AMOUNT_LINES_TO_SHOW))
    local lines_after=$((line_number + AMOUNT_LINES_TO_SHOW))

    # Read the lines into an array
    local lines=()
    while IFS= read -r line; do
      lines+=("$line")
    done < "$file"

    # Loop through the lines
    for ((i = lines_before; i <= lines_after; i++)); do
      local line="${lines[i]}"
      # Print context of the error line
      echo "$line"
    done
    error "Unused key: $key"
    echo "--------------------------------"
  done < "$STYLES_KEYS_FILE"
}

# Function to remove a keyword from the temp file
remove_keyword() {
  local keyword="$1"
  if grep -q "$keyword" "$STYLES_KEYS_FILE"; then
    grep -v "$keyword" "$STYLES_KEYS_FILE" > "$REMOVAL_KEYS_FILE"
    mv "$REMOVAL_KEYS_FILE" "$STYLES_KEYS_FILE"

    return 0 # Keyword was removed
  else
    return 1 # Keyword was not found
  fi
}

lookfor_unused_keywords() {
  # Loop through all files in the src folder
  while read -r file; do

    # Search for keywords starting with "styles"
    while IFS= read -r keyword; do

        # Remove any [ ] characters from the keyword
        local clean_keyword="${keyword//[\[\]]/}"
        # skip styles. keyword that might be used in comments
        if [[ "$clean_keyword" == "styles." ]]; then
          continue
        fi

        if ! remove_keyword "$clean_keyword" ; then
          # In case of a leaf of the styles object is being used, it means the parent objects is being used
          # we need to mark it as used.
          if [[ "$clean_keyword" =~ ^styles\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$ ]]; then
            # Keyword has more than two words, remove words after the second word
            local keyword_prefix="${clean_keyword%.*}"
            remove_keyword "$keyword_prefix"
          fi
        fi
    done < <(grep -E -o '\bstyles\.[a-zA-Z0-9_.]*' "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/')
  done < <(find "${SRC_DIR}" -type f \( "${FILE_EXTENSIONS[@]}" \))
}


# Function to find and store keys from a file
find_styles_object_and_store_keys() {
  local file="$1"
  local base_name="${2:-styles}" # Set styles as default
  local line_number=0
  local inside_arrow_function=false

  while IFS= read -r line; do
    ((line_number++))

    # Check if we are inside an arrow function and we find a closing curly brace
    if [[ "$inside_arrow_function" == true ]]; then
      if [[ "$line" =~ ^[[:space:]]*\}\) ]]; then
        inside_arrow_function=false
      fi
      continue
    fi

    # Check if we are inside an arrow function
    if [[ "$line" =~ ^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{ || "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\(.*\)[[:space:]]*'=>' ]]; then
      inside_arrow_function=true
      continue
    fi

    # Skip lines that are not key-related
    if [[ ! "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{|^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{|^[[:space:]]*\} ]]; then
      continue
    fi

    if [[ "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{ ]]; then
      key="${BASH_REMATCH[2]%%:*{*)}"
      echo "styles.${key}|...${key}|${base_name}.${key}:${file}:${line_number}" >> "$STYLES_KEYS_FILE"
    fi
  done < "$file"
}

find_styles_functions_and_store_keys() {
  local file="$1"
  local line_number=0
  local inside_object=false
  local inside_arrow_function=false
  local key=""

  while IFS= read -r line; do
    ((line_number++))

    # Skip lines that are not key-related
    if [[ "${line}" == *styles* ]]; then
      continue
    fi

    # Check if we are inside an arrow function and we find a closing curly brace
    if [[ "$inside_arrow_function" == true ]]; then
      if [[ "$line" =~ ^[[:space:]]*\}\) ]]; then
        inside_arrow_function=false
      fi
      continue
    fi

    # Check if we are inside an arrow function
    if [[ "${line}" =~ ^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\( ]]; then
      inside_arrow_function=true
      key="${line%%:*}"
      key="${key// /}"  # Trim spaces
      echo "styles.${key}|...${key}:${file}:${line_number}" >> "$STYLES_KEYS_FILE"
      continue
    fi

    if [[ "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\(.*\)[[:space:]]*'=>' ]]; then
      inside_arrow_function=true
      key="${BASH_REMATCH[2]}"
      key="${key// /}"  # Trim spaces
      echo "styles.${key}|...${key}:${file}:${line_number}" >> "$STYLES_KEYS_FILE"
      continue
    fi

  done < "$file"
}

find_theme_style_and_store_keys() {
  local file="$1"
  local start_line_number="$2"
  local base_name="${3:-styles}" # Set styles as default
  local parent_keys=()
  local root_key=""
  local line_number=0
  local inside_arrow_function=false

  while IFS= read -r line; do
    ((line_number++))

    if [ ! "$line_number" -ge "$start_line_number" ]; then
      continue
    fi

    # Check if we are inside an arrow function and we find a closing curly brace
    if [[ "$inside_arrow_function" == true ]]; then
      if [[ "$line" =~ ^[[:space:]]*\}\) ]]; then
        inside_arrow_function=false
      fi
      continue
    fi

    # Check if we are inside an arrow function
    if [[ "$line" =~ ^[[:space:]]*([a-zA-Zgv 0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{ || "$line" =~ ^[[:space:]]*([a-zA-Zgv 0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>' ]]; then
      inside_arrow_function=true
      continue
    fi

    if [[ "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\(.*\)[[:space:]]*'=>' ]]; then
      inside_arrow_function=true
      continue
    fi

    # Skip lines that are not key-related
    if [[ ! "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{|^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{|^[[:space:]]*\} ]]; then

      continue
    fi

    if [[ "$line" =~ ^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{|^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{ ]]; then
      # Removing all the extra lines after the ":"
      local key="${line%%:*}"
      key="${key// /}"  # Trim spaces

      if [[ ${#parent_keys[@]} -gt 0 ]]; then
        local parent_key_trimmed="${parent_keys[${#parent_keys[@]}-1]// /}"  # Trim spaces
        key="$parent_key_trimmed.$key"
      elif [[ -n "$root_key" ]]; then
        local parent_key_trimmed="${root_key// /}"  # Trim spaces
        key="$parent_key_trimmed.$key"
      fi

      echo "styles.${key}|...${key}|${base_name}.${key}:${file}:${line_number}" >> "$STYLES_KEYS_FILE"
      parent_keys+=("$key")
    elif [[ "$line" =~ ^[[:space:]]*\} ]]; then
      parent_keys=("${parent_keys[@]:0:${#parent_keys[@]}-1}")
    fi
  done < "$file"
}

# Given that all the styles are inside of a function, we need to find the function and then look for the styles
collect_theme_keys_from_styles() {
  local file="$1"
  local line_number=0
  local inside_styles=false

  while IFS= read -r line; do
    ((line_number++))

    if [[ "$inside_styles" == false ]]; then
      if [[ "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\(.*\)[[:space:]]*'=>' ]]; then
        key="${BASH_REMATCH[2]}"
        key="${key// /}"  # Trim spaces
        if [[ "$key" == "styles"* ]]; then
          inside_styles=true
          # Need to start within the style function
          ((line_number++))
          find_theme_style_and_store_keys "$STYLES_FILE" "$line_number"
        fi
        continue
      fi
    fi
  done < "$file"
}

lookfor_unused_spread_keywords() {
  local inside_object=false
  local key=""

  while IFS= read -r line; do
    # Detect the start of an object
    if [[ "$line" =~ ^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{ ]]; then
      inside_object=true
    fi

    # Detect the end of an object
    if [[ "$line" =~ ^[[:space:]]*\},?$ ]]; then
      inside_object=false
    fi

    # If we're inside an object and the line starts with '...', capture the key
    if [[ "$inside_object" == true && "$line" =~ ^[[:space:]]*\.\.\.([a-zA-Z0-9_]+)(\(.+\))?,?$ ]]; then
      key="${BASH_REMATCH[1]}"
      remove_keyword "...${key}"
    fi
  done < "$STYLES_FILE"
}

find_util_styles_store_prefix() {
  # Loop through all files in the src folder
  while read -r file; do
    # Search for keywords starting with "styles"
    while IFS= read -r keyword; do
        local variable="${keyword##*/}"
        local variable_trimmed="${variable// /}"  # Trim spaces

        echo "$variable_trimmed" >> "$UTIL_STYLES_KEYS_FILE"
    done < <(grep -E -o './utils/[a-zA-Z0-9_-]+' "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/')
  done < <(find "${STYLES_DIR}" -type f \( "${FILE_EXTENSIONS[@]}" \))

  # Sort and remove duplicates from the temporary file
  sort -u -o "${UTIL_STYLES_KEYS_FILE}" "${UTIL_STYLES_KEYS_FILE}"
}

find_util_usage_as_styles() {
  while read -r file; do
    local root_key
    local parent_dir

    # Get the folder name, given this util files are index.js
    parent_dir=$(dirname "$file")
    root_key=$(basename "${parent_dir}")

    if [[ "${root_key}" == "utils" ]]; then
      continue
    fi

    find_theme_style_and_store_keys "${file}" 0 "${root_key}"
  done < <(find "${UTILS_STYLES_FILE}" -type f \( -path "${UTILS_STYLES_GENERATORS_FILE}" -prune -o -name "${FILE_EXTENSIONS[@]}" \) -print)

}

lookfor_unused_utils() {
  # Read each util keyword from the file
  while read -r keyword; do
    # Creating a copy so later the replacement can reference it
    local original_keyword="${keyword}"

    # Iterate through all files in "src/styles"
    while read -r file; do
      # Find all words that match "$keyword.[a-zA-Z0-9_-]+"
      while IFS= read -r match; do
        # Replace the util prefix with "styles"
        local variable="${match/#$original_keyword/styles}"
        # Call the remove_keyword function with the variable
        remove_keyword "${variable}"
        remove_keyword "${match}"
      done < <(grep -E -o "$original_keyword\.[a-zA-Z0-9_-]+" "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/')
    done < <(find "${STYLES_DIR}" -type f \( "${FILE_EXTENSIONS[@]}" \))
  done < "$UTIL_STYLES_KEYS_FILE"
}

echo "🔍 Looking for styles."
# Find and store the name of the util files as keys
find_util_styles_store_prefix
find_util_usage_as_styles

# Find and store keys from styles.ts
find_styles_object_and_store_keys "$STYLES_FILE"
find_styles_functions_and_store_keys "$STYLES_FILE"
collect_theme_keys_from_styles "$STYLES_FILE"

echo "🗄️ Now going through the codebase and looking for unused keys."

# Look for usages of utils into src/styles
lookfor_unused_utils
lookfor_unused_spread_keywords
lookfor_unused_keywords

final_styles_line_count=$(count_lines "$STYLES_KEYS_FILE")

if [[ $final_styles_line_count -eq 0 ]]; then
  # Exit successfully (status code 0)
  delete_temp_files
  success "Styles are in a good shape"
  exit 0
else
  show_unused_style_keywords
  delete_temp_files
  error "Unused keys: $final_styles_line_count"
  exit 1
fi
