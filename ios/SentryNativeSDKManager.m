//
//  SentryNativeSDKManager.m
//  NewExpensify
//
//  Initializes the Sentry native SDK before JS loads so native code (e.g. certificate pinning
//  monitor reports) can capture events reliably. Uses the same initialization path as
//  @sentry/react-native (RNSentryStart) so JS Sentry.init() can attach with autoInitializeNativeSdk: false.
//

#import "SentryNativeSDKManager.h"
#import "RNCConfig.h"

@import Sentry;
#import <RNSentry/RNSentryStart.h>

@implementation SentryNativeSDKManager

static BOOL initialized = NO;

+ (instancetype)shared {
    static SentryNativeSDKManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[SentryNativeSDKManager alloc] init];
    });
    return instance;
}

- (NSString *)getConfigValue:(NSString *)key fallback:(NSString *)fallback {
    NSString *value = [RNCConfig envFor:key] ?: @"";
    return value.length > 0 ? value : fallback;
}

- (void)initialize {
    if (initialized) {
        return;
    }
    initialized = YES;

    NSString *environment = [self getConfigValue:@"ENVIRONMENT" fallback:@"development"];
    BOOL enableOnDev = [[self getConfigValue:@"ENABLE_SENTRY_ON_DEV" fallback:@"false"] isEqualToString:@"true"];
    if ([environment isEqualToString:@"development"] && !enableOnDev) {
        return;
    }

    NSString *dsn = [self getConfigValue:@"SENTRY_DSN"
        fallback:@"https://7b463fb4d4402d342d1166d929a62f4e@o4510228013121536.ingest.us.sentry.io/4510228107427840"];

    // CFBundleVersion is e.g. "9.4.14.0" but JS release uses "9.4.14-0", so replace the last dot with a hyphen.
    NSString *version = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"] ?: @"";
    NSRange lastDot = [version rangeOfString:@"." options:NSBackwardsSearch];
    if (lastDot.location != NSNotFound) {
        version = [version stringByReplacingCharactersInRange:lastDot withString:@"-"];
    }

    // On New Architecture, React Native wraps JS errors in C++ exceptions caught by the native crash
    // handler. Filter these out since the JS error handler already reports them. Matches prepareOptions:
    // in RNSentry.mm which is not called when we initialize natively.
    SentryBeforeSendEventCallback beforeSend = ^SentryEvent *(SentryEvent *event) {
        for (SentryException *exception in event.exceptions) {
            if (exception.value != nil &&
                [exception.value rangeOfString:@"ExceptionsManager.reportException"].location != NSNotFound) {
                return nil;
            }
        }
        return event;
    };

    NSMutableDictionary *optionsDict = [@{
        @"dsn": dsn,
        @"environment": environment,
        @"debug": @([environment isEqualToString:@"development"]),
        @"beforeSend": beforeSend,
    } mutableCopy];
    if (version.length > 0) {
        optionsDict[@"release"] = [NSString stringWithFormat:@"new.expensify@%@", version];
    }

    NSError *error = nil;
    [RNSentryStart startWithOptions:optionsDict error:&error];
    if (error != nil) {
        NSLog(@"[SentryNativeSDKManager] Failed to initialize Sentry: %@", error.localizedDescription);
    }
}

@end
