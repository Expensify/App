#import "RCTBootSplash.h"

#if __has_include("DeviceIntegrityChecks.h")
#import "DeviceIntegrityChecks.h"
#define DIC_SHOULD_BLOCK_SPLASH dic_should_block_splash()
#else
#define DIC_SHOULD_BLOCK_SPLASH false
#endif

#import <React/RCTUtils.h>

#import <React/RCTSurfaceHostingProxyRootView.h>
#import <React/RCTSurfaceHostingView.h>
#import <React/RCTRootView.h>

#ifndef EXPENSIFY_PGO_GENERATE
#define EXPENSIFY_PGO_GENERATE 0
#endif

#if EXPENSIFY_PGO_GENERATE
extern "C" void __llvm_profile_set_filename(const char *FilenamePat);
extern "C" int __llvm_profile_write_file(void);
extern "C" void __llvm_profile_reset_counters(void);
#endif

static NSString *const PGO_DIRECTORY_NAME = @"ExpensifyPGO";
static NSString *const PGO_APP_READY_MARKER = @"app-ready.txt";
static NSString *const PGO_STATUS_MARKER = @"profile-status.txt";
static CFStringRef const PGO_WRITE_NOTIFICATION = CFSTR("com.expensify.pgo.write-profiles");
static CFStringRef const PGO_CLEAR_NOTIFICATION = CFSTR("com.expensify.pgo.clear-profiles");

static RCTSurfaceHostingProxyRootView *_rootView = nil;

static UIView *_loadingView = nil;
static NSMutableArray<RCTPromiseResolveBlock> *_resolveQueue = [[NSMutableArray alloc] init];
static bool _fade = false;
static bool _nativeHidden = false;

static long long CurrentTimeMilliseconds(void) {
  return (long long)([[NSDate date] timeIntervalSince1970] * 1000);
}

@interface RCTBootSplash ()
+ (NSURL *)pgoDirectoryURL;
+ (void)writePGOStatus:(NSString *)status result:(int)result;
+ (void)writePGOProfiles;
+ (void)clearPGOProfiles;
@end

static void HandlePGONotification(__unused CFNotificationCenterRef center,
                                  __unused void *observer,
                                  CFStringRef name,
                                  __unused const void *object,
                                  __unused CFDictionaryRef userInfo) {
  if (CFEqual(name, PGO_WRITE_NOTIFICATION)) {
    [RCTBootSplash writePGOProfiles];
  } else if (CFEqual(name, PGO_CLEAR_NOTIFICATION)) {
    [RCTBootSplash clearPGOProfiles];
  }
}

@implementation RCTBootSplash

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

+ (NSURL *)pgoDirectoryURL {
  NSURL *cachesURL = [[[NSFileManager defaultManager] URLsForDirectory:NSCachesDirectory
                                                            inDomains:NSUserDomainMask] firstObject];
  NSURL *directoryURL = [cachesURL URLByAppendingPathComponent:PGO_DIRECTORY_NAME isDirectory:YES];
  [[NSFileManager defaultManager] createDirectoryAtURL:directoryURL
                           withIntermediateDirectories:YES
                                            attributes:nil
                                                 error:nil];
  return directoryURL;
}

+ (void)writePGOStatus:(NSString *)status result:(int)result {
  NSString *contents = [NSString stringWithFormat:@"%lld,%@,%d", CurrentTimeMilliseconds(), status, result];
  NSURL *statusURL = [[self pgoDirectoryURL] URLByAppendingPathComponent:PGO_STATUS_MARKER];
  [contents writeToURL:statusURL atomically:YES encoding:NSUTF8StringEncoding error:nil];
}

+ (void)initializePGOProfileCollection {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    CFNotificationCenterRef notificationCenter = CFNotificationCenterGetDarwinNotifyCenter();
    CFNotificationCenterAddObserver(notificationCenter, NULL, HandlePGONotification, PGO_WRITE_NOTIFICATION, NULL, CFNotificationSuspensionBehaviorDeliverImmediately);
    CFNotificationCenterAddObserver(notificationCenter, NULL, HandlePGONotification, PGO_CLEAR_NOTIFICATION, NULL, CFNotificationSuspensionBehaviorDeliverImmediately);

#if EXPENSIFY_PGO_GENERATE
    NSString *profilePattern = [[[self pgoDirectoryURL] URLByAppendingPathComponent:@"newdot-%m.profraw"] path];
    __llvm_profile_set_filename(profilePattern.fileSystemRepresentation);
#endif
  });
}

+ (void)writePGOProfiles {
#if EXPENSIFY_PGO_GENERATE
  int result = __llvm_profile_write_file();
  [self writePGOStatus:@"written" result:result];
  NSLog(@"ExpensifyPGO: wrote LLVM profile with result=%d", result);
#else
  [self writePGOStatus:@"not-instrumented" result:1];
  NSLog(@"ExpensifyPGO: ignored profile write in a non-instrumented build");
#endif
}

+ (void)clearPGOProfiles {
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSURL *directoryURL = [self pgoDirectoryURL];
  NSArray<NSURL *> *files = [fileManager contentsOfDirectoryAtURL:directoryURL
                                      includingPropertiesForKeys:nil
                                                         options:0
                                                           error:nil];
  for (NSURL *fileURL in files) {
    if ([fileURL.lastPathComponent hasSuffix:@".profraw"] || [fileURL.lastPathComponent isEqualToString:PGO_STATUS_MARKER]) {
      [fileManager removeItemAtURL:fileURL error:nil];
    }
  }

#if EXPENSIFY_PGO_GENERATE
  __llvm_profile_reset_counters();
  [self writePGOStatus:@"cleared" result:0];
#else
  [self writePGOStatus:@"not-instrumented" result:1];
#endif
}

