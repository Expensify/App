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
import Firebase
internal import Expo
import ActivityKit
import AirshipFrameworkProxy

private enum BackupExclusionHelper {
    private static func excludeDirectoryFromBackup(_ directoryPath: String?) {
        guard let directoryPath, !directoryPath.isEmpty else {
            return
        }

        var directoryURL = URL(fileURLWithPath: directoryPath, isDirectory: true)
        var resourceValues = URLResourceValues()
        resourceValues.isExcludedFromBackup = true

        do {
            try directoryURL.setResourceValues(resourceValues)
        } catch {
            NSLog("Failed to exclude \(directoryPath) from backup: \(error.localizedDescription)")
        }
    }

    static func excludeAllAppDataFromBackup() {
        // Covers all app data: Documents directory, Library directory, and the shared app group container.
        let fileManager = FileManager.default
        excludeDirectoryFromBackup(fileManager.urls(for: .documentDirectory, in: .userDomainMask).first?.path)
        excludeDirectoryFromBackup(fileManager.urls(for: .libraryDirectory, in: .userDomainMask).first?.path)
        excludeDirectoryFromBackup(fileManager.containerURL(forSecurityApplicationGroupIdentifier: "group.com.expensify.new")?.path)
    }
}

@main
class AppDelegate: ExpoAppDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ExpoReactNativeFactoryDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  private var privacyOverlay: UIView?

  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    // Initialize Sentry before any native telemetry (e.g. certificate pinning monitor reports).
    SentryNativeSDKManager.shared.initialize()

    // Initialize certificate pinning before any networking starts (Iteration 1 - NewDot).
    CertificatePinning.initialize()
    BackupExclusionHelper.excludeAllAppDataFromBackup()

    let appStartTimePreferencesKey = "AppStartTime"
    UserDefaults.standard.set(Date().timeIntervalSince1970 * 1000, forKey: appStartTimePreferencesKey)
    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

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


  // Cover the UI before the OS captures the app-switcher snapshot, so sensitive data
  // never ends up in snapshot files stored on disk. This must happen in
  // willResignActive (not didEnterBackground): the app switcher already shows the
  // live UI while the app is merely inactive.
  override func applicationWillResignActive(_ application: UIApplication) {
    super.applicationWillResignActive(application)
    showPrivacyOverlay()
  }

  override func applicationDidBecomeActive(_ application: UIApplication) {
    super.applicationDidBecomeActive(application)
    hidePrivacyOverlay()
  }

  private func showPrivacyOverlay() {
    guard privacyOverlay == nil, let window else {
      return
    }
    guard let overlay = UIStoryboard(name: "BootSplash", bundle: nil).instantiateInitialViewController()?.view else {
      return
    }
    overlay.frame = window.bounds
    overlay.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    window.addSubview(overlay)
    privacyOverlay = overlay
  }

  private func hidePrivacyOverlay() {
    privacyOverlay?.removeFromSuperview()
    privacyOverlay = nil
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
