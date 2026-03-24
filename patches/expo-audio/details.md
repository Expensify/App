# `expo-audio` patches

### [expo-audio+55.0.4+001+playsInSilentMode.patch](expo-audio+55.0.4+001+playsInSilentMode.patch)

- Reason: `playsInSilentMode` was only supported on iOS. On Android, the property was filtered out in `setAudioModeAsync` and had no effect. This patch adds Android support so apps can respect the device's silent/vibrate mode.
- Upstream PR: https://github.com/expo/expo/pull/43117
