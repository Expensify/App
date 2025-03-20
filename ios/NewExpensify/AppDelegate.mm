#import "AppDelegate.h"

#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTI18nUtil.h>
#import <React/RCTLinkingManager.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import <UserNotifications/UserNotifications.h>

#import "RCTBootSplash.h"
#import "RCTStartupTimer.h"
#import <HardwareShortcuts.h>
#import <BackgroundTasks/BackgroundTasks.h>
#import <expensify-react-native-background-task/RNBackgroundTaskManager.h>

@interface AppDelegate () <UNUserNotificationCenterDelegate>

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.moduleName = @"NewExpensify";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  self.dependencyProvider = [RCTAppDependencyProvider new];
  
  // Configure firebase
  [FIRApp configure];

  // Force the app to LTR mode.
  [[RCTI18nUtil sharedInstance] allowRTL:NO];
  [[RCTI18nUtil sharedInstance] forceRTL:NO];

  [super application:application didFinishLaunchingWithOptions:launchOptions];

  [RCTBootSplash initWithStoryboard:@"BootSplash"
                           rootView:(RCTRootView *)self.window.rootViewController.view]; // <- initialization using the storyboard file name
  
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center =
      [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  // Start the "js_load" custom performance tracing metric. This timer is
  // stopped by a native module in the JS so we can measure total time starting
  // in the native layer and ending in the JS layer.
  [RCTStartupTimer start];

  if (![[NSUserDefaults standardUserDefaults] boolForKey:@"isFirstRunComplete"]) {
      [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
      [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"isFirstRunComplete"];
  }
  
  [RNBackgroundTaskManager setup];

  return YES;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:
                (NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [RCTLinkingManager application:application
                                openURL:url
                                options:options];
}

- (BOOL)application:(UIApplication *)application
    continueUserActivity:(nonnull NSUserActivity *)userActivity
      restorationHandler:
          (nonnull void (^)(NSArray<id<UIUserActivityRestoring>> *_Nullable))
              restorationHandler {
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return
      [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main"
                                 withExtension:@"jsbundle"];
#endif
}

// This methods is needed to support the hardware keyboard shortcuts
- (NSArray *)keyCommands {
  return [HardwareShortcuts sharedInstance].keyCommands;
}

- (void)handleKeyCommand:(UIKeyCommand *)keyCommand {
  [[HardwareShortcuts sharedInstance] handleKeyCommand:keyCommand];
}

@end
