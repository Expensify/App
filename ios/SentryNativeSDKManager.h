//
//  SentryNativeSDKManager.h
//  NewExpensify
//

#import <Foundation/Foundation.h>

@interface SentryNativeSDKManager : NSObject

@property (class, nonatomic, readonly, nonnull) SentryNativeSDKManager *shared;

- (void)initialize;

@end
