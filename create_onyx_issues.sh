#!/bin/bash

# Script to create GitHub issues from onyxrefs.txt file
# This script creates parent issues for *** lines and sub-issues for >>> lines
# and links them using GitHub GraphQL API
#
# Usage: ./create_onyx_issues.sh [--dry-run|-d]
#   --dry-run, -d    Show what would be created without actually creating issues

set -e

# Parse command line arguments
DRY_RUN=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run|-d)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--dry-run|-d]"
            echo "  --dry-run, -d    Show what would be created without actually creating issues"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check if GitHub CLI is available (skip in dry-run mode)
if [[ "$DRY_RUN" == false ]]; then
    if ! command -v gh &> /dev/null; then
        echo "Error: GitHub CLI (gh) is not installed or not in PATH"
        exit 1
    fi

    # Check if GitHub CLI is authenticated
    if ! gh auth status &> /dev/null; then
        echo "Error: GitHub CLI is not authenticated. Please run 'gh auth login' first."
        exit 1
    fi
fi

# Check if onyxrefs.txt exists
if [ ! -f "onyxrefs.txt" ]; then
    echo "Error: onyxrefs.txt file not found"
    exit 1
fi

# Function to get repository owner and name
get_repo_info() {
    echo "Expensify/App"
}

# Function to create a GitHub issue and return both number and ID (separated by |)
create_issue() {
    local title="$1"
    local body="$2"

    # Add rate limiting to avoid hitting GitHub API limits
    sleep 1

    # Create the issue and capture the output
    local issue_url
    if ! issue_url=$(gh issue create --title "$title" --body "$body" 2>&1); then
        echo "Error creating issue: $issue_url" >&2
        return 1
    fi

    # Extract issue number from URL (last part after the last /)
    local issue_number=$(echo "$issue_url" | sed 's/.*\///')

    # Get the issue ID using the simpler gh issue view command
    local issue_id
    if ! issue_id=$(gh issue view "$issue_number" --json id --jq ".id" 2>&1); then
        echo "Error getting issue ID: $issue_id" >&2
        return 1
    fi

    # Return both number and ID separated by |
    echo "${issue_number}|${issue_id}"
}

# Function to link sub-issue to parent issue using GitHub's native sub-issue feature
# Expects format: "number|id" for both parent and sub parameters
link_sub_issue() {
    local parent_data="$1"
    local sub_data="$2"

    # Add rate limiting
    sleep 0.5

    # Extract IDs from the data
    local parent_id=$(echo "$parent_data" | cut -d'|' -f2)
    local sub_id=$(echo "$sub_data" | cut -d'|' -f2)

    # Use GitHub's native addSubIssue mutation to create proper parent-child relationship
    if ! gh api graphql -H "GraphQL-Features: sub_issues" -f "query=mutation addSubIssue {
        addSubIssue(input: {
            issueId: \"$parent_id\",
            subIssueId: \"$sub_id\"
        }) {
            issue {
                title
            }
            subIssue {
                title
            }
        }
    }" > /dev/null 2>&1; then
        echo "Warning: Failed to link sub-issue to parent using addSubIssue mutation" >&2
        return 1
    fi
}

# Main processing
if [[ "$DRY_RUN" == true ]]; then
    echo "DRY RUN MODE - No issues will be created"
    echo "========================================"
    echo ""
    echo "Processing onyxrefs.txt..."
else
    echo "Starting to process onyxrefs.txt..."
    echo "Repository: $(get_repo_info)"
fi

current_parent_id=""
current_file_path=""
parent_issues_created=0
sub_issues_created=0
links_created=0

while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines
    if [[ -z "$line" ]]; then
        continue
    fi

    # Check if line starts with ***
    if [[ "$line" == \*\*\** ]]; then
        # Extract file path (everything after ***)
        file_path="${line#\*\*\*}"
        current_file_path="$file_path"

                # Create parent issue
        parent_title="Refactor ${file_path} Onyx.connect references"
        parent_body="This issue tracks the refactoring of Onyx.connect references in ${file_path}.

## Sub-issues
Sub-issues will be created for each specific Onyx.connect reference that needs to be removed.

