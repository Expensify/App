
# `react-native-reanimated` patches

### [react-native-reanimated+3.19.0+001+catch-all-exceptions-on-stoi.patch](react-native-reanimated+3.19.0+001+catch-all-exceptions-on-stoi.patch)

- Reason: Reanimated wasn't able to catch an exception here, so the catch clause was broadened.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [Upgrade to React Native 0.76](https://github.com/Expensify/App/pull/51475)

### [react-native-reanimated+3.19.0+002+dontWhitelistTextProp.patch](react-native-reanimated+3.19.0+002+dontWhitelistTextProp.patch)

- Reason: In Expensify `text` prop in a JS prop and not in native code. Recheck if this is still needed when migrating to v4.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch:  [NR 0.75 upgrade](https://github.com/Expensify/App/pull/45289)

### [react-native-reanimated+3.19.0+003+hybrid-app.patch](react-native-reanimated+3.19.0+003+hybrid-app.patch)

- Reason: Fixes IOS build crash due to not finding `package.json`.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [Upgrade to React Native 0.76](https://github.com/Expensify/App/pull/51475)
