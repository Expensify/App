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

// Warm the cache at module load so the sync read is meaningful before any hook subscribes.
warmCache('screen-reader', isScreenReaderEnabled, (enabled) => {
    cachedScreenReaderValue = enabled;
});

function subscribeScreenReader(callback: () => void) {
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
        cachedScreenReaderValue = enabled;
        callback();
    });

    warmCache('screen-reader', isScreenReaderEnabled, (enabled) => {
        cachedScreenReaderValue = enabled;
        callback();
    });

    return () => subscription?.remove();
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
