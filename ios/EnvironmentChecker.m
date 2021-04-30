//
//  EnvironmentChecker.m
//  ExpensifyCash
//
// Source:
// https://github.com/react-native-device-info/react-native-device-info/issues/228#issuecomment-420703355

#import "EnvironmentChecker.h"

@implementation EnvironmentChecker

RCT_EXPORT_MODULE();

// Synchonously check if we are on a TestFlight build
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(isBeta)
{
  NSURL *receiptURL = [[NSBundle mainBundle] appStoreReceiptURL];
  NSString *receiptURLString = [receiptURL path];
  BOOL isRunningTestFlightBeta =  ([receiptURLString rangeOfString:@"sandboxReceipt"].location != NSNotFound);
  
  // We return a number here because the return value must be of an object type, so BOOL isn't an option
  return [NSNumber numberWithBool:isRunningTestFlightBeta];
}

@end
