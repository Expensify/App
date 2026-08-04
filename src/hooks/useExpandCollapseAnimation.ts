import {easing} from '@components/Modal/ReanimatedModal/utils';

import type {LayoutChangeEvent} from 'react-native';

import {useLayoutEffect, useRef, useState} from 'react';
import {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

const EXPAND_COLLAPSE_DURATION = 300;

function useExpandCollapseAnimation(isExpanded: boolean, shouldAddBorderHeight: boolean, resetKey?: string) {
    const contentHeight = useSharedValue(0);
    const hasExpanded = useSharedValue(isExpanded);
    const [isRendered, setIsRendered] = useState(isExpanded);
    const prevResetKeyRef = useRef<string | undefined>(undefined);

    // FlashList may recycle this cell for a different group — reset measured height when the row identity changes.
    useLayoutEffect(() => {
        if (prevResetKeyRef.current !== undefined && prevResetKeyRef.current !== resetKey) {
            contentHeight.set(0);
            setIsRendered(isExpanded);
        }
        prevResetKeyRef.current = resetKey;
    }, [resetKey, isExpanded, contentHeight]);

    // Keep Reanimated shared value in sync with prop (matches AnimatedCollapsible).
    hasExpanded.set(isExpanded);

    // Mount content for collapse animation once expanded; unmount after animation via scheduleOnRN callback.
    if (isExpanded && !isRendered) {
        setIsRendered(true);
    }

    const animatedHeight = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }
        const target = hasExpanded.get() ? contentHeight.get() : 0;
        return withTiming(target, {duration: EXPAND_COLLAPSE_DURATION, easing}, (finished) => {
            if (!finished || target) {
                return;
            }
            scheduleOnRN(setIsRendered, false);
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.get() + (shouldAddBorderHeight ? 1 : 0),
        overflow: 'hidden',
    }));

    const onLayout = (e: LayoutChangeEvent) => {
        const height = e.nativeEvent.layout.height;
        if (height) {
            contentHeight.set(height);
        }
    };

    return {isRendered, animatedStyle, onLayout};
}

export default useExpandCollapseAnimation;
