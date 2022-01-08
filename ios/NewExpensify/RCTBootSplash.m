//
//  RCTBootSplash.m
//  NewExpensify
//
//  Created by Mathieu Acthernoene on 07/01/2022.
//

#import <React/RCTBridge.h>
#import <React/RCTUtils.h>

#import "RCTBootSplash.h"

static RCTRootView *_rootView = nil;
static bool _hideHasBeenCalled = false;

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

  if (_hideHasBeenCalled)
    return;

  [_rootView setLoadingView:loadingView];

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

+ (void)hideWithFade:(bool)fade {
  if ([self isHidden])
    return;

  if (fade) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [UIView transitionWithView:_rootView
                        duration:0.250
                         options:UIViewAnimationOptionTransitionCrossDissolve
                      animations:^{
        _rootView.loadingView.hidden = YES;
      }
                      completion:^(__unused BOOL finished) {
        [_rootView.loadingView removeFromSuperview];
        _rootView.loadingView = nil;
      }];
    });
  } else {
    _rootView.loadingView.hidden = YES;
    [_rootView.loadingView removeFromSuperview];
    _rootView.loadingView = nil;
  }
}

+ (void)onContentDidAppear {
  [NSTimer scheduledTimerWithTimeInterval:10.0 // Safety call
                                  repeats:false
                                    block:^(NSTimer * _Nonnull timer) {
    [timer invalidate];

    _hideHasBeenCalled = true;
    [self hideWithFade:true];
  }];

  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

+ (void)onJavaScriptDidFailToLoad {
  [self hideWithFade:false];
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

RCT_EXPORT_METHOD(hide) {
  if (!_hideHasBeenCalled && !RCTRunningInAppExtension()) {
    _hideHasBeenCalled = true;
    [RCTBootSplash hideWithFade:true];
  }
}

RCT_REMAP_METHOD(getVisibilityStatus,
                 getVisibilityStatusWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([RCTBootSplash isHidden] ? @"hidden" : @"visible");
}

@end
