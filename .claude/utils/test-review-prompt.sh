#!/bin/bash
# Local Claude Code Review Testing Script
# 
# REQUIREMENTS:
# - macOS
# - Git repository
# - Claude CLI installed (https://docs.claude.com/en/docs/claude-code)
# - pbcopy (included with macOS)
#
# USAGE:
#   ./test-review.sh <branch-name> [prompt-file] [--manual]
#
# EXAMPLES:
#   ./test-review.sh main                    # Auto CLI mode, compare against main
#   ./test-review.sh develop --manual        # Manual mode, compare against develop
#   ./test-review.sh main custom.md          # Custom prompt file
#   ./test-review.sh main custom.md --manual # Custom prompt, manual mode
#
# DEFAULT BEHAVIOR: Automatically pipes to 'claude' command (CLI mode)
# Use --manual flag to get instructions for manual copy/paste instead. Useful if you would like to paste it into a browser.

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROMPT_DIR="./prompts"
REVIEW_OUTPUT_DIR="./review-output"
DEFAULT_PROMPT="../agents/code-inline-reviewer.md"

# Parse arguments
TARGET_BRANCH=""
PROMPT_FILE=""
MANUAL_MODE=false

for arg in "$@"; do
    if [ "$arg" = "--manual" ]; then
        MANUAL_MODE=true
    elif [ -z "$TARGET_BRANCH" ]; then
        TARGET_BRANCH="$arg"
    elif [ -z "$PROMPT_FILE" ]; then
        PROMPT_FILE="$arg"
    fi
done

# Set defaults if not provided
TARGET_BRANCH=${TARGET_BRANCH:-main}
PROMPT_FILE=${PROMPT_FILE:-$DEFAULT_PROMPT}

if [ "$MANUAL_MODE" = true ]; then
    echo -e "${BLUE}=== Claude Code Review (Manual Mode) ===${NC}"
else
    echo -e "${BLUE}=== Claude Code Review (CLI Mode) ===${NC}"
fi
echo -e "${BLUE}Target branch: ${TARGET_BRANCH}${NC}"
echo -e "${BLUE}Prompt file: ${PROMPT_FILE}${NC}\n"

# Check if claude CLI is available (only in CLI mode)
if [ "$MANUAL_MODE" = false ]; then
    if ! command -v claude &> /dev/null; then
        echo -e "${RED}Error: 'claude' command not found${NC}"
        echo -e "${YELLOW}Please install Claude CLI: https://docs.claude.com/en/docs/claude-code${NC}"
        echo -e "${YELLOW}Or use --manual flag for manual copy/paste mode${NC}"
        exit 1
    fi
fi

# Create necessary directories
mkdir -p "$PROMPT_DIR"
mkdir -p "$REVIEW_OUTPUT_DIR"

# Check if prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo -e "${RED}Error: Prompt file not found: ${PROMPT_FILE}${NC}"
    echo -e "${YELLOW}Please ensure the prompt file exists at the specified path.${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Current branch: ${CURRENT_BRANCH}${NC}\n"

# Get the diff
echo -e "${YELLOW}Generating diff against ${TARGET_BRANCH}...${NC}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DIFF_FILE="$REVIEW_OUTPUT_DIR/diff-${TIMESTAMP}.txt"
git diff "$TARGET_BRANCH"...HEAD > "$DIFF_FILE"

# Check if there are changes
if [ ! -s "$DIFF_FILE" ]; then
    echo -e "${RED}No changes found between ${CURRENT_BRANCH} and ${TARGET_BRANCH}${NC}"
    rm "$DIFF_FILE"
    exit 1
fi

echo -e "${GREEN}Diff saved to: ${DIFF_FILE}${NC}"
echo -e "${BLUE}Diff stats:${NC}"
git diff --stat "$TARGET_BRANCH"...HEAD
echo ""

# Get list of changed files
echo -e "${YELLOW}Changed files:${NC}"
git diff --name-only "$TARGET_BRANCH"...HEAD
echo ""

# Create review request file
REVIEW_REQUEST="$REVIEW_OUTPUT_DIR/review-request-${TIMESTAMP}.txt"

