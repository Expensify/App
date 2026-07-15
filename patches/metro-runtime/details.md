# `metro-runtime` patches

### [metro-runtime+0.84.4.patch](metro-runtime+0.84.4.patch)

- Reason: During Fast Refresh, `metro-runtime`'s `HMRClient.inject()` only re-evaluated the updated module on the main JS runtime, so the worklet runtime kept executing stale code after a hot reload. The patch forwards the incoming module `code`/`sourceURL` to `global.__workletsModuleProxy.propagateModuleUpdate()` (when available) before the normal eval, letting `react-native-worklets` update its own copy of the module so worklets pick up HMR changes.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: N/A (patched alongside the react-native-worklets 0.10.2 / react-native-reanimated 4.5.1 bump)
