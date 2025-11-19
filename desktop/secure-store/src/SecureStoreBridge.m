#import "SecureStoreBridge.h"
#import <Foundation/Foundation.h>
#import "secure_store_addon-Swift.h"

@implementation SecureStoreBridge

+ (void)setSecret:(NSString*)key
            value:(NSString*)value
          options:(id _Nullable)options
       completion:(void (^)(NSError* _Nullable))completion {
    NSLog(@"[SecureStoreBridge] setSecret called for key: %@", key);
    NSLog(@"[SecureStoreBridge] About to allocate SecureStore");

    @try {
        SecureStore* store = [[SecureStore alloc] init];
        NSLog(@"[SecureStoreBridge] SecureStore allocated successfully");

        NSLog(@"[SecureStoreBridge] Getting options, options param is: %@", options);
        SecureStoreOptions* storeOptions = options ?: [SecureStoreOptions defaultOptions];
        NSLog(@"[SecureStoreBridge] Options obtained, requireAuthentication: %d", storeOptions.requireAuthentication);

        [store setSecretWithKey:key value:value options:storeOptions completionHandler:^(NSError * _Nullable error) {
            if (error) {
                NSLog(@"[SecureStoreBridge] Error: domain=%@, code=%ld, desc=%@",
                      error.domain, (long)error.code, error.localizedDescription);
            } else {
                NSLog(@"[SecureStoreBridge] Success");
            }
            completion(error);
        }];
    } @catch (NSException *exception) {
        NSLog(@"[SecureStoreBridge] EXCEPTION: %@, reason: %@", exception.name, exception.reason);
        NSLog(@"[SecureStoreBridge] Stack trace: %@", [exception callStackSymbols]);
        NSError* error = [NSError errorWithDomain:@"SecureStoreBridge" code:-1 userInfo:@{NSLocalizedDescriptionKey: exception.reason}];
        completion(error);
    }
}

+ (NSString* _Nullable)getSecret:(NSString*)key
                         options:(id _Nullable)options
                           error:(NSError**)error {
    SecureStore* store = [[SecureStore alloc] init];
    SecureStoreOptions* storeOptions = options ?: [SecureStoreOptions defaultOptions];

    NSString* result = [store getSecretWithKey:key options:storeOptions error:error];
    // Return nil if empty string (which indicates not found)
    if (result && [result length] == 0) {
        return nil;
    }
    return result;
}

+ (void)deleteSecret:(NSString*)key
             options:(id _Nullable)options
               error:(NSError**)error {
    SecureStore* store = [[SecureStore alloc] init];
    SecureStoreOptions* storeOptions = options ?: [SecureStoreOptions defaultOptions];

    [store deleteSecretWithKey:key options:storeOptions error:error];
}

+ (BOOL)canUseAuthentication {
    SecureStore* store = [[SecureStore alloc] init];
    return [store canUseAuthentication];
}

@end
