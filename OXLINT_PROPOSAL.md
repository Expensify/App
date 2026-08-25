# Proposal: Replace ESLint with oxlint

**Background:** Linting sits on the path of every code change here. Developers run it in the editor and
before pushing, agents run it on the code they produce, and CI runs it as a required check on every PR
that touches a JavaScript, TypeScript or JSON file. The resolved config enables 469 rules. About three
quarters of them come from `eslint-config-expensify`; 29 are type-aware through typescript-eslint; and
Expensify owns 41 rule modules, 37 in the plugin and 4 in-repo. Two ESLint *processors* also do work no
rule does: message filtering for two memoization rules, and per-API splitting of `no-deprecated`.
`eslint-seatbelt` tolerates 3085 grandfathered findings across 1383 rows of
`config/eslint/eslint.seatbelt.tsv`, and CI auto-tightens it on `main`.
`scripts/checkOnyxConnectBypass.ts` boots a second ESLint per run to catch anyone silencing the
`Onyx.connect` ban with an inline disable. Locally lint usually runs through `lint-changed` over the
diff; the required CI check lints the whole repository, which measured 427 s on this branch.

**Problem:** When developers, agents and CI run lint on the code they change, if each run takes
minutes, then the app development cycle slows down.

**Solution:** Replace ESLint with [oxlint](https://oxc.rs), the Rust linter from the oxc team, staged
behind a fixed observation period so the swap is earned rather than asserted. Effectively the same
ruleset, 461 of 469 rules shared and the remaining 8 decided one by one below, at about **6x the
speed**: one matched run on this branch, whole repo, type-aware, gives **oxlint 73 s against ESLint
427 s**. oxlint has no cache, so 73 s is both its cold and its warm number. Two tools from the same
family already ship here, oxfmt as the formatter since spring and `oxc-transform-react` for the React
Compiler on web.

The config is a mirror of `config/eslint/`, not a rewrite. Five jsPlugin aliases host the real
ESLint plugins by package name, so both tools execute the same rule modules rather than two
separate ports of them. The React Compiler analysis is called directly through
`oxc-transform-react`. And `config/oxlint/eslintDirectives.mjs` teaches every hosted rule the rule
id ESLint's own disable comments already use, so **no suppression comment in the repo has to
change**. Coverage today: 469 rules ESLint enables against 473 oxlint enables, 461 of them shared,
7 of the remainder carrying a written port plan and 1 needing a ledger entry.

Ten gates hold it in place: 55 per-rule fixtures compared line by line on both tools, 445 upstream
`RuleTester` cases replayed through both, every sidecar rule required to carry evidence it actually
runs, and the two configs diffed rule by rule against a ledger where every difference names a reason.

Then, in order:

1. **Guardrails.** The deterministic gates into CI: they lint their own fixtures rather than the repo,
   so they cost seconds. The full-repo comparer stays a **local** tool, gains a linted-file-set
   assertion (a findings comparison reads `0 = 0` as success even when oxlint silently skipped 200
   files) and a ledger where every allowed difference names a reason and an owner.
2. **Observation.** oxlint runs in CI beside ESLint, non-blocking, so both results sit on every PR
   while **ESLint stays the only required gate**. A bug in oxlint cannot block a PR or land a false
   pass, and no source change is needed to start. Of the two directions a difference can go, only an
   ESLint-only finding matters: that is coverage the repo has today. Full `(file, line, rule)`
   comparison runs locally at checkpoints; the cheap in-CI version has a prerequisite, below.
3. **Burn down the known debt.** Three numbers need an owner: `no-unnecessary-type-assertion` at 700,
   `import/no-cycle` at 534 and `exhaustive-deps` at 48, the last of which is already decided as
   findings to keep and fix. Then the 9 open config-drift entries, one missing override block, and
   per-rule fixtures for the native rules this repo suppresses. Detail below.
4. **Build the one thing oxlint has no equivalent for**, a seatbelt counterpart, and switch on the
   already-built `rulesdir/no-onyx-connect-bypass`, which replaces `checkOnyxConnectBypass.ts`.
5. **Flip, then delete.** oxlint becomes required and ESLint runs `continue-on-error` for one week as a
   reverse shadow, then the job, the packages and `oxlint-migration/` are deleted.

---

## DETAILS

## The blockers

| # | blocker | state |
| --- | --- | --- |
| 1 | **Seatbelt has no oxlint counterpart.** 3085 tolerated findings become hard errors on day one | The only structural blocker. oxlint ships no baseline mechanism of any kind, so it has to be ours. Designed and sized, not built. Recommended shape: a post-filter over `--format json` that groups by `(filename, code)`, compares each count to the TSV, fails on an increase and rewrites downward on `main`. It must also reproduce the per-API stratification of `no-deprecated` and the row pruning `scripts/lint.ts` does for deleted files |
| 2 | **`scripts/checkOnyxConnectBypass.ts` reads ESLint's suppressed-message API**, which oxlint's JSON has no concept of | **Solved, not yet switched on.** `config/oxlint/onyxConnectBypass.mjs` registers the ban a second time and gates the second id on "a directive hid this", which is the same information. Proven by `npm run oxlint-onyx-bypass`, four call sites, green-red-green both ways. Enabling one config line at flip time also deletes an extra ESLint boot per run |
| 3 | **Rules oxlint cannot run**, each one keeping a slim ESLint alive | 3 real ones, listed below. Each needs a decision and an owner, not more engineering |
| 4 | **`no-unnecessary-type-assertion`: 700 oxlint-only blocking errors** | Needs a decision now. ESLint's typescript-eslint is patched onto TypeScript 6 and tsgolint runs TypeScript 7, so this gap is structural and will not close on its own. Keep the rule and baseline the 700, or switch it off until ESLint is gone |

## Where the two linters differ today

Latest full-repo run, `npm run compare-oxlint -- --fresh`, this branch, type-aware: **ESLint 3076
findings against oxlint 4014**, 19 rules differ, and **not one rule where ESLint reports more than
oxlint**. Enabling `import/no-cycle` after that run adds 534 more, measured separately, so oxlint's
current total is **4546**. Every part of the gap is extra coverage rather than lost coverage, and it
concentrates in seven rules.

| rule | ESLint | oxlint | what the gap is |
| --- | --- | --- | --- |
| `import/no-cycle` | 0 | **534** | Enabled on both. ESLint's copy reports nothing; oxlint's works. Every finding is a real cycle, so this is the one place oxlint is deliberately stricter rather than mirroring |
| `@typescript-eslint/no-unnecessary-type-assertion` | 0 | **700** | ESLint's typescript-eslint is patched onto TypeScript 6, tsgolint runs TypeScript 7. Blocker 5, and the one number that needs a decision before the flip |
| `@typescript-eslint/no-deprecated` | 197 | **285** | tsgolint has no `ignoreWrites`, so it reports deprecated *write* sites ESLint's copy skips. The repo carries an 83-file override for exactly this; the fix is an upstream compat request |
| `react-hooks/preserve-manual-memoization` | 2 | **65** | ESLint refuses to compile any function a `react-hooks/exhaustive-deps` disable comment reaches. `rc/` turns that opt-out off, which is the whole reason it exists |
| `react-hooks/exhaustive-deps` | 1 | **49** | Same processor gate: ESLint's processor deletes these in files both compilers memoize. Also a different anchor node, so one location moves rather than disappears |
| `react-hooks/refs`, `react-hooks/immutability` | 216, 6 | 219, 7 | +4 between them, genuine engine disagreement between the JavaScript and Rust compilers |
| `@typescript-eslint/no-unsafe-type-assertion` | 2036 | 2038 | +2 on the seatbelt's single biggest rule |
| 12 more rules | 0 | 1 to 13 | oxlint-only handfuls. The largest is `import/no-named-as-default` at 13, all on `import Config from 'react-native-config'`, which is exactly the shape that rule exists to catch and `eslint-plugin-import` misses |

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

## Spotting a difference in CI without blocking anything

The useful shape is one number per run, so runs that differ can be filtered rather than read. What
stops that today is not effort. `npm run lint` passes `--quiet` (`scripts/lint.ts:47`), and
eslint-seatbelt *reclassifies* its 3085 grandfathered findings from errors to warnings, so the required
job's output already excludes them by design. oxlint has no baseline, so its total includes all 3085.
Comparing the two totals therefore compares "errors ESLint still shows after the baseline" against
"everything oxlint sees", which differs by thousands permanently and would flag every run forever.

Three routes, in the order they become available:

| route | available | cost |
| --- | --- | --- |
| **Track oxlint's own total.** Add oxlint to the existing job as a non-blocking step, print `oxlint total=N` to the step summary and emit a `::warning::` when N moves. Filterable across runs, no coupling to ESLint's output | now | 73 s on a 427 s job, about 17% |
| **Full `(file, line, rule)` comparison in CI.** Needs a second ESLint pass with `--format json` and without `--quiet`, because one run applies one formatter | now, but | +427 s, which is the thing being avoided |
| **Comparable error counts on both sides.** Filter oxlint's diagnostics through the same baseline first, then both numbers mean "errors a reviewer has to fix" and any delta is real signal | after the seatbelt counterpart | one extra step, effectively free |

So the cheap version is a *consequence* of building the seatbelt counterpart, not an alternative to it.
Until then the honest CI signal is oxlint's own number, and the paired comparison stays local.

## What the harness costs, and what was removed

The case for a single one-off comparison instead of committed tooling: everything in `oxlint-migration/`
is deleted with ESLint, 12 npm scripts is real surface, and the mirror only has to be proven once.

The case against, which is what the record shows: a single pass is a photograph of a repository that
moves daily. Parity was declared once, and two config gaps were then found *afterwards* by re-running
(a missing `tests/tooling` override worth 30 false positives, and a rule ESLint enforced that oxlint did
not). Neither was visible in the pass that declared parity. On top of that, two of these checks are not
comparisons at all and outlive ESLint: the per-rule fixtures and the sidecar-coverage check exist to
prove an oxlint rule actually runs, which is the failure mode an oxlint version bump reintroduces every
time. 1.79.0 silently re-anchored several rules; the fixtures are what caught it.

So the split worth committing is narrower than what was on the branch: keep the fixtures and coverage
checks permanently, keep the comparer and the drift checker for as long as ESLint exists, and delete the
probes whose subject is already gone. **Nine files were removed, none of them wired to `package.json`,
so no command changed:**

| file | why it is dead |
| --- | --- |
| `wire-codemod.py` | nothing references it at all |
| `naming-codemod.py` | the directive wrapper removed the need for twin comments, so there is nothing to codemod |
| `compareLintResults.ts` | compared JSON on a file subset; `compareFullRepo.py` does the whole repo |
| `compareReactCompiler.mjs` | verifies oxlint's **native** `react/*` per-check rules, which we do not use; `rc/` replaced them |
| `reactCompilerVariants.py`, `compareReactCompilerNative.py`, `measureReactCompilerCost.sh` | a closed triangle referenced only by each other, measuring a sidecar-versus-aggregate trade where both subjects are gone (`rh/` deleted, the aggregate split in 1.79.0) |
| `native-vs-sidecar-probe/native.oxlintrc.json`, `sidecar.oxlintrc.json` | referenced only by that directory's own README. The three `.tsx` fixtures beside them are still live, so the directory stays |

Two more leave as soon as the upstream reports are filed: `compareNativeCtxValues.py` and
`eslint-ctx-values-rule.mjs` are the reproduction for two oxlint bugs nobody has filed yet, cited from
`ruleMap.py:67` and `:162`.

## The two decisions that carry a number

**`no-unnecessary-type-assertion`, 0 on ESLint against 700 on oxlint.** Both tools have the rule on at
error. ESLint's typescript-eslint is patched onto `@typescript/typescript6`, tsgolint runs TypeScript 7,
and TypeScript 7 is the compiler that gates CI. So the 700 are answers from the newer compiler, not a
port bug, and the gap will not close by waiting. Two ways to land it: keep the rule and give the 700 a
home in the seatbelt counterpart, or switch it off in oxlint until ESLint is gone and revisit as its own
cleanup. Switching it off is the mirror-preserving option.

**`exhaustive-deps`, 1 on ESLint against 49 on oxlint.** Not a rule disagreement. ESLint attaches a
*processor* that deletes `exhaustive-deps` messages in files both React compilers memoized, and 32 of
the 48 extras are real missing dependencies that ESLint therefore never shows anyone. oxlint has no
processor, and a native Rust rule cannot be wrapped by one, so the messages survive.

**Decision: keep them.** They are real findings this repo has never been shown, so they go on the fix
list rather than being engineered away. That rules out the exact-mirror option, which is recorded below
because it is cheap and someone will propose it:

| option | result | cost |
| --- | --- | --- |
| option | result | verdict |
| --- | --- | --- |
| **Exact mirror**: host `eslint-plugin-react-hooks`'s own `exhaustive-deps` as a jsPlugin instead of oxlint's native rule | back to **1 = 1**, about 1 s of run time | **rejected.** It forfeits 37 real locations to buy a matching number. Hard constraint if anyone revisits it: no compiler-category rule from that plugin may be enabled alongside, or the 52 s JavaScript analysis returns |
| **Baseline the 48** in the seatbelt counterpart | CI passes, findings stay visible in the baseline file | **the landing path.** The debt is recorded rather than hidden, and it is the same mechanism the other 3085 already use |
| **Fix the 32** | debt removed rather than moved | **the follow-up.** Source changes in 32 places, so it does not gate the swap |

## The fixtures: yes, more tests, and here is the shape

To be clear about what this item is not: it adds no rules and changes no config. Those rules are
**already enabled in both tools**. What is missing is evidence they run. 292 of oxlint's rules are
native Rust ports, and 285 of them have nothing in this repo that violates them, so any comparison
reads `0 = 0` for them forever. A rule can be configured correctly, load, run against oxlint's own AST
and report nothing, and `0 = 0` looks exactly like success. Only a file that deliberately violates the
rule separates those two states.

So yes, more tests. The harness for them already exists and it is cheap per rule: one file that breaks
the rule, one manifest entry naming the rule, the oxlint rule id and the expected count, and
`npm run oxlint-rule-fixtures` then lints it with **both** tools and compares line by line. Today that
covers 55 rules across 36 fixture files, which is why one file can carry several rules.

| | today | target |
| --- | --- | --- |
| Rules with a fixture | 55, almost all of them hosted or rewritten | plus the ~80 native rules this repo suppresses somewhere |
| Native rules with a fixture | 2 of 292 | ~80 |

The scope is deliberately not "all 292". It is the ~80 that somebody in this repo wrote a disable
comment for, across 5188 directives, because a disable comment is the cheapest available evidence that
the rule matters here. The remaining ~210 stay unproven, and that is a stated limit rather than a gap
being papered over. Each fixture also needs a negative control that stays silent on both tools,
otherwise a rule that fires on everything looks like a pass.

## `import/no-cycle`: switched on, 534 cycles

ESLint enables this rule (`['error', {maxDepth: '∞'}]`, from the upstream config) and reports **0**.
oxlint's implementation works. It used to be off in `.oxlintrc.json` to hold the mirror; it is now
**on**, measured whole repo: **534 diagnostics across 148 files**, spot-checked as genuine cycles.

This is the one rule where the two configs deliberately do not mirror, and the direction is worth being
explicit about: oxlint is stricter, ESLint is blind, and the blindness predates this work. Nothing about
the swap depends on it, so it can go three ways once someone reads the list: fix the cycles, suppress
individual ones with a comment and a reason, or switch it back off and treat it as a separate project.
Leaving it on costs 534 blocking errors until one of those happens.

One config detail, because the drift checker now reports it: ESLint passes `{maxDepth: '∞'}` and oxlint
rejects a string there (`invalid type: string "∞", expected u32`). Its default already behaves the same
way on this repo, measured 748 = 748 over `src` with the option omitted and with `maxDepth` at
`u32::MAX`, so the option is simply left off rather than approximated.

## Before the flip

1. The ten gates in CI. Cheapest item on the list, and they protect the evidence everything else leans
   on.
2. The comparer's diff mode, ledger and file-set assertion, with its own green-red-green sabotage pass
   per ledger category. It is the trust anchor, so a normalization bug in it makes a real divergence look
   explained, which is the one failure mode this plan cannot survive.
3. Shadow jobs live, per PR and nightly, with a named reader and a written protocol for what a red means.
   A shadow job nobody reads proves nothing.
4. The 9 config-drift entries closed, each as a fix or an accepted entry with a reason.
5. The missing `no-restricted-globals` override for `.github/{actions,libs}/**/*.ts`, which should read 0
   findings today.
6. A `PORT_PLAN` entry for `react-hooks/component-hook-factories`, so the one unexplained coverage gap
   stops being reported as one.
7. Fixtures for the ~80 native rules this repo suppresses somewhere. The largest remaining evidence
   gap, and no amount of comparing can close it. See the section above.
8. Directive fixtures for the wrapper, so an ESLint semantics change surfaces as a named failing fixture
   instead of as full-repo drift.
9. The seatbelt counterpart, shadowed for a week.

## Rules that cannot migrate, and why

| rule | why not | what is lost |
| --- | --- | --- |
| `rulesdir/prefer-at` | Needs `typeChecker.isArrayType` to tell an array from a record, and a JS plugin inside oxlint gets no type checker. A syntactic port fires on every `obj[key]`: 413 findings in `src/`, 0 of the sampled 104 real | Only the plain `arr[0]` / `arr[i]` case. The `x[x.length - N]` family is recoverable by enabling `unicorn/prefer-at`, which is native in oxlint and already loaded in ESLint, and reports the same 2 findings on the same 2 lines on both tools |
| `rulesdir/boolean-conditional-rendering` | Needs the type of the `&&` left operand, and no syntactic stand-in exists | The rule entirely. Accept, or wait for typed JS plugins |
| `no-invalid-this` | `sourceCode.getJSDocComment` hits an unconditional throw in oxlint's plugin bridge (`node_modules/oxlint/dist/lint.js:5796`), tracked upstream as oxc#18245 | 36 files. TypeScript files are largely covered by `noImplicitThis`, so the exposure is plain `.js` and `.mjs` |
| `eslint-seatbelt/configure` | A pseudo-rule driven by an ESLint processor, not a rule anything can port | Nothing by itself. The debt tracker behind it is blocker 1 |
| `progress/activate` | A progress-bar plugin. oxlint prints its own progress | Nothing |
| `react-hooks/config`, `react-hooks/gating` | Both need per-rule options handed to the React Compiler, and the shared one-analysis-per-file design deliberately takes none. Neither can fire here anyway: `eslint-config-expensify` enables both with no options at all (`configs/public/react.js:448`) | Nothing measurable in this repo |
| `react-hooks/component-hook-factories` | Upstream registers it through `makeDeprecatedRule('7.1.0')`, whose `create()` returns `{}`. A rule with no visitor keys is unreachable by any AST | Nothing. It was enabled only so the two rule sets matched |
| `import/no-cycle` | Not a port problem: oxlint's native rule works, and it is off for parity because ESLint's copy reports 0 | Nothing. See the section above |

Two more things worth knowing about the shape of this migration. The `rc/` alias exists because oxlint's
own React Compiler rules stop analyzing any function a `react-hooks/exhaustive-deps` disable comment
reaches, and `src/` carries 204 of those across 185 files, so we call the same Rust compiler ourselves
with that opt-out turned off. It can go the day oxlint exposes `eslintSuppressionRules` on its linter
rules the way its transform package already does; nobody has filed that yet, and the remaining prize is
about 8 s. The `hosted/` and `core/` aliases are the ones that outlive ESLint, because they exist
wherever oxlint's native port genuinely disagrees (a different anchor line, false positives inside Jest
mock factories) or has no port at all. Fixing the five open oxlint bugs this investigation reproduced
would shrink them and delete about 105 suppression comments.

## Reproduce any number here

```bash
npm run compare-oxlint            # both tools, whole repo, finding by finding
npm run oxlint-config-drift       # the two configs, rule by rule, against a ledger
npm run oxlint-rule-fixtures      # 55 per-rule fixtures, both tools, compared by line
npm run oxlint-rule-tester        # 445 RuleTester cases, 34 custom rules, both tools
npm run oxlint-sidecar-coverage   # every sidecar rule and the evidence it runs
npm run oxlint-onyx-bypass        # the Onyx.connect bypass port, four call sites
npm run oxlint-react-compiler-rust
```
