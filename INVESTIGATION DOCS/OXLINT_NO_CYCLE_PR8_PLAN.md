# PR 8: stop importing navigation barrels for the route config and the active route

Branch `fix/no-cycle-part8-navigation-barrels`, off `upstream/main` (`b63843bd645`). Worktree `/tmp/part8-pr`.
Patch: `OXLINT_NO_CYCLE_PR8.patch`.

## Headline number

Measured with oxlint 1.82.0, `import/no-cycle` isolated.

| State | findings | files in cycles | clusters |
| --- | --- | --- | --- |
| `main` (parts 1-4 merged) | 390 | 95 | `[95]` |
| `main` + PR 8 | **363** | **88** | `[88]` |
| `main` + parts 5-7 | 254 | 77 | `[75, 2]` |
| `main` + parts 5-7 + PR 8 | **229** | **70** | `[68, 2]` |

**-27 findings and -7 files standalone, -25 and -7 stacked behind parts 5-7.** Unlike parts 6 and 7,
this one pays off immediately: it does not need the in-review PRs to land first.

## What it does

Two independent cases of a light consumer importing a heavy barrel to reach one small thing.

### 1. `getStateFromPath` reads the route config directly

`src/libs/Navigation/helpers/getStateFromPath.ts` imported `{linkingConfig}` from the
`Navigation/linkingConfig` barrel and used exactly one property, `linkingConfig.config`, on one line.
The barrel also pulls in `subscribe`, which reaches `actions/Session`, and `getAdaptedStateFromPath`,
which reaches `ReportUtils`.

`config` already lives in its own module, `Navigation/linkingConfig/config.ts`, and that module is
already outside every cycle. So this is a one-line change: import `{config}` from
`@libs/Navigation/linkingConfig/config` and pass it straight to `RNGetStateFromPath`.

Worth **-18 findings and -6 files** on its own, the biggest single cut available on `main` right now.

### 2. `getActiveRoute` moves out of the `Navigation` barrel

`Navigation/helpers/dynamicRoutesUtils/createDynamicRoute.ts` imported the whole `Navigation` barrel to
call `Navigation.getActiveRoute()` once, as the fallback when no `basePath` is passed.

`getActiveRoute` is 15 lines and its only dependencies are `navigationRef` and `getPathFromState`,
neither of which is in a cycle. It moves verbatim to a new
`src/libs/Navigation/helpers/getActiveRoute.ts`. `Navigation.ts` imports it back and keeps exporting it
on the default object, so all other consumers are untouched, and its own now-unused
`getPathFromState` import is dropped.

Worth **-7 findings and -1 file** on top of the first change.

5 files, 1 of them new. +40 / -30. No function body changes.

Neither new module is itself reported: `getActiveRoute.ts` is a sink that nothing in the cluster imports.

## The one test change

`tests/navigation/createDynamicRouteTests.ts` mocked `@libs/Navigation/Navigation` to stub
`getActiveRoute`, and separately mocks `@src/ROUTES` with a partial object. Once `createDynamicRoute`
imports the real `getActiveRoute` leaf instead, that leaf loads `getPathFromState`, which loads
`linkingConfig/config.ts`, which reads `ROUTES.REPORT_ATTACHMENTS.route` at module scope and dies
against the partial `ROUTES` mock:

```
TypeError: Cannot read properties of undefined (reading 'route')
  at Object.route (src/libs/Navigation/linkingConfig/config.ts:30:65)
  at Object.require (src/libs/Navigation/helpers/getPathFromState.ts:2:1)
  at Object.require (src/libs/Navigation/helpers/getActiveRoute.ts:3:1)
```

The dependency genuinely moved, so the mock is retargeted to
`jest.mock('@libs/Navigation/helpers/getActiveRoute')` with a default export. Nothing else in the test
changes.

Green-red-green checked: replacing `basePath ?? getActiveRoute()` with `basePath ?? ''` fails 11 of the
16 tests, so the retargeted mock still guards the behaviour it is named for.

Note this also means `getActiveRoute` is not as cheap a dependency as it looks. It is cycle-free, but it
does drag the 164 KB route config in behind `getPathFromState`. That is fine for the import graph and
for production, but it is why the test needed the retarget.

## Verification

All run on `upstream/main` + this change.

| Check | Result |
| --- | --- |
| `npm run typecheck` | passed, all tsconfigs |
| `npx eslint` on the 4 changed source files | error counts identical to pristine `main` (`Navigation.ts` 10, `createDynamicRoute.ts` 2, `getStateFromPath.ts` 4, all pre-existing `no-unsafe-type-assertion` on untouched lines). New `getActiveRoute.ts` 0. Test file 0 |
| `npm run react-compiler-compliance-check check-changed` | passed, both compilers |
| `npx cspell` on the 4 changed source files | 0 issues |
| `npx jest tests/navigation tests/unit/Navigation` | **81 suites, 1154 tests passed**, 0 failed |
| `npx oxlint . -c .oxlintrc.no-cycle.json` | 390 -> 363 findings, 95 -> 88 files |

## Files leaving the graph

Stacked on parts 5-7, together with PR 9, the navigation files that leave are
`Navigation/helpers/getStateFromPath`, `Navigation/helpers/dynamicRoutesUtils/createDynamicRoute`,
`Navigation/helpers/dynamicRoutesUtils/getDynamicRouteAdaptedState`,
`Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers`,
`Navigation/helpers/lastVisitedTabPathUtils/index`, `Navigation/helpers/preMountBuffer` and
`Navigation/helpers/willRouteNavigateToRHP`.

## Deliberately not included

`actions/Welcome/index.ts -> Navigation/Navigation` (-5, -1 file) looks like the same shape but is not.
It uses `Navigation.setNavigationActionToMicrotaskQueue` and `Navigation.goBack`, which are real
navigation actions and cannot move to a leaf. It needs a different fix.
