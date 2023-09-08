#!/bin/bash

# Configurations
readonly SRC_DIR="src"
readonly STYLES_FILE="src/styles/styles.js"
readonly UTILITIES_STYLES_FILE="src/styles/utilities"
readonly STYLES_KEYS_FILE="scripts/style_keys_list_temp.txt"
readonly UTILITY_STYLES_KEYS_FILE="scripts/utility_keys_list_temp.txt"
readonly REMOVAL_KEYS_FILE="scripts/removal_keys_list_temp.txt"
readonly AMOUNT_LINES_TO_SHOW=3

readonly FILE_EXTENSIONS=('-name' '*.js' '-o' '-name' '*.jsx' '-o' '-name' '*.ts' '-o' '-name' '*.tsx')

# Regex
readonly OBJ_PROP_DECLARATION_REGEX="^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{|^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{|^[[:space:]]*\}"
readonly OBJ_DEFINITION_REGEX="^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{"
readonly CAPTURE_ARROW_FUNC_REGEX="^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{"
readonly CAPTURE_OBJ_ARROW_FUNC_REGEX="^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{|^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{"

source scripts/shellUtils.sh

# trap ctrl-c and call ctrl_c()
trap ctrl_c INT

delete_temp_files() {
  find scripts -name "*keys_list_temp*" -type f -exec rm -f {} \;
}

# shellcheck disable=SC2317  # Don't warn about unreachable commands in this function
ctrl_c() {
  delete_temp_files
  exit 1
}
  
count_lines() {
  local file=$1
  wc -l < "$file"
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
  done < <(find $SRC_DIR -type f \( "${FILE_EXTENSIONS[@]}" \))
}


# Function to find and store keys from a file
find_styles_and_store_keys() {
  local file="$1"
  local base_name="${2:-styles}" # Set styles as default
  local parent_keys=()
  local root_key=""
  local line_number=0

  while IFS= read -r line; do
    ((line_number++))

    # Skip lines that are not key-related
    if [[ ! "$line" =~ $OBJ_PROP_DECLARATION_REGEX && ! "$line" =~ $CAPTURE_ARROW_FUNC_REGEX ]]; then
      continue
    fi
    
    if [[ "$line" =~ $OBJ_DEFINITION_REGEX ]]; then
      root_key="${BASH_REMATCH[2]%%:*{*)}"
    elif [[ "$line" =~ $CAPTURE_OBJ_ARROW_FUNC_REGEX ]]; then
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
    
      if [[ "$key" == "styles."* ]]; then
        echo "${key}:${file}:${line_number}" >> "$STYLES_KEYS_FILE"
      else
        echo "styles.${key}|${base_name}.${key}:${file}:${line_number}" >> "$STYLES_KEYS_FILE"
      fi
      parent_keys+=("$key")
    elif [[ "$line" =~ ^[[:space:]]*\} ]]; then
      parent_keys=("${parent_keys[@]:0:${#parent_keys[@]}-1}")
    fi
  done < "$file"
}

find_utility_styles_store_prefix() {
  # Loop through all files in the src folder
  while read -r file; do
    # Search for keywords starting with "styles"
    while IFS= read -r keyword; do
        local variable="${keyword##*/}"
        local variable_trimmed="${variable// /}"  # Trim spaces
          
        echo "$variable_trimmed" >> "$UTILITY_STYLES_KEYS_FILE"
    done < <(grep -E -o './utilities/[a-zA-Z0-9_-]+' "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/')
  done < <(find 'src/styles' -type f \( "${FILE_EXTENSIONS[@]}" \))

  # Sort and remove duplicates from the temporary file
  sort -u -o "${UTILITY_STYLES_KEYS_FILE}" "${UTILITY_STYLES_KEYS_FILE}"
}

find_utility_usage_as_styles() {
  while read -r file; do
    local folder_name
    local root_key
    local parent_dir

    # Get the folder name, given this utility files are index.js
    parent_dir=$(dirname "$file")
    root_key=$(basename "${parent_dir}")

    if [[ "${root_key}" == "utilities" ]]; then
      continue
    fi

    find_styles_and_store_keys "${file}" "${root_key}"
  done < <(find $UTILITIES_STYLES_FILE -type f \( "${FILE_EXTENSIONS[@]}" \))
}

lookfor_unused_utilities() {
  # Read each utility keyword from the file
  while read -r keyword; do
    # Creating a copy so later the replacement can reference it  
    local original_keyword="${keyword}"

    # Iterate through all files in "src/styles"
    while read -r file; do
      # Find all words that match "$keyword.[a-zA-Z0-9_-]+"
      while IFS= read -r match; do
        # Replace the utility prefix with "styles"
        local variable="${match/#$original_keyword/styles}"
        # Call the remove_keyword function with the variable
        remove_keyword "${variable}"
        remove_keyword "${match}"
      done < <(grep -E -o "$original_keyword\.[a-zA-Z0-9_-]+" "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/')
    done < <(find 'src/styles' -type f \( "${FILE_EXTENSIONS[@]}" \))
  done < "$UTILITY_STYLES_KEYS_FILE"
}

# Find and store the name of the utility files as keys
find_utility_styles_store_prefix

# Find and store keys from styles.js
find_styles_and_store_keys "$STYLES_FILE"

find_utility_usage_as_styles

# Look for usages of utilities into src/styles
lookfor_unused_utilities

echo "⏱️ Now going through the list and looking for unused keys."

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