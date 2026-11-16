//
//  SentryNativeSDKManager.m
//  NewExpensify
//
//  Initializes the Sentry native SDK before JS loads so native code (e.g. certificate pinning
//  monitor reports) can capture events reliably. Uses the same initialization path as
//  @sentry/react-native (RNSentryStart) so JS Sentry.init() can attach with autoInitializeNativeSdk: false.
//

#import "SentryNativeSDKManager.h"
#import "RNCConfig.h"

#import <UIKit/UIKit.h>
#import <os/lock.h>

@import Sentry;
#import <RNSentry/RNSentryStart.h>

// The helpers below are kept in sync with Mobile-Expensify's SentryNativeSDKManager.m, which starts Sentry in the
// HybridApp (the production iOS app). Standalone NewDot has no `odot.foreground` tag, so every idle hang is
// grouped as NewDot.

// Classification is on `frame.package` (the image path, e.g. ".../UIKitCore"), never on `frame.function`:
// SentryCrashReportConverter fills only instructionAddress, imageAddress, package and inApp, and symbolication
// happens server-side after beforeSend returns, so `function` is always nil.
static NSString *frameImageName(SentryFrame *_Nullable frame) {
    NSString *package = frame.package;
    if (![package isKindOfClass:NSString.class] || package.length == 0) {
        return @"unknown";
    }
    return package.lastPathComponent;
}

static BOOL frameIsInImage(SentryFrame *_Nullable frame, NSString *imageName) {
    return [frameImageName(frame) isEqualToString:imageName];
}

#pragma mark - App hang context

// Tags and grouping for App Hang events. V2 counts time spent inactive or in the background as hang time.
// Remove this section together with App Hang tracking, which sentry-cocoa 10 drops in favor of MetricKit.

static NSString *const appHangMechanismType = @"AppHang";
static NSString *const fatalAppHangTypePrefix = @"Fatal";
static NSString *const unknownTagValue = @"unknown";

// Written on the main thread by the lifecycle and run loop observers, read in beforeSend on Sentry's queue.
static os_unfair_lock appLifecycleLock = OS_UNFAIR_LOCK_INIT;
static CFAbsoluteTime lastBecameActiveTime = 0;
static CFAbsoluteTime lastResignedActiveTime = 0;
static CFAbsoluteTime lastEnteredBackgroundTime = 0;
static NSUInteger activationCount = 0;

static void recordLifecycleTime(CFAbsoluteTime *slot) {
    os_unfair_lock_lock(&appLifecycleLock);
    *slot = CFAbsoluteTimeGetCurrent();
    os_unfair_lock_unlock(&appLifecycleLock);
}

// Main run loop busy time per wall-clock second. The gap between two run loop activities is busy unless the
// loop was asleep, which includes the app being suspended.
#define BUSY_HISTORY_SECONDS 600
static double busyTimeInSecond[BUSY_HISTORY_SECONDS];
static long busySecondStamp[BUSY_HISTORY_SECONDS];
static CFAbsoluteTime lastRunLoopActivityTime = 0;
static BOOL lastRunLoopActivityWasSleep = YES;

static void addBusyTimeLocked(CFAbsoluteTime from, CFAbsoluteTime to) {
    from = MAX(from, to - BUSY_HISTORY_SECONDS);
    for (long second = (long)floor(from); second <= (long)floor(to); second++) {
        double overlap = MIN(to, (CFAbsoluteTime)(second + 1)) - MAX(from, (CFAbsoluteTime)second);
        if (overlap <= 0) {
            continue;
        }
        NSUInteger slot = (NSUInteger)(second % BUSY_HISTORY_SECONDS);
        if (busySecondStamp[slot] != second) {
            busySecondStamp[slot] = second;
            busyTimeInSecond[slot] = 0;
        }
        busyTimeInSecond[slot] += overlap;
    }
}

