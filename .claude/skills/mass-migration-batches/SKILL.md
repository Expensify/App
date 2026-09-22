---
name: mass-migration-batches
description: Runbook for executing one batch of a large-scale codebase migration tracked as a GitHub tracking issue with native sub-issues (queried via the sub_issues API, not the issue body) — one sub-issue per batch. Use when asked to work a batch of a tracked mass migration ("do batch N", "continue the migration", "run the next batch of issue #X"): resolves the batch's file scope from its sub-issue, applies the already-established transformation pattern, runs this repo's full local verification gauntlet, captures per-platform video evidence, and opens a scope-disciplined draft PR — resuming correctly if a prior run was interrupted.
---

# Mass Migration Batches

Executes **one batch at a time** of a codebase-wide migration whose batch boundaries live in a GitHub tracking issue's **native sub-issues** (distinct from a markdown checklist in the issue body). Assumes the tracking issue, its sub-issues, and a pattern-setting pilot batch already exist — planning those is a separate, prior step this skill does not do.

See `references/worked-example-header-migration.md` for how this played out end-to-end on a real migration (the `HeaderWithBackButton` → composed `Header` sweep, [Expensify/App#96611](https://github.com/Expensify/App/issues/96611)).

## When to Use This Skill

- The user says "do batch N", "continue the migration for issue #X", "run the next batch", "resume the &lt;feature&gt; migration".
- There's a GitHub issue serving as a tracking issue with **sub-issues** (not just a checklist body) where each sub-issue scopes one batch of files.
- **Not** for: deciding how to split files into batches in the first place, or authoring the transformation pattern itself. Both are prerequisites — this skill is the mechanical batch-execution loop, not the planning phase.

## Prerequisites (must already exist)

- A tracking issue with sub-issues created via GitHub's native sub-issues feature (one per batch), each listing its file scope (usually in a `<details>` block) and a "Done when" checklist.
- A **pilot / pattern-setting batch** already implemented (merged or not) that settles the transformation rules and any "which of several valid targets" decisions. Everything after the pilot is mechanical application of that precedent, not new design.
- `gh` CLI authenticated against the target repo.

If either is missing, stop and say so — this skill does not create tracking issues or invent the transformation pattern.

## Inputs

| Input | Required | Default |
|---|---|---|
| Tracking issue URL | Yes | — |
| Batch selector (number / range / "next" / "all remaining") | No | "next" not-yet-done batch per Step 1 |
| Base branch | No | `main` — but check for an unmerged pilot-implementation branch first (see worked example; this bit the Header migration on day one) |
| Branch naming convention | No | inspect `git branch -a` / `git log` for this repo's actual habit before inventing `<author>/<feature>/batch<N>` |
| Pilot/reference implementation (PR or commit) | Yes on first invocation, cached after | — |
| Platforms needing evidence | No | this repo's default: iOS simulator, Android emulator, web, mWeb — trim per migration |
| Evidence format | No | video, not screenshots |
| Autonomy scope (one batch vs. N unattended) | No | one batch per invocation unless autonomy explicitly granted |
| PR readiness | No | draft, always |

## Kickoff (once per migration, not once per batch)

Pin down every judgment call in the Inputs table **before** the first batch runs — especially once multi-batch autonomy is granted, since the entire point of autonomy is not stopping mid-run to ask.

- [ ] Tracking issue URL confirmed and sub-issues fetched once (`gh api repos/{owner}/{repo}/issues/{number}/sub_issues`).
- [ ] Pilot batch identified and its diff read for the transformation pattern + any per-file decision rules it established.
- [ ] Branch naming convention confirmed from real repo history, not invented.
- [ ] Base branch confirmed to actually contain the pilot's target API (see Step 0 below — don't assume the pilot merged).
- [ ] Platforms needing evidence confirmed.
- [ ] Autonomy scope confirmed: one batch and stop, or N remaining batches unattended with checkpoint updates.

## Step 0 — Resolve batch scope from the tracking issue

- Fetch sub-issues: `gh api repos/{owner}/{repo}/issues/{tracking-issue}/sub_issues --jq '.[] | {number, title, state}'`. **Do not** rely on `gh issue view --json body` — native sub-issues are not part of the tracking issue's markdown body.
- Fetch the target sub-issue's own body: `gh issue view <sub-issue-number> --json body,state` (or `gh api repos/{owner}/{repo}/issues/{number} -q .body` if the CLI's default repo doesn't match).
- Extract the file scope from its `<details>` block and the "Done when" checklist fresh each time — don't hardcode/cache file lists across sessions, since the tracked repo keeps moving.
- If listed paths no longer exist (renamed/deleted/already migrated since the tracking issue was filed), reconcile before starting rather than silently expanding or shrinking scope.
- **Also confirm the base branch actually contains the pilot's target API** (e.g. `git show origin/<base>:<path-the-pilot-introduced>` — if missing, the pilot hasn't merged yet; see the worked example for how the Header migration handled this).

