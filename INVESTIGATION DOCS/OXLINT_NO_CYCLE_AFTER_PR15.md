# `import/no-cycle`: state after part 15, and what to do next

Handoff doc for agents picking up the series. Parts 1 to 14 are merged. Part 15
([#101721](https://github.com/Expensify/App/pull/101721), branch
`fix/no-cycle-part15-reportutils-workflow-reads-v1`) is in review. Everything below assumes part 15 lands
as-is.

Measured 2026-10-06 on `origin/main` `2af84dbdc5b` merged with part 15's head `f334cdf23d8` (merge was
clean), oxlint 1.87.0. Every Δ in this doc is a real oxlint run on that checkout with the import line
commented out, unless marked "simulator".

## Numbers

| state | findings | files | SCC sizes |
| --- | --- | --- | --- |
| `origin/main` (parts 1-14) | 120 | 44 | |
| `origin/main` + part 15 | **99** | **40** | `[38, 2]` |

All 99 findings are in `src/`. Part 15's PR body quotes "155 -> 140"; that was measured on an older
`main`. Today it is **120 -> 99 (-21 / -4 files)**. Re-measure before quoting either figure.

## What part 15 does (context only)

- Read-only workflow checks (`canApproveIOU`, `canIOUBePaid`, `canSubmitReport`, `getBadgeFromIOUReport`,
  `getIOUReportActionWithBadge`) move from `actions/IOU/ReportWorkflow.ts` into `ReportUtils.ts`.
  `ReportUtils` no longer imports `ReportWorkflow`.
- `changeMoneyRequestHoldStatus` moves from `ReportUtils` into `actions/IOU/Hold.ts`, takes `policy` as a
  param.
- Badge checks take violations as a param instead of the deprecated global cache.

