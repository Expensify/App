#import "ReactNativeHybridApp.h"

@implementation ReactNativeHybridApp
RCT_EXPORT_MODULE()

- (NSNumber *)isHybridApp {
    return @false;
}

- (void)closeReactNativeApp:(BOOL)shouldSignOut shouldSetNVP:(BOOL)shouldSetNVP {}

- (void)completeOnboarding:(BOOL)status {}

- (void)switchAccount:(NSString *)newDotCurrentAccountEmail authToken:(NSString *)authToken policyID:(NSString *)policyID accountID:(NSString *)accountID {}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeReactNativeHybridAppSpecJSI>(params);
}

@end
