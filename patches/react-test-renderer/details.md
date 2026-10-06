# `react-test-renderer` patches

### [react-test-renderer+19.2.3+001+run-insertion-effect-cleanup-in-hidden-subtree.patch](react-test-renderer+19.2.3+001+run-insertion-effect-cleanup-in-hidden-subtree.patch)

- Reason: Same change as `react-native+0.86.0+044+run-insertion-effect-cleanup-in-hidden-subtree.patch`. `@testing-library/react-native` renders through `react-test-renderer`, whose 19.2.3 build is compiled with `enableHiddenSubtreeInsertionEffectCleanup` set to `false` like Fabric, so without this patch jest would keep skipping the `useInsertionEffect` cleanup of a component removed inside a hidden `<Activity>` while the patched runtime runs it. The patch drops the `offscreenSubtreeWasHidden` guard in front of the insertion cleanup in `commitDeletionEffectsOnFiber` of the development and production builds.
- Upstream PR/issue: fix behind the flag in https://github.com/facebook/react/pull/30954, flag removed in https://github.com/facebook/react/pull/35918. React 19.3 runs the cleanup unconditionally; drop this patch together with the react-native one.
- E/App issue: https://github.com/Expensify/App/issues/98254
- PR introducing patch: https://github.com/Expensify/App/pull/101577
