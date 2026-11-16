# `react-native-svg` patches

### [react-native-svg+15.15.5+001+web-defs-children.patch](react-native-svg+15.15.5+001+web-defs-children.patch)

- Reason:

    ```
    The web declaration of `Defs` (`elements.web.d.ts`) extends bare `WebShape`, so it accepts no `children`, unlike
    its native declaration and every other element in the same file. Once the web tsconfig resolves `.web.d.ts`
    files, `<Defs>{children}</Defs>` stops compiling. The patch adds `children` to the web `Defs` props.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-svg/pull/3056 (merged, not released yet). Remove this patch when upgrading past 15.15.5.
- E/App issue: https://github.com/Expensify/App/issues/99287
- PR introducing patch: https://github.com/Expensify/App/pull/105816

### [react-native-svg+15.15.5+002+web-style-prop.patch](react-native-svg+15.15.5+002+web-style-prop.patch)

- Reason:

    ```
    The web `BaseProps` type declares `style?: Iterable<unknown>`, so a plain style object doesn't compile on web.
    The web runtime (`lib/resolve.js`) accepts both a style object and an array, so the type is only too narrow.
    The patch types `style` as `unknown`, which leaves each element's own `style` type in charge.
    ```

- Upstream PR/issue: 🛑, upstream PR to be opened.
- E/App issue: https://github.com/Expensify/App/issues/99287
- PR introducing patch: https://github.com/Expensify/App/pull/105816
