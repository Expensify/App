#import <Foundation/Foundation.h>
#import <BackgroundTasks/BackgroundTasks.h>
#import <React/RCTBridgeModule.h>

@interface RNBackgroundTaskManager : NSObject

@property (nonatomic, copy) void (^ _Nullable taskHandler)(BGTask * _Nonnull);

+ (instancetype _Nullable )shared;
+ (void)setup;
- (void)setHandlerForIdentifier:(NSString *_Nullable)identifier
                     completion:(void (^_Nullable)(BGTask * _Nonnull))handler;
- (void (^_Nullable)(BGTask * _Nonnull))handlerForIdentifier:(NSString *_Nullable)identifier;

@end
