# `@types/react-native-web` patches

### [@types+react-native-web+0.19.2+001+align-with-RN-types.patch](@types+react-native-web+0.19.2+001+align-with-RN-types.patch)

- Reason:

    ```
    Aligns @types/react-native-web type definitions with React Native 0.83 types.
    1. Extends `accessibilityRole` to include all roles defined in RN 0.83 (e.g. checkbox, switch, radio, menu, tab, etc.) instead of the limited subset (button, header, heading, label, link, listitem, none, text).
    2. Adds `userSelect` with 'contain' value support to `WebStyle`, matching the web implementation of React Native's style system.
    ```

- Upstream PR/issue: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/74673
- E/App issue: https://github.com/Expensify/App/issues/75120
- PR introducing patch: https://github.com/Expensify/App/pull/79962
