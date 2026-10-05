# `expensify-common` patches

### [expensify-common+2.0.207+001+worklets-0.13-str-without-this.patch](expensify-common+2.0.207+001+worklets-0.13-str-without-this.patch)

- Reason:

    ```
    `str.js` is a `'worklet'` file, and `ExpensiMark` calls `Str` methods on the LiveMarkdownRuntime. Several `Str`
    methods call other `Str` methods through `this` (e.g. `sanitizeURL` calls `this.cutBefore`). When the Worklets
    Babel plugin runs without Bundle Mode (our Re.Pack builds), react-native-worklets 0.13 turns every method of the
    `Str` object literal into a separate worklet, because it removed Worklet Context Objects
    (software-mansion/react-native-reanimated#10411). `this` inside those methods no longer points to `Str` on the
    Worklet Runtime, so typing a link in the composer crashed with "undefined is not a function". Referencing `Str`
    from the methods instead does not work either: the plugin builds each method's closure while the object literal is
    still being created, so `Str` is captured as `undefined`, which breaks `Str` on the JS thread too.

    The patch moves the 20 `Str` methods that other `Str` methods call (`cutBefore`, `isString`, `isTypeOf`, ...) to
    module-level functions declared before `Str`, in dependency order, keeps them on `Str` as shorthand properties,
    and replaces every `this.<method>` with a direct call. The public `Str` API and its behavior are unchanged.
    ```

- Upstream PR/issue: 🛑
- E/App issue: https://github.com/Expensify/App/issues/101440
- PR introducing patch: https://github.com/Expensify/App/pull/102266
