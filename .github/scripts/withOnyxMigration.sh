#!/bin/bash

RED='\033[0;31m'
ORANGE='\033[0;33m'
GREEN='\033[0;32m'
BOLD_WHITE='\033[1;37m'

# Set IFS to newline to properly handle file names with spaces.
# This makes 'for' loop treat each line as a separate item.
IFS=$'\n'

# Fetch the main branch
git fetch origin main --no-tags --depth=1

# Get the list of modified and added files
modified_files=$(git diff --name-only --diff-filter=AM origin/main HEAD -- '*.tsx')

# Count instances of 'withOnyx' on main branch and current branch
count_main=0
count_current=0

echo -e "\nWe're gradually moving from 'withOnyx' to 'useOnyx'. 'useOnyx' hook simplifies the code, offers performance benefits and improves TypeScript compilation time."
echo -e "For more details, see https://expensify.slack.com/archives/C01GTK53T8Q/p1725905735105989.\n"
echo -e "${BOLD_WHITE}If you are blocked by this on something that is very urgent, you can always ignore this check and merge with it failing.\n"

if [ -z "$modified_files" ]; then
  echo -e "${GREEN}No changes detected. Exiting."
  exit 0
fi

for file in $modified_files; do
  # 2>/dev/null is used to ignore errors when the file doesn't exist in the main branch
  count_main_file=$(git show origin/main:"$file" 2>/dev/null | grep -o 'withOnyx<' | wc -l)
  count_current_file=$(grep -o 'withOnyx<' "$file" | wc -l)
  
  count_main=$((count_main + count_main_file))
  count_current=$((count_current + count_current_file))

  if ((count_current_file > 0 && count_current_file >= count_main_file)); then
    echo -e "${ORANGE}WARNING: '$file' was modified on this branch and still contains 'withOnyx' usages. Consider replacing it with 'useOnyx' hooks."
  fi
done

if ((count_current == 0 && count_main == 0)); then
  echo -e "${GREEN}No changes detected. Exiting."
  exit 0
fi

if ((count_current == count_main)); then
  echo -e "${RED}\nERROR: There's no reduction of 'withOnyx' usages on the current branch compared to main. Please migrate one of the above files to use 'useOnyx' hooks instead."
  exit 1
fi

if ((count_current > count_main)); then
  echo -e "${RED}\nERROR: There's an increase in 'withOnyx' usages on the current branch compared to main. Please migrate it to use 'useOnyx' hooks instead."
  exit 1
fi

echo -e "${GREEN}\nIn the modified files, the usage of 'withOnyx' has been reduced from $count_main to $count_current. Great job!"
