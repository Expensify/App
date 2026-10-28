---
name: ship-pr
description: Take finished work in Expensify/App to a PR a human can review without fighting CI or bots. Runs the checks, verifies the change in the running app, gets a fresh-context self-review for the human to triage, opens a PR from your fork (draft by default) with the App template, then babysits it. Use whenever you are asked to open, create, ship, or submit a PR, or when implementation is done and the next step is review.
---

# Ship a PR

You're done when the human only has judgment calls left on the PR: the checks are green, the change is shown working in the app, a fresh reviewer has read the diff, and every bot comment is handled.

Run every step. If one can't run, say which one and why in the handoff. Nothing gets committed, pushed or posted without the human's approval: they own what goes on the PR (`contributingGuides/AI_ETIQUETTE.md`).

Commands below use `upstream` for the Expensify/App remote, which is the usual setup when you work from a fork. If you cloned Expensify/App directly, use `origin` instead.

## 1. Checks

Run what CI runs for what you touched, and fix everything:

```bash
npm run fmt                                              # oxfmt, a CI gate the CLAUDE.md post-edit checklist doesn't list
npm run lint-changed
npm run typecheck
npm run react-compiler-compliance-check check-changed
npm run spell-changed
npm test -- <test files for the code you changed>        # direct test files; CI runs the full suite
```

- `lint-changed` and `spell-changed` diff against `origin/main`. If `origin` is your fork, sync its `main` with Expensify/App first (`git fetch upstream && git push origin upstream/main:main`), so they only see your changes.
- Skip `--findRelatedTests`. Core libs are imported almost everywhere, so it pulls in most of the suite (over 10 minutes for `MoneyRequestReportUtils`). CI runs everything in about 2.5 minutes.

Then the repo rules the tooling cannot see (`CLAUDE.md`, `tests/README.md`):

- Every test has `// Given`, `// When`, `// Then` comments explaining why.
- A bug fix comes with a test that fails without the fix, or the handoff says why it can't.
- A new `Onyx.connectWithoutView` has a comment justifying it. In a component it also needs `@frontend-performance` approval linked in the PR body.
- New strings go in `src/languages/en.ts` only. The other locales are generated from it by `scripts/generateTranslations.ts`. On a PR from a fork that doesn't run automatically, so say in the handoff that someone from Expensify has to run it.
- No new `useMemo`, `useCallback` or `React.memo` in a file the React Compiler handles.
- The `Mobile-Expensify` submodule pointer didn't move by accident: `git diff --ignore-submodules=none upstream/main -- Mobile-Expensify`.

## 2. Verify

Prove the change on the surface it touches. CI can't see this part, so it's the evidence the reviewer needs.

| Change | Run | Evidence |
|---|---|---|
| Web UI | `/playwright-app-testing` against the local dev server (:8082), never production | Screenshots or a recording for `MacOS: Chrome / Safari` |
| Native UI or platform code | `/agent-device` on the iOS simulator or Android emulator | `/agent-device-evidence` MP4s for the native sections |
| Logic with no UI | Jest | The test names, in `### Tests` |
| Performance | `/measure-telemetry-span`, before and after, on realistic data | A before/after table |

- For a bug fix, capture the bug before fixing it, with the failing test first or a recording of the broken behavior. Checking out `main` later costs a fresh `npm install` in another worktree.
- The template asks for five platforms. Cover what you can and name the rest in the handoff. Never tick a box for a platform you didn't test.
- Ad hoc builds (the test builds an Expensify employee triggers on a PR) are out of scope. If a change needs one, say so in the handoff.

If you couldn't verify something, say so and name what stopped you. "Inconclusive" is more useful to the reviewer than a confident claim with no evidence.

## 3. Self-review in a fresh context

The agent that wrote the change doesn't get to judge it. Spawn two reviewers with no memory of this conversation, in parallel:

1. Bug hunt: give it [references/review-prompt.md](references/review-prompt.md) with `<base>` and `<triage-file>` filled in.
2. Rules: have it check the local diff (`git diff $(git merge-base upstream/main HEAD)`, since there is no PR for `gh pr diff` yet) against every rule in `.claude/skills/app-coding-standards/rules/`. claude-review applies the same rules once the PR is out of draft, so fixing them now saves a review round.

Don't fix anything yet. Show the human every `critical` and `important` finding with:

- the finding as `file:line`, severity, and what breaks
- your verdict: agree or disagree, with one line why (check the claim against the code first)
- the fix you'd make, for the ones you agree with

The human decides which to fix. Fix only those, then rerun steps 1 and 2 for what the fixes touched. Keep a one-line reason for every finding left unfixed, for the handoff.

If you can't spawn a reviewer, re-read the whole diff cold against the same prompt yourself and say so in the handoff.

## 4. Commit and open

- Branch off an up-to-date `upstream/main`. Titles and commits use `<type>: <description>` (fix, feat, refactor, upgrade, chore, docs, test, perf, ci), the branch name starts with the same type (`fix/...`), and commit messages stay on one line.
- The body is `.github/PULL_REQUEST_TEMPLATE.md` as it is:
    - `### Explanation of Change`: a few plain sentences on what changed and why.
    - `### Fixed Issues`: the full `$ https://github.com/Expensify/App/issues/<id>` link and the `PROPOSAL:` link.
    - `### Tests`, `### Offline tests`, `### QA Steps`: numbered steps a reviewer can repeat, built from step 2. `[No QA]` goes in the title when QA has nothing to test.
    - `### Screenshots/Videos`: the step 2 evidence under each platform.
    - The author checklist: never change its text, and leave the boxes to the human. The human ticks them to vouch for the PR.
- Show the human the title, body, media list and commits, and ask whether to open it as a draft or ready for review. Default to draft:
    - Draft: claude-review and Codex skip drafts, so babysit clears CI first and the bot round starts when the human marks it ready.
    - Ready for review: the bots and reviewers start right away.
- After approval, push to your fork (`origin` below) and open it. Drop `--draft` when the human picked ready for review:

```bash
git push origin HEAD
gh pr create --repo Expensify/App --base main --head <fork-owner>:<branch> --draft --title "<type>: <description>" --body-file <file>
```

Media upload with `gh pr create --attach` needs `gh` 2.99+. With an older `gh`, the human drags the step 2 files into the PR in the browser: list their paths in the handoff.

## 5. Babysit

Hand the PR to the [babysit](../babysit/SKILL.md) skill and run it to `READY`. If you opened a draft, babysit again once the human marks it ready, for the claude-review and Codex round that follows.

## Handoff

Reply to the human with:

- the PR URL and the babysit verdict
- how it was verified (surface, what you ran, what you saw, where the media is, platforms not covered)
- which review findings the human chose to fix, and the one-line reason for each one left unfixed
- anything left for them: checklist boxes, media upload, marking it ready, escalated threads, parts you could not verify
