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
3. The command loads the agent(s). 

## Tools

There are two types of tools in this framework, controlled at different levels:

### 1. Command-level tools (`allowed-tools` in command frontmatter)

These specify which tools **claude-code-action** allows during command execution. Define them in `.claude/commands/<command>.md`:

```md
---
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),mcp__github_inline_comment__create_inline_comment
description: Review a code contribution pull request
---
```

This includes:
- **Bash with restrictions**: `Bash(gh pr comment:*)` allows only specific `gh` subcommands
- **MCP tools**: `mcp__<server>__<tool>` from attached MCP servers
- Standard Claude Code tools are available by default (see below)

For details on configuring `allowed-tools`, see the [Claude Code GitHub Action documentation](https://github.com/anthropics/claude-code-action).

### 2. Agent-level tools (`tools` in agent frontmatter)

These are the **standard Claude Code tools** that individual agents can use. Specify them in `.claude/agents/<agent>.md`:

```md
---
name: <agent>
description: <what it does>
tools: Read, Glob, Grep, Bash, Edit, Write, TodoWrite, BashOutput, KillBash
model: inherit
---
```

Common standard tools:
- **Read** – read files
- **Write** – create files
- **Edit / MultiEdit** – change files (single/batch)
- **Glob** – match files by pattern
- **Grep** – search in files
- **Bash** – run shell/CLIs (unrestricted, unless limited by command `allowed-tools`)
- **TodoWrite** – manage task lists
- **BashOutput** / **KillBash** – manage long-running bash processes
- **WebFetch / WebSearch** – fetch/search the web (optional)

For a complete list of available Claude Code tools, see the [Claude Code tools documentation](https://docs.anthropic.com/en/docs/claude-code/tools).


### MCP tools

**MCP (Model Context Protocol) tools** allow agents to call additional tools from attached MCP servers. Your agent prompt needs to instruct when to call a tool.

MCP tool names follow: **`mcp__<server>__<tool>`**.

**MCP tools must be declared in both places**:

1. **Command frontmatter** (`allowed-tools`) – so claude-code-action allows them
2. **Agent frontmatter** (`tools`) – so the agent knows it can use them

Example:

Command (`.claude/commands/review-pr.md`):
```md
---
allowed-tools: Bash(gh pr comment:*),mcp__github_inline_comment__create_inline_comment
---
```

Agent (`.claude/agents/code-reviewer.md`):
```md
---
tools: Read, Glob, Grep, mcp__github_inline_comment__create_inline_comment
---
```

#### Built-in MCP servers

The **claude-code-action** may automatically include these built-in MCP servers depending on context (mode, available tokens, PR vs issue, enabled features):

- **`github_comment`**
- **`github_file_ops`**
- **`github_inline_comment`**
- **`github_ci`**
- **`github`** (Official GitHub MCP Server)

Add tools from these servers to your command's `allowed-tools` and agent's `tools` as needed (e.g., `mcp__github_inline_comment__create_inline_comment`).

#### Custom MCP servers

You can also attach **custom MCP servers** to provide additional tools beyond the built-in ones. Create or configure custom MCP servers according to your needs and follow the same `mcp__<server>__<tool>` naming convention.

For details on MCP tool naming, configuration, and creating custom MCP servers, see the [MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp).

## Security considerations

When configuring agents and commands, follow these security best practices:

### Principle of least privilege

**Minimize tool access** – Only grant agents the minimum set of tools they need to perform their task. Review both `allowed-tools` in commands and `tools` in agents regularly.

```md
# ❌ Too permissive
allowed-tools: Bash
tools: Bash, Read, Write, Edit, WebFetch, WebSearch

# ✅ Properly restricted
allowed-tools: Bash(gh pr comment:*),Bash(gh pr view:*)
tools: Bash, Read, Glob, Grep
```

### Restrict Bash access

Always restrict `Bash` usage to specific commands in `allowed-tools` instead of granting unrestricted `Bash` access:

```md
# ❌ Unrestricted Bash
allowed-tools: Bash

# ✅ Restricted to specific gh commands
allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*)
```

### Untrusted input and prompt injection

When agents process **untrusted input from external sources** (e.g., PRs from unknown users when using `allowed_non_write_users: "*"` in workflows), treat the agent as potentially **compromised** or "jailbroken".

**Key considerations:**

1. **Assume prompt injection** – Untrusted PR content may contain prompt injection attempts to manipulate the agent.

2. **Minimize tool access** – Strictly limit tools and consider: What's the worst-case action a compromised agent could take? Can it modify files, commit code, or access secrets?

3. **Best practices** – Prefer read-only tools (`Read`, `Glob`, `Grep`), restrict Bash to safe commands, avoid `Write`/`Edit`, and use built-in MCP tools over unrestricted Bash.

4. **With `allowed_non_write_users: "*"`** – Limit to read-only operations and comments; never grant `Write`, `Edit`, or unrestricted `Bash` access.

Always perform a **security assessment**: If an agent with your current tool configuration were fully compromised, what's the worst damage it could cause? If the answer is unacceptable, reduce tool access.

## Add an agent

1. Create `.claude/agents/<agent>.md`:

   ```md
   ---
   name: <agent>
   description: <what it does>
   tools: Read, Glob, Grep, Bash, Edit, Write, mcp__github_inline_comment__create_inline_comment
   model: inherit
   ---
   ```

2. Create `.claude/commands/<command>.md` describing which agent(s) to run and where to post results. Specify allowed tools in the frontmatter:

   ```md
   ---
   allowed-tools: Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),mcp__github_inline_comment__create_inline_comment
   description: Review a code contribution pull request
   ---
   ```

3. Use it in a workflow:

   ```yml
   - uses: anthropics/claude-code-action@<version-or-sha>
     with:
       anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
       github_token: ${{ secrets.GITHUB_TOKEN }}
       prompt: "/<command> REPO:${{ github.repository }} PR_NUMBER:${{ github.event.pull_request.number }}"
   ```