static void recordRunLoopActivity(CFRunLoopActivity activity) {
    CFAbsoluteTime now = CFAbsoluteTimeGetCurrent();
    os_unfair_lock_lock(&appLifecycleLock);
    if (!lastRunLoopActivityWasSleep && lastRunLoopActivityTime > 0) {
        addBusyTimeLocked(lastRunLoopActivityTime, now);
    }
    lastRunLoopActivityTime = now;
    lastRunLoopActivityWasSleep = activity == kCFRunLoopBeforeWaiting;
    os_unfair_lock_unlock(&appLifecycleLock);
}

// Blocked: busy for at least half of [start, end]. The caller holds appLifecycleLock.
static BOOL mainThreadWasBlockedLocked(CFAbsoluteTime start, CFAbsoluteTime end) {
    CFAbsoluteTime openBusyStart = !lastRunLoopActivityWasSleep && lastRunLoopActivityTime > 0 ? lastRunLoopActivityTime : 0;
    // Edge seconds count in proportion to their overlap with the window.
    CFAbsoluteTime busy = 0;
    for (long second = (long)floor(MAX(start, end - BUSY_HISTORY_SECONDS + 1)); second <= (long)floor(end); second++) {
        NSUInteger slot = (NSUInteger)(second % BUSY_HISTORY_SECONDS);
        double overlap = MIN(end, (CFAbsoluteTime)(second + 1)) - MAX(start, (CFAbsoluteTime)second);
        if (busySecondStamp[slot] == second && overlap > 0) {
            busy += busyTimeInSecond[slot] * overlap;
        }
    }
    if (openBusyStart > 0) {
        busy += MAX(0, end - MAX(start, openBusyStart));
    }
    return busy >= (end - start) / 2;
}

// Idle: above UIApplicationMain only run loop images, ending in a kernel wait entered from CoreFoundation.
// Matches images, not symbols, because `function` is nil before server-side symbolication.
static NSString *mainThreadStateForStacktrace(SentryStacktrace *_Nullable stacktrace) {
    static NSSet<NSString *> *runLoopImages = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        runLoopImages = [NSSet setWithArray:@[@"UIKitCore", @"GraphicsServices", @"CoreFoundation", @"libsystem_kernel.dylib"]];
    });

    NSArray<SentryFrame *> *frames = stacktrace.frames;
    if (frames.count == 0) {
        return unknownTagValue;
    }

    // Frames are oldest first. Skip everything before UIApplicationMain.
    NSUInteger applicationMainIndex = [frames indexOfObjectPassingTest:^BOOL(SentryFrame *frame, NSUInteger index, BOOL *stop) {
        return frameIsInImage(frame, @"UIKitCore");
    }];
    if (applicationMainIndex == NSNotFound) {
        return unknownTagValue;
    }

    if (!frameIsInImage(frames.lastObject, @"libsystem_kernel.dylib")) {
        return @"busy";
    }
    NSUInteger lastNonKernelIndex = [frames indexOfObjectWithOptions:NSEnumerationReverse passingTest:^BOOL(SentryFrame *frame, NSUInteger index, BOOL *stop) {
        return !frameIsInImage(frame, @"libsystem_kernel.dylib");
    }];
    if (lastNonKernelIndex == NSNotFound || !frameIsInImage(frames[lastNonKernelIndex], @"CoreFoundation")) {
        return @"busy";
    }
    for (NSUInteger index = applicationMainIndex; index < frames.count; index++) {
        if (![runLoopImages containsObject:frameImageName(frames[index])]) {
            return @"busy";
        }
    }
    return @"idle";
}

// "App hanging between 2.4 and 3.2 seconds." -> 2.4, the lower bound. NAN for any other wording.
static double appHangMinimumDuration(NSString *_Nullable value) {
    static NSRegularExpression *durationExpression = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        durationExpression = [NSRegularExpression regularExpressionWithPattern:@"between ([0-9]+(?:\\.[0-9]+)?) and" options:0 error:nil];
    });

    if (![value isKindOfClass:NSString.class]) {
        return NAN;
    }
    NSTextCheckingResult *match = [durationExpression firstMatchInString:value options:0 range:NSMakeRange(0, value.length)];
    if (match == nil) {
        return NAN;
    }
    return [[value substringWithRange:[match rangeAtIndex:1]] doubleValue];
}

