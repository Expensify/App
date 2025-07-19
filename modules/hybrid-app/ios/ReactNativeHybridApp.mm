#import "ReactNativeHybridApp.h"

@implementation ReactNativeHybridApp
RCT_EXPORT_MODULE()

- (NSNumber *)isHybridApp {
    return @false;
}

- (void)shouldUseStaging:(BOOL)isStaging {
    NSLog(@"[ReactNativeHybridApp] `shouldUseStaging` should never be called in standalone `New Expensify` app");
}

- (void)closeReactNativeApp:(BOOL)shouldSignOut shouldSetNVP:(BOOL)shouldSetNVP {
    NSLog(@"[ReactNativeHybridApp] `closeReactNativeApp` should never be called in standalone `New Expensify` app");
}

- (void)completeOnboarding:(BOOL)status {
    NSLog(@"[ReactNativeHybridApp] `completeOnboarding` should never be called in standalone `New Expensify` app");
}

- (void)switchAccount:(NSString *)newDotCurrentAccountEmail authToken:(NSString *)authToken policyID:(NSString *)policyID accountID:(NSString *)accountID {
    NSLog(@"[ReactNativeHybridApp] `switchAccount` should never be called in standalone `New Expensify` app");
}

- (void)sendAuthToken:(NSString *)authToken {
    NSLog(@"[ReactNativeHybridApp] `sendAuthToken` should never be called in standalone `New Expensify` app");
}

- (void)getHybridAppSettings:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
    NSLog(@"[ReactNativeHybridApp] `getHybridAppSettings` should never be called in standalone `New Expensify` app");
    reject(@"NOT_IMPLEMENTED", @"This method is not available in standalone New Expensify app", nil);
}

- (void)getInitialURL:(RCTPromiseResolveBlock)resolve
                      reject:(RCTPromiseRejectBlock)reject {
    NSLog(@"[ReactNativeHybridApp] `getInitialURL` should never be called in standalone `New Expensify` app");
    reject(@"NOT_IMPLEMENTED", @"This method is not available in standalone New Expensify app", nil);
}

- (void)onURLListenerAdded {
    NSLog(@"[ReactNativeHybridApp] `onURLListenerAdded` should never be called in standalone `New Expensify` app");
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeReactNativeHybridAppSpecJSI>(params);
}

@end
