#import "ReactNativeBackgroundTask.h"

@implementation ReactNativeBackgroundTask {
    NSMutableDictionary *_taskExecutors;
}

RCT_EXPORT_MODULE()

- (instancetype)init {
    if (self = [super init]) {
        _taskExecutors = [NSMutableDictionary new];
    }
    return self;
}

RCT_EXPORT_METHOD(defineTask:(NSString *)taskName
                  taskExecutor:(RCTResponseSenderBlock)taskExecutor
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if (taskName == nil) {
        NSLog(@"[ReactNativeBackgroundTask] Failed to define task: taskName is nil");
        reject(@"ERR_INVALID_TASK_NAME", @"Task name must be provided", nil);
        return;
    }
    
    if (taskExecutor == nil) {
        NSLog(@"[ReactNativeBackgroundTask] Failed to define task: taskExecutor is nil");
        reject(@"ERR_INVALID_TASK_EXECUTOR", @"Task executor must be provided", nil);
        return;
    }

    NSLog(@"[ReactNativeBackgroundTask] Defining task: %@", taskName);
    _taskExecutors[taskName] = taskExecutor;
    resolve(nil);
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeReactNativeBackgroundTaskSpecJSI>(params);
}
#endif

@end
