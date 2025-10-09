# Agent Framework (Claude Code + GitHub Actions)

A setup for running agents (eg: code review, triage etc.) on **issues and pull requests** using [Anthropic’s Claude Code GitHub Action](https://github.com/anthropics/claude-code-action).

## Architecture

```
.claude/
  agents/      # One prompt per agent
  commands/    # Orchestration prompts that can call multiple agents and tools
.github/workflows/
  claude-*.yml # CI workflows that run a command
```

## How it works

1. Workflow events (manual dispatch, new comment, PR opened, label changes, etc.) kick things off.
2. The workflow calls `anthropics/claude-code-action` with:

   * `prompt`: `/command-name REPO:… [ISSUE_NUMBER:… | PR_NUMBER:…]`
   * `claude_args`: `--allowedTools <comma-separated list>`
3. The command loads the agent(s). They only get the tools you allow.

## Add an agent

1. Create `.claude/agents/<agent>.md`:

   ```md
   ---
   name: <agent>
   description: <what it does>
   tools: Read, Glob, Grep, Bash, Edit, Write
   model: inherit
   ---
   # <Agent Name>
   <!-- prompt: what to do and how to do -->
   ```
2. Create `.claude/commands/<command>.md` describing which agent(s) to run and where to post results.
3. Wire it up in a workflow:

   ```yml
   - uses: anthropics/claude-code-action@<version-or-sha>
     with:
       prompt: "/<command> REPO:${{ github.repository }} PR_NUMBER:${{ github.event.pull_request.number }}"
       claude_args: |
         --allowedTools "Read,Glob,Grep,Edit,Write,Bash(gh pr view:*;gh pr comment:*;gh issue comment:*)"
   ```

   Keep the tool list minimal.


If an agent needs to write on a PR/issue, you can use `gh` or github MCP.

## GH cli

You can use `gh` via **Bash**, e.g.:
`Bash(gh pr comment "$PR_NUMBER" --body "…")`

## MCP tools

You can attach **MCP** servers so agents can call extra tools. Your agent prompt then needs to instruct when to call a tool.

Tool names follow: **`mcp__<server>__<tool>`**.

* Examples:
  `mcp__filesystem__read_file`
  `mcp__github__list_issues`
  `mcp__github__get_pull_request`

Add them to the same allowlist you pass to the action:

```yml
claude_args: |
  --allowedTools "mcp__filesystem__read_file,mcp__github__list_issues,mcp__github__get_pull_request"
```

MCP docs (naming): [https://docs.anthropic.com/en/docs/claude-code/mcp](https://docs.anthropic.com/en/docs/claude-code/mcp)

## Common tools for claude code

* **Read** – read files
* **Write** – create files
* **Edit / MultiEdit** – change files (single/batch)
* **Glob** – match files by pattern
* **Grep** – search in files
* **Bash** – run shell/CLIs (e.g., `gh`, linters)
* **WebFetch / WebSearch** – fetch/search the web (optional)

For action options and tool behavior, see the [Claude Code GitHub Action docs](https://github.com/anthropics/claude-code-action).
