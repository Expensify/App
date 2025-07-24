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

### [react-native-tab-view+4.1.0+002+fix-glitching-on-initial-load.patch](react-native-tab-view+4.1.0+002+fix-glitching-on-initial-load.patch)

- Reason: 
    ```
    There was a visible glitching on initial load. The glitch was visible because two animated values:
    position and translateX were equal to 0 for a brief moment before changing to a proper value.
    ```
- Upstream PR/issue: https://github.com/react-navigation/react-navigation/pull/12627#issuecomment-2945055209
- E/App issue: https://github.com/Expensify/App/issues/62346
- PR Introducing Patch: [#63570](https://github.com/Expensify/App/pull/63570)