#!/bin/bash

# Script to aggregate error titles from job_errors_titles directory
# Usage: ./job_error_aggregator.sh [directory] [output_file]

# Default directory or use first argument
ERROR_TITLES_DIR="${1:-job_errors_titles}"
OUTPUT_FILE="${2:-job_error_report.md}"

# Check if directory exists
if [ ! -d "$ERROR_TITLES_DIR" ]; then
    echo "Error: Directory '$ERROR_TITLES_DIR' does not exist"
    exit 1
fi

# Check if directory has any files
file_count=$(find "$ERROR_TITLES_DIR" -type f | wc -l | xargs)
if [ "$file_count" -eq 0 ]; then
    echo "Error: No files found in '$ERROR_TITLES_DIR'"
    exit 1
fi

echo "Aggregating errors from $file_count files in '$ERROR_TITLES_DIR'..."
echo "Output will be saved to: $OUTPUT_FILE"
echo ""

# Create a temporary file to store all error messages
temp_file=$(mktemp)

# Read all files and extract error messages (removing the ❌ **Error:** prefix)
for file in "$ERROR_TITLES_DIR"/*.txt; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        # Extract the error message part after "❌ **Error:** "
        sed 's/^❌ \*\*Error:\*\* //' "$file" >> "$temp_file"
    fi
done

# Calculate summary statistics
total_errors=$(wc -l < "$temp_file" | xargs)
unique_errors=$(sort "$temp_file" | uniq | wc -l | xargs)

# Generate report header
{
    echo "# Error Frequency Report"
    echo ""
    echo "**Generated:** $(date '+%Y-%m-%d %H:%M:%S')"
    echo "**Source Directory:** \`$ERROR_TITLES_DIR\`"
    echo "**Files Processed:** $file_count"
    echo ""
    echo "## Summary"
    echo ""
    echo "- **Total errors:** $total_errors"
    echo "- **Unique errors:** $unique_errors"
    echo ""
    echo "## Error Breakdown"
    echo ""
    echo "| Count | Error Message |"
    echo "|------:|---------------|"
    
    # Sort, count unique lines, sort by count (descending), and format as table
    sort "$temp_file" | uniq -c | sort -rn | while read -r count error; do
        printf "| %d | \`%s\` |\n" "$count" "$error"
    done
} > "$OUTPUT_FILE"

# Display the report on console
cat "$OUTPUT_FILE"

echo ""
echo "✅ Report saved to: $OUTPUT_FILE"

# Cleanup
rm "$temp_file"

