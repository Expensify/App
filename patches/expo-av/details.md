# `expo-av` patches

### [expo-av+15.1.7+001+fix-blank-screen-android.patch](expo-av+15.1.7+001+fix-blank-screen-android.patch)

- Reason:
  
    ```
    This patch fixes blank modal after fullscreen video ends on Android.
    ```
  
- Upstream PR/issue: The maintainer of the upstream lib isn't willing to accept fix for the lib because it's going to be replaced by another lib `expo-video`, see comment https://github.com/expo/expo/issues/19039#issuecomment-2688369708
- E/App issue: https://github.com/Expensify/App/issues/53904
- PR introducing patch: https://github.com/Expensify/App/pull/56302


### [expo-av+15.1.7+002+handle-unsupported-videos-ios.patch](expo-av+15.1.7+002+handle-unsupported-videos-ios.patch)

- Reason:
  
    ```
    This patch handles unsupported videos in iOS.
    ```
  
- Upstream PR/issue: Probably same reason as the first patch.
- E/App issue: https://github.com/Expensify/App/issues/52673
- PR introducing patch: https://github.com/Expensify/App/pull/57353