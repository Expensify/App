# Proposal: Replace ESLint with oxlint

> **Status, 2026-09-10.** This is the pitch document and its numbers are the ones that were current
> when it was written. Several are superseded: blockers 1 and 2 are closed, the adapter is built, and
> Oxlint runs in CI today as a non-blocking shadow check. For current measurements read
> [OXLINT_MIGRATION_INVESTIGATION.md](OXLINT_MIGRATION_INVESTIGATION.md), which is the state document;
> for how the adapter was built read [OXLINT_LINTER_PLAN.md](OXLINT_LINTER_PLAN.md). The argument
> below is unchanged and still holds.

**Background:** Linting sits on the path of every code change here. Developers run it in the editor and
before pushing, agents run it on the code they produce, and CI runs it as a required check on almost all PRs.
The resolved config enables 469 rules. About three quarters of them come from `eslint-config-expensify`; 29 are type-aware through typescript-eslint; and
Expensify owns 41 rule modules, 37 in the plugin and 4 in-repo. 
`eslint-seatbelt` tolerates 3085 grandfathered findings across 1383 rows of
`config/eslint/eslint.seatbelt.tsv`, and CI auto-tightens it.
Locally lint usually runs through `lint-changed` over the
diff; the required CI check lints the whole repository, which measured 427 s on this branch.

**Problem:** When developers, agents and CI run lint on the code they change, if each run takes
minutes, then the app development cycle slows down.

