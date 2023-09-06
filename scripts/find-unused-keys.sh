#!/bin/bash

# Configurations
SRC_DIR="src"
STYLES_FILE="src/styles/styles.js"
UTILITIES_STYLES_FILE="src/styles/utilities"
STYLES_KEYS_FILE="scripts/style_keys_list_temp.txt"
UTILITY_STYLES_KEYS_FILE="scripts/utility_keys_list_temp.txt"
REMOVAL_KEYS_FILE="scripts/removal_keys_list_temp.txt"

# FILE_EXTENSIONS="-name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx'"
FILE_EXTENSIONS=('-name' '*.js' '-o' '-name' '*.jsx' '-o' '-name' '*.ts' '-o' '-name' '*.tsx')

# trap ctrl-c and call ctrl_c()
trap ctrl_c INT

function ctrl_c() {
  find scripts -name "*keys_list_temp*" -type f -exec rm -f {} \;
  exit 1
}
  
source scripts/shellUtils.sh

# Create an empty temp file if it doesn't exist
# if [ ! -f "$REMOVAL_KEYS_FILE" ]; then
#     touch "$REMOVAL_KEYS_FILE"
# fi

# Read the style file with unused keys
show_unused_style_keywords() {
  while IFS=: read -r key file line_number; do
    title "File: $file:$line_number"
    
    # Get lines before and after the error line
    lines_before=$((line_number - 3))
    lines_after=$((line_number + 3))
    
    # Print context of the error line
    sed -n "$lines_before,$lines_after p" "$file" | awk -v key="$key" '{gsub(key, "\033[1;31m"key"\033[0m"); print}'
    
    error "Unused key: $key"
    echo "--------------------------------"
  done < "$STYLES_KEYS_FILE"

  line_count=$(wc -l < $STYLES_KEYS_FILE)
  error "Unused keys: $line_count"
}

# Function to remove a keyword from the temp file
remove_keyword() {
  keyword="$1"
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
  find 'src' -type f \( "${FILE_EXTENSIONS[@]}" \) | while read -r file; do

    # Search for keywords starting with "styles"
    grep -E -o '\bstyles\.[a-zA-Z0-9_.]*' "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/' | while IFS= read -r keyword; do
        
        # Remove any [ ] characters from the keyword
        clean_keyword="${keyword//[\[\]]/}"
        # skip styles. keyword that might be used in comments
        if [[ "$clean_keyword" == "styles." ]]; then
          continue
        fi
        
        if ! remove_keyword "$clean_keyword" ; then
          # In case of a leaf of the styles object is being used, it meas the parent objects is being used
          # we need to mark it as used.
          if [[ "$clean_keyword" =~ ^styles\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$ ]]; then
            # Keyword has more than two words, remove words after the second word
            keyword_prefix="$(echo "$clean_keyword" | sed -E 's/(styles\.[a-zA-Z0-9_-]+)\..*/\1/')"
            remove_keyword "$keyword_prefix"
          fi        
        fi
    done

  done
}

