//
//  SceneDelegate.swift
//  NewExpensify
//
//  The UIApplicationDelegate-only lifecycle is deprecated as of iOS 26, and iOS 27 terminates apps
//  that have not adopted UIScene (`_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`).
//
//  `AppDelegate` is the process entry point (telemetry, Firebase, push, background tasks) and builds
//  the React Native factory; everything window-scoped - the `UIWindow`, the React Native surface,
//  the boot splash, the scene lifecycle events - lives here. React Native 0.86 and Expo SDK 57 ship
//  no scene delegate of their own, so this one is hand-rolled.
//

import UIKit
import React

@objc(SceneDelegate)
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  private var appDelegate: AppDelegate? {
    UIApplication.shared.delegate as? AppDelegate
  }

  // MARK: - Scene lifecycle

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene else {
      return
    }

    // Nothing here can show a surface without the app delegate's React Native factory, so bail
    // rather than leaving behind a window that stays blank.
    guard let appDelegate, let reactNativeFactory = appDelegate.reactNativeFactory else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    // Native code reads the app delegate's window, keep it in sync.
    appDelegate.window = window

    reactNativeFactory.startReactNative(
      withModuleName: "NewExpensify",
      in: window,
      launchOptions: launchOptions(mergedWith: connectionOptions)
    )

    // Covers the gap between the launch storyboard going away and the JS `SplashScreenHider`
    // mounting. Both use the `BootSplash` storyboard, so the handoff is seamless.
    RCTBootSplash.initWithStoryboard("BootSplash", rootView: window)

    // A cold-launch URL / user activity arrives in `connectionOptions`, not through the app
    // delegate. The launch options above cover `Linking.getInitialURL()`; replaying it here also
    // fires the `url` event for listeners already attached.
    for context in connectionOptions.urlContexts {
      forward(urlContext: context)
    }
    for userActivity in connectionOptions.userActivities {
      forward(userActivity: userActivity)
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      forward(urlContext: context)
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    forward(userActivity: userActivity)
  }

  // There is no scene lifecycle forwarding because nothing implements the matching
  // `UIApplicationDelegate` methods. RN's `AppState` and every SDK here (Airship, Firebase,
  // SDWebImage) observe the `UIApplication` notifications, which UIKit posts either way.

  // MARK: - Launch options

  /// UIKit puts the launching URL / user activity in the scene connection options, while
  /// `RCTLinkingManager.getInitialURL` reads only the bridge launch options. Merge the two so it
  /// resolves to the launching URL instead of `null`.
  private func launchOptions(mergedWith connectionOptions: UIScene.ConnectionOptions) -> [UIApplication.LaunchOptionsKey: Any]? {
    var options = appDelegate?.launchOptions ?? [:]

    if let url = connectionOptions.urlContexts.first?.url {
      options[.url] = url
    }

    if let userActivity = connectionOptions.userActivities.first(where: { $0.activityType == NSUserActivityTypeBrowsingWeb }) {
      options[.userActivityDictionary] = [
        UIApplication.LaunchOptionsKey.userActivityType.rawValue: userActivity.activityType,
        "UIApplicationLaunchOptionsUserActivityKey": userActivity,
      ]
    }

    return options.isEmpty ? nil : options
  }

  // MARK: - Forwarding to the app delegate

  // `AppDelegate` is the single sink for these, so `RCTLinkingManager`, Expo subscribers and any
  // `UIApplicationDelegate` swizzling (Firebase swizzles both selectors) all see them.

  private func forward(urlContext: UIOpenURLContext) {
    let application = UIApplication.shared
    var options: [UIApplication.OpenURLOptionsKey: Any] = [.openInPlace: urlContext.options.openInPlace]
    if let sourceApplication = urlContext.options.sourceApplication {
      options[.sourceApplication] = sourceApplication
    }
    if let annotation = urlContext.options.annotation {
      options[.annotation] = annotation
    }
    _ = application.delegate?.application?(application, open: urlContext.url, options: options)
  }

  private func forward(userActivity: NSUserActivity) {
    let application = UIApplication.shared
    _ = application.delegate?.application?(application, continue: userActivity, restorationHandler: { _ in })
  }
}