static SentryException *_Nullable appHangException(SentryEvent *event) {
    for (SentryException *exception in event.exceptions) {
        if ([exception.mechanism.type isEqualToString:appHangMechanismType]) {
            return exception;
        }
    }
    return nil;
}

// Idle snapshots get one issue per hang type and app. Busy hangs keep stack grouping.
static void addAppHangContext(SentryEvent *event, SentryException *hang) {
    NSMutableDictionary<NSString *, NSString *> *tags = [(event.tags ?: @{}) mutableCopy];

    NSString *mainThreadState = mainThreadStateForStacktrace(hang.stacktrace);
    tags[@"app_hang.main_thread"] = mainThreadState;

    double minimumDuration = appHangMinimumDuration(hang.value);

    // A fatal hang is sent on the next launch, so this process's lifecycle times say nothing about it.
    BOOL isFatal = [hang.type hasPrefix:fatalAppHangTypePrefix];
    if (!isFatal && !isnan(minimumDuration)) {
        // Non-fatal hangs are sent when the hang ends, so the start is roughly now minus the duration.
        CFAbsoluteTime now = CFAbsoluteTimeGetCurrent();
        CFAbsoluteTime start = now - minimumDuration;

        os_unfair_lock_lock(&appLifecycleLock);
        CFAbsoluteTime becameActive = lastBecameActiveTime;
        CFAbsoluteTime resignedActive = lastResignedActiveTime;
        CFAbsoluteTime enteredBackground = lastEnteredBackgroundTime;
        NSUInteger activations = activationCount;
        // beforeSend runs about a second after the hang ends.
        BOOL blocked = mainThreadWasBlockedLocked(start - 1, now);
        os_unfair_lock_unlock(&appLifecycleLock);

        // "launch" until the first return from the background before the hang.
        NSUInteger activationsBeforeHang = activations > 0 && becameActive > start ? activations - 1 : activations;
        tags[@"app_hang.since"] = activationsBeforeHang <= 1 ? @"launch" : @"resume";
        // Includes returning from the background mid-hang: V2 counts the time the app was suspended.
        if (enteredBackground > start || (activations > 1 && becameActive > start)) {
            tags[@"app_hang.interrupted"] = @"background";
        } else if (resignedActive > start) {
            tags[@"app_hang.interrupted"] = @"inactive";
        } else {
            tags[@"app_hang.interrupted"] = @"no";
        }
        tags[@"app_hang.blocked"] = blocked ? @"yes" : @"no";
    }

    event.tags = tags;

    if ([mainThreadState isEqualToString:@"idle"]) {
        NSString *app = [event.tags[@"odot.foreground"] isEqualToString:@"true"] ? @"olddot" : @"newdot";
        event.fingerprint = @[@"app-hang-idle-main-thread", hang.type ?: unknownTagValue, app];
    }
}

static SentryEvent *_Nullable processEventBeforeSend(SentryEvent *event) {
    // On New Architecture, React Native wraps JS errors in C++ exceptions caught by the native crash
    // handler. Filter these out since the JS error handler already reports them. Matches prepareOptions:
    // in RNSentry.mm which is not called when we initialize natively.
    for (SentryException *exception in event.exceptions) {
        if (exception.value != nil &&
            [exception.value rangeOfString:@"ExceptionsManager.reportException"].location != NSNotFound) {
            return nil;
        }
    }

    SentryException *hang = appHangException(event);
    if (hang != nil) {
        addAppHangContext(event, hang);
    }
    return event;
}

@implementation SentryNativeSDKManager

static BOOL initialized = NO;

+ (instancetype)shared {
    static SentryNativeSDKManager *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[SentryNativeSDKManager alloc] init];
    });
    return instance;
}

- (NSString *)getConfigValue:(NSString *)key fallback:(NSString *)fallback {
    NSString *value = [RNCConfig envFor:key] ?: @"";
    return value.length > 0 ? value : fallback;
}

