//
//  RCTBootSplash.m
//  NewExpensify
//
//  Created by Mathieu Acthernoene on 07/01/2022.
//

#import <React/RCTBridge.h>
#import <React/RCTUtils.h>

#import "RCTBootSplash.h"

static NSMutableArray<RCTPromiseResolveBlock> *_resolverQueue = nil;
static RCTRootView *_rootView = nil;
static bool _nativeHidden = false;

@implementation RCTBootSplash

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

+ (void)initWithStoryboard:(NSString * _Nonnull)storyboardName
                  rootView:(RCTRootView * _Nullable)rootView {
  if (rootView == nil || _rootView != nil || RCTRunningInAppExtension())
    return;

  _rootView = rootView;

  [[NSNotificationCenter defaultCenter] removeObserver:rootView
                                                  name:RCTContentDidAppearNotification
                                                object:rootView];

  UIStoryboard *storyboard = [UIStoryboard storyboardWithName:storyboardName bundle:nil];
  UIView *loadingView = [[storyboard instantiateInitialViewController] view];

  if ([self resolverQueueExists])
    return;

  [_rootView setLoadingView:loadingView];

  [NSTimer scheduledTimerWithTimeInterval:0.35
                                  repeats:NO
                                    block:^(NSTimer * _Nonnull timer) {
    // wait for native iOS launch screen to fade out
    _nativeHidden = true;

    // hide has been called before native launch screen fade out
    if ([self resolverQueueExists])
      [self hideAndClearResolverQueue];
  }];

  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(onContentDidAppear)
                                                  name:RCTContentDidAppearNotification
                                                object:nil];

  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(onJavaScriptDidFailToLoad)
                                               name:RCTJavaScriptDidFailToLoadNotification
                                             object:nil];
}

+ (bool)isHidden {
  return _rootView == nil || _rootView.loadingView == nil || [_rootView.loadingView isHidden];
}

+ (bool)resolverQueueExists {
  return _resolverQueue != nil;
}

+ (void)clearResolverQueue {
  if (![self resolverQueueExists])
    return;

  while ([_resolverQueue count] > 0) {
    RCTPromiseResolveBlock resolve = [_resolverQueue objectAtIndex:0];
    [_resolverQueue removeObjectAtIndex:0];
    resolve(@(true));
  }
}

+ (void)hideAndClearResolverQueue {
  if (![self isHidden]) {
    _rootView.loadingView.hidden = YES;
    [_rootView.loadingView removeFromSuperview];
    _rootView.loadingView = nil;
  }

  [RCTBootSplash clearResolverQueue];
}

+ (void)onContentDidAppear {
  [NSTimer scheduledTimerWithTimeInterval:10.0 // Safety call
                                  repeats:false
                                    block:^(NSTimer * _Nonnull timer) {
    [timer invalidate];

    if (_resolverQueue == nil)
      _resolverQueue = [[NSMutableArray alloc] init];

    [self hideAndClearResolverQueue];
  }];

  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

+ (void)onJavaScriptDidFailToLoad {
  [self hideAndClearResolverQueue];
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

RCT_EXPORT_METHOD(hide:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  if (_resolverQueue == nil)
    _resolverQueue = [[NSMutableArray alloc] init];

  [_resolverQueue addObject:resolve];

  if ([RCTBootSplash isHidden] || RCTRunningInAppExtension())
    return [RCTBootSplash clearResolverQueue];

  if (_nativeHidden)
    return [RCTBootSplash hideAndClearResolverQueue];
}

RCT_EXPORT_METHOD(getVisibilityStatus:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([RCTBootSplash isHidden] ? @"hidden" : @"visible");
}

@end
