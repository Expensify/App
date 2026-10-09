# `react-native-screens` patches

### [react-native-screens+4.28.0+001+fix-push-same-view-controller-twice.patch](react-native-screens+4.28.0+001+fix-push-same-view-controller-twice.patch)

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
    The pending controller is a weak reference, so the wait also ends if React deallocates it.
    didMoveToWindow with a nil window and prepareForRecycle reset the state, since a detached or recycled
    stack gets a full update on the next attach. There is no timer and no retry loop: like the rest of
    react-native-screens, the patch waits for UIKit callbacks instead.

    This follows the approach the react-native-screens maintainers described as correct (keep pending
    operations until they show up in the navigation controller), narrowed to this one case. RNS 5 changes
    this model.
    ```

- Upstream PR/issue: 🛑 No upstream PR. Discussed with the react-native-screens maintainers: RNS 4.x is in maintenance mode and the general fix (keep pending operations until they show up in the navigation controller) is RNS 5 material. Remove this patch when upgrading to RNS 5. Standalone repro: https://github.com/WojtekBoman/rns-ios17-push-same-vc-twice-repro
- E/App issue: https://github.com/Expensify/App/issues/102743
- PR introducing patch: https://github.com/Expensify/App/pull/103603
