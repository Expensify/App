# `react-native-onyx` patches

### [react-native-onyx+3.0.61.patch](react-native-onyx+3.0.61.patch)

- Reason: Onyx v3.0.59 ([PR #756](https://github.com/Expensify/react-native-onyx/pull/756)) added a state reset inside the `subscribe` callback of `useOnyx` to fix stale data when keys change dynamically. However, this reset runs unconditionally — including on initial mount — which causes `useSyncExternalStore` to see a new snapshot reference after subscription, triggering one extra render per `useOnyx` hook. This patch guards the reset with a `hasMountedRef` flag so it only runs on key-change re-subscriptions, not on initial mount.
- E/App issue: https://github.com/Expensify/App/issues/85416
- Upstream PR/issue: N/A
