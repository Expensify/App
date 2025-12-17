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

# Configuration for GitHub Projects (v2)
PROJECT_V2_OWNER="Expensify"
PROJECT_V2_TITLE="Deprecate Onyx.connect"
PROJECT_V2_ID=""

# Resolve and cache the Projects (v2) ID by title
get_project_v2_id() {
    if [[ -n "$PROJECT_V2_ID" ]]; then
        echo "$PROJECT_V2_ID"
        return 0
    fi

    local pid
    if pid=$(gh api graphql -f query='
        query($org:String!) {
          organization(login: $org) {
            projectsV2(first: 100) {
              nodes { id title number }
            }
          }
        }
    ' -f org="$PROJECT_V2_OWNER" --jq '.data.organization.projectsV2.nodes[] | select(.title == "'$PROJECT_V2_TITLE'") | .id' 2>/dev/null | head -n1); then
        if [[ -n "$pid" ]]; then
            PROJECT_V2_ID="$pid"
            echo "$PROJECT_V2_ID"
            return 0
        fi
    fi

    echo ""  # not found
    return 1
}

# Add an issue (by GraphQL node ID) to the configured Projects (v2) board
add_issue_to_project_v2() {
    local issue_node_id="$1"

    # Ensure we have a project id
    local project_id
    project_id=$(get_project_v2_id || true)
    if [[ -z "$project_id" ]]; then
        echo "Warning: Projects (v2) board '$PROJECT_V2_TITLE' not found for owner '$PROJECT_V2_OWNER'" >&2
        return 1
    fi

    # Rate limiting
    sleep 0.3

    # Use addProjectV2ItemById to add the issue to the v2 project
    if ! gh api graphql \
        -f query='mutation($projectId:ID!, $contentId:ID!) { addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) { item { id } } }' \
        -f projectId="$project_id" \
        -f contentId="$issue_node_id" > /dev/null 2>&1; then
        echo "Warning: Failed to add issue to Projects (v2). It may already be on the board." >&2
        return 1
    fi

    return 0
}

# Function to get repository owner and name
get_repo_info() {
    echo "Expensify/App"
}

# Function to get the GraphQL ID of the main deprecation issue
get_main_issue_id() {
    # Issue #522215 in Expensify/Expensify repository
    local main_issue_id
    if main_issue_id=$(gh api graphql -f query="
        query {
            repository(owner: \"Expensify\", name: \"Expensify\") {
                issue(number: 522215) {
                    id
                }
            }
        }
    " --jq '.data.repository.issue.id' 2>/dev/null); then
        echo "$main_issue_id"
        return 0
    else
        echo "Error: Could not get main deprecation issue ID" >&2
        return 1
    fi
}

# Function to check if an issue with the same title already exists
check_duplicate_issue() {
    local title="$1"

    # Search for issues with the exact title (case-insensitive)
    local existing_issue
    if existing_issue=$(gh issue list --search "\"$title\" in:title" --json number,title --jq '.[] | select(.title == "'"$title"'") | .number' 2>/dev/null); then
        if [[ -n "$existing_issue" ]]; then
            echo "$existing_issue"
            return 0
        fi
    fi

    # No duplicate found
    return 1
}

# Common template parts for issue bodies
get_parent_issue_reference() {
    echo "This is part of deprecating Onyx.connect. [Parent Issue](https://github.com/Expensify/Expensify/issues/522215)"
}

get_tdd_instructions() {
    echo "Be sure to refactor methods using test driven development:
1. Create a unit test for methods before refactoring
2. Refactor the methods
3. Ensure the unit test still runs after refactoring
4. Reinforce the unit testing with a functional test and a QA test
5. Once you are done, decrease the number of allowable ESLint warnings [here](https://github.com/Expensify/App/blob/e7b5ac9401e2ae9b5c2c70ec513e8de6f5279d7d/package.json#L48) to equal the number of \`Onyx.connect\` references remaining in the code"
}

# Function to build parent issue body
build_parent_issue_body() {
    local file_path="$1"

    cat << EOF
$(get_parent_issue_reference)

Module: [${file_path}](https://github.com/Expensify/App/blob/main/${file_path})

This issue tracks the refactoring of \`Onyx.connect\` references in \`${file_path}\`.
EOF
}

# Function to build sub-issue body
build_sub_issue_body() {
    local file_path="$1"
    local onyx_key="$2"
    local content="$3"

    cat << EOF
$(get_parent_issue_reference)

## Details
- **Module**: [${file_path}](https://github.com/Expensify/App/blob/main/${file_path})
- **Onyx Key**: \`${onyx_key}\`
- **Reference**: \`${content}\`

$(get_tdd_instructions)
EOF
}

# Function to create a GitHub issue and return both number and ID (separated by |)
# Returns "DUPLICATE|existing_number" if duplicate found
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local assignee="$4"

    # Check for duplicate issues first
    local duplicate_number
    if duplicate_number=$(check_duplicate_issue "$title"); then
        echo "DUPLICATE|$duplicate_number"
        return 0
    fi

    # Add rate limiting to avoid hitting GitHub API limits
    sleep 1

    # Create the issue with assignee and labels
    local issue_url
    if ! issue_url=$(gh issue create \
        --title "$title" \
        --body "$body" \
        --assignee "$assignee" \
        --label "$labels" 2>&1); then
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

# Function to add a comment to an issue
add_issue_comment() {
    local issue_number="$1"
    local comment_body="$2"

    # Add rate limiting
    sleep 0.5

    if ! gh issue comment "$issue_number" --body "$comment_body" > /dev/null 2>&1; then
        echo "Warning: Failed to add comment to issue #$issue_number" >&2
        return 1
    fi
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

# Function to get assignee for parent issues (alternates between tgolen and danieldoglas)
get_parent_assignee() {
    local parent_count="$1"
    if (( parent_count % 2 == 0 )); then
        echo "tgolen"
    else
        echo "danieldoglas"
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
current_parent_assignee=""
parent_issues_created=0
sub_issues_created=0
links_created=0
parent_duplicates_skipped=0
sub_duplicates_skipped=0
total_issues_created=0

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
        parent_title="Refactor \`${file_path}\` to remove \`Onyx.connect()\` references"
        parent_body=$(build_parent_issue_body "$file_path")

        if [[ "$DRY_RUN" == true ]]; then
            echo "PARENT ISSUE:"
            echo "  Title: $parent_title"
            echo "  File: $file_path"

            # Check for duplicates in dry-run mode too (if GitHub CLI is authenticated)
            if command -v gh &> /dev/null && gh auth status &> /dev/null; then
                if duplicate_number=$(check_duplicate_issue "$parent_title"); then
                    echo "  Status: DUPLICATE - issue #$duplicate_number already exists"
                    ((parent_duplicates_skipped++))
                    current_parent_id="$duplicate_number|dry-run-parent-id"
                    # Set assignee for the duplicate parent for consistency with sub-issues
                    current_parent_assignee=$(get_parent_assignee $parent_issues_created)
                else
                    echo "  Status: WOULD CREATE"
                    ((parent_issues_created++))
                    current_parent_id="dry-run-parent-number|dry-run-parent-id"
                                        # Set assignee for the new parent
                    current_parent_assignee=$(get_parent_assignee $parent_issues_created)
                fi
            else
                echo "  Status: WOULD CREATE (duplicate check skipped - GitHub CLI not authenticated)"
                ((parent_issues_created++))
                current_parent_id="dry-run-parent-number|dry-run-parent-id"
                # Set assignee for the new parent
                current_parent_assignee=$(get_parent_assignee $parent_issues_created)
            fi
            echo ""
        else
            assignee=$(get_parent_assignee $parent_issues_created)
            current_parent_assignee="$assignee"
            echo "Creating parent issue: $parent_title (assigned to $assignee)"
            if current_parent_id=$(create_issue "$parent_title" "$parent_body" "Engineering,Improvement,Monthly" "$assignee"); then
                parent_number=$(echo "$current_parent_id" | cut -d'|' -f1)
                parent_id=$(echo "$current_parent_id" | cut -d'|' -f2)

                if [[ "$parent_number" == "DUPLICATE" ]]; then
                    echo "Skipped - duplicate parent issue already exists: #$parent_id"
                    ((parent_duplicates_skipped++))
                    # For duplicates, we need to get the actual issue ID for linking
                    if actual_parent_id=$(gh issue view "$parent_id" --json id --jq ".id" 2>/dev/null); then
                        current_parent_id="$parent_id|$actual_parent_id"
                        # For duplicates, we still need to set the assignee for sub-issues
                        # We'll use the current assignee rotation for consistency
                        current_parent_assignee="$assignee"
                        # Try to add duplicate parent issue to Projects (v2)
                        if ! add_issue_to_project_v2 "$actual_parent_id"; then
                            echo "Note: Could not add existing parent issue #$parent_id to Projects (v2)" >&2
                        fi
                    else
                        current_parent_id=""
                        current_parent_assignee=""
                        continue
                    fi
                else
                    echo "Created parent issue #$parent_number with ID: $parent_id"
                    ((parent_issues_created++))
                    ((total_issues_created++))

                    # Add parent issue to Projects (v2)
                    if ! add_issue_to_project_v2 "$parent_id"; then
                        echo "Note: Could not add parent issue #$parent_number to Projects (v2)" >&2
                    fi

                    # Link this parent issue to the main deprecation issue
                    echo "Linking parent issue to main deprecation issue #522215..."
                    if main_issue_id=$(get_main_issue_id); then
                        if gh api graphql -H "GraphQL-Features: sub_issues" -f "query=mutation addSubIssue {
                            addSubIssue(input: {
                                issueId: \"$main_issue_id\",
                                subIssueId: \"$parent_id\"
                            }) {
                                issue {
                                    title
                                }
                                subIssue {
                                    title
                                }
                            }
                        }" > /dev/null 2>&1; then
                            echo "Linked parent issue to main deprecation issue"
                        else
                            echo "Warning: Failed to link parent issue to main deprecation issue" >&2
                        fi
                    else
                        echo "Warning: Could not get main deprecation issue ID for linking" >&2
                    fi
                fi
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
        sub_title="Remove \`Onyx.connect()\` for the key: \`${onyx_key}\` in \`${current_file_path}\`"
        sub_body=$(build_sub_issue_body "$current_file_path" "$onyx_key" "$content")

                if [[ "$DRY_RUN" == true ]]; then
            echo "  SUB-ISSUE:"
            echo "    Title: $sub_title"
            echo "    File: $current_file_path"
            echo "    Onyx Key: $onyx_key"
            echo "    Reference: $content"

            # Check for duplicates in dry-run mode too (if GitHub CLI is authenticated)
            if command -v gh &> /dev/null && gh auth status &> /dev/null; then
                if duplicate_number=$(check_duplicate_issue "$sub_title"); then
                    echo "    Status: DUPLICATE - issue #$duplicate_number already exists"
                    ((sub_duplicates_skipped++))
                else
                    echo "    Status: WOULD CREATE (with Bug label and Bug-Zero comment)"
                    ((sub_issues_created++))
                    # In dry-run, assume all sub-issues would be linked
                    ((links_created++))
                fi
            else
                echo "    Status: WOULD CREATE (with Bug label and Bug-Zero comment - duplicate check skipped - GitHub CLI not authenticated)"
                ((sub_issues_created++))
                # In dry-run, assume all sub-issues would be linked
                ((links_created++))
            fi
            echo ""
        else
            # Use the same assignee as the parent issue
            assignee="$current_parent_assignee"
            echo "Creating sub-issue: $sub_title (assigned to $assignee)"
            if sub_id=$(create_issue "$sub_title" "$sub_body" "Engineering,Improvement,Weekly" "$assignee"); then
                sub_number=$(echo "$sub_id" | cut -d'|' -f1)
                sub_issue_id=$(echo "$sub_id" | cut -d'|' -f2)

                if [[ "$sub_number" == "DUPLICATE" ]]; then
                    echo "Skipped - duplicate sub-issue already exists: #$sub_issue_id"
                    ((sub_duplicates_skipped++))
                    # For duplicates, we can still try to link if it's not already linked
                    if [[ -n "$current_parent_id" ]]; then
                        if actual_sub_id=$(gh issue view "$sub_issue_id" --json id --jq ".id" 2>/dev/null); then
                            duplicate_sub_data="$sub_issue_id|$actual_sub_id"
                            # Try to add duplicate sub-issue to Projects (v2)
                            if ! add_issue_to_project_v2 "$actual_sub_id"; then
                                echo "Note: Could not add existing sub-issue #$sub_issue_id to Projects (v2)" >&2
                            fi
                            echo "Checking if duplicate sub-issue is already linked to parent..."
                            if link_sub_issue "$current_parent_id" "$duplicate_sub_data" 2>/dev/null; then
                                echo "Linked existing sub-issue to parent issue"
                                ((links_created++))
                            else
                                echo "Note: Duplicate sub-issue may already be linked to parent"
                            fi
                        fi
                    fi
                else
                    echo "Created sub-issue #$sub_number with ID: $sub_issue_id"
                    ((sub_issues_created++))
                    ((total_issues_created++))

                    # Add sub-issue to Projects (v2)
                    if ! add_issue_to_project_v2 "$sub_issue_id"; then
                        echo "Note: Could not add sub-issue #$sub_number to Projects (v2)" >&2
                    fi

                    # Add Bug-Zero comment to sub-issue
                    bug_zero_comment="> [!WARNING]
> DO NOT POST PROPOSALS ON THIS ISSUE!!

# Bug-Zero Instructions
- **This issue is CLOSED for proposals**
- It is a special issue and part of a bigger project
- A contributor will be manually assigned to work on this issue and they do not need to submit a proposal
- The bug-zero person only needs to take care of payments to the contributor for the PR and the C+ for reviews
- There do not need to be any regression tests added or updated since this is only refactoring and shouldn't change any existing functionality"

                    echo "Adding Bug-Zero comment to sub-issue..."
                    if add_issue_comment "$sub_number" "$bug_zero_comment"; then
                        echo "Added Bug-Zero comment to sub-issue"
                    else
                        echo "Warning: Failed to add Bug-Zero comment to sub-issue #$sub_number" >&2
                    fi

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
    echo "Files to be processed: $((parent_issues_created + parent_duplicates_skipped))"
    echo "Parent issues that would be created: $parent_issues_created"
    echo "Parent issues that already exist (duplicates): $parent_duplicates_skipped"
    echo "Sub-issues that would be created: $sub_issues_created"
    echo "Sub-issues that already exist (duplicates): $sub_duplicates_skipped"
    echo "Total NEW issues that would be created: $((parent_issues_created + sub_issues_created))"
    echo "Issue links that would be created: $links_created"
    echo ""
    echo "To create these issues, run: $0"
    echo "====================================================="
else
    echo "================== SUMMARY =================="
    echo "Finished processing onyxrefs.txt"
    echo "Parent issues created: $parent_issues_created"
    echo "Parent issues skipped (duplicates): $parent_duplicates_skipped"
    echo "Sub-issues created: $sub_issues_created"
    echo "Sub-issues skipped (duplicates): $sub_duplicates_skipped"
    echo "Issue links created: $links_created"
    echo "Total NEW issues created: $((parent_issues_created + sub_issues_created))"
    echo "Total duplicates skipped: $((parent_duplicates_skipped + sub_duplicates_skipped))"
    echo ""
    echo "Parent issues assigned alternately to: tgolen and danieldoglas"
    echo "Sub-issues assigned to same assignee as their parent issue"
    echo "Parent issues labeled with: Engineering, Improvement"
    echo "Sub-issues labeled with: Engineering, Improvement, Bug"
    echo "Sub-issues include Bug-Zero instructions comment"
    echo "You can view all created issues at: https://github.com/$(get_repo_info)/issues"
    echo "=============================================="
fi
