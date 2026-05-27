import {useCallback, useState, useSyncExternalStore} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {AccessibilityInfo} from 'react-native';
import Log from '@libs/Log';
import isScreenReaderEnabled from './isScreenReaderEnabled';
import moveAccessibilityFocus from './moveAccessibilityFocus';

type HitSlop = {x: number; y: number};

function warmCache<T>(label: string, fetch: () => Promise<T>, apply: (value: T) => void): void {
    fetch()
        .then(apply)
        .catch((error: unknown) => {
            Log.warn(`[Accessibility] Failed to warm ${label} cache`, {error});
        });
}

let cachedScreenReaderValue = false;
const screenReaderSubscribers = new Set<() => void>();

function setScreenReaderValue(value: boolean): void {
    if (cachedScreenReaderValue === value) {
        return;
    }
    cachedScreenReaderValue = value;
    for (const cb of screenReaderSubscribers) {
        cb();
    }
}

// Single always-on listener. Decouples cache freshness from React subscriber lifecycle — toggling TalkBack mid-session updates the cache even if no `useScreenReaderStatus` consumer is currently mounted.
AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderValue);
warmCache('screen-reader', isScreenReaderEnabled, setScreenReaderValue);

function subscribeScreenReader(callback: () => void): () => void {
    screenReaderSubscribers.add(callback);
    return () => {
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

let cachedReduceMotionValue = false;

function subscribeReduceMotion(callback: () => void) {
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        cachedReduceMotionValue = enabled;
        callback();
    });

    warmCache(
        'reduce-motion',
        () => AccessibilityInfo.isReduceMotionEnabled(),
        (enabled) => {
            cachedReduceMotionValue = enabled;
            callback();
        },
    );

    return () => subscription?.remove();
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

export default {
    moveAccessibilityFocus,
    useScreenReaderStatus,
    useAutoHitSlop,
    useReducedMotion,
    isScreenReaderEnabledSync,
};
