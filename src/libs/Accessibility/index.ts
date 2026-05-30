import {useCallback, useState, useSyncExternalStore} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {AccessibilityInfo} from 'react-native';
import Log from '@libs/Log';
import isScreenReaderEnabled from './isScreenReaderEnabled';
import moveAccessibilityFocus from './moveAccessibilityFocus';

type HitSlop = {x: number; y: number};

/**
 * Memoized warmer: success is shared via one Promise; rejection clears the memo so the next caller retries.
 * Subscribers `.then()` it to catch the boot-race — the platform listener only fires on toggles, never on the initial state.
 */
function makeWarmCache<T>(label: string, fetch: () => Promise<T>, apply: (value: T) => void): {ensure: () => Promise<void>; reset: () => void} {
    let warm: Promise<void> | null = null;
    return {
        ensure: () => {
            warm ??= fetch()
                .then(apply)
                .catch((error: unknown) => {
                    Log.warn(`[Accessibility] Failed to warm ${label} cache`, {error});
                    warm = null;
                });
            return warm;
        },
        reset: () => {
            warm = null;
        },
    };
}

let cachedScreenReaderValue = false;
const {ensure: ensureScreenReaderWarm, reset: resetScreenReaderWarm} = makeWarmCache('screen-reader', isScreenReaderEnabled, (enabled) => {
    cachedScreenReaderValue = enabled;
});
ensureScreenReaderWarm();

function subscribeScreenReader(callback: () => void) {
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

let cachedReduceMotionValue = false;
const {ensure: ensureReduceMotionWarm, reset: resetReduceMotionWarm} = makeWarmCache(
    'reduce-motion',
    () => AccessibilityInfo.isReduceMotionEnabled(),
    (enabled) => {
        cachedReduceMotionValue = enabled;
    },
);

function resetForTests() {
    cachedScreenReaderValue = false;
    cachedReduceMotionValue = false;
    resetScreenReaderWarm();
    resetReduceMotionWarm();
}

function subscribeReduceMotion(callback: () => void) {
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
        subscription?.remove();
    };
}

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
};
