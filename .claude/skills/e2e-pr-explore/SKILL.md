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
- Locally, before a PR exists: run `git fetch origin main` and set `DIR` to a new empty folder. Skip step 1, use your checkout as the code and the repo, `git diff $(git merge-base origin/main HEAD)` as the diff and `git merge-base origin/main HEAD` as the base commit. Skip the description check in step 3, and print the comment instead of posting it.

If step 1 fails, stop and say why. If a later command fails, go on without it and add it to the footer's run notes. However the run ends (posted, printed or stopped), run the cleanup at the end of step 1 last.

## 1. Fetch the code at the PR's head

Run this as written, from any checkout of App. It copies the PR's code into `$DIR/code` without its git history, so nothing there can show the PR's commit messages. The fetched branches are deleted as soon as they're used, for the same reason.

```sh
PR=<number>
DIR="/tmp/e2e-pr-explore-$PR"
rm -rf "$DIR"; mkdir -p "$DIR/code"
pwd | tee "$DIR/repo"
gh pr view "$PR" -R Expensify/App --json state,mergedAt,headRefOid,baseRefName,files
BASE=$(gh pr view "$PR" -R Expensify/App --json baseRefName --jq .baseRefName)
MERGE=$(gh pr view "$PR" -R Expensify/App --json mergeCommit --jq '.mergeCommit.oid // ""')
git fetch -q https://github.com/Expensify/App.git "+pull/$PR/head:e2e-pr-explore-$PR" "+$BASE:e2e-pr-explore-$PR-base"
git archive "e2e-pr-explore-$PR" | tar -x -C "$DIR/code"
if [ -n "$MERGE" ]; then UPSTREAM="$MERGE^1"; else UPSTREAM="e2e-pr-explore-$PR-base"; fi
git merge-base "e2e-pr-explore-$PR" "$UPSTREAM" | tee "$DIR/base"
git branch -D -q "e2e-pr-explore-$PR" "e2e-pr-explore-$PR-base"
gh pr diff "$PR" -R Expensify/App > "$DIR/diff"
```

- `$DIR/code` is the PR's code at its head. Read source there, not from your checkout, so the paths match the code under review.
- `$DIR/repo` is the checkout you ran this from. The subagent reads older history there (`subagent.md`, step 2d).
- `$DIR/base` holds the **base commit**: the last commit on the base branch before this PR's own commits. For a merged PR it comes from the merge commit's first parent, because the PR is already part of the base branch.
- `mergedAt` is the merge date, or empty if the PR isn't merged.

Cleanup, always the last thing you run:

```sh
git branch -D -q "e2e-pr-explore-$PR" "e2e-pr-explore-$PR-base" 2>/dev/null
rm -rf "$DIR"
```

## 2. Write paths blind

Start a separate subagent with no history from this conversation and wait for it to finish: in Claude Code use the Agent (Task) tool with a `general-purpose` agent; in pi use the `subagent` tool with the `delegate` agent and `async: false`. Give it only:

- the real values of the PR number, `$DIR`, the repo path, the base commit and `mergedAt` (not the variable names);
- the instruction to read and follow `<repo>/.claude/skills/e2e-pr-explore/subagent.md`, with the repo path filled in.

If you can't start a subagent, follow `subagent.md` yourself and don't read anything outside its allowed list until step 3. If the PR's title, description or a commit message is already in your context (for example because someone asked for this run in a PR comment), add that to the footer's run notes.

## 3. Check the paths

Back in the main agent, read `$DIR/paths.md` and `subagent.md`, and check the paths in this order.

First, without reading the PR description:

- The subagent's command list stays inside the allowed list in `subagent.md`. A shortened list is fine when every entry is clearly allowed. If it read anything not allowed, left the list out, or skipped a step for a reason that doesn't hold, run step 2 again and add that to the run notes.
- If the subagent wrote no paths, check its reason against the diff. If it holds, tell the user in one or two sentences why there are no paths, don't post anything, and go to cleanup.
- The `file:line` exists at the PR's head and the code there does what the path claims. Fix a wrong claim, or drop the path if its steps no longer make sense.
- The expected result is what the code intends. If the code, its tests or its UI text say the behavior is deliberate, fix the path or drop it.
- No two paths test the same flow.

Then read the PR description. This is the first point where you may. Drop any path its QA steps already cover in full. Keep paths they cover only in part. From here on, only drop paths and renumber the rest: don't add or rewrite any.

If no path is left, tell the user why, don't post anything, and go to cleanup.

## 4. Post the comment

Decide how to deliver it:

- **The PR is merged or closed:** print the comment. Skip the rest of this step.
- **Someone asked for this run in a comment on the PR** (for example through Melvin): post it.
- **Anyone else** (for example the author running it in a terminal): show the comment and post it only after they confirm.

Use one comment per PR and update it when the skill runs again. Start it with the marker `<!-- e2e-pr-explore -->` so you can find it:

```sh
gh api "repos/Expensify/App/issues/$PR/comments" --paginate --jq '.[] | select(.body | test("^<!-- e2e-pr-explore -->")) | .id'
```

Write the comment to `$DIR/comment.md`. If the lookup returns an id, update that comment with `gh api -X PATCH repos/Expensify/App/issues/comments/<id> -F body=@$DIR/comment.md`. If it returns more than one, update the first. Otherwise create it with `gh pr comment "$PR" -R Expensify/App --body-file "$DIR/comment.md"`.

Comment template:

```md
<!-- e2e-pr-explore -->
## Paths this PR could break

Written from the code only, without the PR description or QA steps. Run them along with the QA steps, by hand or by asking Melvin. This isn't a required check: if a path is wrong or out of scope, say so and move on.

<paths in the format from subagent.md, step 2f>

<details><summary>Not covered</summary>

<entry points and variants no path covers, one line each>

</details>

<sub>Generated by `/e2e-pr-explore` at <short head SHA>. <Run notes, only if any: commands that failed, step 2 reruns, or PR text that was already in context.></sub>
```
