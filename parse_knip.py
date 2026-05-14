#!/usr/bin/env python3
import re

# Read the clean report
with open('knip.full.report.clean.txt', 'r') as f:
    lines = f.readlines()

# Parse the report
sections = {}
current_section = None

for line in lines:
    line = line.rstrip()
    if not line:
        continue
    
    # Check if it's a section header (e.g., "Unused files (64)")
    match = re.match(r'^([A-Za-z\s]+?)\s*\((\d+)\)$', line)
    if match:
        current_section = match.group(1).strip()
        sections[current_section] = []
    elif current_section is not None:
        # This is an item in the current section
        sections[current_section].append(line)

# Write TSV file
with open('knip.full.parsed.tsv', 'w') as f:
    f.write("SECTION\tITEM\n")
    for section, items in sections.items():
        for item in items:
            f.write(f"{section}\t{item}\n")

# Print parsing summary
print("Parsed sections:")
for section, items in sections.items():
    print(f"  {section}: {len(items)} items")