## Context
This is part of a larger effort to refactor Onyx.connect usage throughout the codebase."

        if [[ "$DRY_RUN" == true ]]; then
            echo "PARENT ISSUE:"
            echo "  Title: $parent_title"
            echo "  File: $file_path"
            echo ""
            ((parent_issues_created++))
            current_parent_id="dry-run-parent-number|dry-run-parent-id"
        else
            echo "Creating parent issue: $parent_title"
            if current_parent_id=$(create_issue "$parent_title" "$parent_body"); then
                local parent_number=$(echo "$current_parent_id" | cut -d'|' -f1)
                local parent_id=$(echo "$current_parent_id" | cut -d'|' -f2)
                echo "Created parent issue #$parent_number with ID: $parent_id"
                ((parent_issues_created++))
            else
                echo "Failed to create parent issue for $file_path" >&2
                current_parent_id=""
                continue
            fi
        fi

    # Check if line starts with >>>
    elif [[ "$line" == \>\>\>* ]]; then
        # Extract the content after >>>
        content="${line#\>\>\> }"

        # Extract the ONYX key name (everything after the colon and space)
        if [[ "$content" == *": "* ]]; then
            onyx_key="${content##*: }"
        else
            onyx_key="$content"
        fi

                # Create sub-issue
        sub_title="Remove Onyx.connect reference: ${onyx_key} in ${current_file_path}"
        sub_body="Remove the Onyx.connect reference for \`${onyx_key}\` in \`${current_file_path}\`.

## Details
- **File**: \`${current_file_path}\`
- **Onyx Key**: \`${onyx_key}\`
- **Reference**: ${content}

## Context
This is part of refactoring Onyx.connect usage. The reference should be replaced with the appropriate modern Onyx pattern.

## Parent Issue
This is a sub-issue of the main refactoring issue for this file."

                if [[ "$DRY_RUN" == true ]]; then
            echo "  SUB-ISSUE:"
            echo "    Title: $sub_title"
            echo "    File: $current_file_path"
            echo "    Onyx Key: $onyx_key"
            echo "    Reference: $content"
            echo ""
            ((sub_issues_created++))
            ((links_created++))  # In dry-run, assume all sub-issues would be linked
        else
            echo "Creating sub-issue: $sub_title"
            if sub_id=$(create_issue "$sub_title" "$sub_body"); then
                local sub_number=$(echo "$sub_id" | cut -d'|' -f1)
                local sub_issue_id=$(echo "$sub_id" | cut -d'|' -f2)
                echo "Created sub-issue #$sub_number with ID: $sub_issue_id"
                ((sub_issues_created++))

                # Link sub-issue to parent issue
                if [[ -n "$current_parent_id" ]]; then
                    echo "Linking sub-issue to parent..."
                    if link_sub_issue "$current_parent_id" "$sub_id"; then
                        echo "Linked sub-issue to parent issue"
                        ((links_created++))
                    else
                        echo "Warning: Failed to link sub-issue to parent" >&2
                    fi
                else
                    echo "Warning: No parent issue ID available for linking" >&2
                fi
            else
                echo "Failed to create sub-issue for $onyx_key in $current_file_path" >&2
            fi
        fi
    fi

done < "onyxrefs.txt"

echo ""
if [[ "$DRY_RUN" == true ]]; then
    echo "================== DRY RUN SUMMARY =================="
    echo "Files to be processed: $parent_issues_created"
    echo "Parent issues that would be created: $parent_issues_created"
    echo "Sub-issues that would be created: $sub_issues_created"
    echo "Total issues that would be created: $((parent_issues_created + sub_issues_created))"
    echo "Issue links that would be created: $links_created"
    echo ""
    echo "To create these issues, run: $0"
    echo "====================================================="
else
    echo "================== SUMMARY =================="
    echo "Finished processing onyxrefs.txt"
    echo "Parent issues created: $parent_issues_created"
    echo "Sub-issues created: $sub_issues_created"
    echo "Issue links created: $links_created"
    echo "Total issues created: $((parent_issues_created + sub_issues_created))"
    echo ""
    echo "You can view all created issues at: https://github.com/$(get_repo_info)/issues"
    echo "=============================================="
fi
