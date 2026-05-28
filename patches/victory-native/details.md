# `victory-native` patches

### [victory-native+41.21.0+002+bun-stubs.patch](victory-native+41.21.0+002+bun-stubs.patch)

- Reason:

    ```
    Drops a tsconfig.json into the installed package so Bun's resolver can remap
    react-native, react-native-reanimated, and react-native-gesture-handler to the
    stubs in server/victory-chart-renderer/stubs/ when loading victory-native for the
    headless chart renderer CLI. Metro ignores tsconfig paths, so the in-app build is
    unaffected.
    ```

- Upstream PR/issue: N/A — Bun-specific wiring for the victory-chart-renderer CLI.
- E/App issue: https://github.com/Expensify/Expensify/issues/91528
- PR introducing patch: https://github.com/Expensify/App/pull/91672
- Remove when: We replace the Bun renderer or victory-native ships a bun export condition.

### [victory-native+41.21.0+001+horizontal-bars.patch](victory-native+41.21.0+001+horizontal-bars.patch)

- Reason:
  
    ```
    This patch adds support to horizontal bars when rendered in <BarGroup />
    ```
  
- Upstream PR/issue: Not yet. This is urgent patch with deadline.
- E/App issue: https://github.com/Expensify/Expensify/issues/636601
- PR introducing patch: https://github.com/Expensify/App/pull/91659