# Function to find and store keys from a file
find_styles_and_store_keys() {
  local file="$1"
  local parent_keys=()
  local root_key=""
  local line_number=0  # Initialize the line number

  while IFS= read -r line; do
    ((line_number++))  # Increment the line number

    # Skip lines that are not key-related
    if [[ ! "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{|^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{|^[[:space:]]*\} && ! "$line" =~ ^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{ ]]; then
      continue
    fi
    # Handle keys defined in functions within objects
    function_key_pattern="^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{"
    if [[ "$line" =~ ^[[:space:]]*(const|let|var)[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{ ]]; then
      root_key=$(echo "${BASH_REMATCH[2]}" | sed -E "s/[:[:space:]]*\{.*//")
    elif [[ "$line" =~ ^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{ || "$line" =~ ^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{ ]]; then
      local key=$(echo "$line" | sed -E "s/[:[:space:]]*\{.*//")
      
      if [[ "$line" =~ ^[[:space:]]*([a-zA-Z0-9_-])+:[[:space:]]*\(.*\)[[:space:]]*'=>'[[:space:]]*\(\{  ]]; then
        key="${BASH_REMATCH[0]%%:*}"
      fi
      
      key="${key// /}"  # Trim spaces
      if [[ ${#parent_keys[@]} -gt 0 ]]; then
        parent_key_trimmed="${parent_keys[${#parent_keys[@]}-1]// /}"  # Trim spaces
        key="$parent_key_trimmed.$key"
      elif [[ -n "$root_key" ]]; then
        parent_key_trimmed="${root_key// /}"  # Trim spaces
        key="$parent_key_trimmed.$key"
      fi
    
      if [[ "$key" == "styles."* ]]; then
        echo "$key:$file:$line_number" >> "$STYLES_KEYS_FILE"
      else
        echo "styles.$key:$file:$line_number" >> "$STYLES_KEYS_FILE"
      fi
      parent_keys+=("$key")
    elif [[ "$line" =~ ^[[:space:]]*\} ]]; then
      parent_keys=("${parent_keys[@]:0:${#parent_keys[@]}-1}")
    fi
  done < "$file"
}

find_utility_styles_store_prefix() {
  # Loop through all files in the src folder
  find 'src/styles' -type f \( "${FILE_EXTENSIONS[@]}" \) | while read -r file; do

    # Search for keywords starting with "styles"
    grep -E -o './utilities/[a-zA-Z0-9_-]+' "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/' | while IFS= read -r keyword; do
        variable=$(echo "$keyword" | sed 's/.*\///')
        variable_trimmed="${variable// /}"  # Trim spaces
          
        echo "$variable_trimmed" >> "$UTILITY_STYLES_KEYS_FILE"
    done
  done

  # Sort and remove duplicates from the temporary file
  sort -u -o "$UTILITY_STYLES_KEYS_FILE" "$UTILITY_STYLES_KEYS_FILE"
}

find_utility_usage_as_styles() {
  find $UTILITIES_STYLES_FILE -type f \( "${FILE_EXTENSIONS[@]}" \) | while read -r file; do
    if [ -d "$path" ]; then
      # Use the folder name as the root key
      root_key=$(basename "$path")
      echo "styles.$root_key:$path:0" >> "$STYLES_KEYS_FILE"
      continue
    fi
    find_styles_and_store_keys $file
  done
}

lookfor_unused_utilities() {
  # Read each utility keyword from the file
  while read -r keyword; do
    # Creating a copy so later the replacement can reference it  
    original_keyword="$keyword"

    # Iterate through all files in "src/styles"
    find 'src/styles' -type f \( "${FILE_EXTENSIONS[@]}" \) | while read -r file; do
      # Find all words that match "$keyword.[a-zA-Z0-9_-]+"
      grep -E -o "$original_keyword\.[a-zA-Z0-9_-]+" "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/' | while IFS= read -r match; do
        # Replace the utility prefix with "styles"
        variable=$(echo "$match" | sed "s/^$original_keyword/styles/")

        # Call the remove_keyword function with the variable
        remove_keyword "$variable"
      done
    done
  done < "$UTILITY_STYLES_KEYS_FILE"
}

# Find and store the name of the utility files as keys
find_utility_styles_store_prefix

# Find and store keys from styles.js
find_styles_and_store_keys "$STYLES_FILE"

find_utility_usage_as_styles

# Look for usages of utilities into src/styles
lookfor_unused_utilities

echo "Keys saved to $KEYS_FILE"
echo "Now going through the list and removing the keys that are being used."

line_count=$(wc -l < $STYLES_KEYS_FILE)
echo "Number of styles found: $line_count"

lookfor_unused_keywords

echo "Unused keys are into to $STYLES_KEYS_FILE"

line_count2=$(wc -l < $STYLES_KEYS_FILE)
echo "Number of styles not being used: $line_count2"

show_unused_style_keywords

# Delete all temo files
find scripts -name "*keys_list_temp*" -type f -exec rm -f {} \;