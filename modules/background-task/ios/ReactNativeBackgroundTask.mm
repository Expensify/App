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
        
        // Add observer in the next run loop to ensure proper registration
        dispatch_async(dispatch_get_main_queue(), ^{
            [[NSNotificationCenter defaultCenter] addObserver:self
                                                   selector:@selector(handleAppDidFinishLaunching:)
                                                       name:UIApplicationDidFinishLaunchingNotification
                                                     object:nil];
        });
    }
    return self;
}

// Add dealloc to properly remove the observer
- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
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
    
    for (NSString *identifier in backgroundIdentifiers) {
        [[RNBackgroundTaskManager shared] setHandlerForIdentifier:identifier completion:^(BGTask * _Nonnull task) {
            NSLog(@"[ReactNativeBackgroundTask] Executing background task's handler");
            
            // Execute all registered tasks
            [self->_taskExecutors enumerateKeysAndObjectsUsingBlock:^(NSString *taskName, RCTResponseSenderBlock executor, BOOL *stop) {
                NSLog(@"[ReactNativeBackgroundTask] Executing task: %@", taskName);
                executor(@[@{
                    @"taskName": taskName,
                    @"type": @"background",
                    @"identifier": task.identifier
                }]);
            }];
            
            [task setTaskCompletedWithSuccess:YES];
        }];
        
        
        BGProcessingTaskRequest *request = [[BGProcessingTaskRequest alloc] initWithIdentifier:identifier];
        
        // Set earliest begin date to some time in the future
        request.earliestBeginDate = [NSDate dateWithTimeIntervalSinceNow:15 * 60]; // 15 minutes from now
        
        NSError *error = nil;
        if ([[BGTaskScheduler sharedScheduler] submitTaskRequest:request error:&error]) {
            resolve(@YES);
        } else {
            reject(@"error", error.localizedDescription, error);
        }
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
