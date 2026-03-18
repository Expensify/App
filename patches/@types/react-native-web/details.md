# `@types/react-native-web` patches

### [@types+react-native-web+0.19.1+001+userSelect-style.patch](@types+react-native-web+0.19.1+001+userSelect-style.patch)

- Reason:

    ```
    The @types/react-native-web type definitions do not include the `userSelect` CSS property in the `WebStyle` interface.
    This patch adds `userSelect` (including the 'contain' value) to allow setting text selection behavior in styles without TypeScript errors.
    ```

- Upstream PR/issue: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/74673
- E/App issue: 🛑 TODO
- PR introducing patch: https://github.com/Expensify/App/pull/84856
