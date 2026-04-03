# `expo-video` patches

### [expo-video+55.0.3+001+catch_play_abort_error.patch](expo-video+55.0.3+001+catch_play_abort_error.patch)

- Reason: When rapidly seeking a video via the progress bar on web, `HTMLVideoElement.play()` returns a Promise that gets rejected with `AbortError` if `pause()` is called before it resolves. This patch wraps all 5 `video.play()` call sites in `VideoPlayer.web.js` with `.catch()` to silently swallow `AbortError` while re-throwing any other errors. This is the [standard fix recommended by Chrome](https://developer.chrome.com/blog/play-request-was-interrupted).
