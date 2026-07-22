# `@expensify` patches

### [@expensify+react-native-live-markdown+0.1.329+001+clamp-cursor-range-offset.patch](@expensify+react-native-live-markdown+0.1.329+001+clamp-cursor-range-offset.patch)

- Reason:

    ```
    This patch prevents a web crash in live-markdown cursor restoration by clamping Range offsets against the actual DOM node bounds before calling Range.setStart and Range.setEnd.
    ```

- Upstream PR/issue: 🛑 TODO - upstream this fix to `@expensify/react-native-live-markdown` after validating the App PR
- E/App issue: https://github.com/Expensify/App/issues/95347
- PR introducing patch: 🛑 TODO - current PR