## Step 1 — Resumability / idempotency gate

State machine per batch: `not_started → branch_cut → migrated → verified → evidence_captured → pr_open`.

Before doing any work:
1. Derive the expected branch name from the naming convention.
2. Check `git ls-remote --heads origin <branch>` and local `git branch --list <branch>`.
3. Check for an existing PR referencing this sub-issue: `gh pr list --state all --search "<sub-issue-number> in:body"`.
4. Check a local progress cache (`~/.cache/mass-migration-batches/<owner>-<repo>-<tracking-issue-number>.json`, a map of `batchNumber → {status, branch, prUrl, updatedAt}`, never committed to the repo) and reconcile against the live GitHub/git state above — **GitHub/git is the source of truth; the cache is only a fast-path**, never trust it over a disagreement.
5. Branch on what's found:
   - Nothing exists → start fresh at Step 2.
   - Branch exists, no PR → check it out, diff against base to see which in-scope files are already migrated, resume Step 4 only for the remainder — never redo files already converted.
   - PR exists (open/draft) → already in flight; don't open a duplicate. Resume whichever step is incomplete (verification not run yet? evidence missing?) instead of restarting.
   - PR merged/closed and the sub-issue's "Done when" boxes are satisfied → already complete, report and move to the next batch.

## Step 2 — Create the batch branch

- Update the base branch first (`git fetch origin && git checkout <base> && git pull --ff-only`).
- Cut one fresh branch per batch from the base branch — never stack a batch's branch on top of a previous batch's *unmerged* branch unless the invoker explicitly asked for a stacked series.
- Name it per the confirmed convention.

## Step 3 — Mine the established transformation pattern

- Re-read the pilot batch's diff (and any prior completed batches) before touching a single file in this batch. The point of a pilot batch is that stylistic/API-shape decisions get made once — this step is "look it up," not "decide."
- If the pilot batch's PR description or code comments state a decision rule (e.g. "which of several valid target patterns to use for a given call shape"), treat that as binding precedent, not something to re-derive.
- If a call-site doesn't cleanly match any precedent yet established, that's a genuine judgment call — flag it explicitly in the batch's PR description or to the user rather than quietly improvising a new convention later batches would have to reconcile with.

## Step 4 — Apply the migration to every file in the batch's scope

- Touch only files listed in this sub-issue's scope. Nothing else.
- If something incidentally broken or worth fixing is noticed along the way, do **not** fix it in this batch's diff — note it (a comment on the tracking issue, a running notes file, or a message to the user) for separate follow-up. Same "keep unrelated fixes local" discipline this repo already applies to other scenarios.

## Step 5 — Run the full local verification gauntlet before opening any PR

- Enumerate this repo's actual CI-required checks and find/derive a local-runnable equivalent for each. Prefer the diff-scoped/changed-file variant for speed; know which checks are only meaningfully whole-repo/whole-project and budget time for those.
- Don't hardcode a check list forever — `package.json` scripts and `.github/workflows/*.yml` are the real source of truth and can change. Re-derive if this skill is reused in a different repo or scripts get renamed.
- The concrete snapshot of what this looks like in *this* repo right now lives in `references/verification-and-evidence.md`.
- Fix every failure before proceeding to Step 6 — a batch does not get a PR while its own gauntlet is red.

## Step 6 — Capture evidence

