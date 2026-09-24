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
- PR Updating Patch: [#64155](https://github.com/Expensify/App/pull/64155), [#98097](https://github.com/Expensify/App/pull/98097), [#101715](https://github.com/Expensify/App/issues/101715)
- Note: Re-ported onto 7.22.1. Every hunk applied without changes.
- Note: Core 7.22.0 made `useNavigationBuilder` return a `render` callback and deprecated the `NavigationContent` output it returned before. Our only builder call site, `createPlatformStackNavigatorComponent` (shared by `createRootStackNavigator`, `createRightModalNavigator`, `createSplitNavigator` and `createSearchFullscreenNavigator`), still uses `NavigationContent`, and the `convertCustomScreenOptions` argument this patch adds has no upstream equivalent, so move to `render` and re-check this patch together when `NavigationContent` eventually disappears.

### [@react-navigation+core+7.22.1+003+root-state-not-undefined.patch](@react-navigation+core+7.22.1+003+root-state-not-undefined.patch)

- Reason: Keep `NavigationContainerRef.getRootState()` typed as `NavigationState` instead of `NavigationState | undefined`. Types only, no runtime change: the implementation already returned `undefined` before the container ref mounted in 7.21.12, the type just did not admit it. Around 30 call sites (including `navigationRef.current?.getRootState().routes` in the navigation tests) hand the result straight to helpers that require a state object, and they all run behind the app's readiness gate (`NavigationRoot`'s `onReady`, `navigationRef.isReady()`), so guarding each one is a separate refactor rather than part of an upgrade.
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/commit/4e6eaaac6fad57d09ab5a828484b8ffeb4cfc6e5 (core 7.21.13, "fix return type of getRootState")
- E/App issue: [#101715](https://github.com/Expensify/App/issues/101715)
- PR Introducing Patch: N/A
- Note: Drop this patch once call sites handle the missing state explicitly (a guarded `getRootState()` helper in `src/libs/Navigation` would cover most of them). Until then, calling `getRootState()` before the container mounts logs react-navigation's `NOT_INITIALIZED_ERROR` and returns `undefined` at runtime while the type claims otherwise - same as before the upgrade.

### [@react-navigation+native+7.4.1+001+initial.patch](@react-navigation+native+7.4.1+001+initial.patch)

- Reason: Allows us to use some more advanced navigation actions without messing up the browser history
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/12751 (`route.history` + `pushParams`, added upstream for this use case); originating issue https://github.com/react-navigation/react-navigation/issues/12460. On the v8 upgrade, evaluate adopting `pushParams` to shrink this patch.
- E/App issue: [#21356](https://github.com/Expensify/App/issues/21356)
- PR Introducing Patch: [#24165](https://github.com/Expensify/App/pull/24165)
- PR Updating Patch: [#32087](https://github.com/Expensify/App/pull/32087) [#42465](https://github.com/Expensify/App/pull/42465) [#64155](https://github.com/Expensify/App/pull/64155) [#101715](https://github.com/Expensify/App/issues/101715)
- Note: Re-ported onto 7.4.1. `createMemoryHistory` and `useLinking` were refactored upstream (`getPathWithoutHash`, `getHistoryLength`, `pendingPopStateDelta`, `isPoppingLastEntry`), so the hunks were re-anchored instead of applied verbatim: `backIndex` keeps upstream's hash handling and adds the focused-route-key match, and `useLinking` keeps upstream's `pendingPopStateDelta` guard and `getHistoryLength` delta while re-adding `historyDeltaByKeys`/`getStaleHistoryDiff`. Two parts of the old patch became redundant and were dropped: the `findFocusedRouteKey` helper file now matches upstream's own module, and the extra `history.replace` right after `history.go(nextIndex - currentIndex)` duplicated the replace that upstream already runs at the end of the same `try` block.

### [@react-navigation+stack+7.11.1+001+edge-drag-gesture.patch](@react-navigation+stack+7.11.1+001+edge-drag-gesture.patch)

- Reason: Adds `edgeDragGestureMonitor` implementation
- Upstream PR/issue: N/A
- E/App issue: [#15849](https://github.com/Expensify/App/issues/15849)
- PR Introducing Patch: [#18402](https://github.com/Expensify/App/pull/18402)
- PR Updating Patch: [#22678](https://github.com/Expensify/App/pull/22678) [#22437](https://github.com/Expensify/App/pull/22437) [#64155](https://github.com/Expensify/App/pull/64155) [#101715](https://github.com/Expensify/App/issues/101715)
- Note: Re-ported onto 7.11.1. The added and removed lines are unchanged; only the surrounding context moved, because 7.10.x wrapped the gesture animation in `animationIdRef`/`isAnimatingRef` guards. `resetExpectingTouchendWithDelay()` still runs after those guards, so a stale animation callback that returns early no longer resets the monitor.

### [@react-navigation+stack+7.11.1+002+dontDetachScreen.patch](@react-navigation+stack+7.11.1+002+dontDetachScreen.patch)
- Reason: Prevents the second screen in the stack from being detached too early.  
  Additionally, setting `zIndex: Platform.OS === 'web' ? 'auto' : undefined` helps avoid issues in Safari where the home screen might be hidden due to `overflow: hidden`.
- Upstream PR/issue: N/A
- E/App issue: [#22372](https://github.com/Expensify/App/issues/22372)
- PR Introducing Patch: [#22437](https://github.com/Expensify/App/pull/22437)
- PR Updating Patch: [#33280](https://github.com/Expensify/App/pull/33280) [#37421](https://github.com/Expensify/App/pull/37421) [#49539](https://github.com/Expensify/App/pull/49539) [#64155](https://github.com/Expensify/App/pull/64155) [#65119](https://github.com/Expensify/App/issues/65119) [#101715](https://github.com/Expensify/App/issues/101715)
- Note: Not fully covered by the public `detachPreviousScreen` option (this also forces `activityState`). v8 replaces `detachInactiveScreens`/`detachPreviousScreen`/`freezeOnBlur` with a single `inactiveBehavior` option — re-evaluate this patch then.
- Note: Re-ported onto 7.11.1 unchanged. `STATE_TRANSITIONING_OR_BELOW_TOP` is now a module-level constant upstream, so the patch no longer declares it, and `CardA11yWrapper.js` is byte-for-byte identical to 7.8.5, so the `zIndex` hunk still applies (the 7.11.x `overflow` handling change did not touch this file).

### Removed patches

- `@react-navigation+native+7.1.33+003+increase-history-go-popstate-fallback-timeout.patch` was dropped: upstream raised the `createMemoryHistory.go()` fallback timeout from 100ms to 1000ms in 7.3.18 (https://github.com/react-navigation/react-navigation/pull/13217), with the same Firefox rationale as our patch. Original context: [#94571](https://github.com/Expensify/App/issues/94571) / [#95980](https://github.com/Expensify/App/pull/95980), upstream issue https://github.com/react-navigation/react-navigation/issues/11145.

  One behaviour difference is worth a Firefox regression check on #94571: when the timeout does fire, upstream removes its own `popstate` listener and rejects the `go()` promise if the browser hasn't landed on the expected entry (`window.history.state?.id !== targetId`), whereas it used to resolve. That check came from 7.3.8 (https://github.com/react-navigation/react-navigation/commit/788d7c565554d85fc7d3c3b9d1a7829e1847b8da), not from the timeout change. Rejecting skips the trailing `history.replace`, which upstream documents as deliberate: the entry we are on may not be the one we intended to land on. Both variants still deliver a late `popstate` to external listeners, so this only changes what happens to the history record in the >1s case.

  `tests/unit/Navigation/createMemoryHistoryTest.ts` covered the old contract and now asserts the new one: a timed-out traversal rejects, and the in-time case points `window.history.state` at the target entry first, the way a real traversal does.
