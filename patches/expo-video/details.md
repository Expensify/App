# `expo-video` patches

### [expo-video+3.0.11+001+comment-jsLogger.patch](expo-video+3.0.11+001+comment-jsLogger.patch)

- Reason:

    ```
    This patch comments '.jsLogger' usages until Expo modules core is updated, it is needed, because expo-video android build breaks when Expo is in version 53.
    ```

- Upstream PR/issue: To be removed in Expo SDK 54 update
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/66793

### [expo-video+3.0.12+001+prevent_double_pause](expo-video+3.0.12+001+prevent_double_pause)

- Reason:

    ```
    This patch edits the onPause eventListener in expo-video's videoPlayer. It still pauses all mounted videos, but now excludes the video that invoked the listener, preventing it from being paused twice.
    ```

- Upstream PR/issue: https://github.com/expo/expo/issues/40743
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/66793
