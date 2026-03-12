# `react-native-screens` patches

### [react-native-screens+4.15.4+001+delay-freeze-until-paint.patch](react-native-screens+4.15.4+001+delay-freeze-until-paint.patch)

- Reason: Adds `requestAnimationFrame` to `DelayedFreeze` so the screen freeze is deferred until after the current frame is painted. Without this, screens can be frozen while transitional UI states are still visible, causing a visual flicker.
- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/82764
