# Agent Framework (Claude Code + GitHub Actions)

A small, repo-scoped setup for running **agents** (code review, triage, docs checks, etc.) on **issues and pull requests** using [Anthropic’s Claude Code GitHub Action](https://github.com/anthropics/claude-code-action).

## Architecture

```
.claude/
  agents/      # One prompt per agent
  commands/    # Orchestration docs that can call multiple agents/tools
.github/workflows/
  claude-*.yml # CI workflows that run a command
```

## How it works

1. Workflow events (manual dispatch, new comment, PR opened, label changes, etc.) kick things off.
2. The workflow calls `anthropics/claude-code-action` with:

   * `prompt`: `/command-name REPO:… [ISSUE_NUMBER:… | PR_NUMBER:…]`
   * `claude_args`: `--allowedTools <comma-separated list>`
3. The command loads the agent(s) and they only get the tools you allow.

## Add an agent (example: code review)

1. Create `.claude/agents/<agent>.md`:

   ```md
   ---
   name: <agent>
   description: <what it does>
   tools: Read, Glob, Grep, Bash, Edit, Write
   model: inherit
   ---
   # <Agent Name>
   <!-- short rubric: what to look for / how to respond -->
   ```
2. Create `.claude/commands/<command>.md` describing which agent(s) to run and where to post results.
3. Wire it up in a workflow:

   ```yml
   with:
     prompt: "/<command> REPO:${{ github.repository }} PR_NUMBER:${{ github.event.pull_request.number }}"
     claude_args: |
       --allowedTools "Read,Glob,Grep,Edit,Write,Bash(gh pr view:*;gh pr comment:*;gh issue comment:*)"
   ```

   Keep the tool list minimal.

## Posting comments (issues & PRs, no MCP)

Use `gh` via **Bash**:

* Issue comment: `gh issue comment <num> --body "<text>"`
* PR summary comment: `gh pr comment <num> --body "<text>"`
* PR review: `gh pr review <num> --comment --body "<text>"`
* PR inline comment (file/line):

  ```
  gh api repos/:owner/:repo/pulls/:number/comments \
    -f path=path/to/file \
    -f line=123 \
    -f body="your text" \
    -f side=RIGHT
  ```

Make sure `GITHUB_TOKEN` and `gh` are available in the job, and that your `Bash(...)` patterns are allowed.

## Common tools

* **Read** – read files
* **Write** – create files
* **Edit / MultiEdit** – change files (single/batch)
* **Glob** – match files by pattern
* **Grep** – search in files
* **Bash** – run shell/CLIs (e.g., `gh`, linters)
* **WebFetch / WebSearch** – fetch/search the web (optional)

For full action options and tool behavior, see the [Claude Code GitHub Action docs](https://github.com/anthropics/claude-code-action).
