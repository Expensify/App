//
//  RNBackgroundTaskManager.h
//  Pods
//
//  Created by Szymon Rybczak on 27/11/2024.
//


#import <Foundation/Foundation.h>
#import <BackgroundTasks/BackgroundTasks.h>
#import <React/RCTBridgeModule.h>

@interface RNBackgroundTaskManager : NSObject

@property (nonatomic, copy) void (^taskHandler)(BGTask * _Nonnull);

+ (instancetype)shared;
+ (void)setup;
- (void)setHandlerForIdentifier:(NSString *)identifier
                     completion:(void (^)(BGTask * _Nonnull))handler;
- (void (^)(BGTask * _Nonnull))handlerForIdentifier:(NSString *)identifier;

@end
