# Worked example: HeaderWithBackButton → composed Header

This is **one instance** of the mass-migration-batches pattern, not the rule. Every concrete detail here (branch names, directories, the specific component API) is illustrative — apply the *shape* of what happened, not the literal specifics, to a different migration.

## The tracking issue

[Expensify/App#96611](https://github.com/Expensify/App/issues/96611) proposes replacing the legacy `HeaderWithBackButton` (~50 flat props, ~495 call-sites) with a composed `Header` primitive system. It has 19 **native sub-issues** (#101530–#101548, fetched via `gh api repos/Expensify/App/issues/96611/sub_issues` — they are invisible in the tracking issue's own `body` field).

Each sub-issue's body shape:
```
## Scope
workspace/companyCards/ + upgrade/ + downgrade/ + invoices/ (28 files)

## Background
<boilerplate linking back to #96611 and the master batch-plan comment>

<details><summary>28 files</summary>
src/pages/workspace/companyCards/...
...
</details>

## Done when
- [ ] All files in scope migrated to the composed Header
- [ ] Checks pass (lint, typecheck, knip, CONSISTENCY, PERF)
- [ ] PR merged

Issue Owner: <details>...</details>
```

Some sub-issue bodies also carry **stale guidance** left over from before the pilot batch settled the target API (e.g. "the target shape isn't decided yet, follow whatever the first migration PR establishes," or a reference to a component path that was later renamed). Treat the sub-issue's file list and "Done when" checklist as authoritative; treat prose describing the target API as superseded by whatever the pilot batch actually shipped.

## The pilot batch, and a lesson learned the hard way

Batch 1 (#101530, `workspace/rules/`, 29 files) was implemented inside [PR #98601](https://github.com/Expensify/App/pull/98601) — but at the time batches 2–19 were being planned, **that PR was still open, unmerged**. The base branch (`main`) did not yet contain the new `Header` component at all — only the PR's own branch (`Guccio163/header/part2`) did.

This is exactly the kind of thing Step 0's "confirm the base branch actually contains the pilot's target API" check exists to catch — the plan's original assumption ("batch 1 is done, work off `main`") was wrong, and it was only caught by literally running `git show origin/main:<path>` and `gh pr view <pilot-pr> --json state,mergedAt` before cutting any branches. **Never assume a referenced pilot PR has merged — verify it live before Step 2.**

The resolution (a genuine judgment call, decided with the user rather than assumed): batches 2–19 stack on top of the pilot's own branch (`Guccio163/header/part2`) instead of `main`, with each batch's draft PR based on that branch too — so each PR's diff shows only its own migration, not the entire pending pilot diff. A live check re-run at the top of every batch (`git show origin/main:<path-the-pilot-introduces>`) detects the moment the pilot merges and flips the base to `main` automatically for every subsequent batch, with no separate human intervention needed. Any batch PRs opened before that point get their base retargeted afterward.

## The transformation pattern (mined from the pilot's real diffs, not re-derived per batch)

Real batch-1 commits established:
- A **preset component** (`HeaderWithBackButtonAndTitle`) as the default shorthand for the common back+title(+trailing children) case.
- **Full primitive composition** (`<Header><Header.BackButton/><Header.Title/>...</Header>`) as an equally-valid alternative even for that same simple case — the pilot's own commits show both patterns used for structurally identical call sites. The decision rule that emerged: use the preset by default, but switch to full composition as soon as the back button becomes conditional/absent, an icon or avatar is needed, or `style` needs conditional logic. This is a per-file readability call, not a global rule — don't force one pattern.
- A complete flat-prop-to-primitive mapping table, derived by reading the legacy component's full prop surface once and matching each prop (or prop group) to its primitive equivalent — including props with **no primitive equivalent at all** (a rotate-button prop set, a policy-avatar prop) which only had 1–2 real remaining call-sites each across the whole ~495-file migration. Those got hand-composed inline in their one/two consuming files rather than growing the shared primitive set for a single consumer — an explicit anti-over-engineering call, not an oversight.

The general lesson for any future migration: read the pilot's diff for real prop→target mappings and any "which pattern when" rule *before* starting batch 2, and grep the whole remaining scope up front for props/patterns that don't have a same-shaped remaining primitive — a handful of genuine gaps is normal and cheap to handle case-by-case; it doesn't need to block or complicate the other 495 files.

## Evidence capture specifics

Platforms: iOS simulator, Android emulator, web (via Playwright, not the device-automation MCP tool used for iOS/Android — that tool's own docs list Chromium/web as explicitly unsupported for recording). mWeb was folded into "web" for this migration since the underlying React code path is identical.

The web app's session lives partly in IndexedDB, not just cookies/localStorage — a Playwright `storageState()` capture needs `{indexedDB: true}` or a restored context lands on a blank/login page. This was a real, repeat-tripping mistake in an earlier session on this same migration — the fix is folded into Step 6's "check environment memory for gotchas already solved" guidance rather than re-discovered each time.

Because this specific migration never touches native code, one native build per platform served the entire 18-batch run — `git checkout` between batches plus a Metro/Fast-Refresh reload was enough, with a full rebuild reserved as a recovery path for an actual build/connection failure (which did happen once earlier in the project, from an unrelated Swift 6 toolchain incompatibility — captured in project memory, not repeated here since it's environment-specific, not migration-specific).
