# Linting

The App is linted with [ESLint](https://eslint.org) and its configuration lives in [`config/eslint/`](../config/eslint/). The main source of truth is [`config/eslint/eslint.config.mjs`](../config/eslint/eslint.config.mjs) — every other file in that directory (plugins, processors, the seatbelt baseline) is wired up from there.

## TL;DR

```bash
# Lint the whole repo (same command CI runs):
npm run lint

# Lint only the files added/modified/renamed on this branch vs origin/main:
npm run lint-changed

# Lint specific files or directories:
npm run lint -- src/components/Foo/index.tsx src/libs/bar.ts

# Continuously re-lint changed files as you edit:
npm run lint-watch
```

Prefer `npm run lint` (or `lint-changed` / `lint -- <files>`) over raw `npx eslint` invocations. Those wrappers increase the memory allocation to prevent OOM errors, and also include caching and concurrency flags for faster linting.

## eslint-seatbelt
We use [eslint-seatbelt](https://github.com/justjake/eslint-seatbelt) to manage known lint errors.

1. **Every rule is an error.** There are no warnings.
2. **Pre-existing errors are grandfathered in via [`eslint-seatbelt`](https://github.com/justjake/eslint-seatbelt).** A per-file / per-rule baseline lives at [`config/eslint/eslint.seatbelt.tsv`](../config/eslint/eslint.seatbelt.tsv). As long as a file's error count for a given rule is **≤** its recorded baseline, seatbelt reclassifies those errors as warnings and the run still passes.
3. **The baseline is a ratchet.** The count can only go down over time — never up — unless you (and a reviewer) explicitly allow an increase.
4. **The baseline auto-tightens on `main`.** When a PR merges, the lint job on `main` rewrites `eslint.seatbelt.tsv` to reflect the new (lower) counts and commits it back as OSBotify. You don't need to commit TSV updates yourself during normal development.
5. **You never hand-edit `eslint.seatbelt.tsv`.** Seatbelt rewrites it deterministically based on what it sees during a lint run.

### Mental model: what happens to `eslint.seatbelt.tsv`

| Scenario                                                     | TSV rewritten locally? | Lint result                                                |
| ------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------- |
| Counts go down (you fixed a baselined error)                 | No (read-only mode)    | Passes                                                     |
| Counts go up without `SEATBELT_INCREASE`                     | No                     | Fails                                                      |
| `SEATBELT_INCREASE=<rule>` locally (intentional loosening)   | Yes                    | Passes; commit the TSV diff alongside your change          |
| PR CI, counts go down                                        | Yes (ephemeral)        | Passes; `main` will tighten the committed TSV after merge  |
| PR CI, counts go up without `SEATBELT_INCREASE`              | No                     | Fails                                                      |
| `push: main` lint job, counts go down                        | Yes                    | Passes; OSBotify commits the tightened TSV back to `main`  |

In plain English: during normal development, fixing baselined errors does not dirty your worktree. `main`'s lint job takes care of tightening the committed baseline after your PR merges. The only case where you commit `eslint.seatbelt.tsv` by hand is the `SEATBELT_INCREASE` escape hatch.

## Day-to-day workflows

### "I just wrote some code — is it clean?"

```bash
npm run lint-changed
```

This lints every file added, modified, or renamed on your branch relative to `origin/main`. It's the fastest "am I clean?" check during active development.

If you're iterating specifically on a CI failure and you already know which files are flagged, lint just those:

```bash
npm run lint -- src/components/Foo/index.tsx src/libs/bar.ts
```

### "I fixed an existing baselined error"

Just run `npm run lint` (or `npm run lint-changed`) locally. Seatbelt notices the count went down and passes. **It does not rewrite `config/eslint/eslint.seatbelt.tsv` locally** — the config sets `readOnly: !process.env.CI`, so the TSV is only rewritten in CI. After your PR merges, the lint job on `main` re-runs, writes the tightened TSV, and OSBotify commits it back to `main` for you.

No TSV commit required on your end.

### "I added a new error and can't easily fix it right now"

The default assumption is that you fix it. If you genuinely need to land code that trips a baselined rule and the fix is out of scope, you have two options, in order of preference:

1. **Suppress the specific occurrence** with an `eslint-disable-next-line <rule>` comment and a justification. See [`CONSISTENCY-5`](../.claude/skills/coding-standards/rules/consistency-5-justify-eslint-disable.md).
2. **Widen the seatbelt baseline** for that file/rule with `SEATBELT_INCREASE`:

    ```bash
    # Allow the new count for one rule:
    SEATBELT_INCREASE=@typescript-eslint/no-deprecated npm run lint
    ```

   That will modify `config/eslint/eslint.seatbelt.tsv`. **Always commit the diff alongside your code**, and expect a reviewer to ask you why a fix wasn't feasible.

### "I'm enabling a new rule repo-wide"

1. Add the rule to `config/eslint/eslint.config.mjs` in `'error'` mode.
2. Save the initial baseline:

    ```bash
    SEATBELT_INCREASE=<rule-id> npm run lint
    ```

3. Commit the config change and the new lines in `config/eslint/eslint.seatbelt.tsv` together.

## CI behavior

The [`ESLint check`](../.github/workflows/lint.yml) workflow runs `npm run lint`. In CI, `readOnly` is off (so seatbelt can write) and `SEATBELT_FROZEN=0` is exported from [`scripts/lint.sh`](../scripts/lint.sh) so GitHub Actions' auto-set `CI=true` doesn't flip seatbelt into frozen mode.

- **PR runs:** counts go down → passes (TSV rewrite is ephemeral and thrown away with the runner). Counts go up without `SEATBELT_INCREASE` → fails with seatbelt's "exceeds allowed count" error.
- **`push: main` runs:** same behavior, plus an extra step — if `config/eslint/eslint.seatbelt.tsv` changed, OSBotify commits the tightened baseline straight back to `main`.

You do **not** need to commit `eslint.seatbelt.tsv` diffs for ordinary fixes. The only case that requires a TSV commit from you is `SEATBELT_INCREASE` (see below).

## Escape hatches

Set any of these env vars for a one-off local run when you need to bypass seatbelt's usual behavior:

| Variable                  | Effect                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `SEATBELT_INCREASE=<rule>`| Allow the baseline to grow for `<rule>` (or `ALL`). Overrides `readOnly` and writes the new count to disk. Commit the diff. |
| `SEATBELT_READ_ONLY=0`    | Force writes locally (e.g. you want to see what CI would rewrite). Opposite of the default local behavior. |
| `SEATBELT_FROZEN=1`       | Force frozen mode locally (fail on any diff). Useful for reproducing a stale-baseline failure. |
| `SEATBELT_DISABLE=1`      | Skip all seatbelt processing for this run — raw ESLint output, baseline file ignored.    |
| `SEATBELT_VERBOSE=1`      | Log every decrement/increment seatbelt performs. Handy when debugging the baseline.      |

Full reference: [eslint-seatbelt README](https://github.com/justjake/eslint-seatbelt#configuration).

## Related reading

- [Ratcheting errors](https://www.notion.com/blog/how-we-evolved-our-code-notions-ratcheting-system-using-custom-eslint-rules).
- [`CONSISTENCY-5`: Justify ESLint rule disables](../.claude/skills/coding-standards/rules/consistency-5-justify-eslint-disable.md) — when `eslint-disable` is acceptable, and how to document it.
- [`CLEAN-REACT-PATTERNS-0`: React Compiler compliance](../.claude/skills/coding-standards/rules/clean-react-0-compiler.md) — why some hook-related rules are suppressed per-file.
- [`STYLE.md`](./STYLE.md) — the coding style rules many of our ESLint rules enforce.
- [`REACT_COMPILER.md`](./REACT_COMPILER.md) — separate compiler-compliance CI check that runs alongside lint.