It did **not** cut `ReportUtils -> Violations/ViolationsUtils` (the original plan's "part 15 B"). That edge
is still open, see below.

## The remaining graph

One 38-file SCC plus the `SearchUIUtils <-> actions/Search` 2-cycle.

Findings per file (top): `ReportUtils` 11, `TransactionUtils/index` 8, `actions/Session/index` 8,
`PolicyUtils/index` 7, then `BankAccounts`, `Welcome/OnboardingFlow`, `ReportNameUtils`,
`Violations/ViolationsUtils` at 4 each.

Cyclic in-degree (top): `PolicyUtils/index` 14, `Navigation/Navigation` 12, `ReportUtils` 11,
`TransactionUtils/index` 8, `DistanceRequestUtils` 6.

SCC members (paths under `src/libs/`): `DistanceRequestUtils`, `ModifiedExpenseMessage`,
`Navigation/Navigation`, `Navigation/helpers/getAdaptedStateFromPath`,
`Navigation/helpers/getReportURLForCurrentContext`, `Navigation/helpers/linkTo/index`,
`Navigation/linkingConfig/index`, `PolicyUtils/index`, `PolicyUtils/tag`, `Reauthentication`,
`ReportActionsUtils`, `ReportNameUtils`, `ReportUtils`, `SubscriptionUtils`, `TaskUtils`,
`TransactionUtils/{index,buildOptimisticTransaction,duplicates,getDistanceInMeters,getUpdatedTransaction,tax,violations}`,
`Violations/ViolationsUtils`, `WorkspacesSettingsUtils`, `actions/App`, `actions/BankAccounts`,
`actions/Delegate`, `actions/HybridApp/index`, `actions/PaymentMethods`,
`actions/ReimbursementAccount/{index,navigation}`, `actions/Session/index`, `actions/SignInRedirect`,
`actions/Welcome/{index,OnboardingFlow}`, `actions/connections/{index,QuickbooksOnline}`, `merge/HRUtils`.

`actions/Report/index.ts`, `actions/Link.ts` and `actions/Task.ts` are **no longer in any cycle**.

## Recommended next PRs

Line numbers are from the `main + part 15` merge; re-derive them when writing each PR.

### Part 16: take Navigation out of the cycle by splitting `getAdaptedStateFromPath` (branch ready)

Branch `fix/no-cycle-part16-navigation-linking-split`, commit `10c5f2ca80c`, local only in
`~/conductor/nocycle-dev`, not pushed. No new `Onyx.connect` / `connectWithoutView`, no change to
`ReportUtils`' exports.

Measured with oxlint 1.87.0:

| state | findings / files |
| --- | --- |
| `main` | 120 / 44 |
| `main` + 16 | 90 / 34 |
| `main` + 15 | 99 / 40 |
| `main` + 15 + 16 (merges clean) | **71 / 30** |

What it does: instead of cutting `getAdaptedStateFromPath -> ReportUtils`, it removes every path from
`Navigation.ts` into `getAdaptedStateFromPath`, so the whole Navigation cluster leaves the SCC.

- `getMatchingFullScreenRoute` (plus `getRoutesWithIndex`, `getTabNavigatorState`,
  `isRouteWithBackToParam`) moves verbatim into new `Navigation/helpers/getMatchingFullScreenRoute.ts`.
  `linkTo` and `swapBackgroundTabForRHPTarget` import it from there; `linkTo` takes `isFullScreenName`
  from `isNavigatorName`. `getAdaptedStateFromPath` imports the helpers back and no longer re-exports.
- `Navigation.ts`, `linkTo/index.ts` and `Welcome/OnboardingFlow.ts` used the `linkingConfig` barrel only
  for `.config`; they now import `config` from `linkingConfig/config` (part 8 pattern). `ReportUtils.ts`
  used it only for `.prefixes`; it now imports `linkingConfig/prefixes`.
- Two moved `as` casts got `eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion`, because
  the seatbelt baseline is per file and they were grandfathered in `getAdaptedStateFromPath.ts`.
- Tests: `getMatchingFullScreenRouteTests` imports the new module and drops its now-unneeded
  `@libs/ReportUtils` mock; `swapBackgroundTabForRHPTarget.test` mocks the new module (green-red-green
  checked).

Checks run: `npm run typecheck`, `npm run lint-changed`, `react-compiler-compliance-check check-changed`,
`spell-changed` all pass; `tests/navigation`, `tests/unit/Navigation`, `ReportUtilsTest`,
`OnboardingFlowTest`: 99 suites / 2764 tests pass.

Still open after 16: `getAdaptedStateFromPath -> ReportUtils` itself. `getAdaptedStateFromPath` stays in
the SCC because `actions/Session` and `Welcome/OnboardingFlow` import it. The original cut (-31 on
`main + 15`) needs a sync read of `COLLECTION.REPORT` without `ReportUtils`. The only cycle-safe homes found
were a new subscription or `Parser.ts`'s existing map, and the user ruled out new subscriptions.
`getAdaptedStateFromPath` must stay synchronous (React Navigation `getStateFromPath`, router
`getStateForAction`), so an async `Onyx.get` does not fit either.

### Part 17: `ReportUtils -> actions/Session` (branch ready)

Branch `fix/no-cycle-part17-reportutils-anonymous-session`, commit `04497b53f39`, off `origin/main`
`da0cf969340`, local in `~/conductor/nocycle-dev`, not pushed. No new Onyx subscription.

- `CurrentUserStore`'s existing `ONYXKEYS.SESSION` callback also mirrors `authTokenType`; the file exports
  `isAnonymousUser()`.
- `ReportUtils` drops `import {isAnonymousUser as isAnonymousUserSession} from './actions/Session'` and
  imports `isAnonymousUser` from `./CurrentUserStore` (3 no-arg call sites: `findLastAccessedReport` x2,
  `canLeaveChat`). `actions/Session`'s param-taking `isAnonymousUser` is unchanged.
- Tests: 3 cases in `CurrentUserStoreTest`, 2 in `ReportUtilsTest` `canLeaveChat`. The existing
  "public room and the user is the guest" test passes even when the anonymous check is broken (the room
  is not leavable for other reasons), so the new pair uses a room the user can leave. Green-red-green
  checked.

Measured with oxlint 1.87.0, all merges clean:

| state | findings / files |
| --- | --- |
| `main` | 120 / 44 |
| `main` + 17 | 105 / 38 |
| `main` + 15 + 17 | 84 / 34 |
| `main` + 16 + 17 | 82 / 31 |
| `main` + 15 + 16 + 17 | **63 / 27** |

Checks run: typecheck, lint-changed, compiler check, spell-changed pass; 11 suites / 2229 tests pass.

### Parts 18+: verified on `main` + 15 + 16 + 17

Re-measured 2026-10-06 on `origin/main` `da0cf969340` merged with the part 15, 16 and 17 branches
(local merge `7a3c79850b4`, all clean): **63 / 27**, SCCs `[25, 2]`. Every number below is a real oxlint
1.87.0 run with the whole import statement commented out (see the stub script in the recipe), and each
row is measured on top of the rows above it. Line numbers are from that merge.

Remaining 25-file SCC: `DistanceRequestUtils`, `ModifiedExpenseMessage`,
`Navigation/helpers/getAdaptedStateFromPath`, `PolicyUtils/{index,tag}`, `ReportActionsUtils`,
`ReportNameUtils`, `ReportUtils`, `SubscriptionUtils`,
`TransactionUtils/{index,buildOptimisticTransaction,duplicates,getDistanceInMeters,getUpdatedTransaction,tax,violations}`,
`Violations/ViolationsUtils`, `WorkspacesSettingsUtils`, `actions/{App,BankAccounts,PaymentMethods}`,
`actions/Welcome/OnboardingFlow`, `actions/connections/{index,QuickbooksOnline}`, `merge/HRUtils`. Plus the
`SearchUIUtils <-> actions/Search` pair. `Navigation.ts`, `actions/Session` and `linkingConfig` are out.

| PR | cuts | after | Δ | size |
| --- | --- | --- | --- | --- |
| 18 | `connections/index.ts:6`, `TransactionUtils/getDistanceInMeters.ts:1`, `actions/BankAccounts.ts:53` | 51 / 22 | -12 / -5 | small, 3 pure helpers |
| 19 | `ReportUtils.ts:110` (`getOnboardingMessages`) | 46 / 19 | -5 / -3 | one 217-line verbatim move |
| 20 | `PolicyUtils/index.ts:8`, `ReportActionsUtils.ts:80`, `actions/Search.ts:69` | 40 / 15 | -6 / -4 | small, 3 pure helpers |
| 21 | `TransactionUtils/index.ts` stops re-exporting `./duplicates`, `./tax`, `./violations` | 31 / 12 | -9 / -3 | large: 79 consumer files repoint |
| 22 | `ReportUtils.ts:306` (`ViolationsUtils`) | 26 / 11 (bare cut) | -5 / -1 | hard, see below; realistic is about -3 |

Each PR 18 cut alone on 63: -4 / -2, -4 / -1, -4 / -2 (verified individually).

#### Combined part 18 (= planned 18 + 19 + 20), branch ready

Branch `fix/no-cycle-part18-pure-helper-leaves`, commit `478fb46f385`, off `origin/main` `da0cf969340`,
local in `~/conductor/nocycle-dev`, not pushed. 29 files, +478 / -437, no new Onyx subscription.

| state | findings / files |
| --- | --- |
| `main` | 120 / 44 |
| `main` + 18 | 97 / 35 |
| `main` + 15 + 16 + 17 | 63 / 27 |
| `main` + 15 + 16 + 17 + 18 | **40 / 15** |

Merging on top of part 17 conflicts in the `ReportUtils.ts` import block (17 removes the `actions/Session`
line, 18 replaces the adjacent `OnboardingFlow` line). Resolution: keep only
`import buildOnboardingMessages from './actions/Welcome/buildOnboardingMessages';`.

New leaves: `PolicyUtils/isCollectPolicy.ts` (re-exported with `export *`), `DistanceUnitConversionUtils.ts`
(`convertDistanceUnit`, `convertToDistanceInMeters`, both constants), `actions/getMakeDefaultPaymentOnyxData.ts`,
`actions/Welcome/buildOnboardingMessages.ts`, `WorkspaceDisplayUtils.ts`, `isTransactionGroupListItemType.ts`.
`shouldShowQBOReimbursableExportDestinationAccountError` moved into `PolicyUtils/index.ts`; its 5 consumers
repointed.

**Correction to the part 19 plan below:** `getOnboardingMessages` read OnboardingFlow's module-level
`onboardingData` (an existing `NVP_ONBOARDING` `connectWithoutView`). The leaf is
`buildOnboardingMessages(onboardingData, locale?)`; `OnboardingFlow.getOnboardingMessages` wraps it with its
own mirror (other callers unchanged) and `ReportUtils` passes its existing `onboarding` mirror
(`ReportUtils.ts:1211`). The value only affects the Manage team message, which `ReportUtils` never reads.

Checks: typecheck, lint-changed, compiler check, spell pass. Jest over the 223 suites that reference a
touched module: 222 pass; `tests/ui/UnreadIndicatorsTest.tsx` fails 3 tests identically on plain `main`
`da0cf969340`, so it is pre-existing.

#### Part 18: three pure helpers to leaves

- **`actions/connections/index.ts:6`** `import * as PolicyUtils from '@libs/PolicyUtils'`. Only use:
  `PolicyUtils.isCollectPolicy(policy)` at `:87`. Body (`PolicyUtils/index.ts:1384`, 3 lines):
  `policy?.type === CONST.POLICY.TYPE.TEAM`. Move it to a new `PolicyUtils/<name>.ts` and add
  `export * from './<name>'` in `PolicyUtils/index.ts` next to the existing `export * from './tag'`
  (`:3471`). The comment above that line explains why: a named re-export becomes a getter that throws
  while the module is loading and breaks the 27 tests that spread `jest.requireActual('@libs/PolicyUtils')`.
  `export *` does not. `connections/index.ts` imports the new file directly. 9 other files use
  `isCollectPolicy` through `@libs/PolicyUtils` and stay untouched.
- **`TransactionUtils/getDistanceInMeters.ts:1`** `import DistanceRequestUtils`, used only for
  `convertToDistanceInMeters` (`:17`). Body `DistanceRequestUtils.ts:549` (6 lines) needs `CONST`,
  the `Unit` type and `METERS_TO_KM` / `METERS_TO_MILES` (`:39-40`, also used at `:130-132`). Move the
  function and both constants to a leaf; `DistanceRequestUtils` imports them back and keeps
  `convertToDistanceInMeters` on its default-export object, so `useTaxAmount.ts:75` and the 3 tests that
  mock `@libs/DistanceRequestUtils` keep working. No test spreads `requireActual` on it.
- **`actions/BankAccounts.ts:53`** `getMakeDefaultPaymentOnyxData` (`:650`). Body
  `actions/PaymentMethods.ts:91`, a pure Onyx-update builder (Onyx, CONST, ONYXKEYS, types). Move to a
  leaf; `PaymentMethods` imports it back for its own uses (`:158-159`) and keeps exporting it (`:614`). No
  `requireActual` spread on `PaymentMethods`; 2 tests mock it with factories, run them.

#### Part 19: `getOnboardingMessages` to a leaf

- `ReportUtils.ts:110` `import {getOnboardingMessages} from './actions/Welcome/OnboardingFlow'`, used
  at 2 sites. Body `OnboardingFlow.ts:242-458`: `translate`, `IntlStore.getCurrentLocale`, `CONST`,
  `hasCompletedGuidedSetupFlowSelector` (`@src/selectors/Onboarding`). Probed: importing those modules
  from `ReportUtils` instead gives 58 / 24, same as the bare cut, so the leaf stays out of the cycle.
- `ReportUtils.ts:99` is an `import type` from the same module. It does **not** need to move: stubbing only
  `:110` gives the same 58 / 24 as stubbing both.
- 7 src files use `getOnboardingMessages` (incl. `useOnboardingMessages`, `actions/Report`,
  `Policy`, `PayMoneyRequest`, `TrackExpense`) plus `tests/actions/ReportTest.ts`. `OnboardingFlow`
  can import the leaf back and re-export; no `requireActual` spread on it.

#### Part 20: three more pure helpers

- **`PolicyUtils/index.ts:8`** imports `shouldShowQBOReimbursableExportDestinationAccountError` from
  `actions/connections/QuickbooksOnline` (`:98`, 3 lines over `isPolicyAdmin` and the policy's QBO config).
  It is a policy predicate; move it into `PolicyUtils` (or a `PolicyUtils/` submodule with `export *`).
  Cutting `:8` alone gives the same result as also cutting `QuickbooksOnline.ts:9`.
- **`ReportActionsUtils.ts:80`** `getUnitTranslationKey`, `getWorkspaceAddressStreetLines` from
  `WorkspacesSettingsUtils` (`:71`, `:57`). Both pure (CONST and types only). Leaf;
  `WorkspacesSettingsUtils` re-exports. Cutting `:80` alone equals also cutting
  `WorkspacesSettingsUtils.ts:13`.
- **`actions/Search.ts:69`** `isTransactionGroupListItemType` from `SearchUIUtils` (`:890`,
  `'transactions' in item`). Leaf type guard; breaks the `SearchUIUtils <-> actions/Search` 2-cycle.
  `isTransactionGroupListItemType` and the QBO helper have 14 files / 49 refs between them, so prefer
  re-export over repoint (no `requireActual` spread on `SearchUIUtils`).

#### Part 21: `TransactionUtils` barrel

`TransactionUtils/index.ts` imports 6 names from `./duplicates` (`:50-57`), 12 from `./tax` (`:76`) and
26 from `./violations` (`:105`), uses **none** of them internally, and only re-exports them (one of the
imports already carries `eslint-disable-next-line import/no-cycle`). The submodules import `PolicyUtils`,
`ReportUtils` and `DistanceRequestUtils`, which reach back to the barrel. Dropping the three re-exports
means 79 files that import those names from `@libs/TransactionUtils` repoint to the submodules, plus any
`jest.mock('@libs/TransactionUtils')` factories that stub them. Mechanical but wide; worth splitting by
submodule (each alone is -3).

#### Part 22: `ReportUtils -> ViolationsUtils` (hard)

Two uses: `:2411` `getViolationsOnyxData` inside `pushTransactionViolationsOnyxData` (`:2343`), whose
only callers are `actions/Policy/{Category,Policy,Tag}.ts`, so that function can move out to an action
sink; and `:10447` `hasVisibleViolationsForUser` inside `getViolatingReportIDForRBRInLHN`, which
`ReportUtils` calls itself (`:10815`, `:14091`). `hasVisibleViolationsForUser` needs `isViolationDismissed`
and `shouldShowViolation` from `@libs/TransactionUtils` (in the SCC), so a leaf for it lands inside the
cycle: simulated 60 / 27 on the 63 base (vs 58 for the bare cut). Expect about -3 for real.

#### Not worth it

- `actions/BankAccounts.ts:34` -> `ReportUtils` (`buildOptimisticAddCommentReportAction`, reads
  `ReportUtils` module state): -3 on the part 20 base, no leaf.
- `PolicyUtils/index.ts:20` + `PolicyUtils/tag.ts:5` -> `TransactionUtils`: only -3 together on 63.
- After part 22 the rest (26 / 11) is the `ReportUtils` / `ReportActionsUtils` / `ReportNameUtils` /
  `ModifiedExpenseMessage` / `PolicyUtils` / `TransactionUtils` core, where every remaining edge is -1 or
  -2 and needs real module-state untangling.

## Dead ends and traps

- `Navigation/Navigation.ts`'s `navigate` / `goBack` cannot leave: module state plus hundreds of
  importers. Cut what Navigation reaches (part 16), not Navigation's in-edges.
- **Relocated cycle trap.** A new module that imports the SCC is only a sink if nothing in the SCC
  imports it. Before writing a leaf, check both directions. Fastest check: replace the target import line
  with bare `import '<dep>'` lines for the leaf's planned dependencies and re-run oxlint (done for part 19;
  for part 22 the planned dependency is in the SCC, which is why it is rated hard).
- `ignoreTypes: true` changes nothing: flagged `import type` lines are the first statement of a module
  that also has a value import.
- `actions/Delegate -> actions/App` and `actions/Session -> Reauthentication` were dead ends on the 99
  graph; after parts 16 + 17 neither `Delegate` nor `Session` is in the SCC any more, so they no longer
  matter.

## Rules learned from parts 1-17

- **One finding per (file, module) pair, value imports only.** Trimming symbols from an import buys 0;
  every value import of that module must go. `import type` statements do not count even when oxlint
  reports the finding on their line (verified on `ReportUtils.ts:99` / `:110`).
- **Cuts are not additive.** Measure combinations for real, never sum Δs.
- **Re-export vs repoint.** A hub may re-export a moved symbol only if the new module imports nothing in
  the cycle. Otherwise repoint every consumer (part 11 rule). `jest.requireActual` spreads that make
  re-exports risky: `@libs/ReportUtils` 44, `@libs/PolicyUtils` 27 (counted in `tests/` today).
- **Prefer extending an existing leaf store** (`CurrentUserStore`, part 13) over a new
  `Onyx.connectWithoutView`. New ones ping the connectWithoutView reviewers.
- **Prefer cuts that do not grow `ReportUtils`.** Part 15 is the exception (logic moved in because every
  alternative recreated the cycle); do not use it as precedent without a reason.
- PR conventions: title `[No QA] Fix import/no-cycle - part N`, branch `fix/no-cycle-partN-<slug>`, body
  states before/after findings measured on the PR's own merge base.
- Before pushing: `npm run lint-changed`, `npm run typecheck`,
  `npm run react-compiler-compliance-check check-changed`, `npm run spell-changed`, and the jest suites of
  every touched module. New tests need `// Given / // When / // Then`.

## Measurement recipe

Use a scratch worktree, never the working branch. `submodule.recurse` is on in this repo and
`Mobile-Expensify` is not initialised in a hand-made worktree, so pass `-c submodule.recurse=false`.

```bash
W=/tmp/nocycle-wt
git -c submodule.recurse=false worktree add --detach $W origin/main
# optional: stack open parts on top
git -C $W -c submodule.recurse=false merge --no-edit origin/<part-branch>
ln -s <workspace>/node_modules $W/node_modules            # without node_modules oxlint resolves no aliases and reports 0
cp <workspace>/.oxlintrc.no-cycle.json $W/                 # untracked; import plugin, import/no-cycle only
cd $W && ~/conductor/workspaces/expensify-app/chiang-mai/node_modules/.bin/oxlint . -c .oxlintrc.no-cycle.json -f json > /tmp/nc.json
python3 -c "import json;d=json.load(open('/tmp/nc.json'))['diagnostics'];print(len(d),len({x['filename'] for x in d}))"
```

Real Δ for a candidate cut (comment out lines, run, restore):

```python
#!/usr/bin/env python3
# stub2.py src/path.ts:LINE ...   (W=<worktree> env var)
# Comments out the WHOLE import statement containing each line, runs oxlint, restores.
# Commenting a single line of a multi-line import breaks parsing and oxlint silently skips the file,
# which reports fake huge drops (seen: 63 -> 37 for TransactionUtils/index.ts:76; real value 59).
import sys, subprocess, os, json
W = os.environ.get('W', '/tmp/nocycle-wt'); os.chdir(W)
OX = os.path.expanduser('~/conductor/workspaces/expensify-app/chiang-mai/node_modules/.bin/oxlint')
touched = {}
for s in sys.argv[1:]:
    f, l = s.rsplit(':', 1); l = int(l) - 1
    L = touched.get(f) or open(f).read().split('\n')
    a = l
    while not L[a].lstrip().startswith(('import', 'export')): a -= 1
    b = a
    while ' from ' not in L[b] and not L[b].lstrip().startswith('} from'): b += 1
    for i in range(a, b + 1): L[i] = '// STUB ' + L[i]
    touched[f] = L
for f, L in touched.items(): open(f, 'w').write('\n'.join(L))
out = subprocess.run([OX, '.', '-c', '.oxlintrc.no-cycle.json', '-f', 'json'], capture_output=True, text=True).stdout
d = json.loads(out)['diagnostics']
print(len(d), len({x['filename'] for x in d}))
subprocess.run(['git', '-c', 'submodule.recurse=false', 'checkout', '-q', '--', 'src'])
```

Use oxlint 1.87.0 explicitly (path above): `main` has no oxlint dependency, so a bare `npx oxlint` in a
`main` checkout runs whatever version is cached (1.85.0 here).

Simulator for ranking edges before implementing anything. It rebuilds the graph from the cycle paths in
oxlint's notes, removes an edge, recomputes SCCs and recounts. On 2026-10-06 it reproduced 99 / 40
exactly and matched all 9 real stub runs above.

```python
# sim.py /tmp/nc.json
import json, re, sys, collections
sys.setrecursionlimit(100000)
diags = json.load(open(sys.argv[1]))['diagnostics']
pat = re.compile(r'\(([^)]+)\)')
edges, findings = set(), []
for x in diags:
    f = x['filename']; nodes = pat.findall(x['note'])
    path = [f] + nodes
    for a, b in zip(path, path[1:] + [f]): edges.add((a, b))
    findings.append((f, nodes[0], x['labels'][0]['span']['line']))

def sccs(E):
    g = collections.defaultdict(set)
    for a, b in E: g[a].add(b)
    idx, low, st, on, comp, i = {}, {}, [], set(), {}, [0]
    def sc(v):
        idx[v] = low[v] = i[0]; i[0] += 1; st.append(v); on.add(v)
        for w in g[v]:
            if w not in idx: sc(w); low[v] = min(low[v], low[w])
            elif w in on: low[v] = min(low[v], idx[w])
        if low[v] == idx[v]:
            while True:
                w = st.pop(); on.discard(w); comp[w] = v
                if w == v: break
    for v in list(g):
        if v not in idx: sc(v)
    return comp

def count(E):
    comp = sccs(E)
    live = [f for f in findings if (f[0], f[1]) in E and comp.get(f[0]) == comp.get(f[1])]
    return len(live), len({f[0] for f in live})

base = count(edges)
print('baseline', base)
ranked = sorted((count(edges - {(a, b)})[0] - base[0], a, line, b) for a, b, line in findings)
for d, a, line, b in ranked[:30]:
    print(d, f'{a}:{line}', '->', b)
```

Line numbers in this doc are from the local `main + part 15` merge at `c78e209f3f5`. `ReportUtils.ts`
churns daily; re-derive every line number and re-run the measurement after each rebase.
