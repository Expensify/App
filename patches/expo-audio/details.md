# `expo-audio` patches

### [expo-audio+1.1.1.patch](expo-audio+1.1.1.patch)

- Reason: `playsInSilentMode` was only supported on iOS. On Android, the property was filtered out in `setAudioModeAsync` and had no effect. This patch adds Android support so apps can respect the device's silent/vibrate mode.
- Upstream PR: https://github.com/expo/expo/pull/43117
