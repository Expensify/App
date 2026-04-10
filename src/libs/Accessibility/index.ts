import {useCallback, useState, useSyncExternalStore} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {AccessibilityInfo} from 'react-native';
import isScreenReaderEnabled from './isScreenReaderEnabled';
import moveAccessibilityFocus from './moveAccessibilityFocus';

type HitSlop = {x: number; y: number};

let cachedScreenReaderValue = false;

function subscribeScreenReader(callback: () => void) {
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
        cachedScreenReaderValue = enabled;
        callback();
    });

    isScreenReaderEnabled()
        .then((enabled) => {
            cachedScreenReaderValue = enabled;
            callback();
        })
        .catch(() => {});

    return () => subscription?.remove();
}

function getScreenReaderSnapshot() {
    return cachedScreenReaderValue;
}

const useScreenReaderStatus = (): boolean => useSyncExternalStore(subscribeScreenReader, getScreenReaderSnapshot, () => false);

let cachedReduceMotionValue = false;

function subscribeReduceMotion(callback: () => void) {
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        cachedReduceMotionValue = enabled;
        callback();
    });

    AccessibilityInfo.isReduceMotionEnabled()
        .then((enabled) => {
            cachedReduceMotionValue = enabled;
            callback();
        })
        .catch(() => {});

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
};