+ (bool)isLoadingViewVisible {
  return _loadingView != nil && ![_loadingView isHidden];
}

+ (BOOL)isInitialized {
  return _loadingView && _rootView;
}

+ (bool)hasResolveQueue {
  return _resolveQueue != nil;
}

+ (void)clearResolveQueue {
  if (![self hasResolveQueue])
    return;

  while ([_resolveQueue count] > 0) {
    RCTPromiseResolveBlock resolve = [_resolveQueue objectAtIndex:0];
    [_resolveQueue removeObjectAtIndex:0];
    resolve(@(true));
  }
}

+ (void)hideAndClearPromiseQueue {
  if (![self isLoadingViewVisible]) {
    return [RCTBootSplash clearResolveQueue];
  }

  if (_fade) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [UIView transitionWithView:_rootView
                        duration:0.250
                         options:UIViewAnimationOptionTransitionCrossDissolve
                      animations:^{
        _loadingView.hidden = YES;
      }
                      completion:^(__unused BOOL finished) {
        [_loadingView removeFromSuperview];
        _loadingView = nil;

        return [RCTBootSplash clearResolveQueue];
      }];
    });
  } else {
    _loadingView.hidden = YES;
    [_loadingView removeFromSuperview];
    _loadingView = nil;

    return [RCTBootSplash clearResolveQueue];
  }
}

+ (void)initWithStoryboard:(NSString * _Nonnull)storyboardName
                  rootView:(UIView * _Nullable)rootView {
  if (RCTRunningInAppExtension() || [self isInitialized]) {
    return;
  }

  [NSTimer scheduledTimerWithTimeInterval:0.35
                                  repeats:NO
                                    block:^(NSTimer * _Nonnull timer) {
    // wait for native iOS launch screen to fade out
    _nativeHidden = true;

    // hide has been called before native launch screen fade out
    if ([_resolveQueue count] > 0) {
      [self hideAndClearPromiseQueue];
    }
  }];

  if (rootView != nil) {
    _rootView = (RCTSurfaceHostingProxyRootView *)rootView;

    UIStoryboard *storyboard = [UIStoryboard storyboardWithName:storyboardName bundle:nil];

    _loadingView = [[storyboard instantiateInitialViewController] view];
    _loadingView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _loadingView.frame = _rootView.bounds;
    _loadingView.center = (CGPoint){CGRectGetMidX(_rootView.bounds), CGRectGetMidY(_rootView.bounds)};
    _loadingView.hidden = NO;

    [_rootView addSubview:_loadingView];

    if ([_rootView respondsToSelector:@selector(disableActivityIndicatorAutoHide:)]) {
      [_rootView disableActivityIndicatorAutoHide:YES];
    }
    if ([_rootView respondsToSelector:@selector(setLoadingView:)]) {
      [_rootView setLoadingView:_loadingView];
    }

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onJavaScriptDidLoad)
                                                 name:RCTJavaScriptDidLoadNotification
                                               object:nil];

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onJavaScriptDidFailToLoad)
                                                 name:RCTJavaScriptDidFailToLoadNotification
                                               object:nil];
  }
}

+ (void)onJavaScriptDidLoad {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

+ (void)onJavaScriptDidFailToLoad {
  if (DIC_SHOULD_BLOCK_SPLASH) {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    return;
  }

  [self hideAndClearPromiseQueue];
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSDictionary *)constantsToExport {
  UIWindow *window = RCTKeyWindow();
  __block bool darkModeEnabled = false;

  RCTUnsafeExecuteOnMainQueueSync(^{
    darkModeEnabled = window != nil && window.traitCollection.userInterfaceStyle == UIUserInterfaceStyleDark;
  });

  return @{
    @"darkModeEnabled": @(darkModeEnabled)
  };
}

+ (void)bringSubviewToFrontIfInitialized {
  if(![self isInitialized]) {
    return;
  }

  [_rootView bringSubviewToFront:_loadingView];
}

+ (void)hide:(BOOL)fade {
  if (DIC_SHOULD_BLOCK_SPLASH) {
    return [RCTBootSplash clearResolveQueue];
  }

  if (![RCTBootSplash isLoadingViewVisible] || RCTRunningInAppExtension())
    return [RCTBootSplash clearResolveQueue];

  _fade = fade;

  return [RCTBootSplash hideAndClearPromiseQueue];
}

- (void)hideImpl:(BOOL)fade
         resolve:(RCTPromiseResolveBlock)resolve {
  if (_resolveQueue == nil)
    _resolveQueue = [[NSMutableArray alloc] init];

  [_resolveQueue addObject:resolve];

  [RCTBootSplash hide:fade];
}

RCT_EXPORT_METHOD(hide:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  if (DIC_SHOULD_BLOCK_SPLASH) {
    reject(@"JAILBREAK_DETECTED", @"BootSplash blocked on jailbroken device", nil);
    return;
  }

  [self hideImpl:0 resolve:resolve];
}

RCT_EXPORT_METHOD(reportFullyDrawn) {
  double startedAt = [[NSUserDefaults standardUserDefaults] doubleForKey:@"AppStartTime"];
  long long readyAt = CurrentTimeMilliseconds();
  long long duration = startedAt > 0 ? MAX(0, readyAt - (long long)startedAt) : 0;
  NSString *contents = [NSString stringWithFormat:@"%lld,%lld", readyAt, duration];
  NSURL *markerURL = [[RCTBootSplash pgoDirectoryURL] URLByAppendingPathComponent:PGO_APP_READY_MARKER];
  [contents writeToURL:markerURL atomically:YES encoding:NSUTF8StringEncoding error:nil];
  NSLog(@"NewDotStartup: APP_READY durationMs=%lld", duration);
}

@end
