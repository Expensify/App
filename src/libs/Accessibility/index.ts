import {useCallback, useState, useSyncExternalStore} from 'react';
import type {AppStateStatus, LayoutChangeEvent} from 'react-native';
import {AccessibilityInfo, AppState} from 'react-native';
import Log from '@libs/Log';
import isScreenReaderEnabled from './isScreenReaderEnabled';
import moveAccessibilityFocus from './moveAccessibilityFocus';

type HitSlop = {x: number; y: number};

/**
 * Memoized warmer: success is shared via one Promise; rejection clears the memo so the next caller retries.
 * Subscribers `.then()` it to catch the boot-race — the platform listener only fires on toggles, never on the initial state.
 * `refresh()` invalidates the memo and re-warms; used on AppState resume to recover from toggles that fire while no JS listener was active.
 */
function makeWarmCache<T>(
    label: string,
    fetch: () => Promise<T>,
    apply: (value: T) => void,
): {ensure: () => Promise<void>; reset: () => void; refresh: () => Promise<void>; isWarm: () => boolean} {
    let warm: Promise<void> | null = null;
    let warmed = false;
    const ensure = () => {
        warm ??= fetch()
            .then((value) => {
                warmed = true;
                apply(value);
            })
            .catch((error: unknown) => {
                Log.warn(`[Accessibility] Failed to warm ${label} cache`, {error});
                warm = null;
            });
        return warm;
    };
    return {
        ensure,
        // reset/refresh invalidate warmed so any in-flight refresh (cold start or AppState resume) is treated as unknown until the new value resolves.
        reset: () => {
            warm = null;
            warmed = false;
        },
        refresh: () => {
            warm = null;
            warmed = false;
            return ensure();
        },
        isWarm: () => warmed,
    };
}

let cachedScreenReaderValue = false;
const screenReaderSubscribers = new Set<() => void>();
const {
    ensure: ensureScreenReaderWarm,
    reset: resetScreenReaderWarm,
    refresh: refreshScreenReaderWarm,
    isWarm: isScreenReaderCacheWarm,
} = makeWarmCache('screen-reader', isScreenReaderEnabled, (enabled) => {
    cachedScreenReaderValue = enabled;
});
ensureScreenReaderWarm();

function subscribeScreenReader(callback: () => void) {
    screenReaderSubscribers.add(callback);
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
        cachedScreenReaderValue = enabled;
        callback();
    });
    let cancelled = false;
    ensureScreenReaderWarm().then(() => {
        if (cancelled) {
            return;
        }
        callback();
    });
    return () => {
        cancelled = true;
        screenReaderSubscribers.delete(callback);
        subscription?.remove();
    };
}

function getScreenReaderSnapshot() {
    return cachedScreenReaderValue;
}

const useScreenReaderStatus = (): boolean => useSyncExternalStore(subscribeScreenReader, getScreenReaderSnapshot, () => false);

function isScreenReaderEnabledSync(): boolean {
    return cachedScreenReaderValue;
}

// True only after the platform query has resolved with false; returns false while warm-up is in-flight (cold start OR AppState resume) so 'unknown' is treated as 'might be on'.
function isScreenReaderKnownOff(): boolean {
    return isScreenReaderCacheWarm() && !cachedScreenReaderValue;
}

let cachedReduceMotionValue = false;
const reduceMotionSubscribers = new Set<() => void>();
const {
    ensure: ensureReduceMotionWarm,
    reset: resetReduceMotionWarm,
    refresh: refreshReduceMotionWarm,
} = makeWarmCache(
    'reduce-motion',
    () => AccessibilityInfo.isReduceMotionEnabled(),
    (enabled) => {
        cachedReduceMotionValue = enabled;
    },
);
ensureReduceMotionWarm();

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

function resetForTests() {
    cachedScreenReaderValue = false;
    cachedReduceMotionValue = false;
    resetScreenReaderWarm();
    resetReduceMotionWarm();
    screenReaderSubscribers.clear();
    reduceMotionSubscribers.clear();
    appStateSubscription?.remove();
    appStateSubscription = null;
}

function subscribeReduceMotion(callback: () => void) {
    reduceMotionSubscribers.add(callback);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        cachedReduceMotionValue = enabled;
        callback();
    });
    let cancelled = false;
    ensureReduceMotionWarm().then(() => {
        if (cancelled) {
            return;
        }
        callback();
    });
    return () => {
        cancelled = true;
        reduceMotionSubscribers.delete(callback);
        subscription?.remove();
    };
}

/*
 * Re-warm both caches on background→active because change events fired while the JS thread was suspended aren't reliably delivered on resume.
 * Skip iOS 'inactive' transitions (Notification Center, Control Center, banners) — those don't suspend JS.
 */
let previousAppStateStatus: AppStateStatus = AppState.currentState ?? 'active';
appStateSubscription = AppState.addEventListener('change', (status) => {
    const wasBackgrounded = previousAppStateStatus === 'background';
    previousAppStateStatus = status;
    if (!wasBackgrounded || status !== 'active') {
        return;
    }
    const prevScreenReader = cachedScreenReaderValue;
    const prevReduceMotion = cachedReduceMotionValue;
    Promise.all([refreshScreenReaderWarm(), refreshReduceMotionWarm()]).then(() => {
        if (cachedScreenReaderValue !== prevScreenReader) {
            for (const cb of screenReaderSubscribers) {
                cb();
            }
        }
        if (cachedReduceMotionValue !== prevReduceMotion) {
            for (const cb of reduceMotionSubscribers) {
                cb();
            }
        }
    });
});

function getReduceMotionSnapshot() {
    return cachedReduceMotionValue;
}

const useReducedMotion = (): boolean => useSyncExternalStore(subscribeReduceMotion, getReduceMotionSnapshot, () => false);

const getHitSlopForSize = ({x, y}: HitSlop) => {
    /* according to https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/
    the minimum tappable area is 44x44 points */
    const minimumSize = 44;
    const hitSlopVertical = Math.max(minimumSize - x, 0) / 2;
    const hitSlopHorizontal = Math.max(minimumSize - y, 0) / 2;
    return {
        top: hitSlopVertical,
        bottom: hitSlopVertical,
        left: hitSlopHorizontal,
        right: hitSlopHorizontal,
    };
};

const useAutoHitSlop = () => {
    const [frameSize, setFrameSize] = useState({x: 0, y: 0});
    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const {layout} = event.nativeEvent;
            if (layout.width !== frameSize.x && layout.height !== frameSize.y) {
                setFrameSize({x: layout.width, y: layout.height});
            }
        },
        [frameSize.x, frameSize.y],
    );
    return [getHitSlopForSize(frameSize), onLayout] as const;
};

export {resetForTests};
export default {
    moveAccessibilityFocus,
    useScreenReaderStatus,
    useAutoHitSlop,
    useReducedMotion,
    isScreenReaderEnabledSync,
    isScreenReaderKnownOff,
};
