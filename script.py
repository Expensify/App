import json
import re

# Load ESLint result 
with open('result.json', 'r') as f:
    eslint_result = json.load(f)

files = {}
# Loop over entries in eslint result
for entry in eslint_result:
    file_path = entry['filePath']

    # If file is not already processed, load its content
    if file_path not in files:
        with open(file_path, 'r') as f:
            file_content = f.read().split('\n')
            files[file_path] = file_content

    for message in entry['messages']:
        line_number = message['line']
        rule_id = message['ruleId']

        # Prepare eslint disable line
        eslint_line = f'// eslint-disable-next-line {rule_id}'

        # Add eslint line at appropriate position
        files[file_path].insert(line_number - 1, eslint_line)

# Overwrite files
for file_path, content in files.items():
    new_content = '\n'.join(content)

    with open(file_path, 'w') as f:
        f.write(new_content)