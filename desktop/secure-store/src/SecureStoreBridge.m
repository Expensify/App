#import "SecureStoreBridge.h"
#import "secure_store_addon-Swift.h"
#import <Foundation/Foundation.h>

@implementation SecureStoreBridge

+ (void)setItem:(NSString*)key value:(NSString*)value {
    [SecureStore setItem:key value:value];
}

+ (NSString*)getItem:(NSString*)key {
    return [SecureStore getItem:key];
}

+ (void)deleteItem:(NSString*)key {
    [SecureStore deleteItem:key];
}

@end
