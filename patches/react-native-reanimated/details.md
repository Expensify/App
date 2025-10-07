
# `react-native-reanimated` patches

### [react-native-reanimated+3.19.2+001+catch-all-exceptions-on-stoi.patch](react-native-reanimated+3.19.2+001+catch-all-exceptions-on-stoi.patch)

- Reason: Reanimated wasn't able to catch an exception here, so the catch clause was broadened.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [Upgrade to React Native 0.76](https://github.com/Expensify/App/pull/51475)

### [react-native-reanimated+3.19.2+002+dontWhitelistTextProp.patch](react-native-reanimated+3.19.2+002+dontWhitelistTextProp.patch)

- Reason: In Expensify `text` prop in a JS prop and not in native code. Recheck if this is still needed when migrating to v4.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch:  [NR 0.75 upgrade](https://github.com/Expensify/App/pull/45289)

### [react-native-reanimated+3.19.2+003+reduce-motion-animation-callbacks.patch](react-native-reanimated+3.19.2+003+reduce-motion-animation-callbacks.patch)

- Reason: The layout animation callbacks were not called when Reduce Motion accessibility setting was enabled on mobile devices (on native apps). This caused the app to be unresponsive after opening a modal.
- Upstream PR/issue: https://github.com/software-mansion/react-native-reanimated/pull/8142
- E/App issue: https://github.com/Expensify/App/issues/69190
- PR Introducing Patch: https://github.com/Expensify/App/pull/69444
