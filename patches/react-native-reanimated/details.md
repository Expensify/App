
# `react-native-reanimated` patches

### [react-native-reanimated+3.19.1+001+catch-all-exceptions-on-stoi.patch](react-native-reanimated+3.19.1+001+catch-all-exceptions-on-stoi.patch)

- Reason: Reanimated wasn't able to catch an exception here, so the catch clause was broadened.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [Upgrade to React Native 0.76](https://github.com/Expensify/App/pull/51475)

### [react-native-reanimated+3.19.1+002+dontWhitelistTextProp.patch](react-native-reanimated+3.19.1+002+dontWhitelistTextProp.patch)

- Reason: In Expensify `text` prop in a JS prop and not in native code. Recheck if this is still needed when migrating to v4.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch:  [NR 0.75 upgrade](https://github.com/Expensify/App/pull/45289)

### [react-native-reanimated+3.19.1+003+correctly-handle-Easing.bezier.patch](react-native-reanimated+3.19.1+003+correctly-handle-Easing.bezier.patch)

- Reason: The Easing.bezier animation doesn't work on web
- Upstream PR/issue: https://github.com/software-mansion/react-native-reanimated/pull/8049
- E/App issue: https://github.com/Expensify/App/pull/63623
- PR Introducing Patch:  🛑

