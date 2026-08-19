# Onyx.get validation plan

**Purpose of this file:** the list of things that must be true before we post the proposal and before wave 1 ships. Each step is self-contained so it can be handed to a separate agent or person. This is the direct answer to the review feedback on the first draft: *"the plan needs to be tested and validated... the plan must target the right places and conditions to use Onyx.get, most important thing."*
**Last updated:** 2026-08-18, after the manual round closed the last device-bound rows. Its steps and raw results are in [ONYX-GET-MANUAL-QA.md](ONYX-GET-MANUAL-QA.md).
**Update this file when:** any step changes status, a step turns out to be wrong, or a new risk appears. Update the status table first, then the step body, then the evidence link.
**This file is the source of truth, decided 2026-08-17.** [ONYX-GET-PROPOSAL.md](ONYX-GET-PROPOSAL.md) and [ONYX-GET-THREAD-NOTES.md](ONYX-GET-THREAD-NOTES.md) are only updated when the owner asks for it, so a finding lands here first and reaches those two on request. Anything recorded here that changes the posted text is worth flagging when it is written, since the flag is the only thing that gets it into the proposal.
**Related:** [ONYX-GET-PROPOSAL.md](ONYX-GET-PROPOSAL.md), [ONYX-GET-MANUAL-QA.md](ONYX-GET-MANUAL-QA.md), [ONYX-GET-THREAD-NOTES.md](ONYX-GET-THREAD-NOTES.md), [ONYX-GET-INVESTIGATION.md](ONYX-GET-INVESTIGATION.md).
**Scope of this file:** validation only, meaning things that can be shown to be true or false. Proposal framing is not a validation step and is not tracked here: the prepared answers live in [ONYX-GET-THREAD-NOTES.md](ONYX-GET-THREAD-NOTES.md).
**Branches and the PR.** `feature/onyxutils-get-synchronous-2` carries the enforcement tooling, the semantics suites and, since 2026-08-17, the pinned Onyx dependency. `feature/onyx-get-pilot` forks it and carries the four conversions, so the pilot can be reviewed or dropped without touching the foundation. As of `4444df0cb76` it has absorbed the foundation three times over and carries the pin, the test sweeps and A7d, so both branches are in sync with their remotes and everything below has been run there. That branch is now open as a draft PR against `main`: **[Expensify/App#98582](https://github.com/Expensify/App/pull/98582) "[POC] [WIP] Onyx.get"**, opened 2026-08-13 by LukasMod, containing everything from the semantics suites and the enforcement tooling through all four conversions. It is the artifact the review feedback asked for, so cite the PR rather than the branch from here on. These five documents stay uncommitted on purpose: they are the working record, not a deliverable, and committing them would put them in front of reviewers who are meant to read the proposal instead.

## Next steps, updated 2026-08-18 after the manual round

**Validation is finished, and so is the tooling.** Nothing here needs a device, a session, a profiler or CI, the priority order below is empty, and the last candidate for more enforcement was rejected on evidence (see A7). One step left.


| #   | Step                                                            | Why now                                                                                                                                                                                                                                                                                                                    | Who |
| --- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| 1   | Post                                                            | **The seven text corrections were applied on 2026-08-18**, across the proposal, the thread notes and the investigation doc: the pre-hydration condition and its 6,016 ms measurement, the two new rules replacing "candidates for rules", fresh classifier figures with their command, the init guard closed, the deleted `window.Onyx.get` shim, and the 890 ms figure retired in favour of ~146 ms. What is left is pressing post                                | Us  |


**Done 2026-08-19: the three read rules are one rule,** `no-unsafe-onyx-read`**.** `no-onyx-get-in-render`, `no-onyx-read-at-module-scope` and `no-onyx-read-after-write` are now `eslint-plugin-local-rules/no-unsafe-onyx-read.js` with three `messageId`s, 935 lines down to 590. They already shared their whole detection front end: 147 identical lines between the first two, 133 between the last two, and rules 2 and 3's `isTransparentBoundary` was exactly rule 1's `classifyFunctionBoundary(...) === SYNCHRONOUS`, case for case.

**The reason that outweighs the deduplication: the three were not disjoint, so they double-reported.** Two shapes were reported twice, verified by linting with all three enabled: `const el = <View a={Onyx.get(k)} />;` at module scope (render plus module scope), and `function Row(){ Onyx.merge(k,v); const a = Onyx.get(k); return <View a={a}/>; }` (render plus read-after-write). Three separate rules cannot deduplicate; one rule with a precedence order can. The order is **module scope > render > read-after-write**, and it falls out of one line: only an event-position read is recorded for the order pass. The module-scope JSX case now reports the module-scope message, which is the actionable one, since that element is built at import time.

**What it cost elsewhere.** `config/eslint/eslint.config.mjs` 8 lines to 4, `scripts/onyxConnectBypass.ts` and `scripts/checkOnyxConnectBypass.ts` 4 policed rules to 2 (`RENDER_READ_RULE_ID` is now `UNSAFE_READ_RULE_ID`, and the three empty grandfathered maps are one), three `RuleTester` suites to one. `scripts/callGraphFromSource.ts` keeps its own copy of the constants, since it walks a different AST; it now says so in a comment naming the file to keep in sync.

**What it costs conceptually, stated because it is a real loss.** One severity, one seatbelt counter and one `eslint-disable` id for all three hazard classes. Cheap today: all three shipped at `warn`, none has a seatbelt entry, and all three have 0 findings over `src/`. Splitting `read-after-write` back out later is a file move now that the internals are shared.

**Evidence.** All 112 unique fixture shapes from the three deleted suites carried over, checked by extracting and diffing the case strings rather than by reading: 0 missing. Five moved from `valid` to `invalid`, which is exactly the set each suite had parked because another rule owned it. `tests/unit/NoUnsafeOnyxReadRuleTest.ts` is 117 green. Red-checked four ways: falling through to `EVENT` instead of `MODULE_SCOPE` reds 18 cases, dropping the `sawJSXExpression` branch reds 1, letting the render report fall through to the order pass reds 1, recording every read regardless of position reds 1. **Parity over real code**: both implementations linted over all 1,509 `react-native-onyx`-importing files in `src/` and `tests/` produce **25 identical findings, all** `noOnyxReadAfterWrite`**, all in the semantics suites in** `tests/`**, and 0 in** `src/`. Zero delta either way. The bypass path still bites: a probe file with `// eslint-disable-next-line rulesdir/no-unsafe-onyx-read` exits 1 and names the file, 0 once removed. Lint clean on all changed files, `typecheck-tsgo` 0 errors, `checkRenderReachability` unchanged at 0 render-reachable.

**Closed as not worth doing, 2026-08-17: raising an init guard on [#773](https://github.com/Expensify/react-native-onyx/pull/773).** The owner's position, and the evidence agrees: `init()` is a precondition, the exported `get`'s own doc comment says the value is `undefined` for every key until `init()` has hydrated the cache, and making `get` queue would have replaced a silent `undefined` with a silent wait at the one site where this actually mattered. The finding that came out of asking the question is in A7 and belongs to the conversion checklist rather than to the library.

**Deliberately not doing:** `useOnyx`'s dropped `dependencies` argument, 3 sites, decided by the owner on 2026-08-17 as unrelated to this workstream. So `npm run typecheck` stays red on both branches with `TS2554` at `src/hooks/useOnyx.ts:101`, `useReportPreviewActionDecision.ts:50` and `useReportTransactionViolations.ts:23` until someone absorbs library `main`'s `5739db80`. Anyone reading a red typecheck here should check it is only those three before assuming the pin broke something.

**Done 2026-08-17, later: the** `OnyxDerived` **restore is fixed (A7d),** `569e00f7d78`**.** The read moved from `init()` time into the first line of `runCompute`, where hydration has necessarily finished, so the restore fires again on every cold start. It needed no library change and no `afterInit`, and it took the last `OnyxUtils` deep import out of that file. `tests/unit/OnyxPreHydrationReadTest.ts` was rewritten to guard the fixed behaviour instead of the broken one, and red-checked against the old timing.

**Done 2026-08-17, last: both branches pushed, so [App#98582](https://github.com/Expensify/App/pull/98582) now shows the pin, the sweeps and A7d.** Foundation went up at `569e00f7d78`; the pilot took a third merge at `4444df0cb76` with one expected conflict, the derived restore hunk that `cacab041f3c` had also rewritten, resolved by taking the foundation side whole since A7d subsumes it. Verified on the pilot afterwards: 292 cases across 16 suites green, 0 lint errors on both changed files, tsgo clean apart from the three descoped `useOnyx` errors, React Compiler compliance passed, and the reachability gate at 19 units and 0 render-reachable.

**Done since the switch:** the lock reconciled and committed; `bc23444f675` and `475ad7e09e5` cleaning up knip, spellcheck and the unit tests; `a3d854063d6` rewriting `src/setup/addUtilsToWindow.ts` off the debug shim onto the real export, which cleared 5 of the 8 type errors and gave `src/` its first twelve public `Onyx.get` reads; `c9d24c1620f` sweeping 71 test reads onto `Onyx.get` and clearing all 22 lint errors; `7a6d0fe7a8b` merging the foundation branch into the pilot, after which all 8 pilot suites are green on the pin; and `b1db15583e0` fixing the reachability checker's config read, which put the CI gate back in service and produced its first verdict over real `src/` call sites. A13 is closed.

**Two things for the proposal and thread notes when they are next opened**, since both are now wrong in the posted text and neither file is updated without being asked: the thread notes' 9.5 exhibit describes the `window.Onyx.get` shim that `a3d854063d6` deleted, and the proposal's step 4 reads as though the Onyx-side docs are outstanding when `073821fb` landed them.

**Done 2026-08-17: the consumption switch and A13, its re-validation.** The local patch is gone and Onyx is a pinned git dependency at the head of [#773](https://github.com/Expensify/react-native-onyx/pull/773), which now contains our `get` export, its library-side tests and its API docs. The 24 semantics and timing cases plus the 95 tooling cases are green on that build, after one stale instrument was fixed. Typecheck and lint are not: the pin is also a 3.0.94 to 3.0.100 upgrade, and it has an app-side bill of 8 type errors and 22 lint errors, none of them about #773's semantics. See the strategy section and A13, and next-step 2.

**Done 2026-08-17: A10, both halves.** 27 of 28 cases red unpatched, and the awaited-read variant narrowed that to the two cases that red on write semantics, both in A3. Net effect on what we can say: **[#773](https://github.com/Expensify/react-native-onyx/pull/773) fixes [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813)** rather than "does not reproduce with it", the set-before-merge reorder has **no observed behaviour difference on either build**, and A4a's ordering result is **not patch-dependent**. Two of the three are retractions, which is the point of having run it.

**Descoped by the owner, 2026-08-13.** Three candidate steps were dropped from this sequence: writing the PR description, deciding in writing which parts of the PR are proposed for merge, and D1's manual pass over the four flows. Recorded so nobody re-adds them as blockers. D1 keeps its row in the status table, because it is still the only check no test can perform, but it does not sit in front of posting.

Two things not to do next. Do not convert more call sites: four risk classes are covered, and a fifth conversion adds volume to review without adding an argument. And do not chase CI green on [#98582](https://github.com/Expensify/App/pull/98582) as a goal in itself, since the only failing check is `Check independent approval`, which is Expensify's process gate on a draft rather than anything about the code.

Test suites for the completed steps, each named after the step it covers. All of them are green on the pinned build on both branches as of 2026-08-17: 292 cases across these 16 suites on the pilot, which is the branch that has everything.

```bash
npx jest tests/unit/OnyxSyncGetValidationTest.ts    # A1, A2, A3, A5 - write timing, clear(), the public export
npx jest tests/unit/OnyxSyncGetTimingTest.ts        # A4a, A6a, A7a - derived keys, cross-tab, pre-init
npx jest tests/unit/OnyxPreHydrationReadTest.ts     # A7c, A7d - the hydration boundary and the derived restore
npx jest tests/unit/OnyxDerivedTest.tsx tests/unit/OnyxDerivedSelfHealTest.ts  # A7d regression cover
npx jest tests/unit/NoUnsafeOnyxReadRuleTest.ts     # B1a, B5a, B5b - the lint rule, all three read hazards
npx jest tests/unit/OnyxConnectBypassTest.ts        # B3 - the eslint-disable bypass check
npx jest tests/unit/CallGraphFromSourceTest.ts      # B2a - one file to units, calls and reads
npx jest tests/unit/BuildCallGraphTest.ts           # B2a - import resolution and graph assembly
npx jest tests/unit/RenderReachabilityTest.ts       # B2a - the reachability search
npx jest tests/unit/hooks/useSwitchToDelegator.test.ts  # C1 - the pilot characterization test
npx jest tests/unit/hooks/useBulkDuplicateReportActionTest.ts tests/actions/IOUTest/DuplicateTest.ts  # C2
npx jest tests/ui/components/PayActionCellOnyxReadsTest.tsx  # C3 - the per-row conversion, real Onyx and no useOnyx mock
npx jest tests/actions/ReplaceOptimisticReportWithActualReportTest.ts tests/unit/MiddlewareTest.ts  # C4
```



The checker itself, over the whole of `src/` in about 13 seconds:

```bash
npx bun scripts/checkRenderReachability.ts                                  # every unit that reads Onyx synchronously
npx bun scripts/checkRenderReachability.ts --callers '<file>#<name>'        # who calls a function, and which of them render
```

Status legend: ✅ (passed), `todo`, `wip`, `fail`, `blocked`, `n/a`.
Unit-test column: `yes` = unit tests alone settle it, no app run and no device. `partly` = unit tests cover the core, plus one named manual or runtime check. `no` = needs a running app, a device, or a profiler.

Why the `partly` rows are not `yes`:

- **A4** unit tests can prove that a derived key recomputes asynchronously relative to its source write, using fake timers. They cannot produce the per-key latency figure, which needed a real session. Done 2026-08-18.
- **B1** the rule itself is fully testable with ESLint `RuleTester`. Deciding whether each flag is a false positive is a human reading the output over `src/`.
- **B2** the caller walk is testable on fixtures. The hand validation against five known functions is review, not a test.
- **C1 to C4** the conversion is covered by jest, including the Onyx-seeding fixtures. Each also had its flow exercised by hand once, which is D1, done 2026-08-18.

**Condition C5 is retired as a manual check, 2026-08-18.** The plan said a behaviour change from event-time freshness is invisible to a test written against the new behaviour, and that D1 would catch it. That is true of tests and false of hand testing: under subscriptions any change to a subscribed key re-rendered the component, so the stale window was one render commit, milliseconds wide, and staging a change inside that window by hand is a coin toss rather than a test. So D1 stands as a regression pass over the four flows, and the C5 argument belongs in the proposal's text rather than in a QA result.

## Strategy decision, 2026-08-13: validate the version we run

**Superseded on 2026-08-17 by the switch in the next section. Kept because every result dated before then was measured this way.** Everything is validated against the Onyx the app actually runs, `react-native-onyx@3.0.94` plus `patches/react-native-onyx/react-native-onyx+3.0.94.patch`, rather than against the library's `main` (3.0.100) or a checkout of the [#773](https://github.com/Expensify/react-native-onyx/pull/773) branch. One file to maintain, it is the build every measurement in these documents was already taken on, and a pilot stacked on it is testable today instead of after a library release.

**What that patch is, stated as a citation rather than as a local artifact (2026-08-17).** It is [#773 @](https://github.com/Expensify/react-native-onyx/pull/773/changes/a8bca8a85f25079ca79bdfde794e0e2fd5fa4894) `a8bca8a`, the tip of `feature/onyxutils-get-synchronous` and a merge of `main` at 3.0.100, applied to the `dist/` of 3.0.94, plus two hunks of ours. Checked against that revision rather than assumed: `OnyxUtils.get` there is `return cache.get(key) as TValue`, `clear()` runs synchronously and deletes the pending `mergeQueue` and `mergeQueuePromise` entries under its own comment about in-flight merges, and the public `Onyx` export still does **not** include `get`, which is the entire content of our two extra hunks (A5). Point reviewers at the revision; the patch path below is only how it is applied and reverted here. That last clause about the export was true of `a8bca8a8` and is no longer true of what we run: `9c39ad0e` put `get` there, in the PR.

What followed from that, and all three lines have now been overtaken by the switch below:

- `get` reaches the public surface through the patch (A5), not through an upstream export change.
- The semantics suites stay in App and run against the patched build, so A10 keeps only its red-check half.
- Rows that only matter to the library release stay in the table, but they no longer block planning here. Whichever version eventually ships the change has to be re-validated against these same suites, since a patch proves nothing about code we did not patch.



## Consumption switch, 2026-08-17: pinned [#773](https://github.com/Expensify/react-native-onyx/pull/773) commit instead of a local patch

**What changed.** `35951b058ce3` deleted `patches/react-native-onyx/react-native-onyx+3.0.94.patch` (788 lines) and its `details.md`, and pointed `package.json` at `git+https://github.com/Expensify/react-native-onyx#<sha>`. `ce129e040b19` moved the pin to its current value, `073821fb`.

**What the pin contains.** `a8bca8a8`, the [#773](https://github.com/Expensify/react-native-onyx/pull/773) revision everything in these documents was validated against, plus three commits of ours on top, 103 added lines across 4 files:


| Commit     | Contents                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `9c39ad0e` | `feat: expose Onyx.get`. `lib/Onyx.ts`, +11: the wrapper delegating to `OnyxUtils.tryGetCachedValue` (A12) and `get,` on the exported object                                           |
| `370d89fc` | `test: add Onyx.get and OnyxUtils.tryGetCachedValue unit tests`. `tests/unit/onyxTest.ts` +45 and `tests/unit/onyxUtilsTest.ts` +33, in the two suites that already own those subjects |
| `073821fb` | `docs: add get() api`. `API.md`, +14                                                                                                                                                   |


**The part that changes an argument rather than a mechanism: those three commits are inside [#773](https://github.com/Expensify/react-native-onyx/pull/773).** `git ls-remote upstream refs/pull/773/head` answers `073821fb`, so the PR's own head is the build we run. The export is no longer ours sitting on top of theirs, which retires the proposal's "so #773 must add it" and lands the Onyx half of its step 4 at the same time.

**What it costs.** The version under test moved from 3.0.94 to 3.0.100, and every A-group result in this file predates that move. That is what A13 is for, and it earned its place immediately: one case was red on the new build for a reason that had nothing to do with [#773](https://github.com/Expensify/react-native-onyx/pull/773).

**What it buys.**

- Reviewers can run what we ran, from a pin, with no local artifact in the way.
- A5 becomes a library change with library tests instead of two patch hunks with no upstream home.
- The A10 baseline improves. Reverse-applying the patch compared stock 3.0.94 against 3.0.94-plus-[#773](https://github.com/Expensify/react-native-onyx/pull/773); pinning compares `a19a070f` (`main` at 3.0.100) against `073821fb`, which isolates #773 rather than #773 plus six versions of drift.
- The caveat that closed A10, *"a patch proves nothing about code we did not patch"*, is now half discharged: we test the PR's code. It is still open for whatever version finally ships the change.

**What it costs to operate.** Changing run state was `patch -R -p1`, seconds, no reinstall. It is now a pin edit plus `npm install` from git, minutes, and the lock has to be reconciled afterwards. Two consequences worth knowing before running A10 again: npm records `resolved` as `git+ssh://git@github.com/...` in the lock even though `package.json` says `git+https`, and an interrupted install can leave `node_modules/.bin` incomplete, which is how this switch left the tree unable to run jest at all.

## Status table


| ID                                     | Step                                        | Blocks | Unit-test | Status  | Owner | Evidence                                                                                                                                                                                                      |
| -------------------------------------- | ------------------------------------------- | ------ | --------- | ------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Onyx library semantics**          |                                             |        |           |         |       |                                                                                                                                                                                                               |
| A1                                     | Read-after-write in one tick                | C2     | yes       | ✅       |       | `tests/unit/OnyxSyncGetValidationTest.ts`, 21 green                                                                                                                                                           |
| A2                                     | `update()` set-before-merge reorder         |        | yes       | ✅       |       | same suite, `A2` describe                                                                                                                                                                                     |
| A3                                     | `clear()` merge-queue flush                 |        | yes       | ✅       |       | same suite, `A3` describe                                                                                                                                                                                     |
| A4a                                    | Derived-key read ordering                   | C3     | yes       | ✅       |       | `tests/unit/OnyxSyncGetTimingTest.ts`, `A4` describe                                                                                                                                                          |
| A4b                                    | Derived-key latency, 4 of 9 keys            |        | no        | ✅       |       | Measured 2026-08-18, both builds. 87 to 105 ms on the pilot, 96 to 252 ms on `main`, no key excluded. See A4b result                                                                                          |
| A5                                     | Public `Onyx.get` export                    | C1-C4  | yes       | ✅       |       | now upstream in [#773](https://github.com/Expensify/react-native-onyx/pull/773) at `9c39ad0e`, with library tests at `370d89fc`. `A5` describe, 4 cases, lives on the pilot branch. Name collision in `addUtilsToWindow.ts` found and fixed 2026-08-13                   |
| A6a                                    | Cross-tab write reaches the cache           |        | yes       | ✅       |       | same suite, `A6` describe                                                                                                                                                                                     |
| A6b                                    | Two real tabs, spot check                   |        | no        | ✅       |       | 2026-08-18: a rename in one tab reaches the other, **including offline**, so no server round trip is involved                                                                                                 |
| A7a                                    | Reads before `Onyx.init` resolves           |        | yes       | ✅       |       | same suite, `A7` describe                                                                                                                                                                                     |
| A7c                                    | Pre-hydration storage-backed reads          |        | yes       | ✅       |       | `tests/unit/OnyxPreHydrationReadTest.ts` cases 1-2, red-checked. A sync read misses a key that is on disk in that window                                                                                      |
| A7d                                    | Fix the `OnyxDerived` restore               | D2     | yes       | ✅       |       | same suite, cases 3-4. Restore moved into `runCompute`, red-checked against the old timing. Killed A7's `whenReady` ask                                                                                       |
| A7b                                    | Push-wake ordering on device                |        | no        | ✅       |       | Closed in code 2026-08-18, `140e4f0f119`: the site went back to main's hydration-waiting read. Device runs found no drop; the headless wake is not forceable on a dev build                                   |
| A8                                     | Storage eviction versus sync read           |        | n/a       | ✅       |       | verified 2026-08-12, see step body                                                                                                                                                                            |
| A9                                     | Root-cause the reported [#773](https://github.com/Expensify/react-native-onyx/pull/773) oddities       |        | no        | dropped |       | Dropped 2026-08-18: nothing specific was ever collected, so there is nothing to reproduce. Belongs to the library release if reports resurface                                                                |
| A10                                    | Red-check the suites, patch reverted        |        | yes       | ✅       |       | 27 of 28 red unpatched; awaited variant isolates 2 semantic reds, both A3. Corrections to A2, A4a, A7. Recipe superseded by the pin                                                                           |
| A11                                    | Eager full-DB hydration already ships       |        | yes       | ✅       |       | `Storage.getAll()` in `initializeWithDefaultKeyStates`, in unpatched 3.0.94 and re-checked at `lib/OnyxUtils.ts:854` on 3.0.100                                                                               |
| A12                                    | Which reader public `get` uses              | C2-C4  | yes       | ✅       |       | 7 cases folded into `onyxTest.ts` and `onyxUtilsTest.ts` in the Onyx checkout, red-checked, shipped in the pin at `370d89fc`                                                                                  |
| A13                                    | Re-validate on the pinned [#773](https://github.com/Expensify/react-native-onyx/pull/773) build        | C1-C4  | yes       | ✅       |       | foundation 24 + 95 green, pilot 165 green after the merge. Cost: 1 stale instrument, 22 lint errors swept, 5 type errors cleared, 3 left and descoped                                                         |
| **B. Static analysis and enforcement** |                                             |        |           |         |       |                                                                                                                                                                                                               |
| B1a                                    | `no-onyx-get-in-render` rule plus tests     | B3     | yes       | ✅       |       | Merged into `no-unsafe-onyx-read` on 2026-08-19, see the merge entry. `eslint-plugin-local-rules/no-unsafe-onyx-read.js`, `tests/unit/NoUnsafeOnyxReadRuleTest.ts`, 117 green across all three hazards        |
| B1b                                    | Triage false positives over `src/`          |        | yes       | ✅       |       | 0 findings over 6,805 files; re-verified after C4, and again on 2026-08-17 with 12 real `Onyx.get` reads in `src/setup/addUtilsToWindow.ts`                                                                   |
| B2a                                    | Render-reachability checker plus fixtures   | C2, C3 | yes       | ✅       |       | 3 scripts, 47 tests across 3 suites. CLI broke on JSONC and was fixed in `b1db15583e0`; first real run finds 11 sync readers, 0 render-reachable                                                              |
| B2b                                    | Hand-validate on five known functions       |        | partly    | ✅       |       | 5 functions checked, 0 edges missed against grep                                                                                                                                                              |
| B3                                     | Extend `checkOnyxConnectBypass.ts`          |        | yes       | ✅       |       | 12 tests, plus a probe file that exits 1                                                                                                                                                                      |
| B5a                                    | `no-onyx-read-after-write` rule             |        | yes       | ✅       |       | Merged into `no-unsafe-onyx-read` on 2026-08-19. Was 49 green, red-checked three ways; 2 findings on the first real run, both false positives, both fixed in the rule, 0 after that. Now in the merged suite   |
| B5b                                    | `no-onyx-read-at-module-scope` rule         |        | yes       | ✅       |       | Merged into `no-unsafe-onyx-read` on 2026-08-19. Was 31 green, red-checked twice; 0 findings over 904 Onyx-importing files, re-established 2026-08-17. Now in the merged suite                                 |
| B5c                                    | Source and derived read in one tick         |        | yes       | ✅       |       | Decided, not built. B5a flags the same-body shape (probe-verified) and the residue is cross-function, so it belongs to the graph. Derived computes read no Onyx at all                                        |
| B4                                     | Recover or rewrite the classifier tooling   |        | yes       | ✅       |       | Recovered, not rewritten: all three scripts arrived in `eea544287e4`. Re-run on `main` 2026-08-18 and it reproduces the published 104 caches exactly. CI job descoped by the owner                            |
| **C. Pilot conversions**               |                                             |        |           |         |       |                                                                                                                                                                                                               |
| C1                                     | `useSwitchToDelegator`, baseline            |        | partly    | ✅       |       | [App#98582](https://github.com/Expensify/App/pull/98582), `5bd92cec214`, 8-case suite green before and after                                                                                                  |
| C2                                     | `bulkDuplicateReports`, flagship            |        | partly    | ✅       |       | [App#98582](https://github.com/Expensify/App/pull/98582), `318a7cc79ef`, 117 tests green before and after                                                                                                     |
| C3                                     | `PayActionCell`, per-row and snapshot       |        | partly    | ✅       |       | [App#98582](https://github.com/Expensify/App/pull/98582), `83edad4e623`, 10 green both ways, 4 mutations red                                                                                                  |
| C4                                     | `replaceOptimisticReportWithActualReport`   |        | partly    | ✅       |       | [App#98582](https://github.com/Expensify/App/pull/98582), `193b52974e1`, 29 green unedited, 1 case added for the trigger                                                                                      |
| **D. Regression and open questions**   |                                             |        |           |         |       |                                                                                                                                                                                                               |
| D1                                     | Manual QA of the four pilot flows           |        | no        | ✅       |       | Run 2026-08-18 on web plus partial iOS, all four flows pass online and offline. Steps and caveats in [ONYX-GET-MANUAL-QA.md](ONYX-GET-MANUAL-QA.md)                                                           |
| D2                                     | No perf regression on the pilot             |        | partly    | ✅       |       | CI green twice: `4444df0cb76`, then again at `23e7ca2c369` where all five render-count deltas moved **down**. A7d's own saving measured separately, 1.15 ms at 250 reports and 4.55 ms at 1000               |
| D3                                     | The two reproducible [#773](https://github.com/Expensify/react-native-onyx/pull/773) regressions       |        | partly    | dropped |       | Dropped 2026-08-18. CI's reassure run at `23e7ca2c369` raised no render count anywhere and `SidebarLinks` held at 5, so the sidebar half does not reproduce; the duration half has no scenario                |
| D4                                     | Why `visibleReportActions` is 0.9 s late    |        | partly    | ✅       |       | Measured on both builds 2026-08-18. The 0.9 s does not reproduce on either. What is real is ~146 ms on the optimistic round, pilot against `main`                                                             |




**Progress, 2026-08-12.** Six steps pass: A1, A2, A3 (19 tests) plus A4a, A6a, A7a (5 tests). Two suites, `tests/unit/OnyxSyncGetValidationTest.ts` and `tests/unit/OnyxSyncGetTimingTest.ts`, both green with lint and typecheck clean. Two of the plan's own assumptions were wrong and are corrected in the step bodies: `Onyx.update` defers even a SET, and derived keys are **not** inherently stale on the patched build. A5's audit is done and corrected two more. B3 and B4 are blocked, for reasons not visible when the plan was written: B3 needs B1a's rule first, and the scripts behind the classifier figures are missing.

**Conclusions from that round** are in [ONYX-GET-INVESTIGATION.md](ONYX-GET-INVESTIGATION.md) section 8b. The short version: the conditions list shrank rather than grew, every timing hazard reduces to "read before write", the real remaining risk is init ordering rather than timing, and [#773](https://github.com/Expensify/react-native-onyx/pull/773) now stands on three justifications of its own.

**Progress, 2026-08-13.** The whole B group except B4 now passes: the lint rule, its bypass check, and the caller-graph checker all exist, with 95 tests across five suites. Every one of the five suites was mutation-checked, and one mutation survived on the first pass, which is recorded in B3's result because it says something about the tests rather than about the code. Two findings worth carrying forward: the checker's verdict on `navigateToConciergeChat` is **not render-reachable**, which contradicts this plan's own guess, and B2a rebuilt enough machinery that B4 is no longer a from-scratch rewrite.

**Progress, 2026-08-13, second half.** All four pilot conversions pass: C1, C2, C3 and C4. Group C is closed. Across the four, 30 `useOnyx` subscriptions and 2 module-level collection caches became 26 synchronous reads, one parameter object shrank from 25 fields to 14, and no test assertion had to be edited to accommodate any of it. Three findings from the second half, all of which change wording rather than direction:

1. The one-block-at-the-top rule is per synchronous stretch, not per function. C4 defers through `runAfterTransitions` and its later reads are meant to see its own earlier writes.
2. The public export collided with a name E/App had already hand-rolled, `window.Onyx.get` in `addUtilsToWindow.ts`, and the whole-repo typecheck is what caught it. Recorded under A5.
3. A prop-passed handler is invisible to the caller-graph checker (`0 direct caller(s)` for `PayActionCell.confirmPayment`). The lint rule's position analysis, not the graph, is what clears that shape.

**Progress, 2026-08-17.** A10 done, both halves, so every row that blocks posting is now either ✅ or descoped (D1). Full sequence: 28 green patched, the awaited-read variant written and greened patched, patch reverse-applied, both halves run unpatched, patch restored, 39 green again. Three claims changed, two of them downwards: **[#773](https://github.com/Expensify/react-native-onyx/pull/773) fixes [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813)** is now sayable, the set-before-merge reorder turns out to have **no observed behaviour difference on either build**, and A4a's ordering result is **not patch-dependent**, which costs #773 one of its three independent justifications. Both corrections came from the half of the step that was almost skipped, since the obvious version of A10 reds every case for the same trivial reason and would have found neither.

**Progress, 2026-08-17, second half: the patch is gone.** Onyx is consumed as a pinned commit at the head of [#773](https://github.com/Expensify/react-native-onyx/pull/773), and our `get` export, its tests and its docs are inside that PR rather than stacked on it. A13 re-ran what could be re-run on the new build: 24 semantics and timing cases plus 95 B-group cases green, one jest red that turned out to be a stale instrument rather than a semantics change (`keepInstancesSync` takes a whole batch as of upstream `e75f5f4d`), and 30 static-analysis reds that are the price of the version bump rather than anything to do with the proposal. Three things follow for the plan itself: A10's reverse-apply recipe is replaced by a pin table with a better baseline, the branch needs the app-side upgrade work before CI can pass, and the pilot branch is now the only place the deleted patch still matters.

**Progress, 2026-08-18: the manual round, and the table is now closed.** D1 passed by hand on web plus partial iOS. A6b passed and propagates offline. A4b and D4 were measured on both builds in one session each: the 890 ms straggler does not exist on either, and a reproducible ~146 ms difference on the optimistic round replaces it. A7b was closed by restoring the site rather than by measuring it, after the device runs found no drop and the headless wake proved unforceable on a dev build. B4 was unblocked by recovery when Fábio's three scripts landed in `eea544287e4`, and its classifier reproduces the published 104 exactly. A9 and D3 were dropped by the owner, along with B4's CI job. **Three findings change the posted text**: retire 890 ms in favour of ~146 ms, refresh the classifier numbers, and say zero converted sites sit in the pre-hydration window rather than two.

**The most reusable thing today produced is not a number.** A7b's site had already been fixed upstream on 2026-08-15, and our merge at `e7f0876779e` silently reverted it. No lint rule, no checker and no test noticed, because the read is legitimately non-render, not at module scope, and untested. That looked like the case for more enforcement, and on inspection it is not: neither candidate guard would have caught it, and the hazard has exactly one observed instance, at module scope, already covered. Recorded in A7 as a decision rather than a backlog item, which closes the tooling work.

**Next up.** Restore the `OnyxDerived` restore-from-disk read, push both branches, then post the proposal with A10's corrections, the two A13 wording items and the pre-hydration condition folded in. The init-guard question on [#773](https://github.com/Expensify/react-native-onyx/pull/773) is closed as not worth raising, and the `useOnyx` `dependencies` migration is out of scope by decision, so a red `typecheck` here is expected until someone else absorbs it. Everything else is a `no` row needing a device. B5a and B5b are done, and B5c is decided as not worth building. The classifier tooling (B4) stays parked last.

**Superseded, kept for the record.** Earlier on 2026-08-13 this line read: D1 plus A10's red check next. Before that, on the same day: C1 next, sequence picks up at priority 4.

**Reclassification, 2026-08-12.** A second pass over what a unit test can actually reach moved four steps off the `no` list. The pattern each time: the question that gates a decision is about **ordering**, which jest settles, while only the millisecond figure needs a device, and the figure was never what gated anything. A4, A6 and A7 are now split into a `yes` half that is already done and a `no` half that is a nice-to-have or a wave-1 gate rather than a proposal gate. B1 and B2 split the same way, tool from triage. Net: the work needed before posting the proposal no longer requires a device at all.

## Priority order

**Nothing left to validate.** As of 2026-08-18 every row in the status table is ✅ or dropped, so there is no validation work queued for `Onyx.get` on either branch. What remains is writing, and it lives in the `Next steps` block near the top of this file.

**Superseded, kept for the record.** This section last listed five open rows in priority order: D1, then A9 and D3, then A4b, A7b and D4, then B4, each needing a person with a device, a browser or a profiler.

---



## A. Onyx library semantics

These decide whether the conditions in the proposal are the right conditions. Do them first, because a surprise here changes the proposal rather than the code.

### A1. Read-after-write in the same tick

**Why.** `Onyx.merge` applies changes to the cache inside `Promise.resolve().then(...)`, so `Onyx.merge(key, value)` followed by `Onyx.get(key)` in the same handler returns the pre-merge value. This is the most likely way to ship a silent bug during migration.
**Method.** Unit tests in the Onyx repo covering: merge then get; two merges then get; `set` then get; `mergeCollection` then get; `update()` then get. Record the actual behaviour of each, not the expected behaviour.
**Exit criteria.** A table of the five cases with observed behaviour, a documented rule for authors (reads before writes, or await), and a note in the Onyx docs. If any case is surprising, the proposal's condition list changes.
**Where.** `node_modules/react-native-onyx/dist/Onyx.js` `merge`, plus the Onyx repo test suite.

**Result, 2026-08-12: pass, with one correction to this plan.** Suite at `tests/unit/OnyxSyncGetValidationTest.ts`, 19 tests, all green against `react-native-onyx@3.0.94` plus the local patch. Run it with `npx jest tests/unit/OnyxSyncGetValidationTest.ts`.


| Write                                  | Visible to a same-tick `OnyxUtils.get`? | Why                                                                                                       |
| -------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Onyx.merge(key, value)`               | No, returns the pre-merge value         | The merge queue is drained in `Promise.resolve().then(...)`                                               |
| Two `Onyx.merge` calls in one tick     | No, and neither is partially visible    | Both batch into one queued application                                                                    |
| `Onyx.set(key, value)`                 | **Yes**                                 | `setWithRetry` calls `broadcastUpdate` synchronously, which writes the cache                              |
| `Onyx.set` after a queued `Onyx.merge` | Yes, and the merge is discarded         | `setWithRetry` deletes the pending merge queue for that key                                               |
| `Onyx.mergeCollection(...)`            | **Yes**                                 | Writes the cache synchronously before returning                                                           |
| `Onyx.update([...])`, any method       | **No, not even a SET**                  | `update()` returns `clearPromise.then(() => Promise.all(...))`, and that `.then` always costs a microtask |
| Anything, after its promise resolves   | Yes                                     |                                                                                                           |


**The** `update()` **row was the surprise, and it is the one that matters.** The plan assumed a SET inside `update()` would be visible immediately, because a bare `Onyx.set` is. It is not: everything inside `update()` is deferred by the promise chain at `Onyx.js:514`, regardless of method or key type. A lone SET on a non-collection key is deferred too, which rules out collection batching as the cause. Since optimistic data in E/App is written almost exclusively with `Onyx.update`, this is the realistic shape of the hazard: an action creator that calls `Onyx.update` and then reads any key that batch touched sees pre-write state.

**Rule for authors, to replace the narrower one in the proposal.** Inside one tick, an event-time read is stale for any key written earlier in that tick by `Onyx.merge` or `Onyx.update`. `Onyx.set` and `Onyx.mergeCollection` are visible immediately, but relying on that is fragile. So: **do all reads before the first write, or** `await` **the write before reading.** Reads of keys the tick did not write are always current.

**Follow-ups this produced.** A10 for the red check and the port into [#773](https://github.com/Expensify/react-native-onyx/pull/773). One line of `ONYX-GET-PROPOSAL.md` needs the broader wording (applied 2026-08-12).

### A2. `update()` set-before-merge reorder

**Why.** [#773](https://github.com/Expensify/react-native-onyx/pull/773) reorders set before merge inside `update()`. Optimistic data commonly mixes both for the same key.
**Method.** Targeted tests: an `update()` containing a `set` and a `merge` on the same key, in both orders, before and after the patch. Compare final values.
**Exit criteria.** Documented behaviour difference, or proof of no difference.

**Result, 2026-08-12: pass.** The change is a two-line move in `update()`, visible at lines 177 to 196 of `patches/react-native-onyx/react-native-onyx+3.0.94.patch`: the `partialSetCollection` thunk is now pushed **before** the `mergeCollectionWithPatches` thunk instead of after it. Thunks run in array order inside `Promise.all(finalPromises.map((p) => p()))`, so array order is execution order. The patch's own comment states the reason: a set's cache write has to be in place before the merge reads previous values, which only became load-bearing once those reads turned synchronous.

Four tests pin the resulting semantics, all green:

- SET then MERGE on the same key in one batch: the merge applies on top of the set.
- MERGE then SET on the same key in one batch: the set wins and the earlier merge is discarded.
- SET member A and MERGE member B in the same collection: A is replaced wholesale, B keeps its untouched fields.
- A whole-collection `connectWithoutView` subscriber sees A's set already applied in the first notification, and both members correct in the last.

One API note for whoever ports this to the Onyx repo: `waitForCollectionCallback` no longer exists in 3.0.94, in the types or anywhere in `src/`. A `connectWithoutView` on a collection key receives the whole collection with no option needed.

**No value-level difference found for the same-key cases**, because `update()` collapses per-key operations into one queue entry before the set/merge split happens, so the reorder cannot affect them. The reorder is observable only across members of one collection, and there it affects what a subscriber sees mid-batch rather than the final values. That is the honest scope of the risk: subscriber notification content, not stored data.

**Residual, closed 2026-08-17 by A10, and it took the second claim with it.** Both sides have now been executed. All four cases pass against stock 3.0.94 once the read is awaited, so the comparison the residual asked for came back "no difference" for the same-key cases, as expected. It also came back "no difference" for `:262`, the collection case, which is the one the paragraph above says is where the reorder shows. **So the sentence "the reorder is observable only across members of one collection, and there it affects what a subscriber sees mid-batch" is not supported, and neither is "that is the honest scope of the risk".** The honest scope is smaller: no behaviour difference was observed anywhere, on either build, in any shape tested.

What the reorder still has is its reason, which is a statement about the code rather than about behaviour: a set's cache write has to be in place before `mergeCollectionWithPatches` reads previous values, and that read only became synchronous with the patch. So the four A2 cases guard the read, not the reorder, and nothing in this plan guards the reorder. For the proposal that is a simplification rather than a loss: the Prerequisite paragraph can describe the reorder as a precondition for the synchronous read instead of as a behaviour change needing root-cause.

### A3. `clear()` merge-queue flush

**Why.** [#773](https://github.com/Expensify/react-native-onyx/pull/773) flushes pending merge queues in `clear()`. `clear()` runs on sign-out and on cache reset.
**Method.** Test that a merge in flight when `clear()` is called cannot resurrect data after the clear. Related to [issue #2813](https://github.com/callstack-internal/expensify-issues/issues/2813), which [#773](https://github.com/Expensify/react-native-onyx/pull/773) is expected to fix.
**Exit criteria.** Test proving no resurrection, and confirmation of whether [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) is fixed.

**Result, 2026-08-12: pass on the patched build.** Three tests, all green:

- A merge issued before `clear()` in the same tick does not resurrect the key. The key is gone after both promises settle.
- A merge issued after `clear()` in the same tick survives, which is the behaviour callers depend on for sign-out and cache-reset flows that immediately re-seed data.
- The [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) shape, a delete via `Onyx.update([{merge, key, null}])` racing a `Onyx.merge(key, value)` in one tick, leaves the key deleted. No resurrection on the patched build.

**Caveat on the [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) claim, lifted 2026-08-17 by A10.** It read: *"These tests confirm the bug does not reproduce with the patch applied; they do not prove the patch is what fixes it... say 'does not reproduce with [#773](https://github.com/Expensify/react-native-onyx/pull/773) applied' rather than '#773 fixes #2813'."* The unpatched side has now been run, with the read awaited so that the read type is not what fails. On stock 3.0.94 the key **resurrects** in both shapes, the plain merge-before-`clear()` case and the #2813 `update()` delete racing a merge. With the patch it stays deleted. So the patch is what fixes it, and **"#773 fixes #2813" is now the accurate sentence.**

These two are also the only cases in either suite, out of 28, that go red unpatched for a write-semantics reason rather than because the read returns a Promise. Both mechanisms are in `clear()` at [#773 @](https://github.com/Expensify/react-native-onyx/pull/773/changes/a8bca8a85f25079ca79bdfde794e0e2fd5fa4894) `a8bca8a`, so cite the PR rather than our patch file: it stops deferring through `getAllKeys().then(...)`, so keys are classified and dropped from the cache synchronously in the calling tick, and it deletes the pending `mergeQueue` and `mergeQueuePromise` entries outright rather than letting them apply afterwards, under the comment *"Clear pending merge queues so that any in-flight Onyx.merge() calls don't overwrite the default values we're about to set"*. That comment is the author saying what A10 then measured.

### A4. Derived-key arrival latency

**Why.** `ONYXKEYS.DERIVED.`* values are computed asynchronously. Our send-message trace showed `visibleReportActions` landing 890 ms after the write on main and 109 ms on the patched build. An event-time read of a derived key can return a pre-write value.
**Method.** Instrument the write-to-derived-visible delay for all nine derived keys (`reportAttributes`, `reportTransactionsAndViolations`, `outstandingReportsByPolicyID`, `visibleReportActions`, `nonPersonalAndWorkspaceCardList`, `personalAndWorkspaceCardList`, `cardFeedErrors`, `sortedReportActions`, `loginToAccountIDMap`) using `instrumentOnyxCounters.mjs`.
**Exit criteria.** Per-key latency numbers, and a decision: exclude all derived keys from wave 1, or exclude only those with measurable lag.

**Split.** A4a is the ordering question, which is what the exclusion decision actually rests on, and jest answers it. A4b is the per-key latency figure, which needs a session and is now a wave-1 gate rather than a proposal gate.

**Result A4a, 2026-08-12: pass, and it overturns the plan's assumption.** Three tests in `tests/unit/OnyxSyncGetTimingTest.ts`:

1. **Awaiting the source write is enough.** After `await Onyx.merge(transaction_A, ...)`, the derived `reportTransactionsAndViolations` already carries the new amount. There is no extra revision of lag. The derived recompute and its own write land inside the source merge's promise chain, because the compute's reads are now synchronous cache lookups.
2. **An unresolved merge leaves both stale.** In the same tick as a pending merge, the source and the derived value both read the previous revision. Same rule as any other key, no special case.
3. **The one genuine trap is** `set`**.** `Onyx.set` writes the cache synchronously, so the source key reads as current immediately while the derived value is still one revision behind, since the derivation's own write is queued as a merge. **Reading a source key and a key derived from it in the same handler can see two different revisions.**

**Consequence for the proposal: drop the blanket derived-key exclusion.** The condition was "the key is not an `ONYXKEYS.DERIVED.`* key, because derived values are computed asynchronously". On the patched build that is not true, and the exclusion would have cost real coverage, since `reportAttributes`, `visibleReportActions` and `sortedReportActions` are among the most-read keys in the app. The replacement is narrower and follows from the rule already stated: do all reads before the first write, and do not mix a source read with a derived read in a tick that wrote either of them. Applied to `ONYX-GET-PROPOSAL.md` on 2026-08-12.

**Caveat that keeps A4b alive.** This is jest: memory storage, no IDB latency, no competing tasks. The production trace showed `visibleReportActions` arriving 890 ms after its source write on unpatched `main` and 109 ms on the patched build. The unit result explains the direction of that gap, so treat "no derived lag" as proven for ordering and unproven for wall-clock until A4b runs.

**Correction, 2026-08-17: result 1 is not a patch-dependent result, and A10 is what showed it.** The claim above, repeated in a comment inside the test at `OnyxSyncGetTimingTest.ts:94`, was that awaiting the source write is enough *because* the read is synchronous, and that an unpatched build would lag because the derived compute waits on storage. Run with the read awaited and with `main`'s own `OnyxDerived`, the unpatched build is **also** current once the source write resolves. So the thing that removes the revision lag is awaiting the write, not the patch.

Two consequences. The ordering half of A4a is a statement about Onyx rather than about [#773](https://github.com/Expensify/react-native-onyx/pull/773), which makes it quotable without the patch and removes one of the three justifications #773 was carrying on its own. And the 890 ms figure is left with nothing supporting it at unit level, so it is wall-clock only, which is exactly A4b's scope: do not cite it as evidence that #773 fixes derived-key latency until A4b measures a session.

**Result A4b, 2026-08-18: measured, and no derived key needs excluding.** `scripts/instrumentOnyxCounters.mjs` (see B4) recording one send-message trace per build, in the same chat and browser. Each message produces two rounds, the optimistic write and the server update, and latency is taken from the `reportActions_<reportID>` notification in the same round.


| Derived key                    | Pilot, [#773](https://github.com/Expensify/react-native-onyx/pull/773) pin | `main`, 3.0.94   |
| ------------------------------ | -------------------------------------------------------------------------- | ---------------- |
| `reportAttributes`             | 86 to 94 ms                                                                | 102 to 249 ms    |
| `outstandingReportsByPolicyID` | 88 to 95 ms                                                                | 97 to 244 ms     |
| `sortedReportActions`          | 96 to 102 ms                                                               | 96 to 243 ms     |
| `visibleReportActions`         | 99 to 105 ms                                                               | 105 to 252 ms    |


Four of the nine keys fire on this interaction; the other five (`reportTransactionsAndViolations`, the two card lists, `cardFeedErrors`, `loginToAccountIDMap`) stay unmeasured, so the scope of this result is the report-actions path. Within it there is no straggler and no candidate for exclusion: the four keys arrive in a burst spanning 9.0 to 9.3 ms on `main` and 11.0 to 14.3 ms on the pilot, so they are not each buying a separate React commit. The A4a rule governs regardless of latency: do all reads before the first write, and do not mix a source read with a derived read in a tick that wrote either.

**One trap this uncovered, recorded because it will recur.** Reading unpatched code needs unpatched app code too. `src/libs/actions/OnyxDerived/index.ts` on this branch reads through the public `Onyx.get` and no longer wraps the restore in `.then`, so unpatched it throws `TypeError: Onyx.get is not a function` and every A4 case fails for a reason unrelated to timing. See contamination 1 under A10.

### A5. Expose `get` on the public `Onyx` export

**Why.** Verified 2026-08-12: the public `Onyx` object exports `connect`, `connectWithoutView`, `disconnect`, `set`, `multiSet`, `merge`, `mergeCollection`, `setCollection`, `update`, `clear`, `init`, `registerLogger`. There is no `get`. The proposal's step 1 is real work in [#773](https://github.com/Expensify/react-native-onyx/pull/773), not a consequence of it.
**Method.** Add `get` (and decide on `multiGet` and `tupleGet`) to the export and to `Onyx.d.ts`. Confirm no existing caller awaits `OnyxUtils.get`, since the return type stops being a Promise: current callers are `src/components/GPSTripStateChecker/index.native.tsx`, `src/components/GPSTripStateChecker/useUpdateGpsTripOnReconnect.ts`, `src/libs/actions/OnyxDerived/index.ts`, `src/setup/backgroundLocationTrackingTask/index.native.ts`, and the `window.Onyx.get(...).then(...)` chains in `src/setup/addUtilsToWindow.ts`.
**Exit criteria.** Export landed in the [#773](https://github.com/Expensify/react-native-onyx/pull/773) branch, typecheck clean, `addUtilsToWindow.ts` migrated off `.then`.

**Result, 2026-08-12: audit done, export change pending. Two corrections to this plan.**

**Correction 1:** `addUtilsToWindow.ts` **needs no migration.** Its `window.Onyx.get(...).then(...)` chains do not call the library at all. The file assigns its own shim at `src/setup/addUtilsToWindow.ts:31`, a Promise wrapped around a one-shot `connectWithoutView`, under this comment: *"We intentionally do not offer an Onyx.get API because we believe it will lead to code patterns we don't want to use in this repo, but we can offer a workaround for the sake of debugging."* So the signature change cannot break it. What it does instead is give the proposal a good exhibit, added as section 9.5 of `ONYX-GET-THREAD-NOTES.md`: E/App withheld `Onyx.get` on purpose and then hand-rolled it anyway. Once `Onyx.get` is public, those 12 lines get deleted, and that deletion belongs in the migration.

**Update, 2026-08-13: the awaited test sites were not optional after all, and are now fixed.** Correction 2 below called them "misleading rather than broken", which was wrong once the patch is on the branch: `@typescript-eslint/await-thenable` is type-aware, so `await` on a value the patch made non-Promise is a lint **error**, and `npm run lint-changed` failed with 10 of them. The lines came from `main`, where the type is still a Promise, so the patch is what breaks them.

Twelve `await` keywords removed across `tests/actions/ReportTest.ts` (5), `tests/unit/OnyxDerivedTest.tsx` (5) and `tests/unit/OnyxDerivedSelfHealTest.ts` (2). The risk was that `await` on a non-thenable still yields a microtask, so removing it could change what a timing-sensitive assertion sees. It did not: every one of the twelve already had an explicit `await waitForBatchedUpdates()` or an awaited write directly above it, so the tick was never load-bearing. Verified by count rather than by argument: 301 tests passed before, 301 after, 0 failures either way, and lint-changed is clean.

The other 149 `OnyxUtils.get` calls across 14 test files are left alone. They lint fine, and converting only some of them to `Onyx.get` would leave those files mixing the two. A whole sweep is available as a follow-up. Two files must be excluded from any such sweep: `tests/unit/NoUnsafeOnyxReadRuleTest.ts` (then `NoOnyxGetInRenderRuleTest.ts`) uses `OnyxUtils.get` as rule fixtures, and the A5 case in `tests/unit/OnyxSyncGetValidationTest.ts` exists precisely to compare the two spellings.

**Correction 2: nothing in** `src/` **awaits** `OnyxUtils.get`**.** Twelve `await OnyxUtils.get(` sites exist and all twelve are in tests (`tests/actions/ReportTest.ts`, `tests/unit/OnyxDerivedTest.tsx`, `tests/unit/OnyxDerivedSelfHealTest.ts`). Awaiting a non-Promise is a no-op, so they pass either way; they are misleading rather than broken, and cleaning them up is a mechanical follow-up rather than a prerequisite. Meanwhile 11 test files already read through `OnyxUtils.get` synchronously, so the fixture pattern the pilot conversions need already exists.

**Still to do.** Add `get` to the public `Onyx` export and to `Onyx.d.ts`, decide whether `multiGet` and `tupleGet` join it, and add a test that `Onyx.get` works through the public surface. This belongs in Onyx [#773](https://github.com/Expensify/react-native-onyx/pull/773) rather than in the local patch, so it is gated on that branch rather than doable here.

**Result, 2026-08-13: pass, in the patch rather than in [#773](https://github.com/Expensify/react-native-onyx/pull/773).** The "still to do" paragraph above assumed the export had to come from the library. The strategy decision reversed that, and the export now lands as two hunks in `patches/react-native-onyx/react-native-onyx+3.0.94.patch`:

- `dist/Onyx.js`, a `get(key)` wrapper delegating to `OnyxUtils.get`, plus `get,` in the exported object.
- `dist/Onyx.d.ts`, a `declare function get<TKey extends OnyxKey, TValue extends OnyxValue<TKey>>(key: TKey): TValue;` plus `get: typeof get;` on the exported type, with `OnyxValue` added to the type import it needed.

Regenerated with `npx patch-package react-native-onyx`, which diffs against a clean install of 3.0.94, so the hunks are correct against a fresh `npm install` by construction. The regenerated file has to be written back into `patches/react-native-onyx/` rather than left at the flat path patch-package writes to: `scripts/applyPatches.sh` collects with `find ./patches -type f -name '*.patch'` into one flat temp directory, so two files with the same basename silently clobber each other and which one wins is filesystem order.

`multiGet` and `tupleGet` are deliberately left off. Nothing in `src/` calls either, and a public surface is easier to widen later than to narrow.

**Evidence, and the red half of it.** Two cases in the `A5` describe of `tests/unit/OnyxSyncGetValidationTest.ts`: `get` is a function on the export, and it returns the same value as the `react-native-onyx/dist/OnyxUtils` deep import it replaces. Removing `get,` from the exported object turns exactly those two red and leaves the other 19 green, so they guard the hunk rather than the library. Suite green at 21, `npm run typecheck-tsgo` clean, which is what proves the `.d.ts` half rather than only the runtime half.

**What it does not do.** The five existing call sites still use `import OnyxUtils from 'react-native-onyx/dist/OnyxUtils'`, including `src/libs/actions/OnyxDerived/index.ts:23`. Converting them to `Onyx.get` is mechanical and belongs with the first wave, not with the export.

**Correction, 2026-08-13: the "typecheck-tsgo clean" claim above was wrong, and the export collided with a name the app already used.** Found while verifying C3 and C4, and reproduced with everything else stashed, so it is the patch and nothing else: `npm run typecheck-tsgo` reported **5 errors, all in** `src/setup/addUtilsToWindow.ts`, and had done since the export landed. The A5 evidence paragraph only measured the suite and the changed files.

The cause is exactly the exhibit from correction 1. `src/types/modules/react-native-onyx.d.ts` declares the debug shim as `Onyx: typeof Onyx & {get: (key: CollectionKeyBase) => Promise<unknown>; ...}`. Once the library's own `get` exists, that intersection produces a property whose two call signatures cannot both be satisfied, so the assignment at `addUtilsToWindow.ts:32` fails and `window.Onyx.get(key).then(...)` becomes uncallable:

```
error TS2322: Type '(key: keyof OnyxCollectionValuesMapping) => Promise<unknown>' is not assignable to type
  '(<TKey extends OnyxKey, TValue extends OnyxValue<TKey>>(key: TKey) => TValue) & ((key: keyof OnyxCollectionValuesMapping) => Promise<unknown>)'.
```

Fixed by declaring the window copy as `Omit<typeof Onyx, 'get'> & {get: ...}` in both the global declaration and the cast, so the shim shadows the real `get` on `window.Onyx` only and nothing in application code changes. `typecheck-tsgo` is now 0 errors. The 12 shim lines still want deleting during the migration, per correction 1, but that is a decision about debug ergonomics rather than a typecheck fix, so it stays out of the pilot.

**Result, 2026-08-17: the export moved out of the patch and into [#773](https://github.com/Expensify/react-native-onyx/pull/773), where the "still to do" paragraph above wanted it all along.** Three commits, all now the head of `refs/pull/773/head`: `9c39ad0e` adds the wrapper and `get,` to the exported object in `lib/Onyx.ts` (+11), `370d89fc` adds its tests to the library's own `onyxTest.ts` and `onyxUtilsTest.ts` (+78), `073821fb` adds the `API.md` entry (+14). `multiGet` and `tupleGet` stay off, for the reason below. What was two hand-written hunks against `dist/` is now a library change with library tests, so the App-side A5 cases stop guarding a patch and become a consumer check that the pinned dependency really exposes what it claims. They still guard something: `Onyx.get` and the `react-native-onyx/dist/OnyxUtils` deep import have to agree, and the `.d.ts` has to survive the app's typecheck, which is A13's typecheck row.

**Why this is worth more than its size.** It is the first real migration cost the plan did not predict, and it is the cheapest possible version of one: a name collision, in dev-only code, caught by typecheck. Two things follow. Any repo adopting the export has to check for its own hand-rolled `get`, which is precisely the workaround candidate 2 describes. And the verification step for a patch has to be the **whole** typecheck, not the changed files, because a patch changes a type everything can see.

### A6. Cross-tab staleness on web

**Why.** Two tabs of NewDot share storage. If another tab's write does not reach this tab's cache promptly, an event-time read is stale in a way a subscription would not be.
**Method.** Two tabs, same account. In tab B, change a value. In tab A, run an event-time `Onyx.get` for that key and compare against `useOnyx`. Establish whether Onyx broadcasts cross-tab writes into the cache and how quickly.
**Exit criteria.** Either "same guarantee as `useOnyx`, no new risk", or a documented condition excluding affected keys.

**Result A6a, 2026-08-12: pass. No new risk, and no condition needed.** The mechanism, read from source and then exercised by test:

- `dist/storage/InstanceSync/index.web.js` raises a `localStorage` `SYNC_ONYX` event on every write, and the listener in other tabs reacts with `storage.getItem(onyxKey).then((value) => onStorageKeyChanged(onyxKey, value))`.
- `Onyx.init` supplies that callback (`dist/Onyx.js:58`), and it does `OnyxCache.set(key, value)` immediately followed by `OnyxUtils.keyChanged(...)`.

So the cache is current in the same statement pair that notifies subscribers. A `useOnyx` subscription and an event-time `Onyx.get` are exactly as fresh as each other, and the async hop over the storage event is shared by both. The test drives this without two browsers: the jest storage mock exposes `keepInstancesSync` as a `jest.fn()`, so the registered callback can be pulled off `mock.calls` and invoked to simulate the other tab. It asserts the value is readable in the same tick as the incoming event and that the subscriber sees the same value.

**A6b** was optional: a two-tab spot check would confirm the plumbing end to end, but it cannot change the answer, because both read paths share one cache update.

**Result A6b, 2026-08-18: pass, and it came back stronger than asked.** Two tabs on the same account, a workspace renamed in one, and the other is current. It also propagates **while offline**, which follows from the mechanism above rather than adding to it: the `SYNC_ONYX` event fires on every write, optimistic ones included, so no server round trip is involved in a cross-tab update.

### A7. Headless and HybridApp cache warmth

**Why.** `src/setup/index.ts` initialises Onyx outside the React lifecycle so that a headless JS context, for example waking from a push notification, can update data with no components mounted. If the cache preload is not complete in that context, a sync read returns `undefined` where an async read used to hit storage. `src/setup/backgroundLocationTrackingTask/index.native.ts` already calls `OnyxUtils.get` twice, so this path exists today.
**Method.** Trigger a push notification on a killed app on iOS and Android and log whether the keys those paths read are cache-resident at read time.
**Exit criteria.** Confirmation that reads in headless context are safe, or a documented rule that headless code must await init first.

**Result A7a, 2026-08-12: pass, and it found a hazard class the plan had not named.** `Onyx.get` has **no init guard**. Every write path funnels through `OnyxUtils.afterInit`, which defers until `deferredInitTask` resolves, and that task resolves only after `initializeWithDefaultKeyStates()` has eagerly loaded the cache (`dist/Onyx.js:77-79`). The read is a bare `OnyxCache.get(key)` with none of that. The test proves the window: call `Onyx.init` with a declared `initialKeyStates` entry, read synchronously, get `undefined`; await, get the value.

**The rule this adds.** An event-time read is only correct once Onyx init has resolved. UI event handlers always satisfy that, since nothing renders before init. Code that does not: the headless JS path (`src/setup/index.ts` initialises Onyx outside React precisely so a push-notification wake can write data, and `src/setup/backgroundLocationTrackingTask/index.native.ts` already calls `OnyxUtils.get` twice), module-level initialisation, and anything running during early startup. Those call sites must await init, or the library should give `get` the same `afterInit` treatment as the writes, which is worth raising on [#773](https://github.com/Expensify/react-native-onyx/pull/773) as a design question: a silent `undefined` is a worse failure mode than a deferred read.

**A7b** remains: whether a real push-wake on device runs before or after init resolves. The unit result makes that question sharper rather than answering it.

**Addition, 2026-08-17 from A10: the window is not created by the patch.** Awaited and run against stock 3.0.94, this case is green: before init resolves, storage holds nothing either, so the read is empty on both builds. What the patch changes is the failure mode, not the hole. Unpatched, a pre-init read is a Promise that resolves to nothing; patched, it is `undefined` immediately. So the init-guard question on [#773](https://github.com/Expensify/react-native-onyx/pull/773) is a pre-existing design gap worth closing rather than a regression the proposal has to defend, which is the better way to raise it.

**Correction, 2026-08-17, later: that addition is only true for a key with nothing in storage, which is the only case A10 tested.** The A7a fixture seeds through `initialKeyStates`, so nothing was ever written to disk and both builds were empty for the same trivial reason. For a key that **does** have persisted data the two builds differ, because [#773](https://github.com/Expensify/react-native-onyx/pull/773) removed a fallback rather than only changing a return type. Pre-#773 `OnyxUtils.get` is `Promise<TValue>` and reads storage on a cache miss (`main` at 3.0.100, `lib/OnyxUtils.ts`: cache hit resolves immediately, RAM-only keys resolve `undefined`, everything else falls through to `Storage.getItem(key)`). On the pinned build it is `return OnyxCache.get(key)` and nothing else. **So in the pre-hydration window the old read returned persisted data and the new one returns** `undefined`**.** That is the sharp version of the init question, and it is about the read losing its storage fallback rather than about `undefined` being undocumented.

**A7c, 2026-08-17: the above was read off the source, and it is now measured.** `tests/unit/OnyxPreHydrationReadTest.ts`, 4 cases, `6e1c752ba78`. It seeds through `Storage` rather than through Onyx, because writing through Onyx populates the cache and removes the phenomenon, then reproduces `src/setup/index.ts`'s order exactly: `Onyx.init({keys: ONYXKEYS})`, a synchronous read, `initOnyxDerivedValues()`, nothing awaited in between.


| Case                                                    | Result                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A synchronous `Onyx.get` misses a value that is on disk | confirmed `undefined`, while `Storage.getItem` for the same key in the same window resolves the seeded value |
| The same read after hydration                           | returns it, so the data was always reachable and the window is the whole story                               |
| The derived restore cannot fire at startup              | confirmed: the `Derived value for reportAttributes restored from cache` line is absent                       |
| The restore does fire with a warm cache                 | confirmed, which is what makes the case above a statement about timing rather than about a log message       |


The last two rows describe the suite as it stood at `6e1c752ba78`, before the fix. A7d rewrote them, because a suite that asserts the restore cannot fire would fail on the fixed code, and the top two rows are the ones that carry the Onyx-level finding.

**Green-red-green, and the first two attempts at the red were the useful part.** Mutating `OnyxDerived` to read through `Storage.getItem`, which is what `main`'s async `OnyxUtils.get` did on a cache miss, reds **exactly** the third case and leaves the other three green. So the suite is sensitive to the one difference this whole section is about: a storage-backed restore succeeds in the window, a cache-only synchronous one does not. Two guards keep the third case from being vacuous: it also asserts the captured log list is non-empty, proving `initOnyxDerivedValues` ran at all, and it snapshots after three flushes rather than one, so a restore that merely ran late would still be caught.

**One limitation, worth knowing before anyone trusts this suite for a fix.** A mutation that defers the restore through `OnyxUtils.afterInit` does **not** red the third case, so the suite cannot distinguish "reads the cache" from "reads late". The reason is the harness: `jest/setupAfterEnv.ts` calls `Onyx.init` in a global `beforeAll`, so `deferredInitTask` is already resolved by the time any test file runs, and `afterInit` therefore returns immediately rather than waiting for the second init's hydration. In a real cold start `afterInit` does wait, so it remains the sound production fix; it is just not one this suite can prove. A7d took a different route for that reason among others: deferring into the compute is observable in-process, so the suite can and does prove it.

**Where that bites, and it is not hypothetical: two converted sites sit in that window.**

**What the dead restore actually costs, established 2026-08-17 after asking whether any of this is a real-life scenario.** Not correctness: the persisted derived value still reaches the cache through hydration, subscribers still see it, and the first compute produces a value either way. The cost is one specific startup optimisation becoming unreachable. `derivedValue` in `OnyxDerived/index.ts` has exactly two sources, the restore read at `:46` and the result of each compute at `:120`, and it is handed to every config as `context.currentValue` at `:100`. So on the startup flush `currentValue` is now always `undefined`, and in `configs/reportAttributes.ts`, the 40 KB config that runs over every report, that decides two branches:

```ts
// line 279, the comment is the author describing the case this regressed
// We compare preferredLocale against currentValue?.locale so that the first locale load on startup
// (where both equal the same persisted value) does not trigger an unnecessary full recompute.
const needsFullRecompute = (hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, triggeredKeys) && preferredLocale !== currentValue?.locale) || ...
// line 366
const useIncrementalUpdates = !!currentValue?.reports && Object.keys(currentValue.reports).length > 0 && !needsFullRecompute;
```

With `currentValue` undefined, `preferredLocale !== undefined` is true, so `needsFullRecompute` is true and `useIncrementalUpdates` is false: the startup flush takes the full-scan path that the comment at `:279` exists to avoid. Deterministic rather than racy, on every cold start, and unmeasured in wall-clock terms, which is D2's job rather than a claim to make here.

- `src/libs/actions/OnyxDerived/index.ts`**, the restore-from-disk read. Fixed 2026-08-17 by A7d; kept here because it is the case the whole section was written around.** `src/setup/index.ts` calls `Onyx.init({...})` and then `initOnyxDerivedValues()` in the same synchronous function, with no await between them, exactly as its comment intends, since the whole point is to be outside the React lifecycle. On `main` that read is `OnyxUtils.get(key).then((storedDerivedValue) => ...)`, so it awaits storage and logs *"Derived value for X restored from cache"*. On the pilot, `cacab041f3c` converted it to `const derivedValue = Onyx.get(key)` and deleted the `.then`, so at that moment the cache is empty and the value can only ever be `undefined`. Correctness survives, because the derived value recomputes from its dependencies and that path has its own suite (`OnyxDerivedSelfHealTest.ts`), but **the restore-from-disk optimisation is dead on every cold start**, for all nine derived keys, including report attributes. Nobody noticed because nothing fails.
- `src/setup/backgroundLocationTrackingTask/index.native.ts`**. Fixed 2026-08-18 by restoring main's version, `140e4f0f119`, so this site no longer reads synchronously at all.** It read `GPS_DRAFT_DETAILS` at the top of the task callback and returned early when falsy, dropping that batch of location points.

**So the pre-hydration window now contains zero converted sites, not two.** A7d fixed the `OnyxDerived` restore and A7b's site went back to a hydration-waiting read. Anywhere the proposal or these notes say "two sites", it is one sentence out of date.

**A7b, closed 2026-08-18 by fixing the site rather than by measuring it, and the way it was found is the finding.** Upstream had already replaced that read on 2026-08-15 in `df3c706b178d`, "Remove OnyxUtils.get() from backgroundLocationTrackingTask, use connectWithoutView", with a one-shot subscription that cannot resolve before init does. That commit is an ancestor of both our branches, but the merge at `e7f0876779e` resolved in favour of the synchronous version and dropped it, and `cacab041f3ca` then converted it to the public `Onyx.get`. **The branch was carrying a silent revert of main, and nothing caught it**: not the lint rules, since the read is legitimately non-render and not at module scope, not the reachability checker, which has no startup entry set, and not any test, since no suite references this file. That is the argument for next-step 2.

**What the device runs showed before the fix**, on a real Android device tethered to Metro, with the probe inside the task callback: the read returned the trip every time, in the foreground and after a process kill plus a manual relaunch. The genuine headless wake, where the OS restarts a dead process with no UI, could not be forced on a dev build, because the restarted process fetches its bundle from Metro first and that pushes every delivery past hydration. Recorded as unknown rather than as a pass, which is why the fix rather than the measurement is what closes A7b. iOS is not a scenario at all: a user swipe-kill stops standard location delivery and the app is not relaunched for it.

**One measurement from that session outlives A7b.** A first attempt placed the probe at module scope rather than inside the callback, and it showed a synchronous read returning nothing at bundle evaluation with the same key arriving through a subscription **6,016 ms later**. That is a real-device measurement of the pre-hydration window on exactly the shape `no-onyx-read-at-module-scope` (B5b) forbids, and 6 s is far wider than that rule's justification assumed. Worth quoting in the proposal.



**What follows, and it is not an init guard on** `get`**.** The owner's position on 2026-08-17 is that `init()` is a documented precondition and the library does not need `get` to queue or throw, and the doc comment on the exported `get` already states the contract. Agreed, and the finding above does not change that: a guard would have turned the `OnyxDerived` case from a silent `undefined` into a silent wait, which is not obviously better. What it changes is the **conversion checklist**: "the read is not reachable during render" is not sufficient for code that can run before hydration, and neither of these two sites was flagged by anything, because both are legitimately non-render. That is B5b's job (`no-onyx-read-at-module-scope`), and B5b as scoped only covers module scope, not "called synchronously from a function that runs at startup".

**There is one small library-side ask hiding in here, and it is not the init guard.** The fix for a site that must read at startup is to wait for hydration, and the only way to do that today is `OnyxUtils.afterInit` through the `react-native-onyx/dist/OnyxUtils` deep import: the public `Onyx` object exports `init` but nothing that says when init finished. So the proposal, which is about giving non-render code a sanctioned public read, has a matching gap for the one case where that read has to be sequenced. A public `whenReady`, or `init` returning its promise, is a far smaller ask than guarding every read, and it is worth raising instead of the guard.

Cheapest fixes, in order: restore the `OnyxDerived` site to a read that waits for hydration (done, A7d), restore the GPS one to main's subscription read (done 2026-08-18, `140e4f0f119`), and widen B5b's brief or give the graph a startup entry set (next-step 2).

### A7d. Fix the `OnyxDerived` restore (done)

**Done 2026-08-17,** `569e00f7d78`**.** `src/libs/actions/OnyxDerived/index.ts`, +19/-5. The restore read is unchanged in what it does; it moved in *when* it runs. Instead of reading at `init()` time it is a one-shot closure, called on the first line of `runCompute`:

```ts
let derivedValue: ReturnType<typeof compute> | undefined;
let hasRestoredPersistedValue = false;
const restorePersistedValue = () => {
    if (hasRestoredPersistedValue) {
        return;
    }
    hasRestoredPersistedValue = true;

    derivedValue = Onyx.get(key);
    if (derivedValue) {
        Log.info(`Derived value for ${key} restored from cache`);
    }
};
```

**Why a compute is early enough, and why this needs no** `afterInit`**.** Four links, each enforced by code. A compute only runs once `areAllConnectionsSet` (`index.ts:75`, gated at `:229`), which means every dependency callback has delivered at least once. Delivery is gated in the library: `subscribeToKey` chains off `deferredInitTask.promise` plus an extra microtask tick before it resolves matching keys (`dist/OnyxUtils.js:796-805`). And hydration is not lazy per key: `initializeWithDefaultKeyStates` does one `Storage.getAll()` and `OnyxCache.merge`s the whole database before that task resolves (`dist/OnyxUtils.js:695-740`, and A11). So a running compute implies a fully hydrated cache, and `Onyx.get` is enough. That also removed the last `react-native-onyx/dist/OnyxUtils` deep import from the file, and it means A7's "small library-side ask" for a public `whenReady` is not needed for this case after all.

**Why inside** `runCompute` **rather than at its call site.** `runCompute` is the only reader of the restored value: it assigns `context.currentValue` on the very next line (`index.ts:120-121`). Putting the restore there makes the ordering structural instead of positional, so a second call site added later inherits the guarantee rather than having to remember it. It also cannot be too late, since the read and its only consumer are adjacent. It was briefly at the top of `flushRecompute`, which was correct but only by position.

**Why one shot.** `derivedValue` has two legitimate sources and a deliberate reset. After the first compute the engine's own value is the authority, and `resetForClear` sets it to `undefined` on a cache clear precisely so the next compute starts from scratch. Re-reading Onyx on every compute would resurrect a value the engine had just dropped, so the flag is load-bearing rather than an optimisation.

**The regression audit behind the "is it safe" question**, all checked against source rather than reasoned about:


| Scenario                                                  | Verdict                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Restore clobbers a value a compute already produced       | Impossible, one-shot flag                                                                                                                                                                                                                                                                           |
| Restore resurrects a value `Onyx.clear()` dropped         | Impossible twice over: the flag is spent by then, and `clear` sets the cache entry to null synchronously before notifying subscribers, so the read would return nothing anyway. No `KEYS_TO_PRESERVE` list in the repo holds a derived key (`App.ts:140`, `Session/index.ts:330`, `Delegate.ts:33`) |
| Some other writer changes the key in the window           | No other writer exists: only `setDerivedValue` writes `ONYXKEYS.DERIVED.*`, and only this engine calls it                                                                                                                                                                                           |
| A key never computes, so never restores                   | No effect. `derivedValue` is only ever read by a compute. The one visible difference is that the log line no longer appears for a key that never computes                                                                                                                                           |
| Reads `null` instead of `undefined` inside a clear window | Equivalent. Needs a clear before any compute ever ran, and every consumer treats the two the same (`null?.x`, `!!null`, `null ?? fallback`)                                                                                                                                                         |
| Subscription registration timing                          | Unchanged from April's version. `main`'s pre-April version wrapped the whole per-key body including the `connectWithoutView` calls in the `.then`, so it bought its restore by watching nothing until the storage read returned. That delay is not reintroduced                                     |


**Guarded by** `tests/unit/OnyxPreHydrationReadTest.ts`, rewritten, 4 cases, green. The first two are unchanged and still carry the Onyx-level finding: a synchronous read misses a key that is on disk in that window, and the same read returns it afterwards. The last two are new: the restore *does* fire at startup, and it fires exactly once, not on every flush. Red-checked by moving `restorePersistedValue()` back to `init()` time, which reds exactly the third case and leaves the other three green.

**The suite vehicle changed from** `reportAttributes` **to** `loginToAccountIDMap`**, and the reason is worth recording.** `reportAttributes` never flushes at all under jest: its locale dependency subscribes to `RAM_ONLY_ARE_TRANSLATIONS_LOADING`, whose callback returns early while `value ?? true` is true, so that connection is never marked initialised and `areAllConnectionsSet` stays false forever. That is also why the pre-fix suite's third case passed for a weaker reason than it claimed: there was no flush to restore in. `loginToAccountIDMap` has a single dependency, `PERSONAL_DETAILS_LIST`, so its first flush is not gated on anything else. It is a RAM-persisted derived key like the rest, so the seeding through `Storage` still works.

**What this does not fix.** The other pre-hydration site, `src/setup/backgroundLocationTrackingTask/index.native.ts`, is untouched and still needs A7b. And the checklist gap stands: nothing flagged either site, because both are legitimately non-render code, which is next-step 3.

### A8. Storage eviction versus sync read (done)

**Why.** `src/setup/index.ts:41` marks `REPORT_ACTIONS`, `SNAPSHOT`, `REPORT_ACTIONS_DRAFTS`, `REPORT_ACTIONS_PAGES` and `REPORT_ACTIONS_REACTIONS` evictable, and `PayActionCell` reads `REPORT_ACTIONS`.
**Result, verified 2026-08-12.** Onyx #766 ("Remove cache eviction system", merged 2026-04-10) removed memory-cache eviction. What remains is storage-capacity eviction in `OnyxUtils.evictStorageAndRetry`, which calls `remove(keyForRemoval)` and drops the key from cache and storage together. So a sync read returns `undefined` exactly where the parameter path also carried `undefined`. Equivalent, not worse. No condition needed.

### A9. Root-cause the reported oddities on [#773](https://github.com/Expensify/react-native-onyx/pull/773)

**Why.** Oddities were reported in E/App with the patch applied and never root-caused. [#773](https://github.com/Expensify/react-native-onyx/pull/773) cannot be released on "we could not reproduce it".
**Method.** Collect the specific reports, reproduce or disprove each, and write them up.
**Exit criteria.** Every reported oddity either fixed, explained, or documented as unrelated.

### A10. Red-check the A1-A3 suite against unpatched Onyx

**Why.** The A1 to A3 suite is green on the patched build, but it has never been run against unpatched Onyx, so it is unproven as a regression guard: a suite that would pass either way guards nothing. Both A2's "no difference" and A3's [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) result depend on this comparison. The suite's permanent home is the Onyx repo, since it gates the [#773](https://github.com/Expensify/react-native-onyx/pull/773) release rather than any App change.

**Method.** Work in the Onyx checkout at `~/CODE/RN/react-native-onyx` (currently `main` at 3.0.99). The [#773](https://github.com/Expensify/react-native-onyx/pull/773) branch is `feature/onyxutils-get-synchronous`, 6 commits, and GitHub reports it as `CONFLICTING` against `main`, so it needs a merge from `main` first, touching only the conflicted files. Then port the suite to `tests/unit/syncGetSemanticsTest.ts` there, rewritten against `lib/Onyx` and a local `ONYX_KEYS` fixture rather than `@src/ONYXKEYS`, and against `waitForPromisesToResolve` rather than the App's `waitForBatchedUpdates`. Run it on `main` first for the red (`get` returns a Promise there, so the same-tick cases fail and the `returns a value rather than a promise` case names the reason), then on the merged branch for the green.

Alternatively, or as a cross-check, red it in the App checkout: `patch -R -p1 -i patches/react-native-onyx/react-native-onyx+3.0.94.patch`, run, then re-apply with `patch -p1 -i` and confirm green again.

**Exit criteria.** A recorded list of which cases go red unpatched, green again after, and the ported suite committed on the [#773](https://github.com/Expensify/react-native-onyx/pull/773) branch alongside the A4a, A6a and A7a cases that also belong to the library rather than to App.
**Note.** Attempted on 2026-08-12 and blocked by tooling in that session: `patch` and writes outside the App checkout could not be executed. Nothing in the code blocks it.

**Re-scoped 2026-08-13.** The port into [#773](https://github.com/Expensify/react-native-onyx/pull/773) is dropped. What remains is the second half of the method above, the reverse-apply cross-check inside the App checkout, and it is now the whole of A10. The suites stay where they are and keep running against the patched build. This does not make the red-check less important: it is still the only thing separating "these cases describe patched Onyx" from "these cases would pass against anything".

#### A10 mechanics, superseded 2026-08-17 by the pin

The spec below is kept for its predictions, its verdict tables and its two contaminations, all of which still stand. Only the mechanics are dead: there is no patch to reverse-apply, so every `patch -R -p1` in it is now a pin edit plus an install. Anyone re-running A10 uses this table instead.


| State          | Pin                                                                                           | What it contains                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Current        | `git+https://github.com/Expensify/react-native-onyx#073821fb322df72f43a6510575f8b1abd93af2e9` | [#773](https://github.com/Expensify/react-native-onyx/pull/773) semantics, the public `get`, its library tests, its API docs                                                 |
| Semantics only | `...#a8bca8a85f25079ca79bdfde794e0e2fd5fa4894`                                                | [#773](https://github.com/Expensify/react-native-onyx/pull/773) without the export. This is the A5 red-check from the other side, and it no longer needs a hand-edited patch |
| Baseline       | `...#a19a070ff1a117607c150b3c8ac014451754562d`                                                | `main` at 3.0.100, no [#773](https://github.com/Expensify/react-native-onyx/pull/773) at all                                                                                 |


```bash
# edit the pin in package.json, then
npm install                                                                          # minutes, and it rewrites the lock
npx jest tests/unit/OnyxSyncGetValidationTest.ts tests/unit/OnyxSyncGetTimingTest.ts
```

Two of the three "things not to do while unpatched" invert. `npm install` is now the mechanism rather than the thing that silently restores the patched state, and there is no Onyx entry left for `postinstall` to re-apply. The typecheck warning stands and gets stronger: on the baseline pin, `get` is absent from the `.d.ts`, so `npm run typecheck` fails by design. Verify `node_modules/.bin` survived each install before believing a red.

The comparison is also better than the one A10 actually ran. Reverse-applying measured stock 3.0.94 against 3.0.94-plus-[#773](https://github.com/Expensify/react-native-onyx/pull/773); the baseline pin is `main` at the same 3.0.100 the branch merged, so a re-run isolates #773 instead of #773 plus six versions of library drift. A6a is the proof that the drift was not empty: see A13.

#### A10 execution spec, prepared 2026-08-17

Read before running. The step is split, because the obvious version of it answers a weaker question than the one A10 was written to answer.

**The problem with the obvious version.** Reverse-apply the patch and both suites go almost entirely red, and nearly all of that red is the **read type** rather than the **write semantics**. Unpatched, `OnyxUtils.get(key)` returns a Promise for every key, so `expect(OnyxUtils.get(K)).toBeUndefined()` fails because a Promise is not undefined, and `expect(OnyxUtils.get(K)?.field).toBe(v)` fails because a Promise has no such field. Every case reads through that call, so every case fails, whatever the write did. A result of "27 of 28 red" would satisfy the exit criteria as written and still leave A2's residual and A3's [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) caveat exactly where they are.

So:

- **A10a, the read-type red.** Reverse-apply, run both suites, record the per-case verdicts. This is the literal exit criterion and it is worth having: it proves the suites are not passing against anything. About an hour.
- **A10b, the semantics red.** For the ten cases whose subject is a write behaviour rather than the read, run an awaited-read variant unpatched, so the read is comparable on both builds and the only difference left is the write. This is the half that settles A2's "no value-level difference found" (currently established by reading the diff) and A3's "does not reproduce with [#773](https://github.com/Expensify/react-native-onyx/pull/773) applied" (currently not attributable to the patch). Half a day.

**Pre-run state.** `feature/onyx-get-pilot` at `193b52974e1`, working tree clean apart from the five `ONYX-GET-*.md` files. The whole [#773](https://github.com/Expensify/react-native-onyx/pull/773) change lives in `patches/react-native-onyx/react-native-onyx+3.0.94.patch`, which is not in `main` at all, so reverse-applying returns `node_modules/react-native-onyx` to stock 3.0.94. Three run states are available, and the third is free:


| State           | How                                                                                                     | What it contains                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Patched         | current                                                                                                 | [#773](https://github.com/Expensify/react-native-onyx/pull/773) semantics plus the public `get` export                                                                                |
| Base patch only | `git show feature/onyxutils-get-synchronous-2:patches/react-native-onyx/react-native-onyx+3.0.94.patch` | [#773](https://github.com/Expensify/react-native-onyx/pull/773) semantics, no export. Isolates the export from the semantics, which is the A5 red-check done from the other direction |
| Unpatched       | reverse-apply                                                                                           | stock 3.0.94                                                                                                               |


**Mechanics.** Dry run first, because a reverse-apply fails silently into `.rej` files if `node_modules` has drifted. Run on 2026-08-17 and it is clean: six files, no fuzz, no rejects, so nothing about the current install blocks the step.

```bash
patch -R -p1 --dry-run -i patches/react-native-onyx/react-native-onyx+3.0.94.patch   # expect 6 files, no fuzz
patch -R -p1 -i patches/react-native-onyx/react-native-onyx+3.0.94.patch
npx jest tests/unit/OnyxSyncGetValidationTest.ts tests/unit/OnyxSyncGetTimingTest.ts
patch -p1 -i patches/react-native-onyx/react-native-onyx+3.0.94.patch                # restore
npx jest tests/unit/OnyxSyncGetValidationTest.ts tests/unit/OnyxSyncGetTimingTest.ts # 28 green again
```

Three things not to do while unpatched. Do not run `npm run typecheck`: `Onyx.get` leaves the `.d.ts`, so the A5 cases and all four converted files fail to compile, and that is the expected consequence rather than a finding. Do not run the C1 to C4 suites: they call `Onyx.get`, which is undefined unpatched, so they crash for a reason A10 is not asking about. Do not run `npm install` mid-experiment, since `postinstall` re-applies the patch and would silently end the unpatched state.

**Case inventory and predicted verdicts.** 28 cases, 23 in `OnyxSyncGetValidationTest.ts` and 5 in `OnyxSyncGetTimingTest.ts`. Predictions are written down now so the run confirms or refutes them rather than merely reporting them.


| Cases                                      | Predicted unpatched                                                            | Red mechanism                                                                                                                                 | Salvageable in A10b                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A1, 12 cases (`:41` to `:172`)             | all red                                                                        | read type, which is their entire subject                                                                                                      | No. "It is a Promise" is the whole content of these cases unpatched                                                       |
| A5, 4 cases (`:186` to `:219`)             | all red, one by assertion and three by `TypeError: Onyx.get is not a function` | export missing                                                                                                                                | No, and already red-checked from the other side by deleting `get,` from the exported object                               |
| A2, 3 value cases (`:223`, `:233`, `:245`) | red                                                                            | read type, masking the semantics                                                                                                              | Yes                                                                                                                       |
| A2, subscriber case (`:262`)               | **red at** `:289`, and this is the one case that reds on semantics alone       | write semantics: unpatched the merge thunk is pushed ahead of the set thunk, so the first notification carries A at `total: 1` rather than 10 | Already comparable, no variant needed                                                                                     |
| A3, 3 cases (`:301`, `:312`, `:323`)       | red                                                                            | read type, masking the semantics                                                                                                              | Yes, and this is where the [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) claim is decided                                                                         |
| A4, 3 cases (`:87`, `:101`, `:116`)        | red                                                                            | read type                                                                                                                                     | Two of the three. `:116` needs a set to be synchronously visible, which is patch-only, so it is inherently not comparable |
| A6 (`:43`)                                 | red                                                                            | read type. Cross-tab plumbing is baseline, not patched                                                                                        | Yes, and it is expected to go green, which is the honest result: A6a is not a patch-dependent claim                       |
| A7 (`:25`)                                 | red                                                                            | read type. The pre-init window exists because the read is synchronous, so unpatched the hazard is milder or absent                            | Yes, and a green here means A7a is a statement about the patch rather than about Onyx                                     |


**Two assertions that pass unpatched for the wrong reason,** worth naming because they are the shape to watch for anywhere else in these suites: `:100` and `:104`, both `expect(OnyxUtils.get(KEY)?.primaryLogin).toBeUndefined()`. A Promise has no `primaryLogin`, so they pass on a build where the read is broken. Their case still fails on the next line. Any assertion of the form `get(k)?.field` being absent is vacuous unpatched.

**A10b, the awaited-read variant.** Copy both suites to `tests/unit/OnyxSyncGetSemanticsAwaitedTest.ts`, in `tests/` because jest has to see it, and delete it afterwards, the same way B3's bypass probe was handled. Four mechanical edits:

1. Add a reader: `const read = <T,>(key: string): Promise<T> => Promise.resolve(OnyxUtils.get(key) as T);`. It is a no-op on the patched build and an await on the unpatched one, which is the point.
2. Rewrite every `OnyxUtils.get(<arg>)` as `(await read(<arg>))`. Every call site takes a simple argument, so `OnyxUtils\.get\(([^()]*)\)` covers all of them.
3. Make `derivedAmount` async, and make the two synchronous `it` callbacks async.
4. Keep only the A2, A3, A4 and A6, A7 describes. Drop A1 and A5, which have nothing to compare.

Then run it on both builds. Predicted results, which is where the value of the whole step sits:


| Case                      | Predicted unpatched, awaited                 | What it settles either way                                                                                                                                                                                                                                             |
| ------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A2 `:223`, `:233`, `:245` | green                                        | Green upgrades A2's "no value-level difference found" from a diff reading to an executed comparison. Red means A2's conclusion is wrong and the reorder does change stored data, which makes [#773](https://github.com/Expensify/react-native-onyx/pull/773) a bigger prerequisite than the proposal currently says               |
| A3 `:301` and `:323`      | red, the key resurrects                      | Red is the headline: it lets A3 say "[#773](https://github.com/Expensify/react-native-onyx/pull/773) fixes [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813)" instead of "does not reproduce with #773 applied", and it makes the merge-queue flush in `clear()` a fix rather than a refactor. Green means #2813 needs a different repro and the proposal must stop citing it |
| A3 `:312`                 | green                                        | The merge-after-clear behaviour callers depend on is present on both builds, so the flush is not a behaviour change for them                                                                                                                                           |
| A4 `:87`                  | red, the derived value lands a revision late | Red reproduces the direction of the production trace (890 ms unpatched, 109 ms patched) in jest, which upgrades A4a from "explains the gap" to "reproduces it", and it is the strongest cheap evidence that [#773](https://github.com/Expensify/react-native-onyx/pull/773) helps rather than merely permits                      |
| A4 `:101`                 | green                                        | Both builds are stale in the same tick as an unresolved merge, so that rule is Onyx's, not the patch's                                                                                                                                                                 |
| A6 `:43`                  | green                                        | Confirms cross-tab freshness is baseline plumbing. A6a is then a claim about Onyx, quotable without the patch                                                                                                                                                          |
| A7 `:25`                  | green, or a milder failure                   | A green says the pre-init window is created by the synchronous read, which sharpens the init-guard question on [#773](https://github.com/Expensify/react-native-onyx/pull/773) rather than weakening it                                                                                                                           |




**Revised exit criteria.** A per-case table of unpatched verdicts for all 28 (A10a), plus the ten-case awaited comparison with each prediction above marked confirmed or refuted (A10b), plus both suites green again after restoring the patch. Every prediction that is refuted gets written into the step body it belongs to, since three of them are load-bearing for the proposal: A2's residual, A3's [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) sentence, and A4's latency claim.

**What this step cannot do.** It compares stock 3.0.94 against our patch, not against whatever the library eventually releases. The note in the strategy decision stands: a patch proves nothing about code we did not patch, so whichever version ships the change has to be re-run against these same suites.

**Result, 2026-08-17: pass, and it refuted two of its own predictions and one sentence in A2.** Both halves ran. Sequence: 28 green patched, variant written and greened patched, reverse-apply, both halves unpatched, restore, 39 green again (28 committed plus the 11 variant cases). The variant files were deleted afterwards, per the recipe above, because the committed suites already guard the one real difference this found.

**A10a, committed suites unpatched: 27 red, 1 green of 28.** The one green is the surprise and it is dealt with below. Mechanisms, which is the part worth keeping:


| Cases                 | Verdict   | Mechanism                                                                                               |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| A1, 12                | red       | read type, as predicted. The sentinel at `:41` fires first and names the reason                         |
| A5, 4                 | red       | one by assertion (`typeof Onyx.get` is `'undefined'`), three by `TypeError: Onyx.get is not a function` |
| A2, 3 value cases     | red       | read type                                                                                               |
| A2, `:262` subscriber | **green** | nothing about it depends on the patch, see finding 2                                                    |
| A3, 3                 | red       | read type                                                                                               |
| A4, 3                 | red       | **not the read type:** `TypeError` **out of app code**, see contamination 1                             |
| A6, A7                | red       | read type                                                                                               |


**A10b, awaited variant unpatched: 2 red, 9 green of 11.** Only two cases in either suite go red on write semantics, and they are the same two:


| Case                             | Predicted        | Actual                                                                                      |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| A2 `:223`, `:233`, `:245`        | green            | green, confirmed                                                                            |
| A2 `:262`                        | red on semantics | **green, refuted**                                                                          |
| A3 `:301` merge before `clear()` | red              | **red, confirmed**                                                                          |
| A3 `:312` merge after `clear()`  | green            | green, confirmed                                                                            |
| A3 `:323`, the [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) shape       | red              | **red, confirmed**                                                                          |
| A4 `:87`                         | red              | **green, refuted** once app code is honest, see contamination 1                             |
| A4 `:101`                        | green            | green, confirmed                                                                            |
| A4 `:116`                        | not comparable   | not comparable, confirmed by failing on the **patched** build too, 555 where it expects 100 |
| A6 `:43`                         | green            | green, confirmed                                                                            |
| A7 `:25`                         | green            | green, confirmed                                                                            |


Ten predictions confirmed, two refuted. Three findings follow, and two of them change sentences we had already written.

**Finding 1: [#2813](https://github.com/callstack-internal/expensify-issues/issues/2813) is attributable to the patch, so A3 can stop hedging.** `:301` and `:323` are the only cases in 28 that red unpatched for a write-semantics reason, and both are about a merge surviving a `clear()`. On stock 3.0.94 the key resurrects; with the patch it stays deleted. The mechanism is in the patch and is not the read: `clear()` no longer defers through `getAllKeys().then(...)`, so it classifies keys and calls `OnyxCache.drop` synchronously in the calling tick, and it deletes the pending `mergeQueue` and `mergeQueuePromise` entries outright. A3's caveat is lifted, in A3's own body.

**Finding 2: the set-before-merge reorder is unobservable in these tests, on either build.** All four A2 cases pass unpatched with an awaited read, including `:262`, which A2's own result names as the place where the reorder shows: *"observable only across members of one collection, and there it affects what a subscriber sees mid-batch rather than the final values"*. That sentence is not supported. The reorder keeps its justification from reading the code, since a set's cache write has to be in place before `mergeCollectionWithPatches` reads previous values synchronously, but it has no test that guards it and no observed behaviour difference at all. Corrected in A2.

**Finding 3: A4a's ordering claim is not patch-dependent.** With an awaited read and `main`'s own `OnyxDerived`, the derived value is already current once the source write resolves on the **unpatched** build too. So what removes the derived-key revision lag is awaiting the write, not the patch. The 890 ms versus 109 ms trace stays what A4b was always scoped for: a wall-clock claim about storage latency, which jest cannot reproduce. Corrected in A4.

**Contamination 1, and it is the most reusable thing here: app code on this branch reads through** `Onyx.get`**.** Commit `cacab041f3c` converted the five deep-import call sites to the public export, and in `src/libs/actions/OnyxDerived/index.ts` it also deleted the `.then` wrapper that the restore-from-disk read used to sit inside. So unpatched, `initOnyxDerivedValues()` throws `TypeError: Onyx.get is not a function` at that file's line 44, and A4's three cases fail for a reason that has nothing to do with derived timing. An unpatched run has to pair the unpatched library with unpatched app code, which is one file: `git show main:src/libs/actions/OnyxDerived/index.ts > src/libs/actions/OnyxDerived/index.ts`, then `git checkout HEAD --` it afterwards. The second-order point matters more than the fix: part of what made the patched A4a result look patch-caused is that app-side de-async, not the library.

**Contamination 2: an awaited read is not a valid instrument for a case that reads in the same tick as an unresolved write.** On the patched build the reader captures the value before the await; on the unpatched build its promise resolves after the pending write has applied. The two builds are therefore not comparable for same-tick cases, and the proof is that A4 `:116` fails on the **patched** build inside the variant. The variant is only valid where the read happens after its writes have settled: A2, A3, A6, A7 and A4 `:87`. Any future use of this instrument has to check that first.

**One more line, cheap and useful for the [#773](https://github.com/Expensify/react-native-onyx/pull/773) conversation.** A7 `:25` is green unpatched with an awaited read: before init resolves, storage has nothing either, so the read is empty on both builds. The init-guard hole is pre-existing rather than something the patch introduces, which makes it a design question on #773 rather than a regression to defend.

### A11. Eager full-DB hydration is already shipped (done)

**Why it matters.** The standing objection to a synchronous read is that it can miss data which is still in storage. Checked on 2026-08-13 against the unpatched package, and the objection is already answered by shipped code rather than by the patch. `initializeWithDefaultKeyStates` in `react-native-onyx@3.0.94` reads:

```js
// Eagerly load the entire database into cache in a single batch read.
return storage_1.default.getAll().then((pairs) => { ... cache.setAllKeys(...); cache.merge(...); })
```

`getAll` is implemented in every provider, so this is both platforms: `SQLiteProvider` aggregates the table with `json_group_array` in one statement, `IDBKeyValProvider` calls `IDB.entries`. The patch did not contain the string `getAll`, which is how we knew it was baseline and not ours. Re-checked on 2026-08-17 after the version moved: `initializeWithDefaultKeyStates` still calls `Storage.getAll()`, at `lib/OnyxUtils.ts:854` on 3.0.100, so the claim carries to the pinned build.

**What follows.** A cache miss is not a storage miss. After init, cache-complete is the shipped invariant, and the sync read inherits it rather than assuming it. The remaining hole is the one A7a already measures: before init resolves there is no data and no guard, and `get` returns `undefined` without saying why. That is the init-guard question in the priority list, and A11 narrows it from "reads can be stale" to "reads before init are empty", which is a much smaller thing to defend.

**Also settled by this.** The RAM-only and skippable-collection-member filtering that used to sit inside `get` was not lost when `get` became a cache read: it moved into this hydration path, which skips both before anything reaches the cache. And the startup cost of loading the whole database is current production behaviour, not something the patch introduces, so it is not a cost this proposal has to defend.

## B. Static analysis and enforcement



### A12. Which reader the public `get` should be (done)

**Why this exists.** C2 needed four whole-collection reads and the first attempt failed, which turned out to be worth more than the attempt.

**What the patch's** `get` **did first.** It delegated to `OnyxUtils.get`, which the [#773](https://github.com/Expensify/react-native-onyx/pull/773) change reduced to `cache.get(key)`. Handed a collection key, that looks up the collection prefix as though it were an ordinary key. Nothing is ever stored under that name, so it returns `undefined`, while the declared return type `OnyxValue<TKey>` resolves through its `TKey extends CollectionKeyBase` branch to `OnyxCollection<T>` and promises the collection. A signature promising a collection, a silent `undefined` at runtime.

**The wrong fix, and why it was reverted.** Adding a collection branch to the patched `get` worked and was rejected on the right grounds: the patch should not invent semantics the library does not have. Reverted the same session.

**The right fix, which adds nothing.** `OnyxUtils.tryGetCachedValue` already handles both shapes of key, and has done since before this work. Its own doc comment: *"If the requested key is a collection, it will return an object with all the collection members."* The patch does not touch it at all, zero changed lines. So the public `get` delegates there instead, and the only thing the wrapper adds is the typing that `tryGetCachedValue` throws away on its own signature, which is declared `OnyxValue<OnyxKey>` and forces every caller to cast.

**Evidence, in the library rather than in App**, because this is a statement about Onyx: 7 cases in the Onyx checkout, typecheck and lint clean there, shipped inside the pin at `370d89fc`. They started as a standalone `tests/unit/syncGetCollectionKeyTest.ts` of 17 and were folded on 2026-08-17 into the two suites that already own the subjects, `describe('get')` in `tests/unit/onyxTest.ts` and `describe('tryGetCachedValue')` in `tests/unit/onyxUtilsTest.ts`. Ten went with the file: the nine that characterised `OnyxUtils.get`'s collection behaviour without [#773](https://github.com/Expensify/react-native-onyx/pull/773) changing it, and one that only checked `typeof Onyx.get`. It pins what happens when someone reads a whole collection through each available path:


| Path                            | Collection key                                                        |
| ------------------------------- | --------------------------------------------------------------------- |
| `get`                           | `undefined`, always, however many members exist                       |
| `tryGetCachedValue`             | every member, or `undefined` when no key is loaded at all             |
| `getCachedCollection`           | every member, or `{}` when none                                       |
| `connectWithoutView` subscriber | every member, via `getCachedCollection` inside `sendDataToConnection` |
| `multiGet([collectionKey])`     | empty map, it does not expand to members                              |
| `getAllKeys()`                  | the member keys, never the prefix, which is the mechanism             |


Two findings that came from running it rather than from reading it. `tryGetCachedValue` answers `undefined` for an empty collection while the store holds no key at all, and `{}` for that same empty collection once **any unrelated key** exists, so a caller has to treat the two as one outcome. And under the already-shipped eager hydration (A11) the first case only happens before init resolves, which is the same pre-init window the single-key read has, so the collection read fails consistently rather than in a new way.

**Green-red-green, both directions.** In the Onyx checkout, pointing the public `get` back at `OnyxUtils.get` reds exactly the two cases that read a collection, `reads every member when given a collection key` and `agrees with a whole-collection subscriber`, and leaves the rest of the 187 in those two suites green. That is the same guard the deleted file held, re-verified after the move. In App, the same mutation reds exactly one A5 case, the collection one, and leaves the other 22 green, which is what proves the delegation changed nothing for single keys.

**For the proposal.** This is not a caveat to hide. The API the proposal names is the synchronous twin of `useOnyx`, and it now accepts the same keys `useOnyx` accepts, by pointing at the library function that already did. The 129-file wave contains whole-collection subscriptions, and those are the expensive ones, since any member changing re-renders the host.

### A13. Re-validate on the pinned [#773](https://github.com/Expensify/react-native-onyx/pull/773) build (wip)

**Why.** This is the caveat that closed A10, arriving as work rather than as a note. Every A-group result in this file was measured on `react-native-onyx@3.0.94` plus a local patch. The app now runs 3.0.100 plus [#773](https://github.com/Expensify/react-native-onyx/pull/773), which is six library versions of other people's changes away, and none of the suites had been run there.

**Method.** Reconcile the install, then run everything that does not need the pilot branch, then run the pilot half after the merge in next-step 2.

**Result, 2026-08-17: the tests pass and the branch does not. Jest is green after one instrument fix; typecheck and lint are red, in app code, for reasons that are the version bump rather than [#773](https://github.com/Expensify/react-native-onyx/pull/773).**


| Check                                                                   | Outcome                                                                                                                                                    |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/unit/OnyxSyncGetValidationTest.ts` (19, A1 to A3)                | green                                                                                                                                                      |
| `tests/unit/OnyxSyncGetTimingTest.ts` (5, A4a, A6a, A7a)                | **1 red**, fixed, then green                                                                                                                               |
| B-group suites: lint rule 36, bypass 12, call graph and reachability 47 | green, 95 of 95                                                                                                                                            |
| `npm run typecheck-tsgo`                                                | **8 errors in 4 files** at first run, two causes, both app-side. **3 left** after `a3d854063d6`, see the update below                                      |
| `npm run lint-changed`                                                  | **18 errors**, all `@typescript-eslint/await-thenable`, and 22 over the whole repo. Still open                                                             |
| `npx bun scripts/checkRenderReachability.ts`                            | **exit 1**, and not the pin's fault. See the B2a note                                                                                                      |
| A5 (4 cases) and C1 to C4                                               | **green on the pin as of the merge below**: 8 suites, 165 cases, and the pilot's typecheck is down to the same 3 `useOnyx` errors as the foundation branch |


**The red, and why it is worth more than a green would have been.** A6a failed with `Expected: 7, Received: undefined` at `tests/unit/OnyxSyncGetTimingTest.ts:65`. Not [#773](https://github.com/Expensify/react-native-onyx/pull/773): upstream commit `e75f5f4d`, *"Fix cross-tab sync for collection-root subscribers"*, landed between 3.0.94 and 3.0.100 and changed the `keepInstancesSync` callback from `(key, value)` to `(pairs)`, a whole batch of entries that changed together. Our test invoked the old two-argument shape, so nothing reached the cache and the read saw nothing. Fixed by calling it as `[[REPORT_A, {reportID: 'A', total: 7}]]`.

**The claim survives and gets stronger.** A6a asserts that a cross-tab write reaches the cache no later than the moment subscribers are told. The new callback captures each member's previous value, calls `cache.set(key, value)` for **every** pair in the batch, and only then runs `keyChanged` for the individual keys and one `keysChanged` per affected collection. So the whole batch is in cache before any notification goes out, which is a wider guarantee than the per-key interleaving the old shape gave. The test comment now says that instead of the old mechanism.

**Green-red-green on the fix**, since a repaired instrument has to be shown to still be an instrument: removing `OnyxCache.set(key, value)` from the cross-tab callback in the installed `dist/Onyx.js` reds exactly the A6 case and leaves the other 4 green; restoring it greens all 5.

**The typecheck reds, 8 in 4 files, and neither cause is [#773](https://github.com/Expensify/react-native-onyx/pull/773).**


| Cause                                                                                                                                                              | Sites                                                                                                                                                                                                                                                               | Fix                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The `window.Onyx.get` shim collides with the real export, which is A5's correction of 2026-08-13 arriving on this branch because the export now comes with the pin | `src/setup/addUtilsToWindow.ts`, 5 errors at `:32` and `:46`                                                                                                                                                                                                        | Already written, on the wrong branch. `src/types/modules/react-native-onyx.d.ts` declares the shim as `Omit<typeof Onyx, 'get'> & {...}` on `feature/onyx-get-pilot` and as a plain intersection here                                                                                                                                              |
| Library `main` removed `useOnyx`'s third `dependencies` argument in `5739db80` on 2026-06-11, and the app still passes one                                         | 3 errors, `TS2554: Expected 1-2 arguments, but got 3`: the app's own wrapper at `src/hooks/useOnyx.ts:101`, plus `useReportPreviewActionDecision.ts:50` and `useReportTransactionViolations.ts:23`, which pass `[iouReport?.ownerAccountID]` and `[transactionIDs]` | The library's replacement is `createMemoizedSelector`, which ships in the package but is not re-exported from its index, so it needs the `react-native-onyx/dist/createMemoizedSelector` deep import. Not a mechanical edit: `useReportTransactionViolations` has a comment explaining why its selector must re-run when `transactionIDs` hydrates |


A ninth error existed before the A6 fix and was the same stale instrument seen from the type side: `tests/unit/OnyxSyncGetTimingTest.ts(62,41): error TS2554: Expected 1 arguments, but got 2`.

**The lint reds, 22 across 5 test files.** All `await OnyxUtils.get(`, which `@typescript-eslint/await-thenable` rejects because the pin makes that read synchronous. This is A5's `await-thenable` finding recurring: 12 of them were stripped on 2026-08-13 in the pilot's `61adf9754e4`, which is downstream of this branch, and `main` has added more since. Current spread: `tests/unit/TransactionTest.ts` 8, `tests/actions/ReportTest.ts` 5, `tests/unit/OnyxDerivedTest.tsx` 5, `tests/unit/OnyxDerivedSelfHealTest.ts` 2, `tests/unit/SearchAutocompleteListTest.tsx` 2. Two options, and the cheap one is not obviously right: strip the awaits, or sweep those files onto `Onyx.get` and be done with the deep import. The second is what the wave has to do eventually anyway.

**Update, 2026-08-17, later: 5 of the 8 type errors are gone, and the fix was better than the one this step recommended.** `a3d854063d6` did not port the pilot's `Omit<typeof Onyx, 'get'>` declaration. It deleted the debug shim outright and rewrote `src/setup/addUtilsToWindow.ts` against the real export: `window.Onyx.log` plus twelve direct `Onyx.get` reads across the `policy`, `report`, `transaction` and `receipt` lazy getters, with no `.then` anywhere. So there is nothing left to collide with, and A5 correction 1's closing sentence, *"once* `Onyx.get` *is public, those 12 lines get deleted, and that deletion belongs in the migration"*, is done, ahead of the migration.

Three things that follow, and the second is the one worth carrying into the thread:

- `src/` **is now a real consumer of the public export on the foundation branch**, 12 call sites, all in that one file, where before this branch had none of its own.
- **B1b gets its first honest run.** Its result read "0 findings over 6,805 files", which was 0 findings over a tree with no `Onyx.get` in it. The rule is still silent, now with twelve real reads present, and it should be: every one sits inside a lazy getter or a helper called from one, none of it render-reachable. The claim to make is "silent with real call sites", not "silent".
- **The remaining 3 errors are the ones with actual work in them**, all `TS2554: Expected 1-2 arguments, but got 3`, from library `main` dropping `useOnyx`'s `dependencies` argument in `5739db80`.

**A13 closed, 2026-08-17, by the sweep and the pilot merge.**

`c9d24c1620f` on the foundation branch converted all 71 `OnyxUtils.get(` calls in the 5 offending test files to `Onyx.get(`, dropping the 22 awaits with them, and deleted the deep import from each. Sweep rather than await-strip, so the per-merge tax stops: 381 tests pass before and 381 after, `lint-changed` clean, typecheck back to the 3 `useOnyx` errors alone.

One case did not survive as written, and it says something about the API rather than about the test. `tests/actions/ReportTest.ts` reassigned a non-nullable `let report` from the read. That compiled against `OnyxUtils.get`, whose signature is `get<TKey, TValue extends OnyxValue<TKey>>(key): TValue` and lets the **caller** pick the return type, so the assignment target silently became the inferred type. The public `get` returns `OnyxValue<TKey>`, which is `Report | undefined` here, and the assignment fails. **The public** `get` **is not a drop-in for the deep import at the type level: it is stricter, and it is stricter in the direction the migration wants.** Fixed by reading into a new `const` next to the assertion, which is what the surrounding `report?.lastMentionedTime` already implied. Worth saying in the thread: converting a call site can surface a nullability the old spelling hid, and that is a feature.

`7a6d0fe7a8b` then merged the foundation branch into `feature/onyx-get-pilot`. Eight conflicts, six of them superseded work that the foundation side had already redone better, and two real ones:


| Conflict                                                                                                                           | Resolution                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `patches/react-native-onyx/react-native-onyx+3.0.94.patch`, plus `addUtilsToWindow.ts`, `react-native-onyx.d.ts`, and 3 test files | Took the foundation side. The patch is deleted, the pilot's `7aa5422bb63` shim shadowing is unnecessary after `a3d854063d6`, and its `61adf9754e4` await-strip is a subset of the sweep                                                                                                                                                   |
| `useBulkDuplicateReportAction.ts`                                                                                                  | Main added a twelfth value, `conciergeChat`, with two subscriptions, after C2 had removed the other eleven. Kept the hook subscription-free by reading both at event time inside the handler, since the merged `bulkDuplicateReports` still takes `conciergeChat` as a parameter. This keeps the proposal's sentence about that hook true |
| `replaceOptimisticReportWithActualReport.ts`                                                                                       | Main added a third parameter, `currentUserAccountID`, and fed it from the `SESSION` module cache that C4 deleted. Kept main's parameter, sourced it with `Onyx.get(ONYXKEYS.SESSION)?.accountID` inside the trigger's `connectWithoutView` callback, which is not render                                                                  |


Result: 8 suites, 165 tests green on the merged pilot, lint clean on both resolved files, typecheck at the same 3 errors. So the pilot PR now runs on the pin rather than on a deleted patch, and the two merge resolutions are the first evidence that a converted call site survives contact with main's ongoing changes: main added a value to each of the two conversions and neither needed to be un-converted.

**What this says about the switch in general.** The patch was a change to Onyx; the pin is a change to Onyx **and** a six-version upgrade, and the upgrade has an app-side bill the patch did not present. Three classes of it are now named, none of them about [#773](https://github.com/Expensify/react-native-onyx/pull/773)'s semantics: a stale test instrument (A6a), library API drift the app has not absorbed (`useOnyx` dependencies), and a type-surface collision that was already solved on another branch (the shim). Two consequences. Green jest is not enough evidence for a pin bump: run typecheck and lint too, which is how all three of these were found. And the same bill is unpaid on the pilot branch, where 4 A5 cases and four conversion suites have never run against 3.0.100, so next-step 2 is not a formality.

### B1. Prototype `no-onyx-get-in-render`

**Why.** The rule is currently a name and a description. Its false-positive rate decides whether it is a guardrail or a permanent stream of `eslint-disable` comments.
**Method.** Implement it well enough to run over the whole `src/` tree with `Onyx.get` calls seeded by the pilot conversions. Report: total flags, true positives, false positives, and the specific syntactic shapes it cannot classify. Remember the classifier's own lesson: IIFEs and synchronous array callbacks (`map`, `filter`, `reduce`) run during render even though they are function boundaries.
**Exit criteria.** Rule runs, false-positive list is enumerated and each case has a decision.

**Split, 2026-08-12.** B1a is the rule plus its `RuleTester` cases, which is ordinary unit-testable work: fixtures for each position the rule must flag (component body, JSX, `useMemo` callback, IIFE, synchronous array callback) and each it must allow (event handler, `useCallback`, `useEffect`, module function). B1b is reading the rule's output over `src/` and deciding which flags are false positives, which is judgement, not a test. B1a is what gates B3 and the pilot; B1b can follow.
**Where it lives.** `eslint-plugin-local-rules/` at the repo root, already on `rulesdir.RULES_DIR` (`config/eslint/eslint.config.mjs:45`) with five local rules to copy from, so the rule id will be `rulesdir/no-onyx-get-in-render`.

**Result B1a, 2026-08-13: pass. Scoped** `M`**, took** `S`**.** `eslint-plugin-local-rules/no-onyx-get-in-render.js`, wired at `config/eslint/eslint.config.mjs` as `warn`, with 36 `RuleTester` cases in `tests/unit/NoOnyxGetInRenderRuleTest.ts`. Run them with `npx jest tests/unit/NoOnyxGetInRenderRuleTest.ts`.

**Superseded 2026-08-19: this rule is now one of the three `messageId`s of `no-unsafe-onyx-read`.** See the merge entry near the top of this file. The paragraph above records what shipped at the time and is kept as the record.


**The rule does not classify by syntactic position, which is what the plan assumed.** Position alone cannot separate `<View onPress={() => Onyx.get(k)} />` from `<View style={Onyx.get(k)} />`: both sit inside a JSX expression container, and only the second runs during render. So the rule walks outwards from the read and stops at the first boundary that decides the timing:


| Boundary between the read and module scope                                         | Verdict      | Why                                                                |
| ---------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| Component body, hook body, or a function that returns JSX                          | flag         | React runs it while rendering                                      |
| JSX expression, reached without crossing a function                                | flag         | Evaluated to produce the output                                    |
| `useMemo` callback                                                                 | flag         | Runs during render, unlike `useCallback`                           |
| IIFE, or a `map`/`filter`/`reduce`/`sort`/`forEach` callback                       | keep walking | Defers nothing, so the read belongs to the unit around it          |
| `memo(...)` or `forwardRef(...)` argument                                          | flag         | It is the component body                                           |
| Anything else: event handler, `useCallback`, `useEffect`, a nested helper, `.then` | allow        | Does not run during render                                         |
| Module scope                                                                       | allow        | Runs at import time, which is A7a's hazard rather than this rule's |


The object also has to resolve to an import from `react-native-onyx` through ESLint's scope analysis, so a local `const store = {get}` is left alone and `import OnyxUtils from 'react-native-onyx/dist/OnyxUtils'` is covered. All four synchronous reads are flagged (`get`, `multiGet`, `tupleGet`, `getAllKeys`), through member access, bracket access, or a destructured alias.

**One known hole, deliberate.** A helper defined inside a component and called during render is allowed by the rule, because the rule sees a function boundary and stops. That is exactly what B2a's caller graph is for, and the graph does catch it: a called local helper is a unit with an edge from the component body.

**Green-red-green.** Two mutations: making the walk never report turned 20 of 36 red, and making it ignore deferring boundaries turned 11 red. Both restored.

**Result B1b, 2026-08-13: pass, with a caveat that matters more than the result.** The rule reports **nothing** across `src/`, 6,805 files. That is the expected answer rather than a reassuring one: the only synchronous reads in the app today are the five `OnyxUtils.get` sites, and all five sit in handlers or effects (`GPSTripStateChecker`, `useUpdateGpsTripOnReconnect`, `OnyxDerived/index.ts`, and two in `backgroundLocationTrackingTask`). So this run proves the rule is silent on current code, not that its false-positive rate on converted code is low. It has to be re-run after C1 seeds real `Onyx.get` calls, and that re-run is the one that answers the original question. Cross-checked against the B2a analyser, which independently attributes all five reads to non-render units.

**The enumerated false-positive list is therefore empty,** and the substitute evidence is the 36 `RuleTester` cases, which pin the behaviour on every shape the codebase actually contains.

**Re-verified after all four conversions, 2026-08-13.** Still **0 findings**, checked over the 60 files in `src/` that both import `react-native-onyx` and contain a call to `get`, `multiGet`, `tupleGet` or `getAllKeys`, which is a superset of what the rule can flag: a file without such a call cannot produce one. That set includes `PayActionCell.tsx`, where a read now lives in a component file and the rule correctly stays quiet because the read sits inside a press handler. Two notes for whoever repeats it. Linting 60 type-aware files needs the heap the repo's own `scripts/lint.sh` sets (`NODE_OPTIONS=--max_old_space_size=8192`), or ESLint dies with an out-of-memory abort. And `npx eslint -f json` piped or redirected in this environment loses the JSON, so use the ESLint Node API and print the counts, per the note in the memory file about output filtering.

**Whole repo, 2026-08-13.** Re-run over everything ESLint lints rather than `src/` alone: **8,335 files, 0 findings, 0 parse errors, 18 seconds** (the repo's own global ignores, so without `Mobile-Expensify`, generated parsers and vendored assets). A positive control keeps that zero honest: a file with two reads in one component, one in the body and one in a handler, flags the body read and leaves the handler alone. So the rule was live for the run, and the zero is the absence of violations rather than the absence of a rule.

### B2. Transitive render-reachability checker

**Why.** Lint sees syntactic position only. The proposal's gate, "no conversion lands without confirming the function has no render-reachable callers", needs a tool or it is manual review with nothing behind it.
**Method.** Extend `analyzeOnyxSubscriptions.ts` with a caller walk over the import graph: for a given exported function, list every path from a component render body to it. Validate the output by hand against `navigateToConciergeChat` (should be render-reachable somewhere, given 25 call sites) and against the pilot targets.
**Exit criteria.** Checker runs in CI time, hand-validated on at least five known functions, and produces a yes or no per conversion candidate.

**Split, 2026-08-12.** B2a is the checker plus fixture tests: small synthetic module graphs where the expected answer is known, including the cases the classifier got wrong once already (a read inside an IIFE or a synchronous `map`/`filter`/`reduce` callback runs during render). B2b is running it over the real graph and checking five known functions by hand. B2a is unit-testable and is the half the pilot depends on.

**Result B2a, 2026-08-13: pass, and it is not an extension of** `analyzeOnyxSubscriptions.ts`**,** because that script is still missing (B4). Written from scratch as four modules, split so each half is testable on inputs whose answer is known by construction:


| File                                 | Does                                                     | Tests                                        |
| ------------------------------------ | -------------------------------------------------------- | -------------------------------------------- |
| `scripts/callGraphFromSource.ts`     | One file to units, calls, reads, re-exports              | `tests/unit/CallGraphFromSourceTest.ts`, 23  |
| `scripts/buildCallGraph.ts`          | Import specifiers to files, `{module, name}` to unit ids | `tests/unit/BuildCallGraphTest.ts`, 13       |
| `scripts/renderReachability.ts`      | The search itself, over a graph handed to it             | `tests/unit/RenderReachabilityTest.ts`, 11   |
| `scripts/checkRenderReachability.ts` | CLI: enumerate `src/`, assemble, print verdicts          | B2b, which is what a CLI can be checked with |


**The model.** A **unit** is a function boundary that defers execution. Transparent boundaries (an IIFE, a synchronous array callback, a `useMemo` callback) are not units, so the code inside them belongs to the unit around them, which is the case the old classifier got wrong. An **edge** `A -> B` means A calls B at a position that runs whenever A runs, so a call written inside a handler is an edge out of the handler rather than out of the component that defines it. A unit is a **render entry** when React runs it while rendering. Reachability is a backwards breadth-first search from the target that stops at the first render entry it reaches, so it reports the render code closest to the target rather than everything above it.

Scope resolution comes from ESLint's own analysis rather than from matching text, which is why `import {x as y}` resolves correctly (see B2b). Cross-file resolution handles tsconfig aliases, extensionless imports, index files, platform variants (every variant gets an edge, since any of them can ship) and re-export chains up to four hops.

**What it cannot do, printed on every run rather than buried here.** Over `src/` it resolves 45,835 edges and fails to resolve 51,213 calls: 29,615 member calls on instances, 19,920 through a binding, 1,474 globals, 204 other. Of 12,693 unresolved import targets, 10,990 point outside `src/` and 1,703 name something the resolved file does not export. Dynamic `import()` is not followed. Each of those can only make a function look safer than it is, never the reverse, so a clean verdict on a function whose callers are dynamic is unproven rather than proven.

**Runtime** 13 seconds over 6,805 files, 39,142 units, no parse failures, which answers "runs in CI time".

**Broken by a main merge, found 2026-08-17 while looking for something else, fixed the same day in** `b1db15583e0`**.** `npx bun scripts/checkRenderReachability.ts` exited 1 before starting work: `SyntaxError: JSON Parse error: Unrecognized token '/'` at `readPathAliases`, which read `tsconfig.json` with a bare `JSON.parse`. `tsconfig.json` acquired `//` comments in main's `272827d2315`, so it is JSONC now and the naive parse died on it. Nothing to do with the Onyx pin, and the 47 unit tests stayed green because they are handed graphs rather than reading the repo, which is exactly the split B2a was written for and also the reason the tests could not catch it.

**The fix reads the config through TypeScript**, `ts.readConfigFile` plus `ts.parseJsonConfigFileContent`, rather than stripping comments. Three reasons, in order of how much they matter:

- It also resolves `extends`, and `tsconfig.json` extends `expo/tsconfig.base`, so a `paths` entry inherited from the base was invisible to the old code and would have failed silently. Demonstrated: parsing `scripts/tsconfig.json`, which owns no `paths` at all, returns all 14 through inheritance.
- It **throws** now instead of falling back to `{}`. That fallback was the real hazard: with no aliases, nearly every cross-file import in `src/` goes unresolved, the graph loses its edges, and every unit then looks safe. A checker that answers "nothing is render-reachable" because it parsed nothing is worse than one that crashes.
- JSONC is handled by the compiler rather than by a regex.

`readDirectory` is stubbed to `() => []` in the parse host, because only `compilerOptions` is wanted and letting TypeScript glob the include patterns would walk the repo. TS18003, "no inputs were found", is that stub's own artifact and is filtered.

**Verified.** Runs again at 14 seconds over 6,845 files, 39,495 units, 46,253 edges, 0 parse failures, which is the same shape as the 13 seconds and 45,835 edges recorded above, so the aliases resolve as they did. `--callers` works too. Green-red-green on the guard rather than only on the happy path: pointed at a JSONC config with no `paths`, it throws `No compilerOptions.paths found`, and the same run proves the comment handling; restored, exit 0. Lint clean and typecheck clean, which took arrow-wrapping the three `ts.sys` methods (`@typescript-eslint/unbound-method`) and taking `configFile.config` as `unknown` rather than destructuring `any`.

**First real run of the CI gate, and it is worth recording as evidence rather than as housekeeping.** On the foundation branch it finds **11 units that read Onyx synchronously and 0 render-reachable**. Eight of the eleven are new: the twelve `Onyx.get` reads that `a3d854063d6` put in `src/setup/addUtilsToWindow.ts`, which resolve to five named helpers plus the lazy getters. So the gate has now been exercised against real call sites in `src/` rather than only against fixtures and the pilot's seeded ones.

**Verdict on the four conversions, 2026-08-17, after merging the fix forward in** `6947ff2cc81`**: 19 units, 0 render-reachable.** All four are covered, and this is the evidence the proposal's step 2 promises:


| Conversion | Units the checker reports                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1         | `useSwitchToDelegator.switchToDelegator`                                                                                                               |
| C2         | `Duplicate.ts#bulkDuplicateReports` and `useBulkDuplicateReportAction.handleDuplicateReports`, the second one added by this session's merge resolution |
| C3         | `PayActionCell.confirmPayment`                                                                                                                         |
| C4         | `replaceOptimisticReportWithActualReport` plus its three nested callbacks                                                                              |


**Quote the caveat with the verdict, because one of these four is clean for the wrong reason.** `--callers` on `PayActionCell.confirmPayment` still answers `0 direct caller(s)`: it is passed as a prop, so the graph cannot see who invokes it and reports no callers rather than reporting the component. Unreachable-because-invisible and unreachable-because-safe print identically. What actually clears that shape is the lint rule's position analysis, which sees the read sitting inside a handler. B2a's own "what it cannot do" paragraph covers this, and a reviewer who asks the obvious question about a component-file conversion should get this answer rather than the verdict on its own.

**Green-red-green.** Three mutations: making every boundary a unit turned 4 of 23 red in the analyser, dropping re-export following turned 2 of 13 red in the assembly, and letting the search walk past render entries turned 1 of 11 red.

**Result B2b, 2026-08-13: pass, and one plan assumption is wrong.** Five functions, checked with `npx bun scripts/checkRenderReachability.ts --callers '<file>#<name>'` against `git grep` by hand:


| Function                                  | Verdict                  | Cross-check                                                                                                              |
| ----------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `navigateToConciergeChat`                 | **not render-reachable** | 28 direct callers, every one a handler or an effect callback                                                             |
| `bulkDuplicateReports`                    | not render-reachable     | 1 caller, `useBulkDuplicateReportAction.handleDuplicateReports`, matches grep exactly                                    |
| `replaceOptimisticReportWithActualReport` | not render-reachable     | 1 caller, the module's own `connectWithoutView` callback; the only outside reference is a dynamic `import()`, not a call |
| `useSwitchToDelegator`                    | render-reachable         | trivially: it is a hook body, so it is its own render entry                                                              |
| `PayActionCell`                           | render-reachable         | trivially: it is a component body                                                                                        |


**This plan guessed that** `navigateToConciergeChat` **"should be render-reachable somewhere, given 25 call sites". It is not.** All 28 call sites sit in handlers: `handleNavigateToConciergeChat`, `paymentMethodPressed`, `onConfirm`, `requestLimitIncrease`, and anonymous callbacks inside effects. That is worth more to the proposal than the guess was: the exhibit it leads with is a function whose Onyx parameters exist only to be forwarded, and which no render path touches, so converting it is exactly the case the conditions allow.

**The recall check, which is the part that makes the verdict evidence.** For `navigateToConciergeChat`, grep finds calls in 23 files and the graph finds callers in 24. Nothing grep found was missing from the graph. The extra file is `src/components/HTMLEngineProvider/HTMLRenderers/ConciergeLinkRenderer.tsx`, which imports it as `navigateToConciergeChat as navigateToConciergeChatAction`: the graph resolved the alias, and the grep pattern missed it. A caller list that beats grep on aliases is the point of resolving through scope analysis rather than text.

### B3. Extend `checkOnyxConnectBypass.ts`

**Why.** Inline `eslint-disable` already has to be defeated for the `Onyx.connect` ban, and the same bypass would apply to the new rule.
**Method.** Extend `scripts/checkOnyxConnectBypass.ts` to read suppressed-message data for `no-onyx-get-in-render` too. Add a test that a file with an inline disable still fails CI.
**Exit criteria.** Test proving the bypass fails.

**Result, 2026-08-12: blocked on B1, and this plan was wrong to list it as independent.** The check cannot be written before the rule exists, because the script loads the rule module itself. Read of `scripts/checkOnyxConnectBypass.ts` and `scripts/onyxConnectBypass.ts` gives the exact extension points, so B1 and B3 can be done back to back by one agent:

1. `BANNED_RULE_ID` (`onyxConnectBypass.ts:15`) is a single constant, and `collectSuppressedBans` filters on it with `message.ruleId !== BANNED_RULE_ID`. Both need to take a set of rule ids.
2. `GRANDFATHERED_BYPASSES` (`onyxConnectBypass.ts:22`) is a flat `Map<file, count>`. It needs to be keyed per rule, or a second map added. The new rule starts with an empty allowance, which is the whole point.
3. `loadNoOnyxConnectRule` (`checkOnyxConnectBypass.ts:38`) resolves the rule out of `eslint-config-expensify/eslint-plugin-expensify/`. The new rule will live in the repo's own `eslint-plugin-local-rules/` instead (that directory is already on `rulesdir.RULES_DIR`, see `config/eslint/eslint.config.mjs:45`), so a second loader path is needed.
4. `findCandidateFiles` (`checkOnyxConnectBypass.ts:54`) narrows targets with `git grep --all-match -e Onyx.connect -e eslint-disable`. A second rule needs its own pair of grep terms, since a file can bypass one rule without containing the other's text.
5. `tests/unit/OnyxConnectBypassTest.ts` is the existing fixture pattern to copy for the new rule's bypass test.

**Effort revision.** Still `S` once B1 exists, but it is `S` on top of B1's `M`, not standalone.

**Result, 2026-08-13: pass.** Both scripts now police a set of rules rather than one. `onyxConnectBypass.ts` carries `POLICED_RULE_IDS` and a per-rule grandfathered map, where `no-onyx-get-in-render` starts with no allowance anywhere, which is the point of landing it before any read is converted. `checkOnyxConnectBypass.ts` carries one `POLICED_RULES` entry per rule, each with its own loader (the shipped rule out of `eslint-config-expensify`, the new one out of `eslint-plugin-local-rules/`), its own git-grep terms, and its own advice line. The new rule's grep pair is `react-native-onyx` plus `eslint-disable`, which stays a superset of the rule because every read it can flag goes through that import.

**The bypass test the exit criteria asked for.** A probe file in `src/` with a read in a component body and an `// eslint-disable-next-line rulesdir/no-onyx-get-in-render` above it (the id is now `rulesdir/no-unsafe-onyx-read`, re-probed 2026-08-19): ESLint reports nothing, and the checker exits 1 with `src/BypassProbeTmp.tsx:5` and the render-read advice. Probe deleted afterwards. `tests/unit/OnyxConnectBypassTest.ts` covers the logic with 12 tests.

**One mutation survived the first pass, and that is the interesting part.** Re-keying the allowance by file instead of by rule and file left all 10 tests green: the mutated code reads the rule id off the first ban in each group, and the fixtures happened to be ordered so that it read the right one. Two cases were added to discriminate, one in each direction (a render-read disable in a file that has a connect allowance, and a connect disable in a file where the render-read rule has none), and the mutation now turns both red. A suite that cannot fail is worth what it costs to run.

### B4. Recover or rewrite the classifier tooling, then wire it into CI

**Why.** The proposal's numbers drifted measurably in 16 days: `useOnyx` bindings 4,642 to 4,707, files 1,394 to 1,422, `Onyx.connect` 51 to 49, `connectWithoutView` 196 to 198, `navigateToConciergeChat` call sites 24 to 25. One claim is now wrong: `bulkDuplicateReports` is a single 25-field options object, not 23 positional parameters.
**Method.** Re-run `analyzeOnyxSubscriptions.ts` on `main` on the day the proposal is posted. Add a CI job that publishes the non-render share so the trend is a fact rather than a claim.
**Exit criteria.** Fresh numbers in the proposal with a date and a reproduction command, and a CI job reporting the share.

**Result, 2026-08-12: blocked. Deliberately parked at the bottom of the priority list.** `analyzeOnyxSubscriptions.ts`, `instrumentOnyxCounters.mjs` and `renderCensus.mjs` are not in this checkout, either sibling worktree, the local Onyx checkouts, or anywhere else searched under the home directory. We are missing the scripts that produced the original analysis. Consequence: the classifier-derived numbers cannot currently be re-run, namely the 28.4% non-render share, the 129 Tier A files, the 310 subscriptions, the 15 subscriber components, the provenance table and the render census.

**Why this is parked rather than urgent.** It blocks refreshing statistics, not the correctness work, and every conclusion the proposal rests on is either already published in the issue thread or reproducible with grep. The correctness half of the plan (the conditions, the lint rule, the caller graph, the pilot conversions) does not depend on it at all, and that is the half the review asked for.

**Mitigation until the tools come back.** Quote the grep-reproducible counts with their command, as `ONYX-GET-INVESTIGATION.md` section 3 does, and attribute the classifier figures to the dated analysis in the issue thread rather than presenting them as re-runnable. Note the known drift: `useOnyx` bindings moved 4,642 to 4,707 in 16 days, so any classifier figure quoted from July is a lower bound on the trend rather than a current measurement.

**Two ways to unblock, when it is worth doing.** Recover the original scripts from whoever still has that working folder, or rewrite `analyzeOnyxSubscriptions.ts` from its documented behaviour. The rewrite is roughly a day and carries a real risk: different numbers from the ones already published, which is worse than having none unless the difference can be explained. Prefer recovery, and if rewriting, reproduce one published figure first as a calibration check before trusting anything new.

**Also affected.** The derived-key finding in A4a widened what wave 1 can include, so the Tier A and Tier B counts understate the reachable surface. Re-deriving them needs this step.

**Closed 2026-08-18: recovered, not rewritten, and it calibrates.** All three scripts arrived on the branch in `eea544287e4` from Fábio: `analyzeOnyxSubscriptions.ts`, `instrumentOnyxCounters.mjs`, `renderCensus.mjs`, plus `scripts/README-onyx-analysis.md`. The recovery path B4 preferred, so none of the rewrite risk applies. B4's own calibration rule was applied first and passed: run against `main`, the classifier reports **104 module-level caches behind** `connectWithoutView`, which is the published figure exactly.

Fresh numbers, `main` at `f5c38af1807`, 2026-08-18, alongside what the proposal currently quotes:


| Figure                     | Published | `main` today                                          |
| -------------------------- | --------- | ------------------------------------------------------- |
| `useOnyx` bindings         | 4,707     | 4,725                                                   |
| Non-render share           | 28.4%     | 27.5%, 1,301 bindings                                   |
| Tier A files               | 129       | 120                                                     |
| Tier B / Tier C            | –         | 72 / 4                                                  |
| Whole-collection bridge    | –         | 273, of which 27 subscribe a collection to index one member |
| `Onyx.connect` sites       | 49        | 48, 22 caches in 7 files                                |
| `connectWithoutView` sites | 198       | 192, **104 caches** in 50 files                         |


Reproduction, and it needs no install because the analyzer is purely syntactic:

```bash
git archive main src | tar -x -C /tmp/mainsrc          # or any checkout of main
npx bun scripts/analyzeOnyxSubscriptions.ts --src /tmp/mainsrc/src
npx bun scripts/analyzeOnyxSubscriptions.ts --connect --src /tmp/mainsrc/src
```

**The pilot shows up in the same instrument**, which is worth quoting: 4,699 bindings against main's 4,725, `connectWithoutView` 188 against 192, caches 101 against 104. The four conversions are visible in the classifier rather than only in the diff.

**The CI job is descoped, owner's call 2026-08-18.** B4's exit criteria asked for fresh numbers plus a CI job publishing the non-render share. The numbers are re-runnable on demand now, which was the point, and a job to watch a percentage drift is not worth a pipeline slot. So B4 passes on the local run, and the mitigation clause below is retired: classifier figures can be presented as re-runnable rather than attributed to a dated analysis.

**One limit to keep with any claim built on this.** Matching 104 proves the tool reproduces itself, not that the classification is correct. The README says the same from the other side: references resolve by name rather than through the symbol table, which biases a binding toward render, so the non-render set is a lower bound.

**Update, 2026-08-13: cheaper than it was, because B2a rebuilt most of the machinery.** `scripts/callGraphFromSource.ts` already classifies a file into function units, decides which units React runs while rendering, attributes reads to units, and resolves imports across files with tsconfig aliases and re-exports. What a classifier rewrite still needs on top of that is a `useOnyx` visitor and the per-key tallies. That moves this from "roughly a day, with a real risk of numbers that disagree with the published ones" to a smaller job on tested foundations, and the calibration rule stands: reproduce one published figure first.

### B5. Enforce the conditions lint does not cover yet

**Why.** The proposal's step 2 lists five conditions and says "and enforce it". Two of them are enforced. The finding, from reviewing what B1a and B2a actually cover:


| Condition from the proposal's step 2                                        | Enforced by                       | Gap                                                                                         |
| --------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------- |
| 1a. The read is not written in a render position                            | `no-onyx-get-in-render`, B1a      | none, for syntax it can see                                                                 |
| 1b. No caller reaches it during render                                      | `checkRenderReachability.ts`, B2a | calls through a binding, dynamic `import()`                                                 |
| 2. The value does not flow back into rendered output                        | nothing                           | a handler can read and push the value into state, and it silently stops being reactive      |
| 3. Reads happen before the first write, or await it                         | `no-onyx-read-after-write`, B5a   | writes reached through a call, so the read and the write are in different bodies             |
| 4. Never a source key and a key derived from it in a tick that wrote either | `no-onyx-read-after-write`, B5a   | same gap: the write is what B5a needs to see, and a call hides it. See the B5c decision      |
| 5. Event-time freshness is the intended behaviour                           | nothing, and unenforceable        | judgement per conversion, which is why D1 keeps a manual spot check                         |
| Extra: no read before `Onyx.init` resolves                                  | `no-onyx-read-at-module-scope`, B5b | a read inside a function that startup calls, which is A7d's site and needs the graph        |


Conditions 3 and 4 are the ones that ship silent bugs rather than a stale render, so "checked per conversion" was the weakest link in the plan once position was mechanised. Two of the gaps were the same shape as B1a and cost about the same, and both are closed below. The table's Enforced-by column is as of 2026-08-17, after B5a and B5b shipped; the remaining gaps are all one gap, which is that a write or a startup call reached through a function is invisible to a single-file rule.

**B5a,** `no-onyx-read-after-write`**.** Inside one function body, flag a synchronous read that appears after an `Onyx.merge`, `Onyx.update`, `Onyx.set` or `Onyx.mergeCollection` on any key, unless that write is awaited first. Purely syntactic, and it encodes the authoring rule A1 produced verbatim. Same `RuleTester` treatment as B1a.

**Done 2026-08-17: B5a ships, and unlike B5b it found something on the first real run.** `eslint-plugin-local-rules/no-onyx-read-after-write.js`, registered as a warning in `config/eslint/eslint.config.mjs` next to its two position siblings, policed in `scripts/onyxConnectBypass.ts` under `READ_AFTER_WRITE_RULE_ID` with an empty grandfathered map, and guarded by `tests/unit/NoOnyxReadAfterWriteRuleTest.ts`, 49 cases green.

**Superseded 2026-08-19: this rule is now one of the three `messageId`s of `no-unsafe-onyx-read`.** See the merge entry near the top of this file. The paragraph above records what shipped at the time and is kept as the record.


**What it flags.** A synchronous read whose text starts after an un-awaited write's call ends, in the same body, where a body is the innermost enclosing function with an IIFE and a synchronous array callback seen through, the same transparency model B5b uses. Writes are `merge`, `update`, `set`, `multiSet`, `mergeCollection`, `setCollection` and `clear`: A1 measured that only the first two are actually deferred, and the rule flags all seven precisely because relying on which is which is what breaks when the call later moves inside `update()`, where even a SET is deferred. `await` on the write clears it, reached through `Promise.all([...])`.

**Four exemptions, each one a shape that is not a hazard.** The read is an argument of the write, so it evaluates first. The two calls are in mutually exclusive branches: `if`/`else`, the two arms of a ternary, or separate `switch` cases. The write is in a block that ends by leaving the function, which is the guard-clause shape `if (special) { Onyx.merge(...); return; }`. And the keys are provably different, which is A1's own rule that reads of keys the tick did not write are always current: both keys have to be static paths differing only in their last segment, with a collection member reading as its collection prefix, so `` `${ONYXKEYS.COLLECTION.REPORT}${a}` `` and `` `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${b}` `` are exempt while two members of one collection are not. Paths from *different* objects are deliberately not exempt: `ONYXKEYS` aliases three key strings across branches, each an `ONYXKEYS.X` also reachable as `ONYXKEYS.FORMS.X_FORM`, verified against `src/ONYXKEYS.ts`, so same-root is not enough to prove two paths are two keys.

**Green-red-green, three mutations.** Ignoring `await` reds 3 valid cases and no invalid ones. Ignoring source order reds 3, the two reads-before-writes and the read-as-an-argument. Never reporting reds all 24 invalid cases and no valid ones. Sensitive in both directions.

**Run over** `src/`**: 904 Onyx-importing files, 2 flagged, both false positives, both now exempt.** Both were in `src/libs/actions/replaceOptimisticReportWithActualReport.ts`, which is C4, our own pilot conversion, so this is the rule meeting the exact code it was written for. `:66` is a read after a write in an earlier `if` block that ends in `return`, so reaching the write means never reaching the read. `:107` is a `REPORT_ACTIONS` read after `REPORT` and `REPORT_DRAFT_COMMENT` writes, three different collections. Neither is the hazard, and each was attributed by disabling one exemption at a time and watching that exact line come back. Then 0 over the same 904 files.

**Not added: a bypass-police test for the new rule id.** `findNewBypasses` is rule-id agnostic and `tests/unit/OnyxConnectBypassTest.ts` already exercises a zero-allowance rule through `RENDER_READ_RULE_ID`, so a copy for the new id would assert the same code path twice. What is worth checking is end-to-end, and it was: a probe file with a read after a merge and an `eslint-disable-next-line` for the new rule made `checkOnyxConnectBypass.ts` print its advice and exit 1, and `src/` exits 0.

**B5b,** `no-onyx-read-at-module-scope`**.** Flag a synchronous read with no enclosing function. Module scope runs at import time, which is the window A7a proved returns `undefined`. Small, and it closes a hazard the current rule deliberately allows.

**Done 2026-08-17: B5b ships, and it finds nothing, which is the useful part.** `eslint-plugin-local-rules/no-onyx-read-at-module-scope.js`, registered as a warning in `config/eslint/eslint.config.mjs` alongside its render-position sibling, policed in `scripts/onyxConnectBypass.ts` under `MODULE_SCOPE_READ_RULE_ID` with an empty grandfathered map, and guarded by `tests/unit/NoOnyxReadAtModuleScopeRuleTest.ts`, 31 cases green.

**Superseded 2026-08-19: this rule is now one of the three `messageId`s of `no-unsafe-onyx-read`.** See the merge entry near the top of this file. The paragraph above records what shipped at the time and is kept as the record.


It shares B1a's import and alias tracking, so `Onyx.get`, `OnyxUtils.get`, `Onyx['get']`, `multiGet`, `tupleGet`, `getAllKeys`, `const {get} = OnyxUtils` and `const readOnyx = OnyxUtils.get` are all covered, and a local object that merely exposes a `get` is not. Where it differs is the walk: `runsAtModuleScope` treats only an IIFE and a synchronous array callback as transparent, so a read inside either still counts as import time, while any other function boundary means something has to call it and the read leaves this rule's brief. It deliberately says nothing about render positions, which stay B1a's, and nothing about a `setTimeout` or `.then` callback written at module scope, which do defer.

**Green-red-green.** Two mutations, both meaningful. Treating every function boundary as transparent reds 11 of the 15 valid cases, the four survivors being the two not-the-library cases and the two write cases that never report either way. Making the walk never report reds all 16 invalid cases. So the suite is sensitive in both directions rather than only to the presence of the report.

**Run over** `src/`**: 904 Onyx-importing files, 0 flagged, 0 parse failures.** Which is the right state for a rule added before the conversions rather than after them: nothing to grandfather, so every future violation is new. It also settles the widening question below, because it proves the hazard A7d found is not the hazard this rule catches.

**Correction, 2026-08-17: that zero was originally vacuous, and B5a is what found it.** The first sweep runner configured ESLint with `files: ['**/*']`, which matches nothing in flat config, so every one of the 904 files came back with a single `No matching configuration found` message and a null rule id. The runner counted a null rule id as neither a finding nor a failure, so a run in which no file was linted at all printed the same "0 flagged, 0 parse failures" as a clean run. Caught by giving B5a's sweep a positive control: a probe file with an obvious violation also came back clean, which cannot happen if the rule is running. Two guards now, both in the shared runner: the pattern is `**/*.{js,jsx,ts,tsx,mjs,cjs}`, and the runner lints a known-violating probe first and exits if the rule does not fire on it, printing the line it fired on. **Both rules were re-run under the fixed runner and the numbers above are from that run**, so B5b's conclusion is unchanged, but it was unsupported for the several hours between the two runs. Generalisation worth keeping: a whole-repo sweep that reports zero needs a positive control in the same invocation, or the zero is a claim about the runner rather than about the repo.

**Final decision, 2026-08-18: build neither guard.** The 2026-08-17 reasoning below is kept because it is still correct about *what* each tool can see. What changed is the evidence about what there is to catch, and it removes the case for both.

- **The graph verdict would not have caught A7b**, which is the case that motivated it. `renderReachability.ts` models an edge as "`from` calls `to` at a position that runs whenever `from` runs", and a call inside a nested handler is an edge out of the handler. The GPS read sat in a callback handed to `defineTask` and invoked later by the OS, so it is a unit with no callers at all, the same blind spot already recorded for `PayActionCell.confirmPayment` and visible in today's run as `replaceOptimisticReportWithActualReport.ts#callback`. A startup entry set catches the A7d shape, not the A7b one.
- **The rule widening would guard a class with no observed members.** The obvious extension is to treat a handler registered at module scope with an external invoker as module scope. But every read measured *inside* the task returned its value: repeatedly in the foreground, and again after a process kill plus relaunch. The only observed miss in the whole session was the module-scope probe, at 6,016 ms, and that shape is already covered by B5b, which finds 0 sites because nobody writes it.
- **What is left is unobservable rather than unguarded.** A true headless wake with no UI could not be forced on a dev build, so the residual risk is a case we cannot reproduce, cannot test, and cannot lint. It is carried as an authoring condition in the proposal's step 2 instead, which is where a judgment call belongs.

The GPS site was still worth restoring, for a different reason than the hazard: the branch had silently reverted an upstream fix and parity with `main` is free.

**Decision on widening B5b, 2026-08-17: do not widen the rule, widen the graph instead.** Next-step 1 asked whether B5b should cover startup-time reads and not just module scope. The zero-finding run answers it: neither pre-hydration site was ever at module scope. `OnyxDerived/index.ts` read inside `init()`, and `backgroundLocationTrackingTask` reads inside its task callback. Both are inside functions, so no syntactic rule can see the hazard, because the hazard is *who calls the function*, which is reachability. The machinery for that already exists and is already in CI: `scripts/checkRenderReachability.ts` builds a 39495-unit, 46256-edge graph and asks whether anything that renders can reach a read. A startup-reachable verdict is the same search with a different entry set, module scope plus whatever `src/setup/index.ts` calls synchronously before hydration resolves, and it would have flagged the `OnyxDerived` site. That is the shape of the work, not done yet, and it is a better use of the effort than making the lint rule guess.

**B5c, source and derived in one tick.** Harder, but not speculative: the derived keys and their sources are declared in `ONYXKEYS.DERIVED` and the `OnyxDerived` config, so a rule can read that map and flag a source read next to a derived read in a function that also writes. Scope it after B5a and B5b.

**Decision, 2026-08-17: do not build it. B5a already covers the shape it was scoped for, and what is left is not syntax.** Three findings, in order.

**One: B5c's hazard cannot happen without a write, and B5a flags the reads after that write.** Condition 4 is not "a source read near a derived read", it is A4a result 3: `Onyx.set` writes the source into the cache synchronously, while the derivation's own write is queued as a merge, so a handler that sets a source and then reads both sees the source current and the derived value one revision behind. The precondition is a write earlier in the same tick, which is exactly B5a's trigger. Verified with a probe: a function that does `Onyx.set` on `` `${ONYXKEYS.COLLECTION.TRANSACTION}${id}` `` and then reads that key and `ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS` gets both reads flagged by B5a, and the same function with the reads moved above the write is not flagged, which is the correct answer for both. A dedicated rule would report the same two lines with a longer message.

**Two: the residue is cross-function, which makes it B2a's shape and not a lint rule's.** What B5a cannot see is a handler that calls something else which writes, then reads the derived key itself: `Report.doThing()` writes, the caller reads. That needs the call graph, and `scripts/checkRenderReachability.ts` already builds one over 39495 units. It is the same conclusion the B5b widening question reached: when the hazard is "who ran before this", widen the graph, not the syntax.

**Three: the premise that derived computes read Onyx is not true here, which removes the other half of the worry.** A compute receives its dependency values as parameters; the `OnyxDerived` configs contain no `Onyx.get`, no `OnyxUtils.get` and no `Onyx.connect` at all, verified by grep over `src/libs/actions/OnyxDerived`. The single synchronous read in the whole tree is A7d's restore at `index.ts:56`, which is one-shot per key and deliberately deferred to the first compute. So "do not read Onyx inside a derived value" is already how the code is written, and it is worth keeping that way: a compute that read the cache itself would take an undeclared dependency, would not re-run when that key changed, and would be reading mid-write for exactly the keys its own dependencies are being written from.

**What replaces the rule.** The authoring rule stays in the proposal's condition list, since it is a real hazard that is simply not statically detectable in the general case. B5a enforces the detectable part today, and a startup-and-write reachability verdict would be where the rest goes if it is ever worth the effort. Nothing here blocks wave 1.

**Not attempted: condition 2.** Whether a value flows back into rendered output is dataflow, not position, and a lint rule that guesses at it would produce exactly the false positives B1b is meant to keep at zero. The pilot's characterization tests are the realistic guard.

**Exit criteria.** B5a and B5b shipped as warnings with `RuleTester` cases and their bypass entries in `checkOnyxConnectBypass.ts`, and a written decision on B5c. **Met 2026-08-17 for the two rules**, both shipped, both policed, 80 `RuleTester` cases between them. The B5c decision is below.

## C. Pilot conversions

Four conversions, one per risk class, on a single branch on top of the current patch. The point is not the diff, it is the written record of which conditions each one hit.

### C1. `useSwitchToDelegator`, baseline case

**Target.** `src/hooks/useSwitchToDelegator.ts`, 8 subscriptions, 0 hot keys, all non-render.
**Why this one.** No hot keys, no derived keys, no whole-collection reads. If the mechanical shape does not work here, it works nowhere.
**Exit criteria.** Subscriptions and parameters removed, unit tests green, condition checklist filled in, diff stats recorded.

**Result, 2026-08-13: pass.** All eight `useOnyx` subscriptions removed, replaced by seven `Onyx.get` reads inside the handler. `src/hooks/useSwitchToDelegator.ts` is 19 insertions and 15 deletions, and the hook body now holds nothing but the five non-Onyx hooks it already had.

Eight became seven because two of the eight subscribed to the same key: `GPS_DRAFT_DETAILS` was read once raw and once through `isTrackingSelector`. The selector is now applied to a single read.

**The characterization test is the artifact, and the order it was written in is the point.** `tests/unit/hooks/useSwitchToDelegator.test.ts`, 8 cases covering every branch and the flow of every value: connect with all four of its Onyx-sourced arguments, the offline block, disconnect back to the original user, the `CONST.EMPTY_OBJECT` fallback when `STASHED_CREDENTIALS` is absent, the chained-delegation refusal, the tracked-trip confirm path asserting `stopGpsTrip(false, points, true)` receives the points that were read, the dismiss path, and the not-tracking path. Written and made green against the **subscription** version, then re-run **unedited** against the converted one. Not one assertion needed changing, which is the claim the proposal wants to be able to make.

One case needed a match rather than an equality: something outside this hook stamps `creationDate` onto `SESSION`, so the session argument is asserted with `objectContaining`. That is a fact about the key, not about the conversion, and it held identically both ways.

**Condition checklist, per the proposal's step 2.**


| Condition                                             | Verdict                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read site not reachable during render, nor any caller | Yes. `no-onyx-get-in-render` reports nothing, and the caller-graph checker now lists `useSwitchToDelegator.switchToDelegator` among the six read units in `src/` with verdict `ok`. Its four callers are `ProfilePage`, `AgentsPage`, `EditAgentPage` and `CopilotPage`, all through press handlers |
| Value does not flow into rendered output              | Yes. Every value went straight into `connect`, `disconnect` or `stopGpsTrip`. Nothing was interpolated into JSX, which is why the hook rendered nothing when these keys changed                                                                                                                     |
| All reads before the first write, or awaited          | Yes, and visibly so: the seven reads sit in one block at the top of the handler, before any branch and before `connect`, which is the first thing that writes                                                                                                                                       |
| No source key read beside a key derived from it       | Not applicable. None of the seven keys is a derived key, which is why C1 was chosen as the baseline                                                                                                                                                                                                 |
| Event time is the intended behaviour                  | Yes, and this is the one that needed a judgment call rather than a check, recorded below                                                                                                                                                                                                            |


**The one real design decision, and the lesson worth carrying into C2.** Converting subscriptions to reads loses something the snapshot gave for free: consistency. Eight subscriptions all came from one render pass, so every branch saw a mutually consistent set of values. Seven reads scattered through the handler, some of them inside closures that only run after the confirmation modal resolves, would not have been. Two specific hazards were closed:

- `isTracking` and the trip's points came from the same key. Read separately, the flag could be true while the points came from a later revision. They are now one read.
- `switchAction` is a closure invoked after an `await` on the modal. Reading inside it would have read post-dialog values. The reads were hoisted so the closure captures values, not reads.

So the shape that works is one read block at the top of the event handler, not a read at each point of use. That also makes the write-ordering condition self-evident to a reviewer instead of something to be traced. C2 through C4 should follow it, and it belongs in the proposal's wording.

**What this does not prove.** Behaviour under a real device, and behaviour when the values genuinely change between render and the tap, which is the case the conversion is supposed to improve rather than preserve. D1 covers the first. The second has no test yet: the suite proves the conversion changes nothing when nothing moves, not that it does the better thing when something does.

### C2. `bulkDuplicateReports`, flagship case

**Target.** `src/hooks/useBulkDuplicateReportAction.ts` and `bulkDuplicateReports` at `src/libs/actions/IOU/Duplicate.ts:1345`, plus `src/components/Search/BulkDuplicateReportHandler.tsx`.
**Why this one.** 11 non-render subscriptions, a 25-field options object, a `return null` host component, and the function already reads the module-level `getAllTransactions()` cache at line 1372. This is the exhibit the proposal leads with, so it must actually convert.
**Expected conditions hit.** A1 (this function writes as well as reads), B2 (the hook is called from a component, so the caller graph matters), and the test-fixture migration.
**Exit criteria.** As C1, plus an explicit note on how read and write ordering was handled inside the function.

**Result, 2026-08-13: pass, and it moved the reads into the function rather than into the hook.** C1 converted a hook; C2 converts the action, which is the harder and more valuable half. All eleven subscriptions are gone from `useBulkDuplicateReportAction`, and the eleven values they fed are now read by `bulkDuplicateReports` itself. Net effect on the exhibit the proposal leads with:


|                                        | Before | After                                  |
| -------------------------------------- | ------ | -------------------------------------- |
| `useOnyx` subscriptions in the hook    | 11     | 0                                      |
| Fields in `BulkDuplicateReportsParams` | 25     | 14                                     |
| Onyx hooks left in the hook body       | 11     | 0, only the five non-Onyx hooks remain |


The eleven that moved: `POLICY`, `POLICY_CATEGORIES`, `POLICY_TAGS` and `TRANSACTION_VIOLATIONS` as whole collections, plus `BETAS`, `PERSONAL_DETAILS_LIST`, `NVP_QUICK_ACTION_GLOBAL_CREATE`, `RECENTLY_USED_CURRENCIES`, `NVP_RECENT_WAYPOINTS`, `NVP_ONBOARDING` through `hasSeenTourSelector` and `NVP_INTRO_SELECTED` through `isTrackIntentUserSelector`. The eleven that stayed as parameters are the ones the caller genuinely owns: the selection, the two locale closures, the current user's identity, `allReports`, `searchData`, and the values that come from other hooks rather than from Onyx.

**Read and write ordering, which the exit criteria asked about specifically.** This function writes: the loop calls `duplicateReport`, which builds optimistic data and calls `API.write`. So the eleven reads sit in one block at the top, above the loop, with a comment saying why. Two properties follow, and both were free under subscriptions:

- Every read happens before the first write, so no read can see a half-applied `Onyx.merge`, which lands on a microtask.
- Every iteration works from the same snapshot. Reading inside the loop would let iteration five see policy data that iteration one's own write had already changed.

This is the C1 pattern applied to a function instead of a handler, and it is the reason to prescribe the pattern rather than describe it.

**The function already read global state**, at `getAllTransactions()`, before any of this. So adding Onyx reads here does not change the function's category from pure to impure; it removes the pretence that eleven of its inputs were caller-supplied when they were always just Onyx.

**Test-fixture migration, the part the plan flagged as a condition.** `tests/actions/IOUTest/DuplicateTest.ts` injected those values through `getDefaultBulkParams`. It now seeds Onyx instead, through one `seedOnyxForBulkParams()` helper in `beforeEach`, and the two cases that overrode categories and tags per test merge them into Onyx before the call. The keys left unseeded are exactly the ones the old fixture passed as empty or undefined anyway.

`tests/unit/hooks/useBulkDuplicateReportActionTest.ts` had one case asserting that the hook forwards `allPolicies`, `allPolicyCategories` and `allPolicyTags`. That case tested the parameter threading this step deletes, so it now asserts the opposite: the payload has none of those three properties. Deleting the assertion outright would have been the wrong move, because the behaviour it stood for still matters; that behaviour is asserted at the function level in `DuplicateTest.ts`, which now drives it through Onyx.

**Evidence.** 117 tests across the three bulk-duplicate suites, green before the conversion and green after, with the same total. `npm run typecheck-tsgo` clean, lint clean, React Compiler compliance clean over 34 changed React files. The caller-graph checker lists `bulkDuplicateReports` among the seven read units in `src/` with verdict `ok`, and its single caller is the hook's `handleDuplicateReports`.

**What the conversion needed that C1 did not, recorded as A12.** Four of the eleven are whole-collection reads, and a collection key cannot be read through `OnyxUtils.get`. See A12: the public `get` delegates to `tryGetCachedValue`, which handles both shapes of key, so no library internals changed.

### C3. `PayActionCell`, per-row and snapshot case

**Target.** `src/components/Search/SearchList/ListItem/ActionCell/PayActionCell.tsx`.
**Why this one.** Raw whole-collection `REPORT` and `REPORT_ACTIONS` subscriptions used only inside a press handler, one instance per Search row, and it is where Łukasz measured the one real win. It also carries the Search snapshot question: some Search data lives under `snapshot_<hash>` rather than the global collection, and this component receives `hash` as a prop. The conversion must read the same source the parameter came from, which here is the global collection, not the snapshot.
**Exit criteria.** As C1, plus a written statement of which source each converted read uses and why, plus a check that `payMoneyRequest` and `payInvoice` still receive equivalent `chatReportActions`.

**Result, 2026-08-13: pass, and it is the first conversion inside a component that renders.** Four of the six `useOnyx` calls are gone, replaced by four reads inside `confirmPayment`:


|                                                 | Before | After |
| ----------------------------------------------- | ------ | ----- |
| `useOnyx` calls in the component                | 6      | 2     |
| Whole-collection subscriptions per rendered row | 3      | 0     |


The four that moved: `REPORT`, `REPORT_ACTIONS` and `REPORT_NAME_VALUE_PAIRS` as whole collections, plus `NVP_INTRO_SELECTED` through `isTrackIntentUserSelector`. The two that stayed are the ones the component actually renders from: `BANK_ACCOUNT_LIST` feeds `canIOUBePaid`, which decides whether the button says Pay or Pay elsewhere, and `usePolicy` likewise. That split is the whole point of the exercise, and it is visible in one screen of code rather than argued.

**Which source each read uses, which the exit criteria asked for specifically.** All four read the **global** collections, which is what the subscriptions they replace read. The Search row is rendered from a snapshot under `snapshot_${hash}`, and `hash` remains a write-side concern: `getSearchPayOnyxData(hash, reportID)` uses it to build the optimistic update for that snapshot. So the conversion neither introduces nor removes the snapshot question, and there is a test asserting it: seeding `snapshot_${hash}` with a different report action for the same report does not change what reaches `payInvoice`.

**Why the reads sit where they do.** One block at the top of the handler, after the guard clauses and before `getSearchPayOnyxData`, per the C1 and C2 pattern. Nothing in this handler writes before the payment call, so the ordering condition is trivially met here; the value of the block is that a reviewer can see that in one glance.

**The lint rule does not fire, and that is the interesting part.** The read now lives inside a component file, which is the case the rule exists for. It stays silent because `confirmPayment` is a deferring boundary: a `const` arrow function whose name is neither a component nor a hook and which returns no JSX. The caller-graph checker agrees from the other direction, listing `PayActionCell.tsx#PayActionCell.confirmPayment` among the read units with verdict `ok`, and reporting `0 direct caller(s)` because the handler is passed to `SettlementButton` as a prop rather than called by name. A prop-passed handler is invisible to the graph, which is worth stating plainly: the graph could not have told us this one is safe, the lint rule's position analysis did.

**The characterization test, and the one decision in it that mattered.** `tests/ui/components/PayActionCellOnyxReadsTest.tsx`, 10 cases: the invoice path's `chatReportActions`, the B2B swap when paying an individual invoice room as a business, the same read when not in an individual invoice room, the whole-collection arguments to `getParticipantsInvoiceReport`, `isTrackIntentUser` true and false through the selector, the `payMoneyRequest` path, the snapshot case above, a report action written after render, and the delegate-restricted refusal.

The decision: **this suite never mocks** `useOnyx`**.** The pre-existing `tests/ui/components/PayActionCellTest.tsx` mocks it wholesale and returns `undefined` for every key, which is why it passed unchanged through this conversion without proving anything about it. Seeding the real store instead is what lets one file assert the same behaviour against both versions. Written green against the subscription version, then re-run **unedited** after the conversion: 10 green both ways.

**Red-checked, four mutations.** Reading `REPORT` instead of `REPORT_ACTIONS` fails 6 of the 10. Reading the actions from `snapshot_${hash}` instead of the global collection fails the same 6, including the snapshot case by name. Dropping the selector fails 2. Returning an empty reports collection fails 1, the `getParticipantsInvoiceReport` case. So every converted read is guarded by at least one case.

**Evidence.** 12 tests green across the two PayActionCell suites, `npm run typecheck-tsgo` 0 errors, `npm run lint-changed` clean, React Compiler compliance clean over 39 changed React files.

### C4. `replaceOptimisticReportWithActualReport`, cache deletion

**Target.** `src/libs/actions/replaceOptimisticReportWithActualReport.ts`.
**Why this one.** Always-on `connectWithoutView` subscriptions to the entire `REPORT_ACTIONS`, `REPORT_DRAFT_COMMENT` and `REPORT` collections, serving a function that runs occasionally. Shows the pattern that would eventually apply to the 104 assign-only caches without putting them in scope.
**Exit criteria.** Three module-level caches deleted, function reads at event time, tests green.

**Result, 2026-08-13: pass, two caches deleted and the third kept on purpose.** The file had three `connectWithoutView` subscriptions. Two were caches and are gone. The third is not a cache at all: the `REPORT` subscription is the module's **trigger**, the thing that notices a report arriving with a `preexistingReportID`. Deleting it would delete the feature. It stays, and its comment now says so, because "104 assign-only caches" is a count of caches, and this file shows one of them is load-bearing.


|                                    | Before         | After          |
| ---------------------------------- | -------------- | -------------- |
| `connectWithoutView` subscriptions | 3              | 1, the trigger |
| Module-level mutable caches        | 3 collections  | 0              |
| Whole-collection reads             | 3, always live | 0              |


What replaced them is the part worth noting: **every read became a single-key read.** The old code mirrored the entire `REPORT_DRAFT_COMMENT` and `REPORT_ACTIONS` collections in module scope to reach one member each time. Now the trigger reads `${REPORT_DRAFT_COMMENT}${report.reportID}` per report, and the function reads `${REPORT_ACTIONS}${parentReportID}` and `${REPORT}${preexistingReportID}` at their points of use. So this conversion removes three always-live collection subscriptions and does not add a single collection read.

**This is the pilot where the C1 prescription does not apply, which is the finding.** C1, C2 and C3 hoist every read into one block at the top because a handler wants one consistent snapshot. This function writes, then defers through `TransitionTracker.runAfterTransitions`, then writes again from inside a callback that other code invokes later, and its later reads are **supposed** to see the earlier writes: the optimistic parent action is deleted up front, and the `childReportID` update further down must not resurrect it. Hoisting would replace "state now" with "state before we changed it", which is the opposite of what the module-level caches did. So the reads stay next to their uses, and the module doc block says why. Corrected wording for the proposal: reads belong in one block **per synchronous stretch of a function**, and a deferred callback is a new stretch.

**Honesty about that claim, because the test suite disagreed with the first version of it.** I asserted the deferred read could not be hoisted, then mutated the code to hoist it: **all 29 tests still passed**. The reason is that the `isOptimisticAction` check next to the read covers the same case a second time, so a stale read reaches the same answer. The read placement is therefore defensive rather than load-bearing here, and the comment in the file now says exactly that. The general point survives, since the defence is only there because someone already thought about this ordering, but the plan should not claim a test proves it when the test says otherwise.

**Test coverage was already there for the conversion, and had a hole exactly where the trigger is.** `tests/actions/ReplaceOptimisticReportWithActualReportTest.ts` is a 29-case suite that already drives everything through Onyx, so it is a characterization test that needed no changes: **29 green before, 29 green after**, plus `tests/unit/MiddlewareTest.ts` for the import-time side effects.

Two mutations proved it guards the converted reads: forcing `hasReportActions` to `false` fails 4 cases, and dropping the `existingReport` read fails 3. A third mutation, dropping the draft-comment read in the trigger, failed **nothing**, because all 29 cases call the function directly and pass the draft comment in as a parameter. That is a real hole and the conversion moved code into it, so one case was added: *"should transfer the draft comment the Onyx trigger reads for the optimistic report"*, which seeds a draft, writes the report into Onyx, and lets the subscription do the work. It fails when the read is dropped and passes otherwise. Suite now 30.

**Evidence.** 43 tests green across the two suites before, 44 after the added case, `npm run typecheck-tsgo` 0 errors, `npm run lint-changed` clean. The checker lists four read units in this file, all `ok`: the function, the module-scope trigger callback, and the two nested callbacks.

## D. Regression and open questions



### D1. Manual QA of the four pilot flows

Switch to delegator; bulk duplicate from Search; pay from a Search row (including pay as business on an individual invoice room, which is the branch that swaps report actions at click time); the optimistic-report replacement path. Offline and online for each. Web plus one native platform.

**Where to check it out, 2026-08-13.** [App#98582](https://github.com/Expensify/App/pull/98582), branch `feature/onyx-get-pilot`. All four flows are converted on it, so this is one session rather than four. Two notes for whoever runs it. The payment flow is the one worth the most attention, because it is the only conversion whose read happens in a component instance that exists once per Search row. And the optimistic-report path needs a chat that already exists to be recreated, which is easiest by starting a DM with someone you already have a DM with while offline, then reconnecting.

**Result, 2026-08-18: pass, web plus partial iOS.** All four flows exercised online and offline: the delegator switch including the offline block, the trip-in-progress modal and the disconnect back; bulk duplicate across one workspace and across two; pay from a Search row including the invoice paths, the delegate refusal, the offline optimistic state and row recycling; and the optimistic-report replacement with a draft comment surviving onto the real report. No behaviour difference from before the conversions, no crash. Steps, prerequisites and the two cases that were skipped are in [ONYX-GET-MANUAL-QA.md](ONYX-GET-MANUAL-QA.md).

**Two cases skipped, both for setup reasons rather than results.** The chained-delegation refusal needs three accounts in a chain, because the list you switch from belongs to whoever is currently signed in, and it is already covered at `tests/unit/hooks/useSwitchToDelegator.test.ts:180`. And the B2B invoice swap needs an existing workspace-to-workspace invoice room, without which there is nothing to observe; it is covered in `tests/ui/components/PayActionCellOnyxReadsTest.tsx`.

**What this pass deliberately did not test, and the reasoning belongs in the proposal.** Condition C5, whether reading at click time rather than at last render changes what the user sees. See the legend near the top: the window is one render commit, so it is not stageable by hand.

**Scope reduction, 2026-08-12.**  Each pilot conversion should be done as a characterization test: write assertions against the current parameter-taking function first, so they record today's behaviour, then convert the function and re-run the same assertions with Onyx seeded instead of parameters. Anything the logic does is then covered by jest, and manual QA is left with the one thing a test written against the new behaviour cannot catch: whether reading at event time rather than at last render changes what the user sees (condition C5). That is a spot check per flow rather than a full regression pass, so this drops from `M` to `S`.

### D2. No performance regression on the pilot branch

Not to claim a win, only to prove nothing got worse. Re-run the four app-wide spans plus the reassure suite against the pilot branch. Watch for the measurement traps in [ONYX-GET-INVESTIGATION.md](ONYX-GET-INVESTIGATION.md), especially the 16.6 ms commit floor and unequal first-mount counts.

**Partly automatable, 2026-08-12.** The repo already carries a reassure suite (17 files under `tests/perf-test/`, run with `npm run perf-test`), so the render-count and render-duration half needs no device and no manual driving. Only the four app-wide spans need a real session. Adding a perf test for any component a pilot conversion touches is the cheap way to make the regression check repeatable rather than a one-off measurement.

**Promoted to next-step 1 on 2026-08-17, and given a second job by A7d.** It is no longer only "prove nothing got worse". A7d restored an optimisation that had been dead since April, and the size of what it restored is the number the proposal is currently missing: A7's cost paragraph says the full-scan path is taken on every cold start and then admits the wall-clock effect is unmeasured. The measurable form is the `reportAttributes` startup compute with `currentValue` restored versus `undefined`, which is a same-process comparison and needs neither a device nor a session.

**Measured 2026-08-17: what A7d gives back per cold start.** Reassure `measureFunction`, 10 runs per case, on the pilot at `4444df0cb76`. Both cases are the same `reportAttributes.compute` call over the same fixtures in the startup shape (`sourceValues: undefined`, locale the only triggered key), differing only in whether `context.currentValue` carries a previous session's result:


| Reports | Restore succeeded      | Restore failed         | Given back |
| ------- | ---------------------- | ---------------------- | ---------- |
| 250     | 0.004 ms (stdev 0.002) | 1.157 ms (stdev 0.043) | 1.15 ms    |
| 1000    | 0.004 ms (stdev 0.000) | 4.558 ms (stdev 0.188) | 4.55 ms    |


Linear in report count, about 4.5 µs per report, and flat on the restored path because the short-circuit at `configs/reportAttributes.ts:379` returns before the scan starts. Three caveats before this number gets quoted anywhere. It is a **lower bound**: transactions, report actions, metadata and violations were left undefined, so the scan does less per report here than in a real session. It is **dev-machine JS**, so a mid-range Android device under Hermes pays more, by an amount nobody here has measured. And it is **one derived key of nine**, so the real per-cold-start figure is larger again.

**The instrument was deliberately not committed**, on the owner's call, 2026-08-17: it was a one-off measurement rather than a CI guard, and a perf test that only re-proves a short-circuit is cheaper than a scan would be noise in `tests/perf-test/`. Its shape is recorded here so it can be rebuilt: `measureFunction` over `reportAttributes.compute`, fixtures from `createCollection` with `createRandomReport`, `createRandomPolicy` and `createPersonalDetails`, `IntlStore.load(EN)` in `beforeAll`, and `triggeredKeys` holding only `NVP_PREFERRED_LOCALE` so `needsFullRecompute` stays false for the restored case.

**Closed 2026-08-17: CI is green on the pilot.** The perf gate ran against `4444df0cb76`, the pilot tip with A7d and all four conversions on it, and `baseline-perf-tests`, `branch-perf-tests` and `validate-perf-tests` all passed. That is the baseline-versus-branch comparison this step asked for, done on the pipeline's own hardware rather than a developer machine, so the regression verdict is **no regression**. The same run's eight `test` jobs also passed, which covers the whole of `tests/` that was too heavy to run locally. See [App#98582](https://github.com/Expensify/App/pull/98582). The three red checks there are the known ones and none is about performance: `typecheck` for the three descoped `useOnyx` errors, plus `Check independent approval` and `checklist`, both Expensify process gates on a draft.

**Who runs it, decided 2026-08-17: CI, not us.** The reassure regression half is a job for the pipeline on the PR, not a local two-sided run. A local baseline diff would also be measured on one developer machine against a branch that needs its own dependency state, which is exactly the kind of comparison the investigation doc's measurement traps warn about. So D2's regression verdict comes from CI on [App#98582](https://github.com/Expensify/App/pull/98582), and the number above stands on its own as the A7d measurement. The four app-wide spans still need a real session, which is A7b's territory.

**The local gate is the targeted suites, not the whole of jest.** 292 cases across the 16 suites listed at the top of this document, which is what covers everything this workstream touched. Running all of `tests/` locally was tried on 2026-08-17 and abandoned as too heavy for the value: CI already runs it on the PR.

### D3. The two reproducible [#773](https://github.com/Expensify/react-native-onyx/pull/773) regressions

`SidebarOrderedReportsContextProvider` +17.6 ms (5 renders to 7) and `SearchPageHeaderWide` +10.5 ms at the same render count, both reproducing in every measured pair. Root-cause before release.

**Dropped 2026-08-18, owner's call, after CI answered the half that was answerable.** The reassure run at `23e7ca2c369` raised no render count anywhere: all five scenarios whose counts moved, moved **down**, and both `SidebarLinks` cases held at 5 renders. No scenario is named `SidebarOrderedReportsContextProvider`, so the honest statement is that the 5-to-7 shape does not reproduce on the nearest scenario, not that it is fixed. The `SearchPageHeaderWide` half has no scenario at all and would need a profiler session, which is Onyx-release work rather than proposal work. Nothing in the proposal cites either regression.

**Partly automatable, 2026-08-12.** The sidebar regression is a render-count change, 5 to 7, which is exactly what reassure measures, and `tests/perf-test/SidebarLinks.perf-test.tsx` already exists as a starting point. A failing render-count assertion would pin the regression in CI instead of relying on someone re-profiling. The `SearchPageHeaderWide` case is a duration change at an unchanged render count, so it still needs a profiler.

### D4. Why `visibleReportActions` is 0.9 s late on main

Sibling derived keys land in about 100 ms. Understanding this is likely the same work as A4, and it may reveal a cheaper fix than the whole patch.

**Answered 2026-08-18, and the premise turned out to be false.** Both builds traced with `instrumentOnyxCounters.mjs`, same chat, same browser, two traces each, two rounds per trace. `visibleReportActions` latency from its `reportActions_` write:


| Round      | `main`, 3.0.94  | Pilot, [#773](https://github.com/Expensify/react-native-onyx/pull/773) pin |
| ---------- | --------------- | -------------------------------------------------------------------------- |
| Optimistic | 245.2, 251.9 ms | 101.4, 104.8 ms                                                            |
| Server     | 105.4, 105.2 ms | 98.7, 100.7 ms                                                             |


**The 0.9 s does not reproduce on either build**, and the worst of four `main` rounds is 251.9 ms. More decisive than the magnitude: `visibleReportActions` is never a straggler. The four derived keys arrive in a burst of 9.0 to 9.3 ms on `main`, so the shape the original trace described, one key landing alone in a later task and re-rendering the list a second time, is absent from today's `main`. **Retire the 890 ms figure** rather than re-explain it, in the investigation doc's 5.3 and anywhere the proposal repeats it.

**Throttling does not explain the original number either**, which was the first hypothesis when these came back. In that same July recording `reportAttributes` landed at +125.7 ms while `visibleReportActions` landed at +890 ms. CPU throttling scales every key in a trace together and cannot open a sevenfold gap between siblings in one recording.

**What replaces it is smaller, repeatable, and measured on the build we ship: about 146 ms on the optimistic round.** The server round is a tie at ~105 ms both ways, so the effect is confined to the round where the derived compute follows a local write, which is what A4a predicted from the unit tests. **Attribution caveat, the same trap as A10's contamination 1:** the pilot differs from `main` by the Onyx pin *and* by app-side changes including A7d, so the defensible sentence is that the pilot build is ~146 ms faster on that round, not that [#773](https://github.com/Expensify/react-native-onyx/pull/773) is. Isolating the library would need a third run, the baseline pin with `main`'s app code.

**Hypothesis from A4a, 2026-08-12.** On the patched build a derivation's reads are synchronous cache lookups, and the unit tests show the recompute plus its write landing inside the source write's own promise chain, with no extra revision of lag. On unpatched Onyx those same reads are promise-returning storage reads, so a derivation with more or larger dependencies pays more promise hops before it can write. That predicts exactly the observed shape: `visibleReportActions` 890 ms behind on `main`, 109 ms on the patched build, while lighter sibling derivations land in about 100 ms either way. This is a hypothesis a trace can confirm or kill, and if it holds, D4 is answered by the patch rather than needing a separate fix.

---



## Handing a step to an agent

One step per agent, one branch per step where code changes. Template:

> Read `ONYX-GET-VALIDATION-PLAN.md` and `ONYX-GET-INVESTIGATION.md` in the repo root. Execute step  only. Do not touch other steps. When done: write the result into the step body under a `**Result.**` heading, set the status in the status table, add the evidence link (branch, PR, or comment URL), and report what you found including anything that contradicts the plan. If the step cannot be completed, set status `blocked` and say exactly what blocks it.

Rules for every step:

1. Do not change the proposal text directly. If a finding invalidates a claim in `ONYX-GET-PROPOSAL.md`, say so in the step result and flag it, so the change is made once and deliberately.
2. Record contradictions loudly. A step that disproves an assumption is more valuable than one that confirms it.
3. Code steps run the post-edit checklist from `CLAUDE.md`: `npm run fmt`, `npm run lint-changed`, `npm run typecheck-tsgo`, and the React Compiler check when components or hooks changed.
4. Correct the Unit-test and Effort columns if reality disagreed with the estimate, and say by how much. A step that was scoped `S` and took two days is information the rest of the plan needs.

