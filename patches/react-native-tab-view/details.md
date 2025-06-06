# `react-native-tab-view` patches

### [react-native-tab-view+4.1.0+001+fix-tab-animation.patch](react-native-tab-view+4.1.0+001+fix-tab-animation.patch)

- Reason: 

    ```
    This patch addresses an issue where the camera in IOURequestStepScan fails to render due to the current position value
    from react-native-tab-view not updating during tab transitions. It explicitly trigger a re-render when the active tab or page changes.
    ```

- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [#39854](https://github.com/Expensify/App/pull/39854)
