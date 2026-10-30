# Review triage

How to decide on a review finding, whoever posted it. Bots change over time, so these rules name none of them. To see who is reviewing a PR, read the thread and comment authors and the check names in `pr-status.ts` output.

## Every finding

1. Read the code it points at, and its callers, before deciding.
2. Check the claim against the current head. Findings go stale: a later commit may already fix it, or it may cite lines that moved (`outdated: true` in `pr-status.ts`).
3. Reproduce it when you can: a Jest test, or the flow in the browser or on a simulator. A finding you reproduced is a fix. One you couldn't reproduce needs a disproof from the code.
4. Decide whether to fix it, dismiss it with a disproof, or escalate it. This is your recommendation: the human picks what actually gets fixed.

## Fix

A plausible defect in code this PR adds or changes: wrong behavior, broken offline handling, a race, a broken contract. Propose a fix in this PR with a test that fails without it. Once the human picks it and it's pushed, post the reply and resolve the thread.

## Dismiss with a disproof

Draft a reply with the one fact that disproves it, then resolve the thread once it's posted. Common shapes:

- Pre-existing: `git blame` against Expensify/App's `main` (`upstream/main` from a fork, `origin/main` otherwise) shows the flagged lines predate the branch. If it's real and cheap to fix, it gets a follow-up issue.
- Misread library behavior: cite the source of the installed version under `node_modules/` (Onyx, react-navigation, React Native).
- Already guaranteed: name the type, helper, or selector that makes the case impossible.
- Intentional trade-off: link the proposal comment on the issue, or the PR body line that states it.
- A tool rule contradicts a repo rule in `CLAUDE.md` or `contributingGuides/`: cite the repo rule.

## Escalate, never dismiss alone

- API command params and Onyx data shapes the backend relies on
- Auth, session, and anything that moves money
- `.github/` workflows and actions, and the `Mobile-Expensify` submodule pointer
- A new `Onyx.connectWithoutView` in a component (needs `@frontend-performance` approval)
- A new code pattern (the author checklist needs it agreed by several Expensify engineers)
- Anything outside the approved proposal

Propose a fix, or draft a reply saying it needs the owner's call, leave the thread unresolved, and name it in the handoff.

## Stop the loop

A reviewer that answers every fix with a narrower edge case in the same function is polishing a heuristic. It stopped finding bugs. After two rounds on the same function, draft a reply saying the remaining cases are out of scope, and name them in the handoff.

## Patterns reviewers keep catching here

These are code patterns from real App bugs. The `ship-pr` self-review checks them before any reviewer does.

1. React Compiler does not memoize the result of an IIFE or a call chain. A derived array or object built that way gets a new identity every render, and an effect that depends on it can loop forever.
2. Prefixed Onyx keys (`transactions_123`) compared against bare IDs (`123`). The comparison never matches, so a guard built on it never fires.
3. Error state that only a successful request can clear, behind a gate that stops the request from running. The UI stays on the error for good.
4. An optimistic value persisted to disk while the data that clears it lives only in memory. A reload in between leaves the value stuck.
5. Subscriptions deduplicated by function reference. A callback recreated per render or per call subscribes twice.
6. Logic gated on `isLoadingApp` that needs navigation. On a reload the flag is already false before the navigator exists, so the code silently does nothing.

## Keeping this file useful

Add a dismissal shape or a code pattern only when it is about the code or the repo, never about a specific bot. When the same pattern gets caught twice, propose a lint rule, a type, or a test for it, and delete the line here once that's merged.
