#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeBackgroundTaskSpec.h"
#import <BackgroundTasks/BackgroundTasks.h>

@interface ReactNativeBackgroundTask : NativeReactNativeBackgroundTaskSpecBase <NativeReactNativeBackgroundTaskSpec>
#else
#import <React/RCTBridgeModule.h>
#import <BackgroundTasks/BackgroundTasks.h>

@interface ReactNativeBackgroundTask : NSObject <RCTBridgeModule>
#endif

- (void)defineTask:(NSString *)taskName
      taskExecutor:(RCTResponseSenderBlock)taskExecutor
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;

@end
