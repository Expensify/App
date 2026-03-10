# `expo-video` patches

### [expo-video+3.0.12+001+prevent_double_pause.patch](expo-video+3.0.12+001+prevent_double_pause.patch)

- Reason:

    ```
    This patch edits the onPause eventListener in expo-video's videoPlayer. It still pauses all mounted videos, but now excludes the video that invoked the listener, preventing it from being paused twice.
    ```

- Upstream PR/issue: https://github.com/expo/expo/issues/40743
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/66793

### [expo-video+3.0.12+002+catch_play_abort_error.patch](expo-video+3.0.12+002+catch_play_abort_error.patch)

- Reason:

    ```
    Wraps all 5 HTMLVideoElement.play() calls in VideoPlayer.web.js with .catch() to silently swallow AbortError. When users rapidly seek the video progress bar, pause() can interrupt a pending play() Promise, causing an unhandled AbortError rejection in the console. This is the standard fix recommended by Chrome's documentation (https://developer.chrome.com/blog/play-request-was-interrupted).
    ```

- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/84294
- PR Introducing Patch: TBD