- Default to **video**, not screenshots, unless told otherwise.
- One recording per **distinct call-site/UI shape** in the batch, not one per file.
- Capture across every platform this repo supports for the kind of change being made — trim the default matrix when the migration plainly doesn't touch a given surface.
- **Efficiency principle**: when the migration itself is JS/TS-only and doesn't touch native modules, Podfile/Gradle, or `package.json`, build/boot each platform's app **once** for the whole multi-batch run and reuse that live instance — `git checkout` into the next batch's branch and rely on Fast Refresh / HMR, rather than rebuilding native per batch. Rebuild only when a batch itself changes build-affecting files, or an actual build/connection failure occurs.
- Before assuming a rebuild or environment fix is needed, check environment/session memory for gotchas already solved on a prior batch (toolchain incompatibilities, lockfile relock behavior blocking `git pull`, etc.) — these are one-time environment fixes, not per-batch problems.
- Mechanics for the recording itself are delegated to `argent-screen-recording` / `argent-ios-simulator-setup` / `argent-android-emulator-setup` / `playwright-app-testing`, not reimplemented here.

## Step 7 — Open the draft PR

- Always a literal GitHub **draft** PR (`gh pr create --draft`) unless explicitly told otherwise.
- Use this repo's PR template verbatim (`.github/PULL_REQUEST_TEMPLATE.md`).
- `### Fixed Issues`: link this batch's **own sub-issue** (`$ https://github.com/.../issues/<sub-issue-number>`) — the parent tracking issue gets mentioned separately as context (e.g. "Part of #<tracking-issue-number>").
- `### Tests` / `### QA Steps`: real, numbered, UI-reachable steps per platform — not vague placeholders, unless genuinely identical to a prior batch and stated as such.
- Complete the full `### PR Author Checklist` honestly — only check boxes actually verified in Steps 5–6.
- Attach/link the evidence captured in Step 6 (or leave the template's placeholder blocks for the invoker to fill, if they've asked to do that themselves).

## Step 8 — Update tracking and report

- Mark the batch `pr_open` in the local progress cache.
- This skill's responsibility ends at a verified, evidenced, draft PR — merging and closing the sub-issue's "Done when" checklist happen later through normal review, not polled or actioned here.
- Surface a concise checkpoint update now: batch number, PR URL, one line of what's left. Do this **at batch boundaries**, not silently through a multi-hour run and not more chattily than that.

## Step 9 — Continue or stop

- If the invoker granted multi-batch autonomy and batches remain, loop back to Step 0 for the next unresolved batch.
- Otherwise stop after the requested batch(es) and hand control back explicitly.

## Autonomous execution etiquette

When full autonomy for this bounded, repetitive task has been explicitly granted: don't ask clarifying questions per batch — front-load every judgment call into Kickoff. Track progress durably (Step 1's cache + live git/gh state) so an interrupted/restarted session resumes correctly instead of redoing or skipping batches. Report at natural checkpoints (Step 8), not continuously and not silently.

## Scope discipline

Each batch's branch/PR contains only that batch's migration. Nothing else, even when something incidentally broken is noticed — that goes in a note for later, not into the diff.

## Worked example

This pattern was extracted from migrating ~495 `HeaderWithBackButton` call-sites onto a new `Header` primitive system (tracking issue [Expensify/App#96611](https://github.com/Expensify/App/issues/96611), 19 sub-issues). See `references/worked-example-header-migration.md` for how each step above mapped onto that real case — treat every concrete detail there (branch names, exact directories, the specific component API) as illustrative, not as this skill's rule.

## Related skills / files

| Reference | Use for |
|---|---|
| `argent-screen-recording` | iOS/Android video capture mechanics |
| `argent-ios-simulator-setup` / `argent-android-emulator-setup` | Booting/connecting devices before recording |
| `playwright-app-testing` | Web evidence capture and general browser-based verification |
| `review-code-pr` (slash command) | Local equivalent of AI-reviewer style categories (e.g. this repo's CONSISTENCY/PERF) |
| `app-coding-standards` | The underlying rule set that `review-code-pr` checks against |
| `.github/PULL_REQUEST_TEMPLATE.md` | Exact PR body structure to fill per batch |
