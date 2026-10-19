---
name: ship-pr
description: Take finished work in Expensify/App to a PR a human can review without fighting CI or bots. Runs the CI checks locally, verifies the change in the running app, gets a fresh-context review, opens a draft PR from your fork with the App template, then babysits it. Use when asked to open, create, ship or submit a PR, or when implementation is done and the next step is review.
---

# Ship a PR

Opening the PR isn't the finish line. The finish line is a PR where the human only has judgment calls left: checks green, the change shown working in the app, reviewed by a fresh pair of eyes, and every bot comment handled.

Run every step. If one can't run, say which and why in the handoff instead of skipping it quietly. Nothing gets committed, pushed or posted without the human's approval.

## 1. Checks

Run what CI runs for what you touched, and fix everything:

```bash
npm run fmt                                             # oxfmt, a CI gate the CLAUDE.md checklist doesn't list
npm run lint-changed
npm run typecheck
npm run react-compiler-compliance-check check-changed
npm run spell-changed
npm test -- <test files for the code you changed>       # the direct test files, not --findRelatedTests
```

`lint-changed` and `spell-changed` diff against `origin/main`. If `origin` is your fork and its `main` is behind upstream, they also check a few files you didn't touch. Ignore findings in those.

Don't use `--findRelatedTests` for Jest. Core libs like `MoneyRequestReportUtils` are imported almost everywhere, so it pulls in a large part of the suite and ran for over 10 minutes. CI runs the full suite in about 2.5 minutes across 8 shards, so leave the wider run to CI.

Then the repo rules no tool checks:

- Every new test has `// Given`, `// When`, `// Then` comments saying why (`tests/README.md`).
- A bug fix comes with a test that fails without the fix, unless the fix can't be tested at that level. Say so if not.
- A new `Onyx.connectWithoutView` has a comment justifying it. In a component it also needs `@frontend-performance` approval linked in the PR body.
- New strings exist in every file under `src/languages/` (typecheck enforces the shape). PRs from forks don't get translations generated automatically.
- No new `useMemo`, `useCallback` or `React.memo` in a file the compiler handles.
- The `Mobile-Expensify` submodule pointer didn't move by accident: `git diff --ignore-submodules=none upstream/main -- Mobile-Expensify`.

## 2. Verify

Show the change working on the surface it touches. CI can't see this part, so it's the evidence the reviewer needs.

| Change                     | How                                                                               | Evidence                                                |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Web UI                     | `/playwright-app-testing` against the local dev server on :8082, never production | Screenshots or a recording for `MacOS: Chrome / Safari` |
| Native UI or platform code | `/agent-device` on the iOS simulator or Android emulator                          | `/agent-device-evidence` MP4s for the native sections   |
| Logic with no UI           | Jest                                                                              | The test names, in `### Tests`                          |
| Performance                | `/measure-telemetry-span`, before and after, with realistic data                  | The before/after numbers                                |

For a bug fix, capture the bug before fixing it: write the failing test first, or record the broken behavior first. Checking out `main` later costs a fresh `npm install` in another worktree.

The App template asks for five platforms. Cover what you can, and in the handoff name the platforms you didn't run. Never tick a platform box for a platform you didn't test.

## 3. Fresh-context review

The agent that wrote the change doesn't get to judge it. Start two subagents that haven't seen this conversation, in parallel:

1. **Bug hunt:** give it [references/fresh-review.md](references/fresh-review.md) with the base filled in.
2. **Rules:** have it check the local diff (`git diff $(git merge-base upstream/main HEAD)`, not `gh pr diff`, because there's no PR yet) against every rule in `.claude/skills/app-coding-standards/rules/`. These are the same rules claude-review applies once the PR is out of draft, so catching them now saves a round.

Fix every `critical` and `important` finding you agree with, then rerun steps 1 and 2 for whatever the fixes touched. For every finding you reject, keep a one-line reason for the handoff.

If you can't start a subagent, reread the whole diff cold against the same prompt yourself and say so in the handoff.

## 4. Open

- Branch from an up-to-date `upstream/main`. Titles and commits use `<type>: <description>` (fix, feat, refactor, upgrade, chore, docs, test, perf, ci), and the branch name starts with the same type (`fix/...`). Keep commit messages to one line.
- The body is `.github/PULL_REQUEST_TEMPLATE.md` exactly as it is:
    - `### Explanation of Change`: a few plain sentences on what changed and why.
    - `### Fixed Issues`: the full `$ https://github.com/Expensify/App/issues/<id>` link and the `PROPOSAL:` link.
    - `### Tests`, `### Offline tests`, `### QA Steps`: numbered steps a reviewer can repeat, built from what you ran in step 2.
    - `### Screenshots/Videos`: the evidence from step 2 under each platform.
    - The author checklist: never change its text. Leave the boxes for the human. They're the human's attestation.
    - Put `[No QA]` in the title when there's nothing for QA to test.
- Show the human the title, the body, the media list and the commits. After approval, push to your fork (`origin` below) and open a draft:

```bash
git push origin HEAD
gh pr create --repo Expensify/App --base main --head <fork-owner>:<branch> --draft --title "<type>: <description>" --body-file <file>
```

Local `gh` can't upload media (`--attach` needs 2.99+), so the human drags the files from step 2 into the PR in the browser. List their paths in the handoff.

## 5. Babysit

Hand the PR to the [babysit](../babysit/SKILL.md) skill and run it until it's `READY`. Because the PR is a draft, claude-review hasn't run yet. Once the human marks it ready, babysit again for the bot round that follows.

## Handoff

Tell the human:

- the PR URL and the babysit verdict
- how it was verified: the surface, what you ran, what you saw, where the media files are, and which platforms weren't covered
- what you fixed from the fresh review, and what you dismissed and why
- what's left for them: checklist boxes, uploading media, marking it ready, escalated threads, anything you couldn't verify
