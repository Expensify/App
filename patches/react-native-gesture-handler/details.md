# `react-native-gesture-handler` patches

### [react-native-gesture-handler+2.32.0+001+web-gesture-state-manager-type.patch](react-native-gesture-handler+2.32.0+001+web-gesture-state-manager-type.patch)

- Reason:

    ```
    `gestureStateManager.web.d.ts` imported `GestureStateManagerType` from `'./gestureStateManager'`
    instead of declaring it locally. With App's web TypeScript program using
    `moduleSuffixes: [".web", ""]`, that bare specifier resolves back to
    `gestureStateManager.web.d.ts` itself (the file importing it), so the type was an
    unresolvable circular self-reference and silently degraded to `any` — even for the file's
    own `GestureStateManager.create()` return type. Every `on*` gesture callback's second
    (`stateManager`) parameter is typed via this alias (see `gesture.d.ts`), so `state.activate()` /
    `state.fail()` calls in `usePanGesture`, `usePinchGesture`, and `useTapGestures` were flagged
    by `@typescript-eslint/no-unsafe-call`/`no-unsafe-member-access` as calls on an unresolved
    type. This patch declares `GestureStateManagerType` locally in the web file (matching the
    shape already declared in the native `gestureStateManager.d.ts`) instead of re-importing it.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-gesture-handler/pull/4508
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/99495
