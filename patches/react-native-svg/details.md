# `react-native-svg` patches

### [react-native-svg+15.15.5+001+web-defs-children.patch](react-native-svg+15.15.5+001+web-defs-children.patch)

- Reason:

    ```
    `Defs`'s web declaration (elements.web.d.ts) extends bare `WebShape` (defaulting to
    `BaseProps`, with no `children`), unlike every other element in the same file (e.g. `G`,
    `Mask`, `Symbol`) which pass `BaseProps & <ElementProps>`, and unlike `Defs`'s own native
    declaration (elements/Defs.d.ts), which extends `Component<React.PropsWithChildren>`. With
    App's web TypeScript program using `moduleSuffixes: [".web", ""]`, `<Defs>{children}</Defs>`
    usages (e.g. wrapping a `<Filter>`) now resolve against the web declaration and fail to
    compile without an unsafe local cast. This patch adds `children` to `Defs`'s web props,
    matching its native declaration and its sibling elements in the same file.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-svg/pull/3056
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/99495
