# `react-native-screens` patches

### [react-native-screens+4.15.4+001+fix-lifecycle-events-in-fragment-host.patch](react-native-screens+4.15.4+001+fix-lifecycle-events-in-fragment-host.patch)

- Reason: In HybridApp, React Native is hosted inside a `ReactNativeFragment`, which causes `ScreenFragment.dispatchViewAnimationEvent()` to silently dismiss lifecycle events for root screen fragments. This prevents `transitionStart`/`transitionEnd` from being emitted, which breaks `TransitionTracker` (`src/libs/Navigation/TransitionTracker.ts`). The fix allows event dispatch when the parent fragment is not a `ScreenFragment`.
- Upstream PR/issue: https://github.com/software-mansion/react-native-screens/pull/3854 — once merged and released, bump the version and remove this patch.
- E/App issue: 🛑
- PR Introducing Patch: https://github.com/Expensify/App/pull/85759
