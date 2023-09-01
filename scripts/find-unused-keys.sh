#!/bin/bash

# Configurations
SRC_DIR="src"
STYLES_FILE="src/styles/styles.js"
STYLES_KEYS_FILE="scripts/style_keys_list_temp.txt"
TRANSLATION_KEYS_FILE="scripts/translations_keys_list_temp.txt"
REMOVAL_KEYS_FILE="scripts/removal_keys_list_temp.txt"
  
# Create an empty temp file if it doesn't exist
if [ ! -f "$REMOVAL_KEYS_FILE" ]; then
    touch "$REMOVAL_KEYS_FILE"
fi

# Read the style file with unused keys
show_unused_style_keywords() {
  while IFS=: read -r key file line_number; do
    line_count=$(wc -l < $STYLES_KEYS_FILE)
    echo "Unused keys: $line_count"
    echo "File: $file"
    
    # Get lines before and after the error line
    lines_before=$((line_number - 3))
    lines_after=$((line_number + 3))
    
    # Print context of the error line
    echo "Context around line $line_number:"
    sed -n "$lines_before,$lines_after p" "$file" | awk -v key="$key" '{gsub(key, "\033[1;31m"key"\033[0m"); print}'
    
    echo "Unused key: $key"
    echo "--------------------------------"
  done < "$STYLES_KEYS_FILE"
}

# Function to remove a keyword from the temp file
remove_keyword() {
  keyword="$1"
  
  grep -v "$keyword" "$STYLES_KEYS_FILE" > "$REMOVAL_KEYS_FILE"
  line_count=$(wc -l < $REMOVAL_KEYS_FILE)
  mv "$REMOVAL_KEYS_FILE" "$STYLES_KEYS_FILE"
}

lookfor_unused_keywords() {
  # Loop through all files in the src folder
  find 'src' -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" | while read -r file; do

      # Search for keywords starting with "styles"
      grep -E -o '\bstyles\.[a-zA-Z0-9_.]*' "$file" | grep -v '\/\/' | grep -vE '\/\*.*\*\/' | while IFS= read -r keyword; do

        # Remove any [ ] characters from the keyword
        clean_keyword="${keyword//[\[\]]/}"
        # skip styles. keyword that might be used in comments
        if [[ "$clean_keyword" == "styles." ]]; then
          continue
        fi
        
        remove_keyword "$clean_keyword"
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
    if [[ ! "$line" =~ ^[[:space:]]*const[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{|^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{|^[[:space:]]*\} ]]; then
      continue
    fi

    if [[ "$line" =~ ^[[:space:]]*const[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{ ]]; then
      root_key=$(echo "${BASH_REMATCH[1]}" | sed -E "s/[:[:space:]]*\{.*//")
    elif [[ "$line" =~ ^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{ ]]; then
      local key=$(echo "$line" | sed -E "s/[:[:space:]]*\{.*//")
      # local line_number=$(echo "$line" | grep -n "$key:" | cut -d':' -f1)
      echo "line $line"
      # Handle keys defined in functions within objects
       function_key_pattern="[a-zA-Z0-9_-]+:[[:space:]]*\\(.*\\)[[:space:]]*=>[[:space:]]*\\{"
      if [[ "$line" =~ $function_key_pattern ]]; then
        key="${BASH_REMATCH[0]%%:*}"
      fi
      
      if [[ ${#parent_keys[@]} -gt 0 ]]; then
        parent_key_trimmed="${parent_keys[${#parent_keys[@]}-1]// /}"  # Trim spaces
        key_trimmed="${key// /}"  # Trim spaces
        key="$parent_key_trimmed.$key_trimmed"
      elif [[ -n "$root_key" ]]; then
        parent_key_trimmed="${root_key// /}"  # Trim spaces
        key_trimmed="${key// /}"  # Trim spaces
        key="$parent_key_trimmed.$key_trimmed"
      fi
    
      # echo "$key:$file:$line_number" >> "$STYLES_KEYS_FILE"
      if [[ "$key" == "styles."* ]]; then
        echo "$key:$file:$line_number" >> "$STYLES_KEYS_FILE"
      else
        echo "styles.$key:$file:$line_number" >> "$STYLES_KEYS_FILE"
      fi
      parent_keys+=("$key")
    elif [[ "$line" =~ ^[[:space:]]*\} ]]; then
      # unset "parent_keys[${#parent_keys[@]}-1]"
      parent_keys=("${parent_keys[@]:0:${#parent_keys[@]}-1}")
    fi
  # done < <(grep -E "^[[:space:]]*const[[:space:]]+([a-zA-Z0-9_-]+)[[:space:]]*=[[:space:]]*\{|^[[:space:]]*([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:[[:space:]]*\{|^[[:space:]]*\}" "$file")
  done < "$file"
}

# Find and store keys from styles.js
find_styles_and_store_keys "$STYLES_FILE"

echo "Keys saved to $KEYS_FILE"
echo "Now go through the list and remove the keys that are used."

line_count=$(wc -l < $STYLES_KEYS_FILE)
echo "Number of lines in the file: $line_count"

# lookfor_unused_keywords

echo "Unused keys are into to $STYLES_KEYS_FILE"

line_count2=$(wc -l < $STYLES_KEYS_FILE)
echo "Number of lines in the file: $line_count2"

# show_unused_style_keywords