# PR Authoring & Reviewing Standards & Best Practices

This document defines the shared "playbook" for the day-to-day standards that ensure smooth and high-quality merges between PR Authors and C+ Reviewers. It builds upon our existing [PR Review Guidelines](./PR_REVIEW_GUIDELINES.md) and [Reviewer Checklist](./REVIEWER_CHECKLIST.md) to clarify nuances in responsibilities and workflows.

---

## Table of Contents

- [Overview](#overview)
- [The Line of Responsibility](#the-line-of-responsibility)
- [PR Title Convention](#pr-title-convention)
- [Explanation of Change](#explanation-of-change)
- [Review Readiness](#review-readiness)
- [Workflow Integrity & WIP/HOLD](#workflow-integrity--wiphold)
- [The Testing Split](#the-testing-split)
- [PR Type-Specific Guidelines](#pr-type-specific-guidelines)
  - [Bug Fixes](#bug-fixes)
  - [New Features](#new-features)
  - [Refactoring](#refactoring)
  - [Package Updates](#package-updates)
- [Unblocking Reviews](#unblocking-reviews)
- [PR Granularity](#pr-granularity)
- [Comment Resolution Best Practices](#comment-resolution-best-practices)
- [Summary of Expectations](#summary-of-expectations)

---

## Overview

The goal of this document is to:
1. **Clarify Responsibility** – Define the "line of responsibility" between PR Author and C+ Reviewer.
2. **Ensure Review Readiness** – Establish that a PR is ready for review before a C+ starts reviewing.
3. **Maintain Workflow Integrity** – Encourage clear use of `[WIP]` or `[HOLD]` until the PR is ready for review.
4. **Unblock Reviews** – Clarify when failing workflows should or should not block a review.
5. **Standardize PR Titles** – Use consistent prefixes for better tracking and searchability.

---

## The Line of Responsibility

### The Safety Net Principle

> **The C+ Reviewer is the final safety net, but the PR Author must relay a strong understanding of their changes through comprehensive manual and unit testing to prevent regressions.**

| Role | Primary Responsibility |
|------|----------------------|
| **PR Author** | Owns the correctness, quality, and testing of their changes. Must demonstrate a clear understanding of what was changed and why. |
| **C+ Reviewer** | Acts as the final safety net. Validates proper testing, catches edge cases, and ensures code quality standards are met. |
| **Internal Engineer (CME)** | Internal authority to ensure code is secure, compliant, not malicious, and not propagating bad code patterns. |

### What This Means in Practice

- **Authors** should not rely on reviewers to find obvious bugs or verify basic functionality.
- **Reviewers** should expect that the "happy path" works and focus on edge cases, destructive testing, and potential regressions.
- Both parties share responsibility for the final quality, but **prevention starts with the Author**.

---

## PR Title Convention

All PR titles should follow a consistent format to improve clarity, searchability, and deploy tracking.

### Format

```
<type>: <concise description of what is being fixed/implemented/refactored/upgraded>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `fix` | Bug fixes | `fix: date picker modal accessibility issues` |
| `feat` | New features | `feat: add category rules for expense reports` |
| `refactor` | Code refactoring with no functional changes | `refactor: extract reusable avatar component` |
| `upgrade` | Package/dependency updates | `upgrade: bump react-navigation to v7` |
| `chore` | Maintenance tasks | `chore: update CI workflow configuration` |
| `docs` | Documentation changes | `docs: add TypeScript migration guide` |
| `test` | Test additions or changes | `test: add unit tests for ViolationsUtils` |
| `perf` | Performance improvements | `perf: optimize LHN rendering performance` |

### Why This Matters

- **Searchability**: Finding deploy blocker offending PRs becomes much faster.
- **Clarity**: The type prefix immediately communicates intent.
- **Consistency**: Follows widely adopted conventions used by major libraries (e.g., `@react-navigation`, Angular).

### Examples

| ❌ Bad | ✅ Good |
|--------|---------|
| `Accessibility/fix unexpected behavior` | `fix: unexpected behavior in accessibility settings` |
| `Update some stuff` | `refactor: modernize payment flow components` |
| `Bug fix` | `fix: prevent crash when expense has no category` |

---

## Explanation of Change

**Every PR must include an "Explanation of Change" section**, even if the intent seems obvious from the title.

### Why This Is Mandatory

- Aids in debugging deploy blocker issues
- Provides context for future maintainers
- Helps reviewers understand the author's thought process
- Creates a paper trail for decision-making

> **The best explanations will explain why the change is being done, not just what is changing.**

### Minimum Requirements

Even a single sentence is acceptable:

> This PR fixes an issue where the date picker modal was not accessible via keyboard navigation on web.

### For Complex Changes

Provide additional context:

1. **What** was changed
2. **Why** it was changed (root cause for bugs)
3. **How** it was changed (high-level approach)
4. **What areas** might be affected

---

## Review Readiness

A PR is considered **ready for review** when:

| Requirement | Description |
|------------|-------------|
| ✅ Manual and QA tests documented | Clear, step-by-step testing instructions |
| ✅ CI passing | All automated tests and lint checks pass |
| ✅ No `[WIP]` or `[HOLD]` in title | Title indicates the PR is ready for final review |
| ✅ Screenshots/videos provided | Visual proof for all required platforms |
| ✅ Author checklist complete | All checkboxes genuinely checked (not just ticked) |

### Author Responsibility

Before requesting review, the Author must:
1. Run the app locally and verify the fix on **all platforms** (Web, iOS, Android, mWeb)
2. Document specific flows affected by the change
3. Provide comprehensive manual test steps
4. Ensure unit tests cover the changed logic
5. Verify CI is green (tests, lint, type checks)
6. Address all AI reviewer comments (e.g. Codex Review) – respond with 👍/👎 and provide explanations where applicable

---

## Workflow Integrity & WIP/HOLD

Use `[WIP]` or `[HOLD]` in PR titles until:

- ✅ Manual tests are complete and documented
- ✅ Unit tests are written and passing
- ✅ CI is fully green

### Exception: Merge Conflicts

Merge conflicts that arise **after** marking a PR ready are acceptable and can be resolved upon request. These happen independently of the Author's actions and should not block the initial review request.

### Usage

| Prefix | When to Use |
|--------|-------------|
| `[WIP]` | Work is actively in progress; not ready for any review |
| `[HOLD]` | Paused for external dependency or waiting on feedback |
| (none) | Ready for full review and merge consideration |

---

## The Testing Split

### Author Responsibilities

| Area | Description |
|------|-------------|
| **Primary Verification** | Confirm the fix/feature works as intended (happy path) |
| **Basic Regression Testing** | Verify existing flows still work |
| **Unit Test Coverage** | Add tests for both positive and negative flows (e.g., test when a parameter exists AND when it doesn't, test when a boolean is true AND false) |
| **All Platform Testing** | Test on Web, iOS, Android, and mWeb |
| **Document Test Steps** | Provide clear reproduction and verification steps |

### Reviewer Responsibilities

| Area | Description |
|------|-------------|
| **Destructive Testing** | Intentionally try to break the feature (invalid inputs, edge cases) |
| **Edge Case Exploration** | Test boundary conditions, null states, offline behavior |
| **Regression Hunting** | Check related components for unintended side effects |
| **Code Quality Review** | Ensure patterns, style, and architecture are correct |
| **Cross-Platform Verification** | Independently verify on all platforms |

---

## PR Type-Specific Guidelines

Different types of PRs carry different risks and require tailored focus areas.

### Bug Fixes

**Primary Focus**: Root-cause verification and protecting related flows

| Author | Reviewer |
|--------|----------|
| Clearly identify and document the root cause | Verify the root cause analysis is correct |
| Test the specific bug scenario is fixed | Test that near-flows still work as expected |
| Add regression test for the specific bug | Attempt to reproduce related edge cases |
| Document what areas could be affected | Verify offline behavior if applicable |

### New Features

**Primary Focus**: Happy path vs. UX edge cases

| Author | Reviewer |
|--------|----------|
| Verify all documented requirements are met | Test undocumented edge cases |
| Test happy path thoroughly | Verify error states and recovery |
| Document all UI states and flows | Check accessibility and responsiveness |
| Add comprehensive unit tests | Test with various account types/permissions |

### Refactoring

**Primary Focus**: Regression testing and mapping existing flows

| Author | Reviewer |
|--------|----------|
| Map all affected components and flows | Verify components used elsewhere still work |
| Verify no functional changes occurred | Test edge cases in refactored code paths |
| Ensure tests still pass without modification | Check for accidental behavior changes |
| Document architectural decisions | Validate pattern consistency |

### Package Updates

**Primary Focus**: Breaking changes and cross-app stability

| Author | Reviewer |
|--------|----------|
| Review changelog for breaking changes | Independent verification of critical flows |
| Test affected features/components | Check for deprecation warnings |
| Verify web, native, and hybrid app behavior | Test on actual devices, not just simulators |
| Document any migration steps taken | Verify no performance regressions |

---

## Unblocking Reviews

### Do NOT Block Reviews For

| Issue | Action |
|-------|--------|
| **Minor lint issues** | Note in review, let Author fix in final pass |
| **Merge conflicts** | Review logic/code, Author resolves conflicts after |
| **Unrelated failing workflows** | Continue review if failure is clearly not from this PR |
| **Pre-existing console errors** | C+ Reviewers: Report in Slack `#expensify-bugs`, don't block PR |

> **Tip**: If a reviewer's comment starts with **"NAB"** (Not A Blocker), the author knows it's their decision whether or not to make the suggested change.

### The Goal

> Complete the code/logic review whenever possible, then call out minor fixes for a final pass.

This reduces async delays and keeps development moving smoothly across time zones.

### When to Stop Early

- Fundamental architectural issues that affect the approach
- Critical logic bugs that would require substantial rewrite
- Security vulnerabilities

---

## PR Granularity

### When to Split PRs

Consider splitting a PR when:
- The scope grows too large to maintain a high level of understanding
- The author cannot confidently explain every change
- Testing becomes unwieldy or impossible to cover comprehensively
- Multiple unrelated changes are bundled together
- The diff is difficult to review in one sitting (rule of thumb: **400+ lines of logic** / **20+ files changed**)

> **Note**: When evaluating file count, focus on files with **extensive logic changes**. Translation files, type definitions, and similar auto-generated or boilerplate changes can be excluded from this count.

### Benefits of Smaller PRs

- Faster reviews and shorter feedback cycles
- Easier to identify the source of regressions
- More focused testing
- Cleaner git history

### How to Split

1. **By component**: Separate backend changes from frontend
2. **By feature slice**: Core functionality first, then enhancements
3. **By risk level**: Safe refactors first, then behavioral changes

---

## Comment Resolution Best Practices

> **Note**: Due to current repository permission settings, C+ Reviewers cannot resolve conversation threads directly.

### Recommended Practice

| Step | Actor | Action |
|------|-------|--------|
| 1 | **Reviewer** | Leave clear, actionable feedback as comments |
| 2 | **Author** | Address feedback and reply with what was done |
| 3 | **Reviewer** | Upon satisfactory resolution, reply with "Resolved ✅" or 👍 |
| 4 | **Author** | Mark the conversation as resolved |

This workflow allows the C+ to track their comments effectively while Authors maintain control over resolution.

### Comment Guidelines

- **Reviewers**: Be specific about what needs to change
- **Authors**: Reply to every comment, even if just to acknowledge
- **Both**: Use GitHub suggestions for small changes when possible

---

## Summary of Expectations

### For PR Authors

1. Use proper PR title format (`type: description`)
2. Always include an Explanation of Change
3. Complete all testing before requesting review
4. Use `[WIP]`/`[HOLD]` until truly ready
5. Provide clear, comprehensive test steps
6. Add unit tests for new logic
7. Keep PRs focused and reasonably sized
8. Respond to all reviewer comments

### For C+ Reviewers

1. Complete full review passes, even after finding issues
2. Don't block on minor lint/conflict issues
3. Focus on edge cases and destructive testing
4. Verify bugs found don't exist on `main`
5. Mark comments as "Resolved ✅" when satisfied
6. Adjust testing focus based on PR type
7. Complete reviews within 24 hours on weekdays

---

## Related Documents

- [CONTRIBUTING.md](./CONTRIBUTING.md) – General contribution guidelines
- [PR_REVIEW_GUIDELINES.md](./PR_REVIEW_GUIDELINES.md) – Technical review guidelines
- [REVIEWER_CHECKLIST.md](./REVIEWER_CHECKLIST.md) – Complete reviewer checklist
- [HOW_TO_BECOME_A_CONTRIBUTOR_PLUS.md](./HOW_TO_BECOME_A_CONTRIBUTOR_PLUS.md) – C+ program information
- [REGRESSION_TEST_BEST_PRACTICES.md](./REGRESSION_TEST_BEST_PRACTICES.md) – Writing effective regression tests
