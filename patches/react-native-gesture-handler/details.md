# `react-native-gesture-handler` patches

### [react-native-gesture-handler+3.5.0+001+web-v3-component-types.patch](react-native-gesture-handler+3.5.0+001+web-v3-component-types.patch)

- Reason:

    ```
    On native, `v3/components/GestureComponents.d.ts` exports `TextInput` and `FlatList` both as values and as types,
    and `FlatList` takes a `ref`. The web declarations only export the values and leave `ref` out of `FlatList`, so
    `useRef<TextInput>` and `<FlatList ref={…}>` stop compiling once the web tsconfig resolves `.web.d.ts` files.
    The web `FlatList` spreads its props onto React Native's `FlatList`, so the ref already works at runtime.
    The patch adds the matching type exports and the `ref` prop.
    ```

- Upstream PR/issue: 🛑, upstream PR to be opened.
- E/App issue: https://github.com/Expensify/App/issues/99287
- PR introducing patch: https://github.com/Expensify/App/pull/105816
