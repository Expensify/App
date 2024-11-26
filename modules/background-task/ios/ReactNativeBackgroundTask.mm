#import "ReactNativeBackgroundTask.h"
#import <UIKit/UIKit.h>
#import <BackgroundTasks/BackgroundTasks.h>

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

- (void)handleAppDidFinishLaunching:(NSNotification *)notification {
    NSLog(@"[ReactNativeBackgroundTask] Registering background task handler");
    
      [[BGTaskScheduler sharedScheduler] registerForTaskWithIdentifier:@"com.szymonrybczak.chat"
                                                          usingQueue:dispatch_get_main_queue()
                                                      launchHandler:^(__kindof BGTask * _Nonnull task) {
          [self handleBackgroundTask:task];
      }];
}

- (void)handleBackgroundTask:(BGTask *)task API_AVAILABLE(ios(13.0)) {
    // Create a task request to schedule the next background task
    BGAppRefreshTaskRequest *request = [[BGAppRefreshTaskRequest alloc] initWithIdentifier:@"com.szymonrybczak.chat"];
    request.earliestBeginDate = [NSDate dateWithTimeIntervalSinceNow:15 * 60]; // Schedule for 15 minutes from now
    
    NSError *error = nil;
    if (![[BGTaskScheduler sharedScheduler] submitTaskRequest:request error:&error]) {
        NSLog(@"[ReactNativeBackgroundTask] Failed to schedule next task: %@", error);
    }

    // Execute all registered tasks
    [_taskExecutors enumerateKeysAndObjectsUsingBlock:^(NSString *taskName, RCTResponseSenderBlock executor, BOOL *stop) {
        NSLog(@"[ReactNativeBackgroundTask] Executing background task: %@", taskName);
        executor(@[@{
            @"taskName": taskName,
            @"type": @"background",
            @"identifier": task.identifier
        }]);
    }];

    // Mark the task as complete
    [task setTaskCompletedWithSuccess:YES];
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
