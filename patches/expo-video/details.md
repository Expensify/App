# `expo-video` patches

### [expo-video+55.0.3+001+catch_play_abort_error.patch](expo-video+55.0.3+001+catch_play_abort_error.patch)

- Reason: When rapidly seeking a video via the progress bar on web, `HTMLVideoElement.play()` returns a Promise that gets rejected with `AbortError` if `pause()` is called before it resolves. This patch wraps all 5 `video.play()` call sites in `VideoPlayer.web.js` with `.catch()` to silently swallow `AbortError` while re-throwing any other errors. This is the [standard fix recommended by Chrome](https://developer.chrome.com/blog/play-request-was-interrupted).

### [expo-video+55.0.3+002+fix_settings_popup_position_in_fullscreen.patch](expo-video+55.0.3+002+fix_settings_popup_position_in_fullscreen.patch)

- **Issue**: Android fullscreen video player — opening the Speed/Audio settings popup after the video has ended (`STATE_ENDED`) causes the popup to overlap the playback controls bar. During playback the popup is correctly positioned above the controls.
- **Root cause**: When Media3's `Player.STATE_ENDED` is reached, the controller layout changes (play button becomes a replay button, progress bar stops auto-hiding). The settings popup's `PopupWindow` is anchored against the gear button and the controller's current measurements, but those measurements are not always re-laid-out immediately after the state change. The next `showAsDropDown()` call uses a stale anchor position, causing the popup to overlap the controls.
- **Fix**: Attach a `Player.Listener` that calls `playerView.requestLayout()` (posted to the view's message queue) when `STATE_ENDED` is reached. This forces a fresh measure/layout pass of the `PlayerView` so the gear button anchor view and controller dimensions are current when the popup is next opened. The `post()` wrapper ensures the request runs after any pending layout updates.
- **Fixes**: Expensify/App#91216
