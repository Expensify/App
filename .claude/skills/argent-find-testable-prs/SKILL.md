---
name: argent-find-testable-prs
description: Scans open Expensify App PRs and filters to the mobile-native ones (the platforms the argent-qa-pr skill can actually drive), outputting a candidate shortlist with raw signals. It does NOT rate difficulty — the agent judges difficulty + setup/feasibility per candidate by reading the full PR. Use when asked "what PRs can I test/QA", "find PRs to test on mobile", "list QA candidates", or to pick the next PR for argent-qa-pr.
allowed-tools: Bash, Read, Write, Edit
---

# argent-find-testable-prs

The **scout** for the `[[argent-qa-pr]]` skill. Its job is the cheap, high-volume part: scan
open `Expensify/App` PRs and **filter to the ones `argent-qa-pr` can actually run** (mobile-native),
so you don't read 100 issue bodies by hand. It does **not** rate difficulty or decide testability —
**that judgment is yours** (the agent's), made per candidate from the full PR context. Scout filters;
you judge.

## When to use / not use
- **Use** to get the mobile-native candidate shortlist, then judge + pick the next one for `argent-qa-pr`.
- **Not** for actually testing a PR (that's `argent-qa-pr`), and not for web-only work.

## How to run

```bash
node .claude/skills/argent-find-testable-prs/helpers/scan-prs.mjs --limit 100 --json ai-qa-poc/triage-scan.json
```
Requires the `gh` CLI authenticated. Prints a markdown table of candidates (factual columns +
raw signals), then a collapsed skipped section, and writes JSON. Rows are **identified by PR number**
— the scout does **no** ranking or numbering (that's yours, after judging). One issue fetch per PR,
so a large `--limit` takes a little while — start at `--limit 80–120`.

**What the scout does (mechanical only — no judgment):**
1. Skip drafts, `[No QA]`, `[WIP]`/`[HOLD]`/revert.
2. Resolve the **linked issue** and read its **`## Platforms`** checkboxes.
3. Keep only PRs where **iOS App and/or Android App** is reproduced (mWeb is a browser → doesn't
   count). Web/mWeb-only → `SKIPPED_WEB_ONLY`; no Platforms checklist → `SKIPPED_OTHER`; no linked
   issue → `UNKNOWN`.
4. Emit each candidate's **platforms**, **repro step count**, and **raw keyword signals** (e.g.
   `accounting`, `offline`, `signup`, `rooms`). **Signals are factual hints to prioritize reading
   order — NOT a difficulty/feasibility verdict** (they over/under-fire: e.g. a stray "onboarding").

## Then YOU judge each candidate (the part that isn't a script)

For each candidate worth considering, **pull the full context and judge it yourself** — this is
where project knowledge beats keyword matching:

```bash
gh pr view <n> --repo Expensify/App --json title,body,headRefName
gh issue view <issue> --repo Expensify/App --json body   # + follow the PROPOSAL link in the body
gh pr diff <n> --repo Expensify/App                       # pin the exact element + any beta/layout gate
```

Then rate **how hard to TEST** (not how hard to fix) and **plan the setup**, using the same lens as
`argent-qa-pr` Phase 1.5 (surmountable prep vs real blocker):

| | What it usually means |
| --- | --- |
| 🟢 **Easy** | pure UI / visual / navigation; logged-out or few steps; no data/state setup |
| 🟡 **Medium** | needs some state you can prepare — offline toggle, native share, a workspace/room/expense, a `+tag` fresh account, onboarding, a deep-link/gated entry |
| 🔴 **Hard** | heavy but still doable setup — multi-account (copilot/delegate via `+tag`), roles/workflows |
| **NOT_TESTABLE** | a **live external integration you can't stand up locally** — accounting (QBO/Xero/NetSuite/Sage/Certinia), bank/Plaid, card issuing, real payments — or a **backend-gated** beta |

Reason about **surmountable vs blocker** (don't treat prep as a wall): a fresh account is a `+tag`
alias, a missing workspace/room is created in-app, a UI-gating beta is an Onyx override, a hard-to-reach
screen is a deep link, a web precondition (OldDot signup) is done in a browser. Only genuine external
integrations are `NOT_TESTABLE`. Full recipes: `argent-qa-pr` → `references/methodology.md`.

## Output & next step

**Always present your judged candidates as a markdown table** (this is the required output format —
not a prose list). Sort rows by your verdict (testable easiest-first → harder-but-doable →
`NOT_TESTABLE` → already-done) and number them `1..N` in that order in a leading **`#`** column so the
user can pick by `#`. The scout itself does no numbering; you add it here. Use exactly these columns:

```
| # | PR | Title | Platforms | Difficulty | Setup |
| --- | --- | --- | --- | --- | --- |
| 1 | #93425 | avatar discard-changes guard | iOS | 🟢 best pick | change own avatar → back; self-contained |
| 2 | #93200 | scroll workspace list to top | Android | 🟡 clean | `+tag` fresh acct (no workspaces) + landscape |
| … | … | … | … | … | … |
| 7 | #93217 | Certinia export status | Android+iOS+web | ⛔ NOT_TESTABLE | needs Certinia connection |
```

- `#` = your rank (user picks by it); **PR number** stays as the stable id (`argent-qa-pr` takes it).
- Under the table, **recommend the top picks** — favor single-platform, self-contained, read-only
  flows (least flaky), and call out which need prep vs which are blocked.
- Optionally fold the rows + your verdicts into **`ai-qa-poc/triage-log.md`** so reasons persist.
- To test a chosen PR: run **`argent-qa-pr <PR-number>`**.

## References
- Pairs with **`[[argent-qa-pr]]`** — same mobile-only scope, same surmountable-vs-blocker lens, same
  `ai-qa-poc/` outputs. Scout filters; `argent-qa-pr` (and your judgment) does the rest.
- Helper: `helpers/scan-prs.mjs` (zero extra deps — only needs `gh` + Node).
