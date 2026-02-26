//
//  AppDelegate.swift
//  NewExpensify
//
//  Created by Marcin Warchoł on 08/04/2025.
//

import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import ExpoModulesCore
import Firebase
import Expo
import ActivityKit
import AirshipFrameworkProxy

@main
class AppDelegate: ExpoAppDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "NewExpensify",
      in: window,
      launchOptions: launchOptions
    )
    // Configure firebase
    FirebaseApp.configure()

    // Force the app to LTR mode.
    RCTI18nUtil.sharedInstance().allowRTL(false)
    RCTI18nUtil.sharedInstance().forceRTL(false)

    _ = super.application(application, didFinishLaunchingWithOptions: launchOptions)

    if let rootView = self.window?.rootViewController?.view as? RCTRootView {
        RCTBootSplash.initWithStoryboard("BootSplash", rootView: rootView) // <- initialization using the storyboard file name
    }

    // Define UNUserNotificationCenter
    let center = UNUserNotificationCenter.current()
    center.delegate = self

    if !UserDefaults.standard.bool(forKey: "isFirstRunComplete") {
        UIApplication.shared.applicationIconBadgeNumber = 0
        UserDefaults.standard.set(true, forKey: "isFirstRunComplete")
    }

    RNBackgroundTaskManager.setup()

    // Register GPS trip Live Activity with Airship
    if #available(iOS 16.1, *) {
        try? LiveActivityManager.shared.setup { configurator in
            await configurator.register(
                forType: Activity<GpsTripAttributes>.self,
                airshipNameExtractor: nil
            )
        }
    }

    return true
  }


  override func applicationWillTerminate(_ application: UIApplication) {
    if #available(iOS 16.2, *) {
        for activity in Activity<GpsTripAttributes>.activities {
            Task.detached {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
        }
    }
  }

  override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
      return RCTLinkingManager.application(application, open: url, options: options)
  }

  override func application(_ application: UIApplication,
                   continue userActivity: NSUserActivity,
                   restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
      return RCTLinkingManager.application(application,
                                           continue: userActivity,
                                           restorationHandler: restorationHandler)
  }

  // This methods is needed to support the hardware keyboard shortcuts
  func keyCommands() -> [Any]? {
    return HardwareShortcuts.sharedInstance().keyCommands()
  }

  func handleKeyCommand(_ keyCommand: UIKeyCommand) {
      HardwareShortcuts.sharedInstance().handleKeyCommand(keyCommand)
  }
}

class ReactNativeDelegate: ExpoReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

}
