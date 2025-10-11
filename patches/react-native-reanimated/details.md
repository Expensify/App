
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

### [react-native-reanimated+3.19.1+004+reduce-motion-animation-callbacks.patch](react-native-reanimated+3.19.1+004+reduce-motion-animation-callbacks.patch)

- Reason: The layout animation callbacks were not called when Reduce Motion accessibility setting was enabled on mobile devices (on native apps). This caused the app to be unresponsive after opening a modal.
- Upstream PR/issue: https://github.com/software-mansion/react-native-reanimated/pull/8142
- E/App issue: https://github.com/Expensify/App/issues/69190
- PR Introducing Patch: https://github.com/Expensify/App/pull/69444

### [react-native-reanimated+3.19.1+005+fix-broken-slideInUp-animation.patch](react-native-reanimated+3.19.1+005+fix-broken-slideInUp-animation.patch)

- Reason: `SlideInUp` animation is not working correctly with React Native 0.81. The fix is already present in reanimated v4, but has not been backported yet
- Upstream PR/issue: https://github.com/software-mansion/react-native-reanimated/pull/8089
- E/App issue:
- PR Introducing Patch: https://github.com/Expensify/App/pull/69535
