#!/bin/bash

# Script to collect and cache claude-review workflow run data
# Usage: ./claude_review_collector.sh [limit]
#   limit: Number of workflow runs to fetch (default: 100)
#
# Required environment variables:
#   GITHUB_USER_SESSION: GitHub user session cookie for authenticated requests
#
# Note: GitHub CLI (gh) must be authenticated for API requests

WORKFLOW="claude-review.yml"

# Validate required environment variables
if [ -z "$GITHUB_USER_SESSION" ]; then
    echo "Error: GITHUB_USER_SESSION environment variable is not set"
    echo "Please set it with: export GITHUB_USER_SESSION='your_session_token'"
    exit 1
fi

# Workflow runs limit (default: 100, can be overridden by first argument)
RUNS_LIMIT="${1:-100}"

# Cache directories
JOB_SUMMARY_URL_DIR="job_summary_url"
JOB_SUMMARY_MD_DIR="job_summary_md"
JOB_ERRORS_DIR="job_errors"
JOB_ERRORS_TITLES_DIR="job_errors_titles"

# Create cache directories if they don't exist
mkdir -p "$JOB_SUMMARY_URL_DIR"
mkdir -p "$JOB_SUMMARY_MD_DIR"
mkdir -p "$JOB_ERRORS_DIR"
mkdir -p "$JOB_ERRORS_TITLES_DIR"

# Get run ids for the workflow
echo "Fetching up to $RUNS_LIMIT workflow runs for '$WORKFLOW'..."
RUNS=$(gh run list --workflow "$WORKFLOW" --status success --json databaseId,url --limit "$RUNS_LIMIT")

# Count total runs
TOTAL_RUNS=$(echo "$RUNS" | jq '. | length')
echo "Found $TOTAL_RUNS workflow run(s)"
echo ""

# Iterate over each run and make a curl request to /attempts/1
echo "$RUNS" | jq -r '.[] | .url' | while read -r run_url; do
    run_id=$(basename "$run_url")
    
    # Define cache file paths
    url_cache_file="${JOB_SUMMARY_URL_DIR}/${run_id}.txt"
    md_cache_file="${JOB_SUMMARY_MD_DIR}/${run_id}.md"
    errors_cache_file="${JOB_ERRORS_DIR}/${run_id}.md"
    errors_titles_cache_file="${JOB_ERRORS_TITLES_DIR}/${run_id}.txt"
    
    echo "Processing run: ${run_id}"
    
    # Check if job_summary_path is cached
    if [ -f "$url_cache_file" ]; then
        echo "  Using cached job_summary_path"
        job_summary_path=$(cat "$url_cache_file")
    else
        echo "  Fetching run page: ${run_url}"
        html_content=$(curl -s -L -H "Cookie: user_session=$GITHUB_USER_SESSION" "$run_url")
        
        # Extract job summary path
        job_summary_path=$(echo "$html_content" | grep -oE -m 1 "/Expensify/App/actions/runs/${run_id}/jobs/[0-9]+/summary_raw" | head -1)
        
        if [ -z "$job_summary_path" ]; then
            echo "  No job summary found, skipping..."
            continue
        fi
        
        # Cache the job_summary_path
        echo "$job_summary_path" > "$url_cache_file"
        echo "  Cached job_summary_path"
    fi

    job_summary_url="https://github.com${job_summary_path}"
    
    # Check if job_summary_content is cached
    if [ -f "$md_cache_file" ]; then
        echo "  Using cached job_summary_content"
        job_summary_content=$(cat "$md_cache_file")
    else
        echo "  Fetching job summary: ${job_summary_url}"
        job_summary_content=$(curl -s -L -H "Cookie: user_session=$GITHUB_USER_SESSION" "$job_summary_url")
        
        # Cache the job_summary_content
        echo "$job_summary_content" > "$md_cache_file"
        echo "  Cached job_summary_content"
    fi
    
    # Extract error blocks (content between --- delimiters) and cache them
    if [ ! -f "$errors_cache_file" ]; then
        # Use awk to extract blocks containing errors between --- delimiters
        error_blocks=$(echo "$job_summary_content" | awk '
            BEGIN { in_block=0; block="" }
            /^---$/ { 
                if (in_block && block ~ /❌ \*\*Error:\*\*/) {
                    print block "---"
                }
                in_block=1
                block="---\n"
                next
            }
            in_block { block = block $0 "\n" }
        ')
        
        if [ -n "$error_blocks" ]; then
            echo "$error_blocks" > "$errors_cache_file"
            echo "  Cached errors ($(echo "$error_blocks" | grep -c "^---$")/2 blocks)"
        else
            echo "  No errors found"
            touch "$errors_cache_file"
        fi
    else
        echo "  Errors already cached"
    fi
    
    # Extract error titles from cached errors and cache them
    if [ ! -f "$errors_titles_cache_file" ]; then
        if [ -s "$errors_cache_file" ]; then
            error_titles=$(grep "^❌ \*\*Error:\*\*" "$errors_cache_file")
            if [ -n "$error_titles" ]; then
                echo "$error_titles" > "$errors_titles_cache_file"
                echo "  Cached error titles ($(echo "$error_titles" | wc -l | xargs) titles)"
            else
                touch "$errors_titles_cache_file"
            fi
        else
            touch "$errors_titles_cache_file"
        fi
    else
        echo "  Error titles already cached"
    fi
done