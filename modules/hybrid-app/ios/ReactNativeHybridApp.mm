#import "ReactNativeHybridApp.h"

@implementation ReactNativeHybridApp
RCT_EXPORT_MODULE()

- (NSNumber *)isHybridApp {
    return @false;
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

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeReactNativeHybridAppSpecJSI>(params);
}

@end
