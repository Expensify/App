# `victory-native` patches

### [victory-native+41.20.2+001+horizontal-bars.patch](victory-native+41.20.2+001+horizontal-bars.patch)

- Reason:

    ```
    This patch adds support to horizontal bars when rendered in <BarGroup />
    ```

- Upstream PR/issue: Not yet. This is urgent patch with deadline.
- E/App issue: https://github.com/Expensify/Expensify/issues/636601
- PR introducing patch: https://github.com/Expensify/App/pull/91659

### [victory-native+41.20.2+002+explicit-size-headless.patch](victory-native+41.20.2+002+explicit-size-headless.patch)

- Reason:

    ```
    Adds opt-in explicitSize and headless props to CartesianChart and PolarChart so charts
    can render in headless Skia environments (e.g. a Bun CLI for PNG email previews) without
    a React Native layout pass. Patches both src/ (Metro) and dist/ (Bun/Node import).
    Existing in-app callers are unchanged when neither prop is passed.
    ```

- Upstream PR/issue: https://github.com/FormidableLabs/victory-native-xl/pull/657
- E/App issue: https://github.com/Expensify/App/issues/91528
- PR introducing patch: https://github.com/Expensify/App/pull/91836
