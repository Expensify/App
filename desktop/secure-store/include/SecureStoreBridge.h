#ifndef SecureStoreBridge_h
#define SecureStoreBridge_h

#import <Foundation/Foundation.h>

@interface SecureStoreBridge : NSObject
+ (void)setItem:(NSString*)key value:(NSString*)value;
+ (NSString*)getItem:(NSString*)key;
+ (void)deleteItem:(NSString*)key;
@end

#endif
