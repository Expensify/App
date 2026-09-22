# `@react-navigation` patches

### @react-navigation+package-name+7+fix-failing-jest-by-disabling-esmodule.patch
#### [@react-navigation+bottom-tabs+7.19.1+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+bottom-tabs+7.19.1+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+core+7.22.1+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+core+7.22.1+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+elements+2.9.42+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+elements+2.9.42+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+material-top-tabs+7.7.1+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+material-top-tabs+7.7.1+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+native-stack+7.19.1+002+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+native-stack+7.19.1+002+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+native+7.4.1+002+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+native+7.4.1+002+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+routers+7.6.4+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+routers+7.6.4+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+stack+7.11.1+004+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+stack+7.11.1+004+fix-failing-jest-by-disabling-esmodule.patch)

- Reason: Necessary to run Jest with the obligatory `--experimental-vm-modules` flag. Currently we transpile all the code to `commonjs`, but Jest looks up to individual `package.jsons` to see whether the package is `commonjs` or `ESModule`. That causes a conflict, which can be solved by removing `{"type":"module"}` from `lib/module/package.json`. This might be an issue with Jest, but it would require much more investigation. More: https://github.com/react-navigation/react-navigation/issues/12637
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/issues/12637
- E/App issue: [#62850](https://github.com/Expensify/App/issues/62850)
- PR Introducing Patch: [#64155](https://github.com/Expensify/App/pull/64155)
- PR Updating Patch: N/A

### [@react-navigation+core+7.22.1+002+platform-navigation-stack-types.patch](@react-navigation+core+7.22.1+002+platform-navigation-stack-types.patch)

- Reason: Enables passing custom `ScreenOptions` and adjusts typing to have everything fully type-checked and make sure only the proper (common) platform-specific options are passed
- Upstream PR/issue: N/A
- E/App issue: [#29948](https://github.com/Expensify/App/issues/29948)
- PR Introducing Patch: [#37891](https://github.com/Expensify/App/pull/37891)
- PR Updating Patch: [#64155](https://github.com/Expensify/App/pull/64155), [#98097](https://github.com/Expensify/App/pull/98097)

### [@react-navigation+native+7.4.1+001+initial.patch](@react-navigation+native+7.4.1+001+initial.patch)

- Reason: Allows us to use some more advanced navigation actions without messing up the browser history
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/12751 (`route.history` + `pushParams`, added upstream for this use case); originating issue https://github.com/react-navigation/react-navigation/issues/12460. On the v8 upgrade, evaluate adopting `pushParams` to shrink this patch.
- E/App issue: [#21356](https://github.com/Expensify/App/issues/21356)
- PR Introducing Patch: [#24165](https://github.com/Expensify/App/pull/24165)
- PR Updating Patch: [#32087](https://github.com/Expensify/App/pull/32087) [#42465](https://github.com/Expensify/App/pull/42465) [#64155](https://github.com/Expensify/App/pull/64155) [#101715](https://github.com/Expensify/App/issues/101715)
- Note: Re-ported onto 7.4.1. `createMemoryHistory` and `useLinking` were refactored upstream (`getPathWithoutHash`/`pathWithoutHash`, `getHistoryLength`, `pendingPopStateDelta`), so the hunks were merged onto the new code: `backIndex` keeps upstream's hash handling and adds the focused-route-key match; `useLinking` keeps upstream's `pendingPopStateDelta` guard and `getHistoryLength` delta, and re-adds `historyDeltaByKeys`/`getStaleHistoryDiff`.
- Note (timeout): This patch now also absorbs the old `increase-history-go-popstate-fallback-timeout` patch. Upstream 7.4.1 did raise the `go()` fallback timeout to 1000ms, but it also added a `window.history.state.id !== targetId` guard to `done()` that makes a fired timeout **reject** with "History was changed during navigation." We need it to **resolve** instead (a `popstate` that arrives after the timeout is still delivered to external listeners), so the timer now calls a dedicated `timeoutDone` resolver instead of the interrupt/`done` path. Covered by `tests/unit/Navigation/createMemoryHistoryTest.ts`.

### [@react-navigation+stack+7.11.1+001+edge-drag-gesture.patch](@react-navigation+stack+7.11.1+001+edge-drag-gesture.patch)

- Reason: Adds `edgeDragGestureMonitor` implementation
- Upstream PR/issue: N/A
- E/App issue: [#15849](https://github.com/Expensify/App/issues/15849)
- PR Introducing Patch: [#18402](https://github.com/Expensify/App/pull/18402)
- PR Updating Patch: [#22678](https://github.com/Expensify/App/pull/22678) [#22437](https://github.com/Expensify/App/pull/22437) [#64155](https://github.com/Expensify/App/pull/64155)

### [@react-navigation+stack+7.11.1+002+dontDetachScreen.patch](@react-navigation+stack+7.11.1+002+dontDetachScreen.patch)
- Reason: Prevents the second screen in the stack from being detached too early.  
  Additionally, setting `zIndex: Platform.OS === 'web' ? 'auto' : undefined` helps avoid issues in Safari where the home screen might be hidden due to `overflow: hidden`.
- Upstream PR/issue: N/A
- E/App issue: [#22372](https://github.com/Expensify/App/issues/22372)
- PR Introducing Patch: [#22437](https://github.com/Expensify/App/pull/22437)
- PR Updating Patch: [#33280](https://github.com/Expensify/App/pull/33280) [#37421](https://github.com/Expensify/App/pull/37421) [#49539](https://github.com/Expensify/App/pull/49539) [#64155](https://github.com/Expensify/App/pull/64155) [#65119](https://github.com/Expensify/App/issues/65119)
- Note: Not fully covered by the public `detachPreviousScreen` option (this also forces `activityState`). v8 replaces `detachInactiveScreens`/`detachPreviousScreen`/`freezeOnBlur` with a single `inactiveBehavior` option — re-evaluate this patch then.

### Removed patches

- `@react-navigation+native+7.1.33+003+increase-history-go-popstate-fallback-timeout.patch` no longer exists as a standalone patch. Upstream 7.4.1 raised the `createMemoryHistory.go()` fallback timeout to 1000ms on its own, but it also changed `done()` to reject when the timeout fires, so the timeout behavior we depend on (resolve-on-timeout, so a late `popstate` still reaches external listeners) was folded into the `initial` patch above rather than dropped. Original context: [#94571](https://github.com/Expensify/App/issues/94571) / [#95980](https://github.com/Expensify/App/pull/95980), upstream https://github.com/react-navigation/react-navigation/issues/11145.
