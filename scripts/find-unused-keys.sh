#!/bin/bash

# Configurations
SRC_DIR="src"
STYLES_FILE="src/styles/styles.js"
TRANSLATION_FILES=("src/languages/es.js" "src/languages/en.js")
KEYS_LIST_FILE="keys_list.txt"

# Function to find and store keys from a file
find_and_store_keys() {
  local file="$1"
  local file_keys=($(grep -Eo "([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+:" "$file" | sed -E "s/[:]//g"))
  
  for key in "${file_keys[@]}"; do
    local line_numbers=($(grep -n "$key" "$file" | cut -d':' -f1))
    for line_number in "${line_numbers[@]}"; do
      echo "$key:$file:$line_number"
    done
  done
}

# Function to remove keys from the list
remove_keys() {
  local file="$1"
  local list_file="$2"
  
  while IFS= read -r key_info; do
    local key=$(echo "$key_info" | cut -d':' -f1)
    local key_file=$(echo "$key_info" | cut -d':' -f2)
    if [[ "$key_file" != "$file" ]]; then
      echo "$key_info"
    fi
  done < "$list_file"
}

# Function to find unused keys in a file
find_unused_keys_in_file() {
  local file="$1"
  local list_file="$2"
  local unused_keys=()
  
  while IFS= read -r key_info; do
    local key=$(echo "$key_info" | cut -d':' -f1)
    local key_file=$(echo "$key_info" | cut -d':' -f2)
    local line_number=$(echo "$key_info" | cut -d':' -f3)
    if [[ "$key_file" != "$file" ]]; then
      continue
    fi
    
    if ! grep -q "$key" "$file"; then
      # Check if the line number contains a numeric value
      if [[ "$line_number" =~ ^[0-9]+$ ]]; then
        unused_keys+=("$key_info")
      fi
    fi
  done < "$list_file"
  
  for unused_key_info in "${unused_keys[@]}"; do
    echo "Error: Unused key '$(echo "$unused_key_info" | cut -d':' -f1)' found in '$file' at line: $(echo "$unused_key_info" | cut -d':' -f3)"
  done
}

# Find and store keys from styles.js (only top-level keys)
grep -Eo "^[[:space:]]*[a-zA-Z0-9_-]+:" "$STYLES_FILE" | sed -E "s/[:]//g" | while IFS= read -r key; do
  echo "$key:$STYLES_FILE:0"
done > "$KEYS_LIST_FILE"

# Find and store keys from translation files
for translation_file in "${TRANSLATION_FILES[@]}"; do
  find_and_store_keys "$translation_file" >> "$KEYS_LIST_FILE"
done

# Find and remove used keys from the list
while IFS= read -r file; do
  remove_keys "$file" "$KEYS_LIST_FILE" > keys_list_temp.txt
  mv keys_list_temp.txt "$KEYS_LIST_FILE"
done < <(find "$SRC_DIR" -type f)

# Find unused keys in all files
unused_keys_found=false
while IFS= read -r file; do
  unused_keys_in_file=$(find_unused_keys_in_file "$file" "$KEYS_LIST_FILE")
  if [[ -n "$unused_keys_in_file" ]]; then
    unused_keys_found=true
    echo "$unused_keys_in_file"
  fi
done < <(find "$SRC_DIR" -type f)

if [[ "$unused_keys_found" = false ]]; then
  echo "No unused keys found."
fi