{
    echo "Below you will see output for automated code review. For the purpose of this prompt: Instead of calling github actions output all comments to the console here, in the same format as if they were comments in GH. Follow the same rules as mentioned below, no unwanted output, only rules comments."
    echo ""
    echo "IMPORTANT CONTEXT:"
    echo "- All changed file contents are provided in full below"
    echo "- You have complete access to review all code"
    echo "- Do NOT attempt to use file reading tools or request permissions"
    echo "- Analyze the provided diff and file contents directly"
    echo "- The files are ready for your review - proceed with the analysis"
    echo ""
    sed 's/Read each changed file carefully using the Read tool/Carefully analyze each changed file from the complete content provided below/g; s/using the available GitHub inline comment tool/as console output in GitHub comment format/g' "$PROMPT_FILE"
    echo ""
    echo "---"
    echo ""
    echo "Branch: $CURRENT_BRANCH -> $TARGET_BRANCH"
    echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "Code Changes:"
    echo ""
    cat "$DIFF_FILE"
    echo ""
    echo "---"
    echo ""
    echo "## Full File Contents"
    echo ""
    
    # Add full content of changed files
    git diff --name-only "$TARGET_BRANCH"...HEAD | while read -r file; do
        if [ -f "$file" ]; then
            echo "### File: $file"
            echo '```'
            cat "$file"
            echo '```'
            echo ""
        fi
    done
} > "$REVIEW_REQUEST"

echo -e "${GREEN}Review request prepared: ${REVIEW_REQUEST}${NC}\n"

# Manual Mode: Provide instructions for copy/paste
if [ "$MANUAL_MODE" = true ]; then
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  ${YELLOW}Review request is ready!${BLUE}                              ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Option 1: Copy content to clipboard and paste to Claude CLI${NC}"
    echo -e "  cat \"${REVIEW_REQUEST}\" | pbcopy"
    echo -e "  claude"
    echo -e "  ${GREEN}# Then paste (Cmd+V) into Claude${NC}"
    echo ""
    echo -e "${YELLOW}Option 2: Use automatic CLI mode (recommended)${NC}"
    echo -e "  ./test-review.sh ${TARGET_BRANCH}${PROMPT_FILE:+ $PROMPT_FILE}"
    echo ""
    echo -e "${YELLOW}Option 3: View the file and manually copy${NC}"
    echo -e "  cat \"${REVIEW_REQUEST}\""
    echo ""
    echo -e "${YELLOW}Option 4: Open in your editor${NC}"
    echo -e "  \$EDITOR \"${REVIEW_REQUEST}\""
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""

    # Ask if user wants to copy to clipboard
    echo -e "${YELLOW}Would you like to copy to clipboard now? (y/n)${NC}"
    read -r RESPONSE

    if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
        if command -v pbcopy &> /dev/null; then
            pbcopy < "$REVIEW_REQUEST"
            echo -e "${GREEN}✓ Copied to clipboard!${NC}"
            echo -e "${YELLOW}Now run 'claude' and paste (Cmd+V)${NC}"
        else
            echo -e "${RED}Clipboard tool not found.${NC}"
            echo -e "${YELLOW}Please manually copy from: ${REVIEW_REQUEST}${NC}"
        fi
    fi

    echo ""
    echo -e "${BLUE}After getting Claude's review, save it to:${NC}"
    REVIEW_OUTPUT="$REVIEW_OUTPUT_DIR/review-result-${TIMESTAMP}.md"
    echo -e "${GREEN}${REVIEW_OUTPUT}${NC}"
    echo ""

    # Summary
    echo -e "${BLUE}=== Files Generated ===${NC}"
    echo -e "Diff file:       ${DIFF_FILE}"
    echo -e "Review request:  ${REVIEW_REQUEST}"
    echo -e "Save review to:  ${REVIEW_OUTPUT}"
    echo -e "\n${GREEN}Preparation complete!${NC}"
    
    exit 0
fi

# CLI Mode: Automatically copy to clipboard and pipe to claude
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ${YELLOW}Automatically running Claude CLI${BLUE}                      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Copy to clipboard
if command -v pbcopy &> /dev/null; then
    pbcopy < "$REVIEW_REQUEST"
    echo -e "${GREEN}✓ Copied to clipboard${NC}"
else
    echo -e "${YELLOW}⚠ pbcopy not found, skipping clipboard copy${NC}"
fi

# Pipe to claude
echo -e "${YELLOW}Running: claude -p  < \"${REVIEW_REQUEST}\" ${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

claude -p < "$REVIEW_REQUEST"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Summary
REVIEW_OUTPUT="$REVIEW_OUTPUT_DIR/review-result-${TIMESTAMP}.md"
echo -e "${BLUE}=== Files Generated ===${NC}"
echo -e "Diff file:       ${DIFF_FILE}"
echo -e "Review request:  ${REVIEW_REQUEST}"
echo -e "Save review to:  ${REVIEW_OUTPUT}"
echo ""
echo -e "${GREEN}✓ Review complete!${NC}"
echo -e "${YELLOW}Tip: Save the output above to ${REVIEW_OUTPUT}${NC}"