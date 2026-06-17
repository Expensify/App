#!/usr/bin/env bash
# Pack the CI reviewer instructions + all coding-standards rules into one
# system-prompt file, supplied to the reviewer via --append-system-prompt-file.
#
# Output is deterministic (stable sort, fixed separators), so the cached
# system-prompt prefix stays byte-identical across PR runs. Paired with
# --exclude-dynamic-system-prompt-sections in the workflow, this lets the
# ruleset be served from prompt cache instead of re-sent every run.
#
# Note: the interactive agent at .claude/agents/code-inline-reviewer.md is
# intentionally NOT used here - it loads rules dynamically for local use. CI
# uses this static, pre-packed variant instead.
set -euo pipefail
export LC_ALL=C # locale-stable glob sort

instructions=".github/reviewer/ci-instructions.md"
rules_dir=".claude/skills/coding-standards/rules"
out="${1:?usage: pack-reviewer-prompt.sh <output-file>}"

{
  cat "$instructions"
  # every rule, in sorted order, with a stable separator
  for rule in "$rules_dir"/*.md; do
    printf '\n\n---\n\n'
    cat "$rule"
  done
} >"$out"
