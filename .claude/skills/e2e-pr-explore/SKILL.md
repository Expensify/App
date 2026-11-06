---
name: e2e-pr-explore
description: Writes test scenarios for an App PR from its code alone, without reading its description, QA steps, comments or linked issues, and posts up to 10 paths most likely to break as a PR comment. Use when asked to run /e2e-pr-explore <PR>, to find what a PR can break, or to suggest regression scenarios for a C+ review.
alwaysApply: false
---

# E2E PR Explore

This skill reads an App PR's code, never its description or QA steps, and posts up to 10 paths most likely to break as one PR comment. It never runs the app and is never a required check. The C+ reviewer runs the paths by hand or through Melvin, along with the author's QA steps.

Why: a PR's QA steps cover the flow its author meant to change. Deploy blockers mostly land outside it: another report or workspace type, a narrow screen, offline, a different role, or another screen that uses the same code.

**Fetch the code → write paths blind → check them → post one PR comment.**

## Inputs

- A PR number in `Expensify/App`, for example `/e2e-pr-explore 103121`.
- Locally, before a PR exists: run `git fetch origin main`, skip step 1, use `git diff $(git merge-base origin/main HEAD)` as the diff, your checkout as the worktree and `git merge-base origin/main HEAD` as the base commit. Skip the description check in step 3, and print the comment instead of posting it.

If step 1 fails, stop and say why. If a later command fails, go on without it and name it in the comment's footer.

## 1. Fetch the code at the PR's head

```sh
PR=<number>
gh pr view "$PR" -R Expensify/App --json state,headRefOid,baseRefName,files
BASE=$(gh pr view "$PR" -R Expensify/App --json baseRefName --jq .baseRefName)
git worktree remove --force "/tmp/e2e-pr-explore-$PR" 2>/dev/null
git fetch https://github.com/Expensify/App.git "+pull/$PR/head:e2e-pr-explore-$PR" "+$BASE:e2e-pr-explore-$PR-base"
git worktree add "/tmp/e2e-pr-explore-$PR" "e2e-pr-explore-$PR"
git -C "/tmp/e2e-pr-explore-$PR" merge-base HEAD "e2e-pr-explore-$PR-base"
gh pr diff "$PR" -R Expensify/App > "/tmp/e2e-pr-explore-$PR.diff"
```

The last `merge-base` prints the **base commit**: the point where the PR left its base branch. Read source from the worktree, not from your checkout, so the paths match the code under review. Clean up after step 4:

```sh
git worktree remove --force "/tmp/e2e-pr-explore-$PR"
git branch -D "e2e-pr-explore-$PR" "e2e-pr-explore-$PR-base"
```

## 2. Write paths blind

Start a separate subagent for this step. Give it only the PR number, the worktree path, the diff path, the base commit and the rest of this section. If you can't start a subagent, do it yourself and don't read anything outside the allowed list until step 3. If the PR's title or description is already in your context (for example because someone asked for this run in a PR comment), say so in the footer.

### Allowed

- The diff, and any file in the worktree (read, grep, `git show`).
- `git log` up to the base commit only, never this PR's own commits (`git log <base commit>..HEAD`): their messages describe what the author meant to change.
- `gh pr view <PR> -R Expensify/App --json files,headRefOid,baseRefName`.
- Deploy blocker issues of **other** PRs that touched the same files (step 2d).

### Not allowed

This PR's title, description, QA steps, Tests section, comments, reviews, linked issues, or any issue or search that mentions the PR. The paths have to come from what the code can break, not from what the author meant to change. At the end, list every command you ran, so the main agent can check it in step 3.

### 2a. Map where the changed code shows up

For each changed component, hook, selector, action or util, follow imports upward until you reach screens (`src/pages/**`). Map each screen to its route (`src/ROUTES.ts`, `src/SCREENS.ts`) and to how a user gets there. These are the **entry points**. Regressions mostly land in the ones the author didn't touch, so list all of them, not only the screens the diff edits.

Also follow the data: when the diff changes an Onyx key, a `*Utils` function or an action's optimistic data, find every other reader of that key or function.

When the diff changes a role, permission or membership rule, grep for the role's consumers (for example `isPolicyAdmin`, `isPolicyGuest`, `CONST.POLICY.ROLE`) and treat each one as an entry point.

### 2b. Turn each new condition into a data variant

Every new or changed `if`, ternary, early return, selector or feature flag is a variant to check with data that takes each branch, for example:

- One item or many (single-expense report vs several expenses, one workspace vs several).
- Report type: expense, IOU, invoice, chat, self DM, task, workspace room.
- State: draft, submitted, approved, paid, archived, deleted.
- Amount: positive, negative, zero, foreign currency.
- Role: admin, auditor, approver, member, guest, copilot, delegate.
- Workspace type and features: Collect vs Control, taxes, categories, tags, report fields, accounting integration.

Two variants apply everywhere they make sense:

