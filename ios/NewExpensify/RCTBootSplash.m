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
  if (rootView == nil || RCTRunningInAppExtension())
    return;

  _rootView = rootView;

  [[NSNotificationCenter defaultCenter] removeObserver:rootView
                                                  name:RCTContentDidAppearNotification
                                                object:rootView];

  UIStoryboard *storyboard = [UIStoryboard storyboardWithName:storyboardName bundle:nil];
  UIView *loadingView = [[storyboard instantiateInitialViewController] view];

  if (!_hideHasBeenCalled)
    [_rootView setLoadingView:loadingView];
}

+ (void)hideLoadingView {
  if (_rootView == nil || _rootView.loadingView == nil)
    return;

  dispatch_async(dispatch_get_main_queue(), ^{
    [UIView transitionWithView:_rootView
                      duration:0.220
                       options:UIViewAnimationOptionTransitionCrossDissolve
                    animations:^{
      _rootView.loadingView.hidden = YES;
    }
                    completion:^(__unused BOOL finished) {
      [_rootView.loadingView removeFromSuperview];
    }];
  });
}

- (void)hideOnAppDidBecomeActive {
  [RCTBootSplash hideLoadingView];

  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                  name:UIApplicationDidBecomeActiveNotification
                                                object:nil];
}

RCT_REMAP_METHOD(getVisibilityStatus,
                 getVisibilityStatusWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  resolve(_rootView != nil && _rootView.loadingView != nil
          ? @"visible"
          : @"hidden");
}

RCT_EXPORT_METHOD(hide) {
  _hideHasBeenCalled = true;

  if (_rootView == nil || _rootView.loadingView == nil || RCTRunningInAppExtension())
    return;

  if ([[UIApplication sharedApplication] applicationState] == UIApplicationStateActive) {
    [RCTBootSplash hideLoadingView];
  } else {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(hideOnAppDidBecomeActive)
                                                 name:UIApplicationDidBecomeActiveNotification
                                               object:nil];
  }
}

@end
