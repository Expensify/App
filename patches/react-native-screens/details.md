# `react-native-screens` patches

### [react-native-screens+4.28.0+001+fix-fragment-already-added-in-screenstack-onupdate.patch](react-native-screens+4.28.0+001+fix-fragment-already-added-in-screenstack-onupdate.patch)

- Reason:

    ```
    This patch fixes a fatal Android crash (java.lang.IllegalStateException: Fragment already added: ScreenStackFragment) in ScreenStack.onUpdate.

    When re-attaching screens from visibleBottom upward, onUpdate adds every fragment without checking whether it is already attached. If the screen under a translucent modal (for example, the AI features promo modal) is detached while the modal stays attached, the modal is added twice in the same transaction and the commit throws. The patch removes an already attached fragment before re-adding it, so it is re-appended in stack order and the translucent top stays on top.

    The skip-only guard proposed upstream stops the crash but leaves the modal hidden behind the re-added screen. Remove this patch once upstream ships a fix that keeps the draw order.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-screens/issues/4156, https://github.com/software-mansion/react-native-screens/pull/4157
- E/App issue: https://github.com/Expensify/App/issues/102046
- PR introducing patch: https://github.com/Expensify/App/pull/103126
