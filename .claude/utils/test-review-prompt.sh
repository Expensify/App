#!/bin/bash
# Local Claude Code Review Testing Script (Manual Mode)
# This prepares files and lets you manually paste to Claude CLI
# Usage: ./test-review.sh <branch-name> [prompt-file]

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
DEFAULT_PROMPT="../agents/review-output/code-inline-reviewer.md"

# Parse arguments
TARGET_BRANCH=${1:-main}
PROMPT_FILE=${2:-$DEFAULT_PROMPT}

echo -e "${BLUE}=== Claude Code Review Test Workflow ===${NC}"
echo -e "${BLUE}Target branch: ${TARGET_BRANCH}${NC}"
echo -e "${BLUE}Prompt file: ${PROMPT_FILE}${NC}\n"

# Create necessary directories
mkdir -p "$PROMPT_DIR"
mkdir -p "$REVIEW_OUTPUT_DIR"

# Check if prompt file exists
if [ ! -f "$PROMPT_FILE" ]; then
    echo -e "${RED}Error: Prompt file not found: ${PROMPT_FILE}${NC}"
    echo -e "${YELLOW}Creating default prompt template...${NC}"
    cat > "$DEFAULT_PROMPT" << 'EOF'
# Code Review Instructions

Please review the following code changes:

## Focus Areas
- Code quality and maintainability
- Potential bugs or issues
- Security concerns
- Performance considerations
- Best practices adherence

## Review Guidelines
1. Be constructive and specific
2. Suggest improvements with examples
3. Highlight both issues and good practices
4. Consider the context of the changes

Please provide a thorough review with actionable feedback.
EOF
    PROMPT_FILE="$DEFAULT_PROMPT"
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
    echo "Below you will see output for automated code review. For the purpose of this prompt: Instead of calling github actions output all comments to the console here, in tge same format as if they were comments in GH. Follow the same rules as mentioned below, no unwanted output, only rules comments."
    echo ""
    cat "$PROMPT_FILE"
    echo ""
    echo "---"
    echo ""
    echo "Branch: $CURRENT_BRANCH -> $TARGET_BRANCH"
    echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "Code Changes:"
    echo ""
    cat "$DIFF_FILE"
} > "$REVIEW_REQUEST"

echo -e "${GREEN}Review request prepared: ${REVIEW_REQUEST}${NC}\n"

# Provide instructions
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ${YELLOW}Review request is ready!${BLUE}                              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Option 1: Copy content to clipboard and paste to Claude CLI${NC}"
echo -e "  ${GREEN}# On macOS:${NC}"
echo -e "  cat \"${REVIEW_REQUEST}\" | pbcopy"
echo -e "  claude"
echo -e "  ${GREEN}# Then paste (Cmd+V) into Claude${NC}"
echo ""
echo -e "  ${GREEN}# On Linux:${NC}"
echo -e "  cat \"${REVIEW_REQUEST}\" | xclip -selection clipboard"
echo -e "  claude"
echo -e "  ${GREEN}# Then paste (Ctrl+Shift+V) into Claude${NC}"
echo ""
echo -e "${YELLOW}Option 2: View the file and manually copy${NC}"
echo -e "  cat \"${REVIEW_REQUEST}\""
echo ""
echo -e "${YELLOW}Option 3: Open in your editor${NC}"
echo -e "  \$EDITOR \"${REVIEW_REQUEST}\""
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Ask if user wants to copy to clipboard
echo -e "${YELLOW}Would you like to copy to clipboard now? (y/n)${NC}"
read -r RESPONSE

if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
    if command -v pbcopy &> /dev/null; then
        cat "$REVIEW_REQUEST" | pbcopy
        echo -e "${GREEN}✓ Copied to clipboard!${NC}"
        echo -e "${YELLOW}Now run 'claude' and paste (Cmd+V)${NC}"
    elif command -v xclip &> /dev/null; then
        cat "$REVIEW_REQUEST" | xclip -selection clipboard
        echo -e "${GREEN}✓ Copied to clipboard!${NC}"
        echo -e "${YELLOW}Now run 'claude' and paste (Ctrl+Shift+V)${NC}"
    elif command -v xsel &> /dev/null; then
        cat "$REVIEW_REQUEST" | xsel --clipboard
        echo -e "${GREEN}✓ Copied to clipboard!${NC}"
        echo -e "${YELLOW}Now run 'claude' and paste (Ctrl+Shift+V)${NC}"
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