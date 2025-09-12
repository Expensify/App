# Agent Framework (Claude Code + GitHub Actions)

Framework for running **agents** (code review, triage, docs checks, etc.) on **issues/PRs** using [Anthropic’s Claude Code GitHub Action](https://github.com/anthropics/claude-code-action).

## Architecture

```
.claude/
  agents/      # Specialized prompts (one per agent)
  commands/    # Orchestration commands that can call multiple agents and tools
.github/workflows/
  claude-*.yml # Workflows that run a command in CI
```

## How it works

1. **Events** (workflow dispatch, comment, opened, labeled, etc.) trigger a workflow.
2. The workflow runs `anthropics/claude-code-action` with:

   * `prompt`: `/command-name REPO:… [ISSUE_NUMBER:… | PR_NUMBER:…]`
   * `claude_args`: `--allowedTools <list>`
3. The command loads the target agent(s) and executes **only** the allowed tools.

## Add a new agent (e.g., code review)

1. **Agent** — add `.claude/agents/<agent>.md`:

   ```md
   ---
   name: <agent>
   description: <what it does>
   tools: Read, Glob, Grep, Bash, Edit, Write
   model: inherit
   ---
   # <Agent Name>
   <!-- brief prompt/rubric -->
   ```
2. **Command** — add `.claude/commands/<command>.md` describing which agent(s) to run and how to post results.
3. **Workflow** — call the action with:

   ```yml
   with:
     prompt: "/<command> REPO:${{ github.repository }} PR_NUMBER:${{ github.event.pull_request.number }}"
     claude_args: |
       --allowedTools "Read,Glob,Grep,Edit,Write,Bash(gh pr view:*;gh pr comment:*;gh issue comment:*)"
   ```

   *Principle of least privilege: allow only what’s needed.*

## Posting comments (issues & PRs, no MCP)

Use **Bash** with `gh`:

* **Issue comment:** `gh issue comment <num> --body "<text>"`
* **PR summary comment:** `gh pr comment <num> --body "<text>"`
* **PR review (overall):** `gh pr review <num> --comment --body "<text>"`
* **PR inline (file/line):**
  `gh api repos/:owner/:repo/pulls/:number/comments -f path=... -f line=... -f body=... -f side=RIGHT`

Ensure `GITHUB_TOKEN`/`gh` are available and the `Bash(...)` patterns are included in `--allowedTools`.

## Common tools (one-liners)

* **Read** – read file contents
* **Write** – create files
* **Edit / MultiEdit** – modify files (single/batch)
* **Glob** – list files by pattern
* **Grep** – search within files
* **Bash** – run shell/CLI (e.g., `gh`, linters)
* **WebFetch / WebSearch** – fetch or search the web (optional)

> Full action configuration & tool details: [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)
