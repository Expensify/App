# Review triage

How to decide on a review finding, whoever posted it: claude-review, Codex, MelvinBot, a C+ reviewer or an Expensify engineer. Judge the claim, not the author.

## Every finding

1. Read the code it points at, and its callers, before deciding anything.
2. Check it against the current head. Findings go stale: a later commit may already fix it, or the line numbers may have moved (`outdated: true` in `pr-status.mjs`).
3. Reproduce it when you can: a Jest test, or the flow in the browser or on a simulator. A finding you reproduced is a fix. One you couldn't reproduce needs a disproof from the code, not a shrug.
4. Decide: **fix**, **dismiss with a disproof**, or **escalate**.

## Fix

A plausible defect in code this PR adds or changes: wrong behavior, broken offline handling, a race, a contract break. Fix it in this PR, ideally with a test that fails without the fix. Draft a reply naming the commit.

## Dismiss with a disproof

Draft a reply with the one fact that disproves it. Common shapes:

- **Pre-existing.** `git blame` against `upstream/main` shows the lines predate the branch. If it's real and cheap, it gets a follow-up issue, not scope creep here.
- **Misread library behavior.** Cite the source of the installed version under `node_modules/` (Onyx, react-navigation, React Native), not the docs from memory.
- **Already guaranteed.** Name the type, helper or selector that makes the case impossible.
- **Intentional trade-off.** Link the proposal comment on the issue, or the PR body line that states it.
- **A bot rule that contradicts a repo rule.** Cite `CLAUDE.md` or the `contributingGuides/` page.

## Escalate to the human, never dismiss alone

- API command params and Onyx data shapes the backend relies on
- Auth, session, and anything that moves money
- `.github/` workflows and actions, and the `Mobile-Expensify` submodule pointer
- A new `Onyx.connectWithoutView` in a component (needs `@frontend-performance` approval)
- A new code pattern (the author checklist needs it agreed by several Expensify engineers)
- Anything outside the approved proposal

List these in the handoff with your recommendation. Don't reply on the thread yourself.

## Stop the loop

A reviewer that answers every fix with a narrower edge case in the same function is hardening a heuristic, not finding bugs. After two rounds on the same function, draft a reply saying the remaining cases are out of scope, and name them in the handoff.

## Patterns we keep catching

Code patterns, not bot habits. The `ship-pr` fresh review checks these before any reviewer sees the PR.

1. React Compiler does not memoize the result of an IIFE or a call chain. A derived array or object built that way gets a new identity every render, and an effect that depends on it can loop forever.
2. Comparing prefixed Onyx keys (`transactions_123`) against bare IDs (`123`). The comparison never matches, so a guard built on it never fires.
3. Error state that only a successful request can clear, behind a gate that stops the request from running. The UI stays on the error for good.
4. An optimistic value persisted to disk while the data that clears it lives only in memory. A reload in between leaves the value stuck.
5. Subscriptions deduplicated by function reference. A callback recreated per render or per call subscribes twice.
6. Logic gated on `isLoadingApp` that needs navigation. On a reload the flag is already false before the navigator exists, so the code silently does nothing.

## Keeping this file useful

Add a pattern only when it's about the code, never about a specific bot. When the same pattern is caught twice, propose a lint rule, a type or a test in the handoff instead, and delete the line once that's merged.
