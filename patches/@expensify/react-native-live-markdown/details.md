# `@expensify/react-native-live-markdown` patches

### [@expensify+react-native-live-markdown+0.1.336+001+worklets-0.12-runSync.patch](@expensify+react-native-live-markdown+0.1.336+001+worklets-0.12-runSync.patch)

- Reason:

    ```
    react-native-worklets 0.12.0 removed the deprecated `WorkletRuntime::runGuarded` C++ API, so the native
    Markdown parser no longer compiles against worklets 0.13 (Android `MarkdownParser.cpp` and iOS
    `MarkdownParser.mm`). In worklets 0.11 `runGuarded` was only a deprecated alias of `runSync`, so this patch
    calls `runSync` directly, which works on both worklets 0.11 and 0.13.
    ```

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/101440
- PR introducing patch: 🛑
