# `expo-video` patches

### [expo-video+55.0.3+001+catch_play_abort_error.patch](expo-video+55.0.3+001+catch_play_abort_error.patch)

- Reason: When rapidly seeking a video via the progress bar on web, `HTMLVideoElement.play()` returns a Promise that gets rejected with `AbortError` if `pause()` is called before it resolves. This patch wraps all 5 `video.play()` call sites in `VideoPlayer.web.js` with `.catch()` to silently swallow `AbortError` while re-throwing any other errors. This is the [standard fix recommended by Chrome](https://developer.chrome.com/blog/play-request-was-interrupted).

### [expo-video+55.0.3+002+fix_settings_popup_position_in_fullscreen.patch](expo-video+55.0.3+002+fix_settings_popup_position_in_fullscreen.patch)

- Reason: In Android fullscreen video, opening the Speed/Audio settings popover while the player is active would cause the popover to overlap the playback controls bar and other menu items. The cached popover position is computed against the controller layout at the time the popover was last dismissed, but that layout is stale by the time the popover re-opens. After the video reaches `STATE_ENDED`, the controller layout changes (play button → replay, progress bar stays visible), so the cached position no longer matches. This patch adds a `Player.Listener` on the `PlayerView.player` that forces a controller rebuild on `STATE_ENDED`, which recalculates the popover anchor against the new layout on next open. Fixes issue #91216.
