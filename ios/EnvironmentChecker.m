//
//  EnvironmentChecker.m
//  NewExpensify
//
// Source:
// https://github.com/react-native-device-info/react-native-device-info/issues/228#issuecomment-420703355

#import "EnvironmentChecker.h"

@implementation EnvironmentChecker

RCT_EXPORT_MODULE();

// Check if we are on a TestFlight build
RCT_REMAP_METHOD(isBeta, resolver: (RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURL *receiptURL = [[NSBundle mainBundle] appStoreReceiptURL];
  NSString *receiptURLString = [receiptURL path];

  // We return a number here because the return value must be of an object type, so BOOL isn't an option
  NSNumber *isBeta = [NSNumber numberWithBool:([receiptURLString rangeOfString:@"sandboxReceipt"].location != NSNotFound)];
  resolve(isBeta);
}

@end
