# `@react-navigation` patches

### @react-navigation+package-name+7+fix-failing-jest-by-disabling-esmodule.patch
#### [@react-navigation+bottom-tabs+7.15.5+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+bottom-tabs+7.15.5+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+core+7.16.1+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+core+7.16.1+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+elements+2.9.14+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+elements+2.9.14+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+material-top-tabs+7.4.19+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+material-top-tabs+7.4.19+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+native-stack+7.14.5+002+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+native-stack+7.14.5+002+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+native+7.1.33+002+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+native+7.1.33+002+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+routers+7.5.3+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+routers+7.5.3+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+stack+7.8.5+004+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+stack+7.8.5+004+fix-failing-jest-by-disabling-esmodule.patch)

- Reason: Necessary to run Jest with the obligatory `--experimental-vm-modules` flag. Currently we transpile all the code to `commonjs`, but Jest looks up to individual `package.jsons` to see whether the package is `commonjs` or `ESModule`. That causes a conflict, which can be solved by removing `{"type":"module"}` from `lib/module/package.json`. This might be an issue with Jest, but it would require much more investigation. More: https://github.com/react-navigation/react-navigation/issues/12637
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/issues/12637
- E/App issue: [#62850](https://github.com/Expensify/App/issues/62850)
- PR Introducing Patch: [#64155](https://github.com/Expensify/App/pull/64155)
- PR Updating Patch: N/A

### [@react-navigation+core+7.16.1+001+platform-navigation-stack-types.patch](@react-navigation+core+7.16.1+001+platform-navigation-stack-types.patch)

- Reason: Enables passing custom `ScreenOptions` and adjusts typing to have everything fully type-checked and make sure only the proper (common) platform-specific options are passed
- Upstream PR/issue: N/A
- E/App issue: [#29948](https://github.com/Expensify/App/issues/29948)
- PR Introducing Patch: [#37891](https://github.com/Expensify/App/pull/37891)
- PR Updating Patch: [#64155](https://github.com/Expensify/App/pull/64155)

### [@react-navigation+core+7.16.1+003+propagate-beforeremove-on-nested-reset.patch](@react-navigation+core+7.16.1+003+propagate-beforeremove-on-nested-reset.patch)

- Reason: Browser back on web dispatches a root-targeted `RESET` that keeps route keys and only changes nested state, silently bypassing `usePreventRemove`/`beforeRemove` and losing unsaved data. The patch propagates the check into nested navigators.
- Upstream PR: https://github.com/react-navigation/react-navigation/pull/13153
- Upstream issue: https://github.com/react-navigation/react-navigation/issues/9031
- E/App issue: [#84246](https://github.com/Expensify/App/issues/84246)
- PR Introducing Patch: [#93268](https://github.com/Expensify/App/pull/93268)
- PR Updating Patch: N/A

### [@react-navigation+native-stack+7.14.5+001+added-interaction-manager-integration.patch](@react-navigation+native-stack+7.14.5+001+added-interaction-manager-integration.patch)

- Reason: Adds `InteractionManager` implementation to `@react-navigation/native-stack`
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/11887 (closed/declined upstream; we re-implement it). Still required on v7 — `runAfterInteractions` is used across the app and relies on this. Removing it is gated on migrating those consumers to `navigation.addListener('transitionEnd', ...)`, tracked in [#71913](https://github.com/Expensify/App/issues/71913). That migration works on v7 today and is not a v8-only task — v8 just forces it, since RN deprecated `InteractionManager` in 0.82+.
- E/App issue: [#29948](https://github.com/Expensify/App/issues/29948)
- PR Introducing Patch: [#37891](https://github.com/Expensify/App/pull/37891)
- PR Updating Patch: [#64155](https://github.com/Expensify/App/pull/64155) 

### [@react-navigation+native+7.1.33+001+initial.patch](@react-navigation+native+7.1.33+001+initial.patch)

- Reason: Allows us to use some more advanced navigation actions without messing up the browser history
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/12751 (`route.history` + `pushParams`, added upstream for this use case); originating issue https://github.com/react-navigation/react-navigation/issues/12460. On the v8 upgrade, evaluate adopting `pushParams` to shrink this patch.
- E/App issue: [#21356](https://github.com/Expensify/App/issues/21356)
- PR Introducing Patch: [#24165](https://github.com/Expensify/App/pull/24165)
- PR Updating Patch: [#32087](https://github.com/Expensify/App/pull/32087) [#42465](https://github.com/Expensify/App/pull/42465) [#64155](https://github.com/Expensify/App/pull/64155)

### [@react-navigation+stack+7.8.5+001+edge-drag-gesture.patch](@react-navigation+stack+7.8.5+001+edge-drag-gesture.patch)

- Reason: Adds `edgeDragGestureMonitor` implementation
- Upstream PR/issue: N/A
- E/App issue: [#15849](https://github.com/Expensify/App/issues/15849)
- PR Introducing Patch: [#18402](https://github.com/Expensify/App/pull/18402)
- PR Updating Patch: [#22678](https://github.com/Expensify/App/pull/22678) [#22437](https://github.com/Expensify/App/pull/22437) [#64155](https://github.com/Expensify/App/pull/64155)

### [@react-navigation+stack+7.8.5+002+dontDetachScreen.patch](@react-navigation+stack+7.8.5+002+dontDetachScreen.patch)
- Reason: Prevents the second screen in the stack from being detached too early.  
  Additionally, setting `zIndex: Platform.OS === 'web' ? 'auto' : undefined` helps avoid issues in Safari where the home screen might be hidden due to `overflow: hidden`.
- Upstream PR/issue: N/A
- E/App issue: [#22372](https://github.com/Expensify/App/issues/22372)
- PR Introducing Patch: [#22437](https://github.com/Expensify/App/pull/22437)
- PR Updating Patch: [#33280](https://github.com/Expensify/App/pull/33280) [#37421](https://github.com/Expensify/App/pull/37421) [#49539](https://github.com/Expensify/App/pull/49539) [#64155](https://github.com/Expensify/App/pull/64155) [#65119](https://github.com/Expensify/App/issues/65119)
- Note: Not fully covered by the public `detachPreviousScreen` option (this also forces `activityState`). v8 replaces `detachInactiveScreens`/`detachPreviousScreen`/`freezeOnBlur` with a single `inactiveBehavior` option — re-evaluate this patch then.

### [@react-navigation+native+7.1.33+003+increase-history-go-popstate-fallback-timeout.patch](@react-navigation+native+7.1.33+003+increase-history-go-popstate-fallback-timeout.patch)

- Reason:

    ```
    createMemoryHistory.go() waits for the browser's popstate after history.go(n) but gives up
    after a 100ms fallback timer and deletes its pending record of the traversal. Firefox can
    take 500ms+ to deliver the popstate when the main thread is busy (e.g. rendering the newly
    created group chat report). Once the record is deleted, the late popstate is misclassified
    by listen() as a user-initiated back/forward navigation and react-navigation resets state
    to the previous route. Raising the timeout to 1000ms keeps the pending record alive until
    the traversal actually settles. Fixes group/DM creation not opening the new report on
    Firefox (#94571).
    ```

- Upstream PR/issue: TODO — file against react-navigation (createMemoryHistory.tsx has the same 100ms timeout upstream)
- E/App issue: [#94571](https://github.com/Expensify/App/issues/94571) + TODO — patch-tracking issue via [NewPatchTemplate](../../.github/ISSUE_TEMPLATE/NewPatchTemplate.md)
- PR Introducing Patch: TODO — this PR
