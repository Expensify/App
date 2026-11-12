---
name: e2e-pr-explore
description: Writes test scenarios for an App PR from its code alone, without reading its description, QA steps, comments or linked issues, and posts up to 10 paths most likely to break as a PR comment. Use when asked to run /e2e-pr-explore <PR>, to find what a PR can break, or to suggest regression scenarios for a C+ review.
alwaysApply: false
---

# E2E PR Explore

Give it a PR number in `Expensify/App`, for example `/e2e-pr-explore 103121`. It reads the PR's code, never its description or QA steps, and posts up to 10 paths most likely to break as one PR comment. It never runs the app and is never a required check. The C+ reviewer runs the paths by hand or through Melvin, along with the author's QA steps.

**Fetch the code → write paths blind → check them → post one PR comment.**

## 1. Fetch the code at the PR's head

Run this as written, from the root of any checkout of App (the **repo**). It copies the PR's code into `$DIR/code` without its git history, so nothing there can show the PR's commit messages. If this step fails, stop and say why. If a later command fails, go on without it and add it to the footer's run notes.

```sh
PR=<number>
DIR="/tmp/e2e-pr-explore-$PR"
rm -rf "$DIR"; mkdir -p "$DIR/code"
eval "$(gh pr view "$PR" -R Expensify/App --json mergedAt,headRefOid,baseRefOid \
  --jq '@sh "MERGED_AT=\(.mergedAt // "") HEAD_SHA=\(.headRefOid) BASE_SHA=\(.baseRefOid)"')"
echo "MERGED_AT=$MERGED_AT HEAD_SHA=$HEAD_SHA BASE_SHA=$BASE_SHA"
git fetch -q --no-recurse-submodules https://github.com/Expensify/App.git "$BASE_SHA" "pull/${PR}/head"
git archive "$HEAD_SHA" | tar -x -C "$DIR/code"
gh pr diff "$PR" -R Expensify/App > "$DIR/diff"
```

- `$DIR/code` is the PR's code at its head. Read source there, not from your checkout, so the paths match the code under review.
- `BASE_SHA` is the **base commit**: a commit on the base branch from before this PR merged, so its history has none of the PR's own commits.
- `MERGED_AT` is the merge date (empty if not merged), and `HEAD_SHA` goes in the comment's footer.

Cleanup, always the last thing you run, however the run ends: `rm -rf "$DIR"`.

## 2. Write paths blind

Start a separate subagent with no history from this conversation and wait for it to finish. Give it only:

- the real values of the PR number, `$DIR`, the repo path, the base commit and `MERGED_AT` (not the variable names);
- the instruction to read and follow `<repo>/.claude/skills/e2e-pr-explore/subagent.md`, with the repo path filled in.

If you can't start a subagent, follow `subagent.md` yourself and don't read anything outside its allowed list until step 3. If the PR's title, description or a commit message is already in your context (for example because someone asked for this run in a PR comment), add that to the footer's run notes.

## 3. Check the paths

Back in the main agent, read `$DIR/paths.md` and check it in this order.

First, without reading the PR description:

- If the subagent's command list shows it read this PR's text (title, description, comments or commit messages), run step 2 again once and add that to the run notes. If it happens again, stop and tell the user why.
- If it wrote no paths, skip the rest of this step, including the description.
- The `file:line` exists at the PR's head and the code there does what the path claims. Fix a wrong claim, or drop the path if its steps no longer make sense.
- The expected result is what the code intends. If the code, its tests or its UI text say the behavior is deliberate, fix the path or drop it.
- No two paths test the same flow.

Then read the PR description. This is the first point where you may. Drop any path its QA steps already cover in full. Keep paths they cover only in part. From here on, only drop paths or steps and renumber the rest: don't add or rewrite any.

If no path is left at any point in this step, tell the user in one or two sentences why, don't post anything, and go to cleanup.

## 4. Post the comment

Decide how to deliver it:

- **Someone asked for this run in a comment on the PR** (for example through Melvin): post it.
- **Anyone else** (for example the author running it in a terminal): show the full comment, not a summary, then ask whether to post it.

Use one comment per PR and update it when the skill runs again. Start it with the marker `<!-- e2e-pr-explore -->` so you can find it:

```sh
gh api "repos/Expensify/App/issues/$PR/comments" --paginate --jq '.[] | select(.body | test("^<!-- e2e-pr-explore -->")) | .id'
```

Write the comment to `$DIR/comment.md`. If the lookup returns an id, update that comment with `gh api -X PATCH repos/Expensify/App/issues/comments/<id> -F body=@$DIR/comment.md`. Otherwise create it with `gh pr comment "$PR" -R Expensify/App --body-file "$DIR/comment.md"`.

Comment template:

```md
<!-- e2e-pr-explore -->
## Paths this PR could break

Written from the code only, without the PR description or QA steps. Run them along with the QA steps, by hand or by asking Melvin. This isn't a required check: if a path is wrong or out of scope, say so and move on.

<common setup, if any, and the paths in the format from subagent.md, step 2e>

<details><summary>Not covered</summary>

<entry points and variants no path covers, one line each>

</details>

<sub>Generated by `/e2e-pr-explore` at <short head SHA>. <Run notes, only if any: commands that failed, step 2 reruns, or PR text that was already in context.></sub>
```
