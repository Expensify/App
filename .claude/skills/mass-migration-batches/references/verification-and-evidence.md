# Verification and evidence — current repo snapshot

This is a **snapshot**, not a permanent contract. `package.json` scripts and `.github/workflows/*.yml` are the real source of truth and can change — re-derive this table if a script gets renamed or a check is added/removed, or if this skill is reused in a different repo entirely.

## Local-runnable equivalents of CI-required checks

| Check | Local command | Scoped to changed files? | Notes |
|---|---|---|---|
| ESLint | `npm run lint-changed` (fast, diff vs. `origin/main` merge-base) or `npm run lint` (whole repo, what CI actually runs) | `lint-changed` yes; CI runs whole-repo | Seatbelt ratchet in `config/eslint/eslint.seatbelt.tsv` grandfathers pre-existing violations; `SEATBELT_INCREASE=<rule\|all>` env var raises the baseline when a merge from the base branch introduces a genuinely unrelated new violation. CI auto-tightens the baseline on merge when a PR reduces the violation count — never do this manually for the migration's own reductions. |
| Dead-code / unused-export (knip) | `npm run knip-changed` (delta vs. main) | Delta-based; the underlying `knip` run itself is always whole-repo | Check `knip.json`'s `entry` array for anything referencing paths the migration renames or removes — a stale entry silently protects nothing. |
| TypeScript | `npm run typecheck` | No — project-level, always effectively whole-repo | Slow; run once per batch after files are otherwise settled, not after every micro-edit. |
| React Compiler compliance | `npm run react-compiler-compliance-check check-changed` (diff vs. main) or `check <files/dirs>` (arbitrary scope, useful mid-batch before there's anything to diff against) | Yes | New components/hooks must compile under both compilers; existing compiling files must not regress; no new cross-compiler memoization divergence. |
| Spelling | `npm run spell-changed` | Yes (discovers changed files itself) | |
| Performance regression | `npm run perf-test` (Reassure) | Only for files with an existing `tests/perf-test/*` suite | Render-count must not increase at all; duration regression tolerance ~20%. Skip if no touched file has a matching perf-test suite. |
| Repo-specific AI-reviewer style categories (e.g. this repo's "CONSISTENCY-\*"/"PERF-\*") | Invoke the repo's own review slash command (e.g. `/review-code-pr`) against the live PR diff | Diff-scoped by nature | **Not** a deterministic script with an exit code — it's an LLM judgment pass against a documented rule set (this repo: `.claude/skills/app-coding-standards/rules/`). Fix what it flags, re-run once to confirm, then move on — don't loop indefinitely chasing a possible false positive. |

## General principle for a future migration in a different repo

1. Read `package.json`'s `scripts` block and `.github/workflows/*.yml` to find the actual CI-required checks — don't assume this table's exact command names carry over.
2. For each check, look for a `-changed`/diff-scoped variant first (usually faster, matches what a reviewer cares about for this batch specifically).
3. Note which checks are only meaningfully whole-project (typically the type checker) — budget time for these rather than trying to force a fast path that doesn't exist.
4. Identify whether the repo has any AI-reviewer-driven style categories (subjective, rule-set-based, not a deterministic pass/fail) — these need a local slash-command or agent invocation, not a `npm run` script.

## Evidence capture

- Default: **video**, not screenshots, unless told otherwise.
- One recording per **distinct call-site/UI shape**, not per file — many files in a batch typically share an identical resulting UI.
- Default platform matrix for this repo: iOS simulator, Android emulator, web/mWeb. Trim per migration when a surface plainly isn't touched (e.g. a backend-only or types-only change needs none of this).
- **Build-once-per-platform-reuse-across-batches**: when the migration is JS/TS-only (no native modules, no Podfile/Gradle changes, no `package.json` dependency changes), boot/build each platform's app once for the entire multi-batch run and reuse it via `git checkout` + Fast Refresh/HMR between batches. Rebuild only on an actual build/connection failure, or when a specific batch's diff touches build-affecting files.
- Check environment/session memory for known toolchain gotchas (a prior fragile build fix, a lockfile relock issue, a storage/session quirk for web recordings) before troubleshooting a build or recording issue from scratch — these are one-time environment fixes, not per-batch problems.