- (void)initialize {
    if (initialized) {
        return;
    }
    initialized = YES;

    NSString *environment = [self getConfigValue:@"ENVIRONMENT" fallback:@"development"];
    BOOL enableOnDev = [[self getConfigValue:@"ENABLE_SENTRY_ON_DEV" fallback:@"false"] isEqualToString:@"true"];
    if ([environment isEqualToString:@"development"] && !enableOnDev) {
        return;
    }

    NSString *dsn = [self getConfigValue:@"SENTRY_DSN"
        fallback:@"https://7b463fb4d4402d342d1166d929a62f4e@o4510228013121536.ingest.us.sentry.io/4510228107427840"];

    // CFBundleVersion is e.g. "9.4.14.0" but JS release uses "9.4.14-0", so replace the last dot with a hyphen.
    NSString *version = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"] ?: @"";
    NSRange lastDot = [version rangeOfString:@"." options:NSBackwardsSearch];
    if (lastDot.location != NSNotFound) {
        version = [version stringByReplacingCharactersInRange:lastDot withString:@"-"];
    }

    SentryBeforeSendEventCallback beforeSend = ^SentryEvent *(SentryEvent *event) {
        return processEventBeforeSend(event);
    };

    NSMutableDictionary *optionsDict = [@{
        @"dsn": dsn,
        @"environment": environment,
        @"debug": @([environment isEqualToString:@"development"]),
        @"beforeSend": beforeSend,
    } mutableCopy];
    if (version.length > 0) {
        optionsDict[@"release"] = [NSString stringWithFormat:@"new.expensify@%@", version];
    }

    NSError *error = nil;
    [RNSentryStart startWithOptions:optionsDict error:&error];
    if (error != nil) {
        NSLog(@"[SentryNativeSDKManager] Failed to initialize Sentry: %@", error.localizedDescription);
        return;
    }

    [self startObservingAppLifecycle];
}

// Lifecycle and run loop observers, installed natively so they run before any JS.
- (void)startObservingAppLifecycle {
    NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
    NSOperationQueue *mainQueue = [NSOperationQueue mainQueue];
    // Launch code is running, so the main thread counts as busy until the first run loop activity.
    os_unfair_lock_lock(&appLifecycleLock);
    lastRunLoopActivityTime = CFAbsoluteTimeGetCurrent();
    lastRunLoopActivityWasSleep = NO;
    os_unfair_lock_unlock(&appLifecycleLock);
    CFRunLoopObserverRef runLoopObserver = CFRunLoopObserverCreateWithHandler(kCFAllocatorDefault, kCFRunLoopAllActivities, true, LONG_MAX, ^(CFRunLoopObserverRef observer, CFRunLoopActivity activity) {
        recordRunLoopActivity(activity);
    });
    CFRunLoopAddObserver(CFRunLoopGetMain(), runLoopObserver, kCFRunLoopCommonModes);
    CFRelease(runLoopObserver);
    [center addObserverForName:UIApplicationDidBecomeActiveNotification object:nil queue:mainQueue usingBlock:^(NSNotification *notification) {
        // Counts launch and returns from the background, not a brief inactive state (system alert, Control Center).
        os_unfair_lock_lock(&appLifecycleLock);
        if (activationCount == 0 || lastEnteredBackgroundTime > lastBecameActiveTime) {
            lastBecameActiveTime = CFAbsoluteTimeGetCurrent();
            activationCount++;
        }
        os_unfair_lock_unlock(&appLifecycleLock);
    }];
    [center addObserverForName:UIApplicationWillResignActiveNotification object:nil queue:mainQueue usingBlock:^(NSNotification *notification) {
        recordLifecycleTime(&lastResignedActiveTime);
    }];
    [center addObserverForName:UIApplicationDidEnterBackgroundNotification object:nil queue:mainQueue usingBlock:^(NSNotification *notification) {
        recordLifecycleTime(&lastEnteredBackgroundTime);
    }];
}

@end
