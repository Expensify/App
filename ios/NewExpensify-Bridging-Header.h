//
//  NewExpensify-Bridging-Header.h
//  NewExpensify
//
//  Created by Marcin Warchoł on 08/04/2025.
//

// RCTAppDelegate as headers, not as the Swift module `React_RCTAppDelegate`, which does not exist
// with a prebuilt React Core. Mirrors expo's RCTAppDelegateUmbrella.h; both umbrella spellings cover
// a source and a prebuilt build.
#if __has_include(<React_RCTAppDelegate/React-RCTAppDelegate-umbrella.h>)
#import <React_RCTAppDelegate/React-RCTAppDelegate-umbrella.h>
#elif __has_include(<React_RCTAppDelegate/React_RCTAppDelegate-umbrella.h>)
#import <React_RCTAppDelegate/React_RCTAppDelegate-umbrella.h>
#endif

#import "RCTBootSplash.h"
#import "SentryNativeSDKManager.h"
#import <HardwareShortcuts.h>
#import <BackgroundTasks/BackgroundTasks.h>
#import <RNBackgroundTaskManager.h>
