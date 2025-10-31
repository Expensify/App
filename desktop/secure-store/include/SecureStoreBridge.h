#ifndef SecureStoreBridge_h
#define SecureStoreBridge_h

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface SecureStoreBridge : NSObject

+ (void)setSecret:(NSString*)key
            value:(NSString*)value
          options:(id _Nullable)options
       completion:(void (^)(NSError* _Nullable))completion;

+ (NSString* _Nullable)getSecret:(NSString*)key
                         options:(id _Nullable)options
                           error:(NSError* _Nullable * _Nullable)error;

+ (void)deleteSecret:(NSString*)key
             options:(id _Nullable)options
               error:(NSError* _Nullable * _Nullable)error;

+ (BOOL)canUseAuthentication;

@end

NS_ASSUME_NONNULL_END

#endif
