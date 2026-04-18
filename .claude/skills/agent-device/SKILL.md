---
name: agent-device
description: Drive iOS and Android devices for the Expensify App - testing, debugging, performance profiling, bug reproduction, and feature verification. Use when the developer needs to interact with the mobile app on a device.
---

# agent-device

## Pre-flight Check

Verify the `agent-device` CLI is installed and its skills are accessible:

```bash
agent-device --version
```

If missing, **STOP** and instruct the user to install it:

```bash
npm install -g agent-device
```

The `agent-device` CLI ships with built-in skills under `skills/` in the installed package. These contain the canonical reference for device automation - bootstrap, exploration, verification, debugging, and more. Use `agent-device --help` to discover available commands and skill names. Read the skill files directly from the installed package path when you need detailed guidance:

```bash
# Find the package location
npm root -g
# Then read: <global_root>/agent-device/skills/agent-device/SKILL.md
```

> **Do not proceed without `agent-device` installed.** All device interaction depends on it.

## How This Skill Works

This skill enhances the local development and testing workflow. The developer may provide a full test plan upfront, give step-by-step instructions interactively, or just point at a screen and ask questions. Follow their lead.

### Principles

- **Fail fast.** If something deviates from expectations - wrong screen, unexpected error, missing element - stop, explain what happened and suggest how to get past it. Do not silently work around problems.
- **Deviations are signal.** If the app behaves differently than expected, report the delta clearly so the developer can decide what needs fixing.

## Footnote

> **Early development.** This integration between agent-device and the Expensify App is still in early stages. If you run into issues, please reach out via Expensify Slack or file an issue at https://github.com/callstackincubator/agent-device/issues.
