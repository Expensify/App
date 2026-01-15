# `react-native-tab-view` patches

### [react-native-tab-view+4.2.2+001+fix-tab-animation.patch](react-native-tab-view+4.2.2+001+fix-tab-animation.patch)

- Reason: 

    ```
    This patch addresses an issue where the camera in IOURequestStepScan fails to render due to the current position value
    from react-native-tab-view not updating during tab transitions. It explicitly trigger a re-render when the active tab or page changes.
    ```

- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [#39854](https://github.com/Expensify/App/pull/39854)

### [react-native-tab-view+4.2.2+002+fix-web-onTabSelect-on-mount.patch](react-native-tab-view+4.2.2+002+fix-web-onTabSelect-on-mount.patch)

- Reason: 
    ```
    This patch fixes an issue on web where the `onTabSelect` callback was not being called on initial mount.
    This caused problems in scenarios where the initial tab selection needed to trigger input focus logic.
    ```
- Upstream PR/issue: 🛑 (must merge https://github.com/react-navigation/react-navigation/pull/12627 first)
- E/App issue: https://github.com/Expensify/App/issues/71913#issuecomment-3584103273
- PR Introducing Patch: [#76586](https://github.com/Expensify/App/pull/76586)
