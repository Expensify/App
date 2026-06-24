#!/bin/bash

# Orchestrator script to collect and analyze AI review errors
# Usage: ./ai_review_error_reporter.sh [runs_limit] [output_file]
#   runs_limit: Number of workflow runs to fetch (default: 100)
#   output_file: Output file for the error report (default: job_error_report.md)
#
# Required environment variables:
#   GITHUB_USER_SESSION: GitHub user session cookie for authenticated requests
#
# Required tools:
#   - gh (GitHub CLI): Must be authenticated
#   - jq: JSON processor
#   - curl: HTTP client

set -e  # Exit on any error

# Get script directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Parameters
RUNS_LIMIT="${1:-100}"
OUTPUT_FILE="${2:-job_error_report.md}"

echo "========================================"
echo "AI Review Error Reporter"
echo "========================================"
echo ""
echo "Configuration:"
echo "  Workflow runs limit: $RUNS_LIMIT"
echo "  Output report file: $OUTPUT_FILE"
echo ""

# Step 1: Collect workflow run data
echo "========================================"
echo "Step 1: Collecting workflow run data"
echo "========================================"
echo ""

if [ ! -x "$SCRIPT_DIR/claude_review_collector.sh" ]; then
    echo "Error: claude_review_collector.sh not found or not executable"
    exit 1
fi

"$SCRIPT_DIR/claude_review_collector.sh" "$RUNS_LIMIT"

echo ""
echo "✅ Data collection completed"
echo ""

# Step 2: Aggregate and analyze errors
echo "========================================"
echo "Step 2: Aggregating and analyzing errors"
echo "========================================"
echo ""

if [ ! -x "$SCRIPT_DIR/job_error_aggregator.sh" ]; then
    echo "Error: job_error_aggregator.sh not found or not executable"
    exit 1
fi

"$SCRIPT_DIR/job_error_aggregator.sh" "job_errors_titles" "$OUTPUT_FILE"

echo ""
echo "========================================"
echo "✅ Report generation completed!"
echo "========================================"
echo ""
echo "📊 Report saved to: $OUTPUT_FILE"
echo ""

