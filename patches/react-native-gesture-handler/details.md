# `react-native-gesture-handler` patches

### [react-native-gesture-handler+3.3.0+001+start-hover-on-pointer-move.patch](react-native-gesture-handler+3.3.0+001+start-hover-on-pointer-move.patch)

- Reason:

    ```
    On web the hover gesture begins only on the DOM pointerenter event. The Gesture Handler 3 hook detector attaches
    its listeners in an effect, after paint, so when the view mounts under a pointer that is already there (e.g. quickly
    switching charts in the Insights card), pointerenter fires before the listeners exist and the hover never begins
    until the pointer leaves the view and enters it again. The patch begins the hover on the first pointer move over
    the view when it has not begun yet.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-gesture-handler/pull/4624
- E/App issue: https://github.com/Expensify/App/issues/102782
- PR introducing patch: https://github.com/Expensify/App/pull/103457
