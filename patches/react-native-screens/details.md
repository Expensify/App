# `react-native-screens` patches

### [react-native-screens+4.15.4+001+low-priority-freeze.patch](react-native-screens+4.15.4+001+low-priority-freeze.patch)

- Reason: Wraps the freeze state update in `startTransition` so it is treated as a low-priority update. Without this, the Suspense boundary used by react-freeze can starve pending macrotasks (setTimeout, rAF), blocking queued callbacks from firing.
- Upstream PR/issue: N/A
- E/App issue: https://github.com/Expensify/App/issues/33725
- PR introducing patch: https://github.com/Expensify/App/pull/82764
