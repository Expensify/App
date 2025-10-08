#import "SecureStoreBridge.h"
#import <Foundation/Foundation.h>
#import "secure_store_addon-Swift.h"

@implementation SecureStoreBridge

+ (void)setSecret:(NSString*)key
            value:(NSString*)value
          options:(id _Nullable)options
       completion:(void (^)(NSError* _Nullable))completion {
    NSLog(@"[SecureStoreBridge] setSecret called for key: %@", key);
    SecureStore* store = [[SecureStore alloc] init];
    SecureStoreOptions* storeOptions = options ?: [SecureStoreOptions defaultOptions];
    NSLog(@"[SecureStoreBridge] requireAuthentication: %d", storeOptions.requireAuthentication);

    [store setSecretWithKey:key value:value options:storeOptions completionHandler:^(NSError * _Nullable error) {
        if (error) {
            NSLog(@"[SecureStoreBridge] Error: domain=%@, code=%ld, desc=%@",
                  error.domain, (long)error.code, error.localizedDescription);
        } else {
            NSLog(@"[SecureStoreBridge] Success");
        }
        completion(error);
    }];
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
