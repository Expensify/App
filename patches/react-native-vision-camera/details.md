# `react-native-vision-camera` patches

### [react-native-vision-camera+4.6.1.patch](react-native-vision-camera+4.6.1.patch)

- Reason: Fixes an issue in VisionCamera where the `CameraSession` doesn't get de-initialized and recycled when the screen gets popped/unmounted from the Navigation stack in `@react-navigation/native-stack`.
- Upstream PR/issue: N/A (This will be fixed once VisionCamera is migrated to Nitro Views)
- E/App issue: [#49988](https://github.com/Expensify/App/issues/49988) | [#37891](https://github.com/Expensify/App/pull/37891)
- PR Introducing Patch: [#49936](https://github.com/Expensify/App/pull/49936)
- PR Updating Patch: [#52880](https://github.com/Expensify/App/pull/52880) | [#55861](https://github.com/Expensify/App/pull/55861)
