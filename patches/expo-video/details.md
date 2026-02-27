# `expo-video` patches

### [expo-video+3.0.12+001+prevent_double_pause.patch](expo-video+3.0.12+001+prevent_double_pause.patch)

- Reason:

    ```
    This patch edits the onPause eventListener in expo-video's videoPlayer. It still pauses all mounted videos, but now excludes the video that invoked the listener, preventing it from being paused twice.
    ```

- Upstream PR/issue: https://github.com/expo/expo/issues/40743
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/66793
