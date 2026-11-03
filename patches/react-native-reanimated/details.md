# `react-native-reanimated` patches

### [react-native-reanimated+4.7.0+001+preserve-css-animations-during-exiting.patch](react-native-reanimated+4.7.0+001+preserve-css-animations-during-exiting.patch)

- Reason:

    ```
    On web, an `exiting` layout animation moves the children of the exiting view into a copy of the view. Moving an element restarts its CSS animations, so the children's running CSS animations restarted from their first keyframe, finished animations replayed, and a child's animation ending ended the exiting animation early.

    This patch keeps the children's CSS animations going through the move, and ignores animation events from descendants. LoadingBar needs it to fade out with an `exiting` animation while its CSS-animated indicator keeps moving.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-reanimated/pull/11091, https://github.com/software-mansion/react-native-reanimated/issues/11089
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/105098

### [react-native-reanimated+4.7.0+002+start-exiting-from-current-values.patch](react-native-reanimated+4.7.0+002+start-exiting-from-current-values.patch)

- Reason:

    ```
    When a view unmounts while its `entering` animation is still running, its `exiting` animation starts from its initial values. A view fading in with `FadeIn` jumped to full opacity before `FadeOut` faded it out, on iOS, Android and web.

    This patch starts the properties that the interrupted animation drives from their current values: all of them on iOS and Android, and `opacity` on web. LoadingBar needs it to fade in and out on one view, because a bar hidden during its fade-in would otherwise flash to full opacity first.
    ```

- Upstream PR/issue: https://github.com/software-mansion/react-native-reanimated/pull/11093, https://github.com/software-mansion/react-native-reanimated/issues/11092
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/105098
