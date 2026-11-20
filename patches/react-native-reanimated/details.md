# `react-native-reanimated` patches

### [react-native-reanimated+4.7.0+001+preserve-css-animations-during-exiting.patch](react-native-reanimated+4.7.0+001+preserve-css-animations-during-exiting.patch)

- Reason:

    ```
    On web, an `exiting` layout animation moves the children of the exiting view into a copy of the view. Moving an element restarts its CSS animations, so the children's running CSS animations restarted from their first keyframe, finished animations replayed, and a child's animation ending ended the exiting animation early.

    This patch keeps the children's CSS animations going through the move, and ignores animation events from descendants. LoadingBar needs it to fade out with an `exiting` animation while its CSS-animated indicator keeps moving.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-reanimated/pull/11091, https://github.com/software-mansion/react-native-reanimated/issues/11089
- E/App issue: https://github.com/Expensify/App/issues/104799
- PR introducing patch: https://github.com/Expensify/App/pull/105098

### [react-native-reanimated+4.7.0+002+start-exiting-from-current-values.patch](react-native-reanimated+4.7.0+002+start-exiting-from-current-values.patch)

- Reason:

    ```
    When a view unmounts while its `entering` animation is still running, its `exiting` animation starts from its initial values. A view fading in with `FadeIn` jumped to full opacity before `FadeOut` faded it out, on iOS, Android and web.

    This patch starts the properties that the interrupted animation drives from their current values: all of them on iOS and Android, and `opacity` on web. LoadingBar needs it to fade in and out on one view, because a bar hidden during its fade-in would otherwise flash to full opacity first.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-reanimated/pull/11093, https://github.com/software-mansion/react-native-reanimated/issues/11092
- E/App issue: https://github.com/Expensify/App/issues/104799
- PR introducing patch: https://github.com/Expensify/App/pull/105098

### [react-native-reanimated+4.7.0+003+preserve-native-css-animations-during-exiting.patch](react-native-reanimated+4.7.0+003+preserve-native-css-animations-during-exiting.patch)

- Reason:

    ```
    A CSS-animated descendant freezes on native when an ancestor unmounts with an exiting layout animation. Retain its animation registries and tag-owned layout snapshot until the native mounting proxy releases the view, and forward CSS updates through that proxy during the exit.

    Backported from the reproduction's Reanimated 4.7.1 patch to App's pinned 4.7.0. The terminal-state guard uses ExitingState::DELETED: DEAD views can still be mounted while awaiting structural cleanup. Both native mounting proxies are updated. Patches 001 and 002 remain necessary.

    Limitation: retained-tree batches requiring structural changes (such as reordering or flattening) are skipped without advancing their snapshot. Native compilation and runtime verification remain required before merging.
    ```

- Upstream PR/issue: Not submitted yet; the author requested review before upstream submission: https://github.com/Expensify/App/issues/104799#issuecomment-7048341552. Source patch: https://github.com/thelullabyy/-reanimated-issue/blob/f2cdb4ac18cb6663b1a77c4c04117b7bbe00e97d/patches/react-native-reanimated%2B4.7.1%2Bpreserve-css-during-native-exit.patch#L1
- E/App issue: https://github.com/Expensify/App/issues/104799
- PR introducing patch: Replacement PR for https://github.com/Expensify/App/pull/105098