- **Offline:** every write or optimistic update. Go offline, do the action, come back online, and check the result and any error.
- **Narrow layout:** any code that branches on `shouldUseNarrowLayout`, `isSmallScreenWidth` or `useResponsiveLayout`, or that touches RHP, the bottom tab bar or modals.

### 2c. Add checks from past deploy blockers

| The diff changes | Add checks for |
| --- | --- |
| A computed or displayed value | Every other place it shows: system messages in the thread, report and chat previews, LHN, Search columns, report totals, after editing it, after reload |
| Navigation, lists or position ("x of y", arrows, Back) | Round trips (open, link, Back, Back), opening by direct URL, every entry point, state after removing or moving an item. Every link in a changed header is its own entry point |
| Actions or buttons | Each status (draft, submitted, approved, paid), bulk selection, the same action from the More menu, the header and Search |
| Writes or optimistic updates | The same action from a second entry point, undo, offline, reopening the item afterwards |
| Deleting, moving or merging | Where the item ends up (self DM, another report), totals on both sides, the thread and LHN afterwards |
| A role, permission or membership rule | Set the relationship up first, then change the role, then check everything the role controls from the admin side and from the member's side, including rooms other than #admins and #announce |
| Shared UI (`src/components/**`, styles, hooks) | The two or three busiest other screens that render it |

### 2d. Look at history

```sh
git log --format='%H %s' -n 30 <base commit> -- <changed files>
```

For each commit, find its PR, then that PR's deploy blockers:

```sh
gh api "repos/Expensify/App/commits/<sha>/pulls" --jq '.[].number'
gh issue list -R Expensify/App --label DeployBlockerCash --state all --search "https://github.com/Expensify/App/pull/<number>"
```

When trying the skill on an already merged PR, count only issues created before it merged. Turn each blocker into a general flow ("remove an expense from a report, then use the arrows") and keep the ones this diff can affect.

### 2e. Pick the paths

Rank paths by how likely they are to break and how much it would hurt, for example submitting, approving or paying a report, sending a message, or changing a member's role and then using the workspace. Base the number on what the change puts at risk, not on the diff's size: a one-line change to a shared helper can need many paths, a large change to one screen can need few.

- Write at most 10 paths. Aim for 6 or more. Write fewer only when the change can't reach 6 different flows.
- If no path is left (for example the diff only changes tests, docs or CI), say why and stop. Don't post.
- Each path is one user flow, end to end, with the variants that matter for it. Don't list every combination: pick the variant most likely to break and name the others in one line.
- Skip the main flow the diff is about, in its default state. The author's QA steps cover it; the value is in everything around it.
- Every path must point at the code that puts it at risk (`file:line` in the PR's head). No pointer, no path.

Entry points no path covers go in the "Not covered" list.

### 2f. Write each path in this format

```md
### <n>. <Short title: what might break, where>

**Why it's at risk:** <one or two sentences> (`src/path/File.tsx:123`)
**Setup:** <accounts, roles, workspace type and settings, reports and their state>
**Platform:** <All | Narrow layout | Native only | Web only>

1. <Action>
2. <Action>
3. Verify <expected result>
```

Write setup a C+ reviewer can create in a few minutes on a build of this PR, with a fresh account. Spell out the expected result; "works correctly" isn't checkable.

## 3. Check the paths

Back in the main agent, check every path before posting:

- The subagent's command list stays inside the allowed list. If it read anything not allowed, run step 2 again.
- The `file:line` exists at the PR's head and the code there does what the path claims.
- The expected result is what the code intends. If the code, its tests or its UI text say the behavior is deliberate, drop or fix the path.
- No two paths test the same flow.
- The list doesn't just repeat the QA steps. This is the first point where you may read the PR description: drop any path the QA steps already cover. Don't add or rewrite paths after reading it.

If no path is left, say why and stop. Don't post.

## 4. Post the comment

If the PR is merged or closed, print the comment instead of posting it. When running locally on an open PR, show the comment to the user and post it only after they confirm. Melvin posts it directly.

Use one comment per PR and update it when the skill runs again. Start it with the marker `<!-- e2e-pr-explore -->` so you can find it:

```sh
gh api "repos/Expensify/App/issues/$PR/comments" --paginate --jq '.[] | select(.body | test("^<!-- e2e-pr-explore -->")) | .id'
```

If it returns an id, update that comment with `gh api -X PATCH repos/Expensify/App/issues/comments/<id> -F body=@<file>`. If it returns more than one, update the first. Otherwise create it with `gh pr comment "$PR" -R Expensify/App --body-file <file>`.

Comment template:

```md
<!-- e2e-pr-explore -->
## Paths this PR could break

Written from the code only, without the PR description or QA steps. Run them along with the QA steps, by hand or by asking Melvin. This isn't a required check: if a path is wrong or out of scope, say so and move on.

<paths from step 2f>

<details><summary>Not covered</summary>

<entry points and variants no path covers, one line each>

</details>

<sub>Generated by `/e2e-pr-explore` at <short head SHA>. <Only if needed: commands that failed, and whether the PR's title or description was already in context.></sub>
```
