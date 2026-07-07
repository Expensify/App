#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ModuleFhpIos, NSObject)

RCT_EXTERN_METHOD(enableCapability:(NSInteger)capabilityId responseHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(disableCapability:(NSInteger)capabilityId responseHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setLogURL:(NSString *)url errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setTargetURL:(NSString *)url errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setCustomerId:(NSString *)customerId errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(run:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(stop:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(enableDebugLogs)
RCT_EXTERN_METHOD(setPublicKeyForPinning:(NSString *)publicKey errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setPublicKeysForPinning:(NSString *)publicKeys errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setUserAgent:(NSString *)userAgent errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setSharedKeychainIdentifier:(NSString *)identifier)
RCT_EXTERN_METHOD(setKeepAliveTimeout:(int)sec errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setHeaderValue:(NSString *)value forKey:(NSString *)key errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setLogin:(NSString *)login errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setSessionId:(NSString *)sessionId errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setCustomEvent:(NSString *)event errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(setAttributeTitle:(NSString *)title withValue:(NSString *)value andFormat:(NSInteger)format isSendOnce:(BOOL)isSendOnce errorHandler:(RCTResponseSenderBlock)errorHandler)
RCT_EXTERN_METHOD(getCookies:(RCTResponseSenderBlock)cookiesHandler)
RCT_EXTERN_METHOD(changeBehaviorExtendedData:(BOOL)isExtendedData)
RCT_EXTERN_METHOD(setPubKey:(NSString *)publicKey errorHandler:(RCTResponseSenderBlock)errorHandler)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
