import {useCallback, useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {AccessibilityInfo} from 'react-native';
import moveAccessibilityFocus from './moveAccessibilityFocus';

type HitSlop = {x: number; y: number};

const useScreenReaderStatus = (): boolean => {
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
    useEffect(() => {
        const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setIsScreenReaderEnabled);

        return () => {
            subscription?.remove();
        };
    }, []);

    return isScreenReaderEnabled;
};

/**
 * Hook that returns whether the user has enabled the "reduce motion" accessibility setting.
 * This is used to disable animations for users who are sensitive to motion.
 * Works on iOS, Android, and Web (via react-native-web which uses prefers-reduced-motion media query).
 */
const useReducedMotion = (): boolean => {
    const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

    useEffect(() => {
        let isMounted = true;

        AccessibilityInfo.isReduceMotionEnabled()
            .then((enabled) => {
                if (!isMounted) {
                    return;
                }
                setIsReduceMotionEnabled(enabled);
            })
            .catch(() => {
                // If the check fails, default to false (animations enabled)
                if (!isMounted) {
                    return;
                }
                setIsReduceMotionEnabled(false);
            });

        const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduceMotionEnabled);

        return () => {
            isMounted = false;
            subscription?.remove();
        };
    }, []);

    return isReduceMotionEnabled;
};

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
