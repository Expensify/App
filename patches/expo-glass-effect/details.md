# `expo-glass-effect` patches

### [expo-glass-effect+57.0.4+001+app-switcher-snapshot-tint.patch](expo-glass-effect+57.0.4+001+app-switcher-snapshot-tint.patch)

- Reason:

    ```
    On iOS 26 and newer, UIKit draws a tinted `UIGlassEffect` without its tint in the app switcher snapshot, so the
    green liquid glass camera button showed up gray on the app's card. The patch adds a solid view in the tint color
    (at full opacity, with the view's border radius) above the glass. It is shown on
    `UIApplication.didEnterBackgroundNotification`, before iOS takes the snapshot, and hidden on
    `UIApplication.willEnterForegroundNotification`, before the app is visible again. It is not shown while the app
    is only inactive (Control Center, Notification Center, system alerts, Face ID), so the glass stays as it is there.
    Views without a tint color are left unchanged.
    ```

- Upstream PR/issue: 🛑, upstream issue to be opened.
- E/App issue: https://github.com/Expensify/App/issues/107214
- PR introducing patch: https://github.com/Expensify/App/pull/107284
