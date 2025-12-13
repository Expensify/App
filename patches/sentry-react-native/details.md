# `@sentry/react-native` patches

### [@sentry+react-native+7.6.0+001.patch](@sentry+react-native+7.6.0+001.patch)

- Reason: Fixes React Native path resolution in the Sentry Ruby script during iOS builds. The original implementation failed to locate `react-native/package.json` in our hybrid app setup. The patch changes the resolution strategy to first try resolving from the installation root (similar to react-native-svg and react-native-reanimated), and falls back to ENV variables with support for both node_modules conventions.
- Upstream PR/issue: N/A (specific to our hybrid app environment)
- E/App issue: N/A
- PR Introducing Patch: https://github.com/Expensify/App/pull/70298

### [@sentry+react-native+7.6.0+002.patch](@sentry+react-native+7.6.0+002.patch)

- Reason: - Reason: Fixes Android crash when setting profilesSampleRate to 1.0. This patch disables Android native Hermes profiler initialization.
- Upstream PR/issue: N/A (specific to our hybrid app environment)
- E/App issue: https://github.com/Expensify/App/issues/75036
- PR Introducing Patch: https://github.com/Expensify/App/pull/77230

