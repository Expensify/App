# `@react-navigation` patches

### @react-navigation+package-name+7+fix-failing-jest-by-disabling-esmodule.patch
#### [@react-navigation+core+7.10.0+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+core+7.10.0+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+elements+2.4.3+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+elements+2.4.3+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+material-top-tabs+7.2.13+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+material-top-tabs+7.2.13+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+native-stack+7.3.14+002+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+native-stack+7.3.14+002+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+native+7.1.10+002+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+native+7.1.10+002+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+routers+7.4.0+001+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+routers+7.4.0+001+fix-failing-jest-by-disabling-esmodule.patch)
#### [@react-navigation+stack+7.3.3+004+fix-failing-jest-by-disabling-esmodule.patch](@react-navigation+stack+7.3.3+004+fix-failing-jest-by-disabling-esmodule.patch)

- Reason: Necessary to run Jest with the obligatory `--experimental-vm-modules` flag. Currently we transpile all the code to `commonjs`, but Jest looks up to individual `package.jsons` to see whether the package is `commonjs` or `ESModule`. That causes a conflict, which can be solved by removing `{"type":"module"}` from `lib/module/package.json`. This might be an issue with Jest, but it would require much more investigation. More: https://github.com/react-navigation/react-navigation/issues/12637
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/issues/12637
- E/App issue: [#62850](https://github.com/Expensify/App/issues/62850)
- PR Introducing Patch: [#64155](https://github.com/Expensify/App/pull/64155)
- PR Updating Patch: N/A

### [@react-navigation+core+7.10.0+001+platform-navigation-stack-types.patch](@react-navigation+core+7.10.0+001+platform-navigation-stack-types.patch)

- Reason: Enables passing custom `ScreenOptions` and adjusts typing to have everything fully type-checked and make sure only the proper (common) platform-specific options are passed
- Upstream PR/issue: N/A
- E/App issue: [#29948](https://github.com/Expensify/App/issues/29948)
- PR Introducing Patch: [#37891](https://github.com/Expensify/App/pull/37891)
- PR Updating Patch: [#64155](https://github.com/Expensify/App/pull/64155)

### [@react-navigation+core+7.10.0+002+fix-crash-when-parsing-emoji.patch](@react-navigation+core+7.10.0+002+fix-crash-when-parsing-emoji.patch)

- Reason: App crashes when the path contains emoji
- Upstream PR/issue: https://www.github.com/react-navigation/react-navigation/pull/12679
- E/App issue: [#65709](https://github.com/Expensify/App/issues/65709)
- PR Introducing Patch: [#65836](https://github.com/Expensify/App/pull/65836)
- PR Updating Patch: N/A

### [@react-navigation+native-stack+7.3.14+001+added-interaction-manager-integration.patch](@react-navigation+native-stack+7.3.14+001+added-interaction-manager-integration.patch)

- Reason: Adds `InteractionManager` implementation to `@react-navigation/native-stack`
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/11887
- E/App issue: [#29948](https://github.com/Expensify/App/issues/29948)
- PR Introducing Patch: [#37891](https://github.com/Expensify/App/pull/37891)
- PR Updating Patch: [#64155](https://github.com/Expensify/App/pull/64155) 

### [@react-navigation+native+7.1.10+001+initial.patch](@react-navigation+native+7.1.10+001+initial.patch)

- Reason: Allows us to use some more advanced navigation actions without messing up the browser history
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/11887
- E/App issue: [#21356](https://github.com/Expensify/App/issues/21356)
- PR Introducing Patch: [#24165](https://github.com/Expensify/App/pull/24165)
- PR Updating Patch: [#32087](https://github.com/Expensify/App/pull/32087) [#42465](https://github.com/Expensify/App/pull/42465) [#64155](https://github.com/Expensify/App/pull/64155)

### [@react-navigation+stack+7.3.3+001+edge-drag-gesture.patch](@react-navigation+stack+7.3.3+001+edge-drag-gesture.patch)

- Reason: Adds `edgeDragGestureMonitor` implementation
- Upstream PR/issue: N/A
- E/App issue: [#15849](https://github.com/Expensify/App/issues/15849)
- PR Introducing Patch: [#18402](https://github.com/Expensify/App/pull/18402)
- PR Updating Patch: [#22678](https://github.com/Expensify/App/pull/22678) [#22437](https://github.com/Expensify/App/pull/22437) [#64155](https://github.com/Expensify/App/pull/64155)

### [@react-navigation+stack+7.3.3+002+dontDetachScreen.patch](@react-navigation+stack+7.3.3+002+dontDetachScreen.patch)
- Reason: Prevents the second screen in the stack from being detached too early.  
  Additionally, setting `zIndex: Platform.OS === 'web' ? 'auto' : undefined` helps avoid issues in Safari where the home screen might be hidden due to `overflow: hidden`.
- Upstream PR/issue: N/A
- E/App issue: [#22372](https://github.com/Expensify/App/issues/22372)
- PR Introducing Patch: [#22437](https://github.com/Expensify/App/pull/22437)
- PR Updating Patch: [#33280](https://github.com/Expensify/App/pull/33280) [#37421](https://github.com/Expensify/App/pull/37421) [#49539](https://github.com/Expensify/App/pull/49539) [#64155](https://github.com/Expensify/App/pull/64155) [#65119](https://github.com/Expensify/App/issues/65119)

### [@react-navigation+core+7.10.0+002+getStateFromPath.patch](@react-navigation+core+7.10.0+002+getStateFromPath.patch)
- Reason: Make sure navigation state props retrieved from the path are available at all nesting levels to avoid undefined state.
- Upstream PR/issue: N/A
- E/App issue: [#48150](https://github.com/Expensify/App/issues/48150)
- PR Introducing Patch: [#48151](https://github.com/Expensify/App/pull/48151)
- PR Updating Patch: [#64155](https://github.com/Expensify/App/pull/64155)

### [@react-navigation+core+7.10.0+003+fix-clearing-preloaded-routes-after-logout.patch](@react-navigation+core+7.10.0+003+fix-clearing-preloaded-routes-after-logout.patch)
- Reason: Clear preloaded routes from state that are not available after logging out.
- Upstream PR/issue: N/A
- E/App issue: [#65709](https://github.com/Expensify/App/issues/65211)
- PR Introducing Patch: [#65836](https://github.com/Expensify/App/pull/66890)
- PR Updating Patch: N/A