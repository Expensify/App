# `expo-video` patches

### [expo-video+57.0.2+001+catch_play_abort_error.patch](expo-video+57.0.2+001+catch_play_abort_error.patch)

- Reason: When rapidly seeking a video via the progress bar on web, `HTMLVideoElement.play()` returns a Promise that gets rejected with `AbortError` if `pause()` is called before it resolves. This patch wraps all 5 `video.play()` call sites in `VideoPlayer.web.js` with `.catch()` to silently swallow `AbortError` while re-throwing any other errors. This is the [standard fix recommended by Chrome](https://developer.chrome.com/blog/play-request-was-interrupted).

### [expo-video+57.0.2+002+web-videoview-types.patch](expo-video+57.0.2+002+web-videoview-types.patch)

- Reason:

    ```
    The web `VideoView` declaration types its ref as `unknown` and only exports `VideoView` as a value, while native
    exports a class. Its `player` prop is also typed as the web implementation class instead of the public
    `VideoPlayer` type that `useVideoPlayer` returns. The patch types the ref handle the way the web implementation
    builds it (`enterFullscreen`, `exitFullscreen`, `startPictureInPicture`, `stopPictureInPicture`, `nativeRef`),
    exports it as the `VideoView` type, and accepts the public `VideoPlayer` type for `player`.
    ```

- Upstream PR/issue: 🛑, upstream PR to be opened.
- E/App issue: https://github.com/Expensify/App/issues/99287
- PR introducing patch: https://github.com/Expensify/App/pull/105816
