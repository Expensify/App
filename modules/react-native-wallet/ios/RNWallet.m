#import "RNWallet.h"
#import <React/RCTLog.h>
#import <React/RCTUtils.h>
#import <React/RCTBridge.h>
#import <PassKit/PassKit.h>

typedef void (^completedPaymentProcessHandler)(PKAddPaymentPassRequest *request);

@interface RNWallet () <PKAddPaymentPassViewControllerDelegate>
@property (nonatomic, strong) completedPaymentProcessHandler completionHandler;
@end

@implementation RNWallet

RCT_EXPORT_MODULE()

- (NSArray<NSString *> *)supportedEvents {
  return @[@"getPassAndActivation", @"addPaymentPassViewControllerDidFinish"];
}

RCT_EXPORT_METHOD(canAddPaymentPass:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
  BOOL canAdd = [PKAddPaymentPassViewController canAddPaymentPass];
  resolve(@(canAdd));
}

RCT_EXPORT_METHOD(startAddPaymentPass:(NSString *)last4 
                  cardHolderName:(NSString *)cardHolderName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejector:(RCTPromiseRejectBlock)reject) {
  if (![PKAddPaymentPassViewController canAddPaymentPass]) {
    reject(@"payment_pass_unsupported", @"Unable to add payment pass, please check you have the correct entitlements", nil);
    return;
  }
  
  PKAddPaymentPassRequestConfiguration *passConfig = [[PKAddPaymentPassRequestConfiguration alloc] initWithEncryptionScheme:PKEncryptionSchemeECC_V2];
  passConfig.primaryAccountSuffix = last4;
  passConfig.cardholderName = cardHolderName;
  passConfig.paymentNetwork = PKPaymentNetworkMasterCard;
  
  PKAddPaymentPassViewController *paymentPassVC = [[PKAddPaymentPassViewController alloc] initWithRequestConfiguration:passConfig delegate:self];
  
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *rootViewController = RCTPresentedViewController();
    if (rootViewController) {
      [rootViewController presentViewController:paymentPassVC animated:YES completion:^{
        resolve(nil);
      }];
    } else {
      reject(@"root_view_controller_error", @"Unable to get the root view controller", nil);
    }
  });
}

RCT_EXPORT_METHOD(completeAddPaymentPass:(NSString *)activationData
                  encryptedPassData:(NSString *)encryptedPassData
                  ephemeralPublicKey:(NSString *)ephemeralPublicKey) {
  PKAddPaymentPassRequest *request = [[PKAddPaymentPassRequest alloc] init];
  request.activationData = [[NSData alloc] initWithBase64EncodedString:activationData options:0];
  request.encryptedPassData = [[NSData alloc] initWithBase64EncodedString:encryptedPassData options:0];
  request.ephemeralPublicKey = [[NSData alloc] initWithBase64EncodedString:ephemeralPublicKey options:0];
  
  if (self.completionHandler) {
    self.completionHandler(request);
  }
}

- (void)addPaymentPassViewController:(PKAddPaymentPassViewController *)controller didFinishAddingPaymentPass:(PKPaymentPass *)pass error:(NSError *)error {
  [controller dismissViewControllerAnimated:YES completion:nil];
  [self sendEventWithName:@"addPaymentPassViewControllerDidFinish" body:error ? @{@"error": error.localizedDescription} : @{@"success": @YES}];
}

- (void)addPaymentPassViewController:(PKAddPaymentPassViewController *)controller generateRequestWithCertificateChain:(NSArray<NSData *> *)certificates nonce:(NSData *)nonce nonceSignature:(NSData *)nonceSignature completionHandler:(void (^)(PKAddPaymentPassRequest * _Nonnull))handler {
  self.completionHandler = handler;

  NSString *certificateLeaf = [certificates[0] base64EncodedStringWithOptions:0];
  NSString *certificateSubCA = [certificates[1] base64EncodedStringWithOptions:0];
  NSString *nonceString = [nonce base64EncodedStringWithOptions:0];
  NSString *nonceSignatureString = [nonceSignature base64EncodedStringWithOptions:0];

  NSDictionary *certData = @{
    @"certificateLeaf": certificateLeaf,
    @"certificateSubCA": certificateSubCA,
    @"nonce": nonceString,
    @"nonceSignature": nonceSignatureString
  };

  [self sendEventWithName:@"getPassAndActivation" body:@{@"data": certData}];
}

@end