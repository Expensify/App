
# `react-native-reanimated` patches

### [react-native-reanimated+4.1.5+001+catch-all-exceptions-on-stoi.patch](react-native-reanimated+4.1.5+001+catch-all-exceptions-on-stoi.patch)

- Reason: Reanimated wasn't able to catch an exception here, so the catch clause was broadened.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [Upgrade to React Native 0.76](https://github.com/Expensify/App/pull/51475)