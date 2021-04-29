//
//  EnvironmentChecker.m
//  ExpensifyCash
//
// Source:
// https://github.com/react-native-device-info/react-native-device-info/issues/228#issuecomment-420703355

#import "EnvironmentChecker.h"

@implementation EnvironmentChecker

RCT_EXPORT_MODULE();
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getEnvironment)
{
  NSURL *receiptURL = [[NSBundle mainBundle] appStoreReceiptURL];
  NSString *receiptURLString = [receiptURL path];
  BOOL isRunningTestFlightBeta =  ([receiptURLString rangeOfString:@"sandboxReceipt"].location != NSNotFound);
  if(isRunningTestFlightBeta) {
    return @"TESTFLIGHT";
  }

  return @"PRODUCTION";
}

@end
