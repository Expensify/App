#import "RTNWalletSpec.h"
#import "RTNWallet.h"

@implementation RTNWallet

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(handleWalletCreationResponse:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    NSString *encryptedPassData = data[@"encryptedPassData"];
    NSString *activationData = data[@"activationData"];
    NSString *ephemeralPublicKey = data[@"ephemeralPublicKey"];
    
    // Convert strings to NSData
    NSData *encryptedPassDataBytes = [[NSData alloc] initWithBase64EncodedString:encryptedPassData options:0];
    NSData *activationDataBytes = [[NSData alloc] initWithBase64EncodedString:activationData options:0];
    NSData *ephemeralPublicKeyBytes = [[NSData alloc] initWithBase64EncodedString:ephemeralPublicKey options:0];

    if (!encryptedPassDataBytes || !activationDataBytes || !ephemeralPublicKeyBytes) {
        reject(@"ERROR", @"Invalid data provided", nil);
        return;
    }


}

RCT_EXPORT_METHOD(getDeviceDetails:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
}

@end
