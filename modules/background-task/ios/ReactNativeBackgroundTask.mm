#import "ReactNativeBackgroundTask.h"
#import <UIKit/UIKit.h>
#import <BackgroundTasks/BackgroundTasks.h>
#import "RNBackgroundTaskManager.h"

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

- (BOOL)scheduleNewBackgroundTask:(NSString *)identifier {
    BGAppRefreshTaskRequest *request = [[BGAppRefreshTaskRequest alloc] initWithIdentifier:identifier];
    
    // Set earliest begin date to some time in the future
    request.earliestBeginDate = [NSDate dateWithTimeIntervalSinceNow:15 * 60]; // 15 minutes from now
    
    NSError *error = nil;
    BOOL success = [[BGTaskScheduler sharedScheduler] submitTaskRequest:request error:&error];
    
    if (!success) {
        NSLog(@"[ReactNativeBackgroundTask] Failed to schedule task: %@", error.localizedDescription);
    }
    
    return success;
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
    
    NSArray *backgroundIdentifiers = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"BGTaskSchedulerPermittedIdentifiers"];
    
    
    if (!backgroundIdentifiers || ![backgroundIdentifiers isKindOfClass:[NSArray class]]) {
        NSLog(@"[ReactNativeBackgroundTask] No background identifiers found or invalid format");
        reject(@"ERR_INVALID_TASK_SCHEDULER_IDENTIFIER", @"No background identifiers found or invalid format", nil);
        return;
    }
    
    NSLog(@"[ReactNativeBackgroundTask] Defining task: %@", taskName);
    
    BOOL allSuccess = YES; 

    for (NSString *identifier in backgroundIdentifiers) {
        [[RNBackgroundTaskManager shared] setHandlerForIdentifier:identifier completion:^(BGTask * _Nonnull task) {
            NSLog(@"[ReactNativeBackgroundTask] Executing background task's handler");
            
            // Execute all registered tasks
            [self->_taskExecutors enumerateKeysAndObjectsUsingBlock:^(NSString *taskName, RCTResponseSenderBlock executor, BOOL *stop) {
                NSLog(@"[ReactNativeBackgroundTask] Executing task: %@", taskName);
                [self emitOnBackgroundTaskExecution:(taskName)];
            }];
            
            [self scheduleNewBackgroundTask:identifier];
            
            [task setTaskCompletedWithSuccess:YES];
        }];
        
        BOOL success = [self scheduleNewBackgroundTask:identifier];

        if (success) {
            _taskExecutors[taskName] = taskExecutor;
        } else {
            allSuccess = NO;
            break;  
        }
    }

    if (allSuccess) {
        resolve(@YES);
    } else {
        reject(@"error", @"Failed to schedule initial background task", nil);
    }

        
    _taskExecutors[taskName] = taskExecutor;
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
