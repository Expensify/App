# `metro` patches

### [metro+0.84.4.patch](metro+0.84.4.patch)

- Reason: `react-native-worklets` 0.10.2 emits worklet bundles into a `react-native-worklets/.worklets` directory that is regenerated on every build. Metro's `DependencyGraph.getOrComputeSha1()` caches file SHA-1s, so it kept serving stale worklet code instead of the freshly generated bundle. The patch short-circuits `getOrComputeSha1()` for any path under `react-native-worklets/.worklets` and returns a unique SHA-1 each time (hashed from `performance.now()`), forcing Metro to always treat those generated files as changed.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [Upgrade react-native-worklets and enable bundle mode](https://github.com/Expensify/App/pull/96078)
