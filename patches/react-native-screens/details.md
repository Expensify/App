# `react-native-screens` patches

### [react-native-screens+4.28.0+002+fix-push-same-view-controller-twice.patch](react-native-screens+4.28.0+002+fix-push-same-view-controller-twice.patch)

- Reason:

    ```
    Fixes an iOS crash: NSInvalidArgumentException "<RNSNavigationController> is pushing the same view
    controller instance (<RNSScreen>) more than once which is not supported".

    On iOS 16 and 17 (reproduced on the iOS 17.2 simulator, Sentry events are on iOS 16 and 17 only)
    UIKit can defer an animated push until the current Core Animation transaction commits. This happens
    when RNSScreenStackView applies a multi-screen change as setViewControllers:animated:NO followed by
    pushViewController:animated:YES in the same turn. Until UIKit runs the deferred push, the pushed
    RNSScreen is not in viewControllers and transitionCoordinator is nil, so neither of the existing
    guards in setPushViewControllers sees it. A second stack update in that window pushes the same
    RNSScreen again. When UIKit runs the deferred pushes, the second one fails its sanity check and throws
    from -[_UIAfterCACommitBlock run].

    The patch records the pushed controller when UIKit did not apply the push immediately (iOS < 18 only,
    newer versions keep the default path). While that push is pending, setPushViewControllers skips
    updates and remembers that it skipped one. The wait ends, and a skipped update runs once on the next
    main queue turn, when one of these happens:
    - navigationController:willShowViewController:animated: or didShowViewController:animated: reports
      the pending controller (didShow for any other controller does not count: the non-animated
      setViewControllers: right before the push reports didShow for its own top controller, sometimes
      before UIKit runs the held push),
    - a later update finds the pending controller in viewControllers.
    The skip runs before the "no change" early return in setPushViewControllers: while the push is held,
    viewControllers still equals the stack from before the push, so an update that removes the pushed
    screen would otherwise return early and never be replayed.
    The pending controller is a weak reference. UIKit retains it until the held push runs (the push then
    reports willShow and ends the wait), so in practice it is only freed if UIKit drops the push. The next
    stack update then clears the pending state together with the skipped-update flag and applies the
    full stack.
    prepareForRecycle resets the state, since a recycled stack gets a full update on the next attach. If
    a push is still held at that point, the recycled view gets a new navigation controller: resetting the
    old one may not cancel the held push, which could otherwise land in the recycled stack. The old
    navigation controller (detached, no delegate) receives the held push and is then released.
    Detaching from the window keeps the state: Fabric can detach and reattach a stack before UIKit runs
    the held push, and the update on reattach would otherwise push the same controller again. The held
    push still runs while the stack is detached, so the update on reattach finds the controller in
    viewControllers and ends the wait. There is no timer and no retry loop: like the rest of
    react-native-screens, the patch waits for UIKit callbacks instead.

    This follows the approach the react-native-screens maintainers described as correct (keep pending
    operations until they show up in the navigation controller), narrowed to this one case. RNS 5 changes
    this model.
    ```

- Upstream PR/issue: 🛑 No upstream PR. Discussed with the react-native-screens maintainers: RNS 4.x is in maintenance mode and the general fix (keep pending operations until they show up in the navigation controller) is RNS 5 material. Remove this patch when upgrading to RNS 5. Standalone repro: https://github.com/WojtekBoman/rns-ios17-push-same-vc-twice-repro
- E/App issue: https://github.com/Expensify/App/issues/102743
- PR introducing patch: https://github.com/Expensify/App/pull/103603

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
