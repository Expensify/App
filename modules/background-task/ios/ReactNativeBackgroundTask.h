
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeBackgroundTaskSpec.h"

@interface ReactNativeBackgroundTask : NSObject <NativeReactNativeBackgroundTaskSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ReactNativeBackgroundTask : NSObject <RCTBridgeModule>
#endif

@end
