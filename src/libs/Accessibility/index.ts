import Log from '@libs/Log';

import type {LayoutChangeEvent} from 'react-native';

import {useCallback, useState, useSyncExternalStore} from 'react';
import {AccessibilityInfo, AppState} from 'react-native';

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
): {ensure: () => Promise<void>; reset: () => void; refresh: () => Promise<void>; noteAuthoritative: (value: T) => void; isWarm: () => boolean} {
    let warm: Promise<void> | null = null;
    let warmed = false;
    let generation = 0;
    const ensure = () => {
        if (warm) {
            return warm;
        }
        // Capture at fetch start; a reset/refresh bumps generation, so a superseded resolve sees a mismatch and discards its value.
        const myGeneration = generation;
        warm = fetch()
            .then((value) => {
                if (myGeneration !== generation) {
                    return;
                }
                warmed = true;
                apply(value);
            })
            .catch((error: unknown) => {
                Log.warn(`[Accessibility] Failed to warm ${label} cache`, {error});
                if (myGeneration === generation) {
                    warm = null;
                }
            });
        return warm;
    };
    return {
        ensure,
        // Bump generation so a superseded in-flight fetch can't overwrite the latest value; clear warmed so the warm-up window is treated as unknown.
        reset: () => {
            warm = null;
            warmed = false;
            generation += 1;
        },
        refresh: () => {
            warm = null;
            warmed = false;
            generation += 1;
            return ensure();
        },
        // Platform event is the source of truth: bump generation so any stale in-flight fetch can't overwrite it, mark warm, and apply.
        noteAuthoritative: (value: T) => {
            generation += 1;
            warm = null;
            warmed = true;
            apply(value);
        },
        isWarm: () => warmed,
    };
}

let cachedScreenReaderValue = false;
const screenReaderSubscribers = new Set<() => void>();
let screenReaderListenerHandle: ReturnType<typeof AccessibilityInfo.addEventListener> | null = null;
const {
    ensure: ensureScreenReaderWarm,
    reset: resetScreenReaderWarm,
    refresh: refreshScreenReaderWarm,
    noteAuthoritative: noteScreenReaderEventValue,
    isWarm: isScreenReaderCacheWarm,
} = makeWarmCache('screen-reader', isScreenReaderEnabled, (enabled) => {
    cachedScreenReaderValue = enabled;
});
ensureScreenReaderWarm();

/*
 * One shared native listener across all subscribers, kept attached after the first attach — detaching mid-gap would leak
 * a stale cache if the OS SR state toggled while nothing was listening. `resetForTests` detaches for test isolation.
 */
function subscribeScreenReader(callback: () => void) {
    screenReaderSubscribers.add(callback);
    if (!screenReaderListenerHandle) {
        screenReaderListenerHandle = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
            noteScreenReaderEventValue(enabled);
            for (const cb of screenReaderSubscribers) {
                cb();
            }
        });
    }
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
    };
}

function getScreenReaderSnapshot() {
    return cachedScreenReaderValue;
}

const useScreenReaderStatus = (): boolean => useSyncExternalStore(subscribeScreenReader, getScreenReaderSnapshot, () => false);

function isScreenReaderEnabledSync(): boolean {
    return cachedScreenReaderValue;
}

type ScreenReaderState = 'enabled' | 'disabled' | 'unknown';

/** Tri-state — `'unknown'` while the platform query is in-flight (cold start, AppState resume) so callers can register/capture defensively instead of bailing the moment the boolean cache says `false`. */
function getScreenReaderState(): ScreenReaderState {
    if (!isScreenReaderCacheWarm()) {
        return 'unknown';
    }
    return cachedScreenReaderValue ? 'enabled' : 'disabled';
}

/** Reactive variant of {@link getScreenReaderState} — for effects that need the tri-state inside React. */
const useScreenReaderState = (): ScreenReaderState => useSyncExternalStore(subscribeScreenReader, getScreenReaderState, () => 'unknown');

let cachedReduceMotionValue = false;
const reduceMotionSubscribers = new Set<() => void>();
let reduceMotionListenerHandle: ReturnType<typeof AccessibilityInfo.addEventListener> | null = null;
const {
    ensure: ensureReduceMotionWarm,
    reset: resetReduceMotionWarm,
    refresh: refreshReduceMotionWarm,
    noteAuthoritative: noteReduceMotionEventValue,
} = makeWarmCache(
    'reduce-motion',
    () => AccessibilityInfo.isReduceMotionEnabled(),
    (enabled) => {
        cachedReduceMotionValue = enabled;
    },
);
ensureReduceMotionWarm();

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
// Seed from currentState so a cold-start in 'background' (silent push, pre-warm) still refreshes on the first 'active'.
let wasBackgroundedSinceLastActive = AppState.currentState !== 'active';

function resetForTests() {
    cachedScreenReaderValue = false;
    cachedReduceMotionValue = false;
    resetScreenReaderWarm();
    resetReduceMotionWarm();
    screenReaderSubscribers.clear();
    reduceMotionSubscribers.clear();
    screenReaderListenerHandle?.remove();
    screenReaderListenerHandle = null;
    reduceMotionListenerHandle?.remove();
    reduceMotionListenerHandle = null;
    appStateSubscription?.remove();
    appStateSubscription = null;
    wasBackgroundedSinceLastActive = false;
}

/** Shared native listener (mirrors {@link subscribeScreenReader}) — same lazy-attach + never-detach policy so the cache can't go stale between subscriber gaps. */
function subscribeReduceMotion(callback: () => void) {
    reduceMotionSubscribers.add(callback);
    if (!reduceMotionListenerHandle) {
        reduceMotionListenerHandle = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
            noteReduceMotionEventValue(enabled);
            for (const cb of reduceMotionSubscribers) {
                cb();
            }
        });
    }
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
    };
}

/*
 * Re-warm caches on resume from a real suspension. iOS resume is `background → inactive → active`; transient `inactive` (Notification Center,
 * Control Center, banners) is `active → inactive → active`. The sticky flag distinguishes them — only a true background hop triggers refresh.
 */
appStateSubscription = AppState.addEventListener('change', (status) => {
    if (status === 'background') {
        wasBackgroundedSinceLastActive = true;
        return;
    }
    if (status !== 'active' || !wasBackgroundedSinceLastActive) {
        return;
    }
    wasBackgroundedSinceLastActive = false;
    // refresh() invalidates `warmed` synchronously — notify so reactive consumers re-read during the in-flight window.
    const settled = Promise.all([refreshScreenReaderWarm(), refreshReduceMotionWarm()]);
    for (const cb of screenReaderSubscribers) {
        cb();
    }
    for (const cb of reduceMotionSubscribers) {
        cb();
    }
    settled
        .then(() => {
            // Re-notify unconditionally: `warmed` flips back true even when value unchanged.
            for (const cb of screenReaderSubscribers) {
                cb();
            }
            for (const cb of reduceMotionSubscribers) {
                cb();
            }
        })
        .catch((error: unknown) => {
            Log.warn('[Accessibility] AppState refresh notify threw', {error});
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
    useScreenReaderState,
    useAutoHitSlop,
    useReducedMotion,
    isScreenReaderEnabledSync,
    getScreenReaderState,
};