**Solution:** Replace ESLint with [oxlint](https://oxc.rs), the Rust linter from the oxc team, staged
behind a fixed observation period so the swap is earned rather than asserted. Effectively the same
ruleset, 461 of 469 rules shared and the remaining 8 decided one by one below. Two tools from the same family already ship here, oxfmt as the formatter since spring and `oxc-transform-react` for the React Compiler on web.

### Results



#### eslint and CI


| Case                    | ESLint check | Share of runs        |
| ----------------------- | ------------ | -------------------- |
| Warm cache, green       | 62 s median  | 248 of 299           |
| Any run that fails lint | 495 s median | 36 of 299            |
| Mean over real traffic  | **172 s**    | **73 s** (local run) |




#### eslint vs oxlint locally


| Same machine, one run, 10 files dirty | Time     | Against oxlint        |
| ------------------------------------- | -------- | --------------------- |
| ESLint cold, 8522 files               | 386 s    | oxlint **81% faster** |
| ESLint warm, 10 files re-linted       | **41 s** | oxlint **83% slower** |
| oxlint, whole repo, type-aware        | **75 s** | baseline              |


The distance between those two ESLint rows is the cache, and it is the whole comparison. ESLint stores
a result per file, so a warm run reads 8512 of them back and lints only the 10 that changed. Cold, it
builds the full type-aware TypeScript program and lints all 8522. oxlint keeps no cache and lints the
repo every time.

The failing eslint is 36 of 299 runs carrying 43% of the job's total minutes in this probe, because
`lint.yml:86-90` deletes the cache and re-lints the whole repo on any failure. That is the part
oxlint removes.

The config is a mirror of `config/eslint/`. Five jsPlugin aliases host the real
ESLint plugins by package name, so both tools execute the same rule modules rather than two
separate ports of them. The React Compiler analysis is called directly through
`oxc-transform-react`. And `config/oxlint/eslintDirectives.mjs` teaches every hosted rule the rule
id ESLint's own disable comments already use, so **no suppression comment in the repo has to
change** right now. Coverage today: 469 rules ESLint enables against 473 oxlint enables, 461 of them shared,
7 of the remainder carrying a written port plan and 1 needing a ledger entry.

None of this is asserted; it is covered by a test suite. 55 per-rule fixtures linted by both tools and
compared line by line, 445 upstream `RuleTester` cases replayed through both, an assertion that every
hosted rule really reports rather than silently loading, and a rule-by-rule config diff against a
ledger where each difference names a reason. Ten `npm run` commands, each linting its own small
fixtures, so the suite finishes in seconds and blocks nobody.

Then, in order:

1. **Run that suite in CI, as tests.** The failure it catches is an oxlint upgrade quietly breaking a
  rule, which nothing else notices, and it lints fixtures rather than the
   repo, so it sits beside the Jest jobs and costs seconds. The whole-repo comparer is the one piece
   that stays **local only**: it runs both linters, takes about 500 s, and exists to debug the mirror,
   not to be waited on. It gains a linted-file-set assertion, because a findings comparison reads
   `0 = 0` as success even when oxlint silently skipped 200 files.
2. **Observation.** oxlint runs in CI beside ESLint, non-blocking, so both results sit on every PR
  while **ESLint stays the only required gate**. A bug in oxlint cannot block a PR or land a false
   pass, and no source change is needed to start. Of the two directions a difference can go, only an
   ESLint-only finding matters: that is coverage the repo has today. What CI can print cheaply is
   oxlint's own total, so a jump in it is visible. It cannot compare the two totals yet, for a reason
   given below; finding-by-finding comparison stays something a person runs locally at checkpoints.
3. **Decide the places the two disagree.** Always oxlint reporting more, never less. Four carry a
  number: `no-unnecessary-type-assertion` 700, `import/no-cycle` 534, `no-deprecated` +88,
   `preserve-manual-memoization` +63. Each is a keep-and-baseline or switch-off call rather than
   engineering, and so are the 9 config differences nobody chose. Detail below.
4. **Build what is genuinely missing.** A seatbelt counterpart, the one thing oxlint has no equivalent
  for. Fixtures for the native rules this repo suppresses, the largest remaining evidence gap. One
   missing override block. And switch on the already-built `rulesdir/no-onyx-connect-bypass`, which
   replaces `checkOnyxConnectBypass.ts`.
5. **Flip, then delete.** oxlint becomes required and ESLint runs `continue-on-error` for one week as a
  reverse shadow, then the job and the packages go. Almost all of `oxlint-migration/` goes with them:
   10 of its 13 commands drive ESLint and cannot outlive it. What stays is `config/oxlint/`, 9 files,
   which is the config itself. Detail below.

---



## DETAILS



## The blockers


| #   | blocker                                                                                                              | state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ~~**Seatbelt has no oxlint counterpart.** 3085 tolerated findings become hard errors on day one~~ · **CLOSED**                        | Closed twice over. Expensify/App#99259 rebuilt the ratchet as `scripts/lint/processors/Seatbelt.ts`, a pipeline stage over a tool-agnostic `LintMessage[]`, so it never needed an oxlint-specific counterpart. `scripts/lint/oxlint/OxlintLinter.ts` then fed it Oxlint's output, and `config/oxlint/oxlint.seatbelt.tsv` holds the Oxlint baseline: 1848 rows, 1409 files, 4403 errors. Two baseline files rather than one, because the seatbelt tightens itself and a shared file would ping-pong between the two tools. Original assessment kept for the record: oxlint ships no baseline mechanism of any kind, so it has to be ours. Designed and sized, not built. Recommended shape: a post-filter over `--format json` that groups by `(filename, code)`, compares each count to the TSV, fails on an increase and rewrites downward on `main`. It must also reproduce the per-API stratification of `no-deprecated` and the row pruning `scripts/lint.ts` does for deleted files                                                                                                                                                                                                                                                                |
| 2   | ~~`scripts/checkOnyxConnectBypass.ts` **reads ESLint's suppressed-message API**~~ · **CLOSED**, differently | The shadow rule was deleted rather than switched on: it became redundant on `main`. `scripts/checkOnyxConnectBypass.ts` runs as a post-lint step in `scripts/lint/index.ts` and works under either linter, so nothing here is linter-specific any more. Original assessment kept for the record: **Solved, not yet switched on.** `config/oxlint/onyxConnectBypass.mjs` registers the ban a second time and gates the second id on "a directive hid this", which is the same information. Proven by `npm run oxlint-onyx-bypass`, four call sites, green-red-green both ways. Enabling one config line at flip time also deletes an extra ESLint boot per run                                                                                                                                                                                                                                                                                                                                                      |
| 3   | **Rules oxlint cannot run**, each one keeping a slim ESLint alive                                                    | 3 real ones, listed below. Each needs a decision and an owner, not more engineering                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 4   | ~~**1422 oxlint-only findings, every one of them at error, every one blocking on day one**~~ · **DECIDED**: baseline all of them                            | Resolved 2026-09-10 as keep-and-baseline for every rule, since the seatbelt makes it cheap and each finding is real debt. Current figures are 4403 against ESLint's 3096, 21 rules differing, 8 at parity. Original assessment, whose counts predate several config changes: Needs decisions rather than engineering, and it sizes blocker 1: whatever is kept has to live in the baseline. oxlint reports 4498 against ESLint's 3076 with the seatbelt off, and there is no rule where ESLint reports more. Four rules are all but 31 of the gap: `no-unnecessary-type-assertion` 700, structural because ESLint's typescript-eslint is patched onto TypeScript 6 while tsgolint runs TypeScript 7, so it will not close by waiting; `import/no-cycle` 534, where ESLint enables the rule and reports 0 and oxlint's implementation works; `no-deprecated` +88; `preserve-manual-memoization` +63. The last 31 are 12 rules at 1 to 13 each. Each is a keep-and-baseline or a switch-off call |




## Where the two linters differ today

Latest full-repo run, `npm run compare-oxlint -- --fresh`, this branch, type-aware: **ESLint 3076
findings against oxlint 4014**, 19 rules differ, and **not one rule where ESLint reports more than
oxlint**. Two config changes since that run move the total: `import/no-cycle` switched on adds 534, and
hosting `exhaustive-deps` behind the React Compiler gate removes 48, so oxlint's current total is
**4498**, measured whole repo. Every part of the remaining gap is extra coverage rather than lost
coverage, and it concentrates in six rules.


| rule                                               | ESLint | oxlint  | what the gap is                                                                                                                                                                                                    |
| -------------------------------------------------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `import/no-cycle`                                  | 0      | **534** | Enabled on both. ESLint's copy reports nothing; oxlint's works. Every finding is a real cycle, so this is the one place oxlint is deliberately stricter rather than mirroring                                      |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0      | **700** | ESLint's typescript-eslint is patched onto TypeScript 6, tsgolint runs TypeScript 7. Blocker 5, and the one number that needs a decision before the flip                                                           |
| `@typescript-eslint/no-deprecated`                 | 197    | **285** | tsgolint has no `ignoreWrites`, so it reports deprecated *write* sites ESLint's copy skips. The repo carries an 83-file override for exactly this; the fix is an upstream compat request                           |
| `react-hooks/preserve-manual-memoization`          | 2      | **65**  | ESLint refuses to compile any function a `react-hooks/exhaustive-deps` disable comment reaches. `rc/` turns that opt-out off, which is the whole reason it exists                                                  |
| `react-hooks/exhaustive-deps`                      | 1      | 1       | **Closed.** Was 49, all of them the "changes every render" class ESLint's processor deletes on purpose. Now hosted behind the same gate, so both tools report the same single missing dependency. See below        |
| `react-hooks/refs`, `react-hooks/immutability`     | 216, 6 | 219, 7  | +4 between them, genuine engine disagreement between the JavaScript and Rust compilers                                                                                                                             |
| `@typescript-eslint/no-unsafe-type-assertion`      | 2036   | 2038    | +2 on the seatbelt's single biggest rule                                                                                                                                                                           |
| 12 more rules                                      | 0      | 1 to 13 | oxlint-only handfuls. The largest is `import/no-named-as-default` at 13, all on `import Config from 'react-native-config'`, which is exactly the shape that rule exists to catch and `eslint-plugin-import` misses |


One limit of this table: it counts findings per rule, so two tools reporting the same count on
different lines look identical here. Comparing `(file, line, rule)` sets is what the comparer's ledger
adds.

Rule-set coverage, from the same run: **469 ESLint, 472 oxlint, 460 shared**. Of the 9 ESLint-only
rules, 8 carry a written port plan and 1 is still flagged unexplained
(`react-hooks/component-hook-factories`, which is a no-op upstream, so it needs its recorded decision
moved into `ruleMap.py`'s `PORT_PLAN`). oxlint additionally enables 12 rules ESLint does not, among
them `no-floating-promises`, `only-throw-error`, `require-await` and three jsdoc rules; those are extra
strictness to accept or switch off deliberately, not divergence.

Config level, from `npm run oxlint-config-drift`: **26 rules differ** across the representative files.
5 are spelled differently and behave identically, 12 are deliberate, and 9 were nobody's decision, all
of them in the lenient direction (three option defaults, plus one uncommented override block that turns
off `no-throw-literal` and the five `typescript/no-unsafe-*` for `scripts/**` and `.github/**`). None of
the nine can be caught by a findings comparison, because none of those rules currently fires on the
affected paths.

## What is committed, and what dies with ESLint

The case for proving the mirror once and committing nothing: it is 13 npm scripts of surface, and almost
all of it is deleted with ESLint anyway.

The case against is what the record shows. A single pass is a photograph of a repository that moves
daily: parity was declared once, and two config gaps were then found *afterwards* by re-running, a
missing `tests/tooling` override worth 30 false positives and a rule ESLint enforced that oxlint did
not. Neither was visible in the pass that declared parity. And two of these checks are not comparisons
at all: the fixtures and the sidecar-coverage check exist to prove an oxlint rule still runs, which is
what an oxlint version bump breaks: one past bump silently re-anchored several rules, and the fixtures
are what caught it.

Two directories, and only one is migration tooling:


|                                      | what it is                                                                                             | lifetime                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `config/oxlint/`, 9 files            | the config oxlint actually runs: five jsPlugin aliases, the React Compiler gate, the directive wrapper | **permanent.** Not scaffolding, this is the linter setup |
| `oxlint-migration/`, 13 npm commands | the suite and its probes                                                                               | **10 die with ESLint, 3 do not**                         |


The 10 each run ESLint to produce the side they compare against: `compare-oxlint`
(`compareFullRepo.sh:31`), `compare-oxlint-warm`, `oxlint-config-drift` (imports
`config/eslint/eslint.config.mjs` at `resolveConfigs.mjs:91`), `oxlint-rule-fixtures`
(`compareFixtures.py:46`), `oxlint-rule-tester` (`compareRuleTester.py:127`),
`oxlint-react-compiler-gate` (`:87`), `oxlint-locale-compare-port` (`:95`), `oxlint-jsx-uses-port`
(`:70`), and `oxlint-rule-inventory` plus `oxlint-rule-availability` (both via
`eslint --print-config`, `ruleMap.py:266`).

The 3 needing only oxlint, worth keeping: `oxlint-sidecar-coverage` (verified: 1.8 s, no ESLint in it),
`oxlint-onyx-bypass`, `oxlint-react-compiler-rust`.

"Delete" overstates it for two of the 10. The 36 fixture files with their manifest, and the 445 replayed
`RuleTester` cases, are the assets; only the halves that ask ESLint for the expected answer die. Keeping
them past the flip means pinning expected counts in the manifest instead, which is small. Skipping that
gives up the version-bump guard, the one failure this suite exists to catch.

**None of it can go at accept.** During observation it is the only thing proving the mirror still holds.
It goes at step 5, with the ESLint job. Two files are already orphaned and leave as soon as their
upstream reports are filed: `compareNativeCtxValues.py` and `eslint-ctx-values-rule.mjs`, the
reproduction for two bugs in oxlint's native `jsx-no-constructed-context-values`, cited from
`.oxlintrc.json:685`.

## The one open number: `no-unnecessary-type-assertion`

0 on ESLint, 700 on oxlint, both at error. ESLint's typescript-eslint is patched onto
`@typescript/typescript6`; tsgolint runs TypeScript 7, which is the compiler gating CI. So the 700 are
the newer compiler's answers rather than a port bug, and waiting will not close the gap. Either keep the
rule and give the 700 a home in the seatbelt counterpart, or switch it off until ESLint is gone and run
it as its own cleanup. Switching it off is the mirror-preserving option.

## `exhaustive-deps`: closed at 1 = 1

Worth recording because the first reading was wrong. The 48 extra findings were not new coverage. Every
one was the same class, *"depends on Y, which changes every render"*, which ESLint words as *"wrap the
definition of Y in its own useCallback() Hook"*. That string is exactly what
`config/eslint/processors/eslint-processor-react-compiler-compat.mjs` matches and deletes in files both
React compilers memoized. Genuinely missing dependencies are **not** filtered. Checked rather than
argued: `Suggestions.tsx` gives oxlint 8, the repo's ESLint 0, and ESLint minus the processor the same 8
on the same 8 lines. Enforcing them would demand the manual memoization `CLAUDE.md` forbids.

So the suppression was restored rather than baselined. `eslint-plugin-react-hooks`'s own rule now runs
as `hosted/exhaustive-deps` wrapped by `withMessageGating`, calling the same
`didBothCompilersMemoizeFile` and the same regex, imported from the processor rather than copied.
oxlint's native rule could not be used: a Rust rule cannot be wrapped by a message filter.


| whole repo, back to back       | findings | `exhaustive-deps` | wall       |
| ------------------------------ | -------- | ----------------- | ---------- |
| native `react/exhaustive-deps` | 4546     | 49                | 78.0 s     |
| hosted behind the gate         | **4498** | **1**             | **79.4 s** |


Exact parity with ESLint's 1, same file, for 1.4 s. The fixture also dropped its `oxlintLines` anchor
exemption, and the 204 existing disable comments keep working through `withEslintDirectiveIds`.

One hard constraint: no compiler-category rule from that plugin may be enabled alongside it, or the 52 s
JavaScript React Compiler analysis returns and the whole `rc/` saving is gone.

## `import/no-cycle`: on, 534 cycles

ESLint enables it (`['error', {maxDepth: '∞'}]`, upstream) and reports **0**. oxlint's implementation
works: **534 diagnostics across 148 files**, spot-checked as genuine cycles. It was off to hold the
mirror and is now on, so the cleanup has a number to work against.

This is the one place the configs deliberately do not mirror, and the direction is worth stating: oxlint
is stricter, ESLint is blind, and the blindness predates this work. Nothing about the swap depends on it,
so three ways out once someone reads the list: fix the cycles, suppress individually with a reason, or
switch it back off as a separate project. Until then it is 534 blocking errors.

One config detail the drift checker reports: oxlint rejects a string for `maxDepth`
(`invalid type: string "∞", expected u32`), and its default already behaves the same way here, measured
748 = 748 over `src` with the option omitted and with it at maximum. So it is left off rather than
approximated.

## The fixtures: the gap is evidence, not rules

This item adds no rules and changes no config. The rules are **already enabled in both tools**. What is
missing is proof they run. 292 of oxlint's rules are native Rust ports and 285 of them have nothing in
this repo that violates them, so a comparison reads `0 = 0` for them forever, and a rule that loads,
runs and reports nothing looks identical to one working correctly. Only a file that deliberately
violates the rule separates those two states.

The harness exists and is cheap per rule: one file that breaks the rule, one manifest entry naming the
rule, the oxlint id and the expected count. `npm run oxlint-rule-fixtures` lints it with **both** tools
and compares line by line, today across 55 rules in 36 files.


|                             | today                              | target                                         |
| --------------------------- | ---------------------------------- | ---------------------------------------------- |
| Rules with a fixture        | 55, almost all hosted or rewritten | plus the ~80 native rules this repo suppresses |
| Native rules with a fixture | 2 of 292                           | ~80                                            |


The scope is deliberately not all 292. It is the ~80 somebody here wrote a disable comment for, out of
5188 directives, because a disable comment is the cheapest evidence that the rule matters in this repo.
The other ~210 stay unproven, stated as a limit rather than papered over. Each fixture also needs a
negative control that stays silent on both tools, or a rule firing on everything reads as a pass.

## Before the flip

1. The test suite in CI. Cheapest item here, and it protects the evidence everything else leans on.
2. The comparer's diff mode, ledger and file-set assertion, each with its own green-red-green sabotage
  pass. It is the trust anchor: a normalization bug in it makes a real divergence look explained, which
   is the one failure this plan cannot survive.
3. ~~The non-blocking oxlint step live on every PR~~ · **shipped**, `.github/workflows/oxlint.yml`. Still
  owed: a named reader and a written protocol for what a moved number means. A shadow job nobody reads
  proves nothing.
4. The 9 config-drift entries closed, each as a fix or an accepted entry with a reason.
5. The missing `no-restricted-globals` override for `.github/{actions,libs}/**/*.ts`, which should read 0.
6. A `PORT_PLAN` entry for `react-hooks/component-hook-factories`, so the one unexplained coverage gap
  stops being reported as one.
7. Fixtures for the ~80 suppressed native rules. Largest remaining evidence gap, and no amount of
  comparing closes it.
8. Directive fixtures for the wrapper, so an ESLint semantics change surfaces as a named failing fixture
  rather than as full-repo drift.
9. ~~The seatbelt counterpart~~ · **shipped**, `config/oxlint/oxlint.seatbelt.tsv`. The week of shadowing has not started.



## Rules that cannot migrate, and why


| rule                                       | why not                                                                                                                                                                                                                                                   | what is lost                                                                                                                                                                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rulesdir/prefer-at`                       | Needs `typeChecker.isArrayType` to tell an array from a record, and a JS plugin inside oxlint gets no type checker. A syntactic port fires on every `obj[key]`: 413 findings in `src/`, 0 of the sampled 104 real                                         | Only the plain `arr[0]` / `arr[i]` case. The `x[x.length - N]` family is recoverable through `unicorn/prefer-at`, native in oxlint and already loaded in ESLint, which reports the same 2 findings on the same 2 lines on both tools |
| `rulesdir/boolean-conditional-rendering`   | Needs the type of the `&&` left operand, and no syntactic stand-in exists                                                                                                                                                                                 | The rule entirely. Accept, or wait for typed JS plugins                                                                                                                                                                              |
| `no-invalid-this`                          | `sourceCode.getJSDocComment` hits an unconditional throw in oxlint's plugin bridge, upstream as oxc#18245                                                                                                                                                 | 36 files. TypeScript files are largely covered by `noImplicitThis`, so the exposure is plain `.js` and `.mjs`                                                                                                                        |
| `eslint-seatbelt/configure`                | A pseudo-rule driven by an ESLint processor, not a rule anything can port                                                                                                                                                                                 | Nothing by itself. The debt tracker behind it is blocker 1                                                                                                                                                                           |
| `progress/activate`                        | A progress-bar plugin. oxlint prints its own progress                                                                                                                                                                                                     | Nothing                                                                                                                                                                                                                              |
| `react-hooks/config`, `react-hooks/gating` | Both need per-rule options handed to the React Compiler, and the shared one-analysis-per-file design deliberately takes none. Neither can fire here anyway: `eslint-config-expensify` enables both with no options at all (`configs/public/react.js:448`) | Nothing measurable in this repo                                                                                                                                                                                                      |
| `react-hooks/component-hook-factories`     | Upstream registers it through a deprecation shim whose `create()` returns `{}`. A rule with no visitor keys is unreachable by any AST                                                                                                                     | Nothing. It was enabled only so the two rule sets matched                                                                                                                                                                            |


Two notes on the shape of the config. `rc/` exists because oxlint's own React Compiler rules stop
analyzing any function a `react-hooks/exhaustive-deps` disable comment reaches, and `src/` carries 204 of
those across 185 files, so we call the same Rust compiler ourselves with that opt-out off. It can go the
day oxlint exposes `eslintSuppressionRules` on linter rules the way its transform package already does;
nobody has filed that, and the remaining prize is about 8 s. `hosted/` and `core/` are the aliases that
outlive ESLint, because they exist wherever oxlint's native port genuinely disagrees (a different anchor
line, false positives inside Jest mock factories) or has no port at all. Filing the upstream bugs this
investigation reproduced would shrink both.

## Reproduce any number here

```bash
npm run compare-oxlint             # both tools, whole repo, finding by finding
npm run compare-oxlint-warm        # the same two runs, timed, with ESLint's cache warm like CI's
npm run oxlint-config-drift        # the two configs, rule by rule, against a ledger
npm run oxlint-rule-fixtures       # 55 per-rule fixtures, both tools, compared by line
npm run oxlint-rule-tester         # 445 RuleTester cases, 34 custom rules, both tools
npm run oxlint-sidecar-coverage    # every sidecar rule and the evidence it runs
npm run oxlint-rule-inventory      # every rule each tool knows about
npm run oxlint-rule-availability   # ESLint-only rules, against their recorded port plan
npm run oxlint-react-compiler-gate # the memoization message filter, both tools
npm run oxlint-react-compiler-rust # the Rust compiler port, category by category
npm run oxlint-locale-compare-port # the type-free localeCompare rewrite, receiver by receiver
npm run oxlint-jsx-uses-port       # the jsx-uses-vars port
npm run oxlint-onyx-bypass         # the Onyx.connect bypass port, four call sites
```

