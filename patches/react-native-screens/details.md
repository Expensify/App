# `react-native-screens` patches

### [react-native-screens+4.15.4+001+delay-freeze-until-paint.patch](react-native-screens+4.15.4+001+delay-freeze-until-paint.patch)

- Reason: Delays `DelayedFreeze` before freezing a screen. On iOS (Fabric), freezing a screen while an animation is still in flight (e.g. a popover closing or a swipe-back gesture finishing) blocks React rendering and can cause the app to become unresponsive.
- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/82764
