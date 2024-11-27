//
//  RNBackgroundTaskManager.m
//  Pods
//
//  Created by Szymon Rybczak on 27/11/2024.
//

#import <BackgroundTasks/BackgroundTasks.h>

// RNBackgroundTaskManager.m
@implementation RNBackgroundTaskManager : NSObject  {
    NSMutableDictionary<NSString *, void (^)(BGTask * _Nonnull)> *_handlers;
}

+ (instancetype)shared {
    static RNBackgroundTaskManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[RNBackgroundTaskManager alloc] init];
    });
    return instance;
}

- (instancetype)init {
    if (self = [super init]) {
        _handlers = [NSMutableDictionary new];
    }
    return self;
}

- (void)setHandlerForIdentifier:(NSString *)identifier
                    completion:(void (^)(BGTask * _Nonnull))handler {
    _handlers[identifier] = handler;
}

- (void (^)(BGTask * _Nonnull))handlerForIdentifier:(NSString *)identifier {
    return _handlers[identifier];
}

@end
