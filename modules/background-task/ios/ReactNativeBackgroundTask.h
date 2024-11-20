#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeBackgroundTaskSpec.h"

@interface ReactNativeBackgroundTask : NSObject <NativeReactNativeBackgroundTaskSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ReactNativeBackgroundTask : NSObject <RCTBridgeModule>
#endif

- (void)defineTask:(NSString *)taskName
      taskExecutor:(RCTResponseSenderBlock)taskExecutor
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;

@end
