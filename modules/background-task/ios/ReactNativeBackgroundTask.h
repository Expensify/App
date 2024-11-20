#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeBackgroundTaskSpec.h"
#import <BackgroundTasks/BackgroundTasks.h>

@interface ReactNativeBackgroundTask : NSObject <NativeReactNativeBackgroundTaskSpec>
#else
#import <React/RCTBridgeModule.h>
#import <BackgroundTasks/BackgroundTasks.h>

@interface ReactNativeBackgroundTask : NSObject <RCTBridgeModule>
#endif

- (void)defineTask:(NSString *)taskName
      taskExecutor:(RCTResponseSenderBlock)taskExecutor
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;

- (void)handleAppDidFinishLaunching:(NSNotification *)notification;
- (void)handleBackgroundTask:(BGTask *)task API_AVAILABLE(ios(13.0));

@end
