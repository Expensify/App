#import "RCTBootSplash.h"

#import <React/RCTUtils.h>

#import <React/RCTSurfaceHostingProxyRootView.h>
#import <React/RCTSurfaceHostingView.h>
#import <React/RCTRootView.h>

static RCTSurfaceHostingProxyRootView *_rootView = nil;

static UIView *_loadingView = nil;
static NSMutableArray<RCTPromiseResolveBlock> *_resolveQueue = [[NSMutableArray alloc] init];
static bool _fade = false;
static bool _nativeHidden = false;

@implementation RCTBootSplash

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

+ (bool)isLoadingViewVisible {
  return _loadingView != nil && ![_loadingView isHidden];
}

+ (void)clearResolveQueue {
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
  if (RCTRunningInAppExtension()) {
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
#ifdef RCT_NEW_ARCH_ENABLED
    _rootView = (RCTSurfaceHostingProxyRootView *)rootView;
#else
    _rootView = (RCTRootView *)rootView;
#endif

    UIStoryboard *storyboard = [UIStoryboard storyboardWithName:storyboardName bundle:nil];

    _loadingView = [[storyboard instantiateInitialViewController] view];
    _loadingView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _loadingView.frame = _rootView.bounds;
    _loadingView.center = (CGPoint){CGRectGetMidX(_rootView.bounds), CGRectGetMidY(_rootView.bounds)};
    _loadingView.hidden = NO;

#if RCT_NEW_ARCH_ENABLED
    [_rootView disableActivityIndicatorAutoHide:YES];
    [_rootView setLoadingView:_loadingView];
#else
    [_rootView addSubview:_loadingView];
#endif

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

- (void)hideImpl:(BOOL)fade
         resolve:(RCTPromiseResolveBlock)resolve {
  if (RCTRunningInAppExtension()) {
    return resolve(@(true));
  }

  [_resolveQueue addObject:resolve];
  _fade = fade;

  if (_nativeHidden) {
    return [RCTBootSplash hideAndClearPromiseQueue];
  }
}

- (void)isVisibleImpl:(RCTPromiseResolveBlock)resolve {
  resolve(@([RCTBootSplash isLoadingViewVisible]));
}

RCT_EXPORT_METHOD(hide:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  [self hideImpl:0 resolve:resolve];
}

RCT_EXPORT_METHOD(isVisible:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
  [self isVisibleImpl:resolve];
}

@end
