import {easing} from '@components/Modal/ReanimatedModal/utils';

import type {LayoutChangeEvent} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';

import {useLayoutEffect, useRef, useState} from 'react';
import {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

const EXPAND_COLLAPSE_DURATION = 300;

/** Runs the expand/collapse animation itself. Lives outside the hook so effects can call it without re-running on every render. */
function animateHeightTo(animatedHeight: SharedValue<number>, target: number, setIsRendered: (isRendered: boolean) => void) {
    animatedHeight.set(
        withTiming(target, {duration: EXPAND_COLLAPSE_DURATION, easing}, (finished) => {
            if (!finished || target) {
                return;
            }
            scheduleOnRN(setIsRendered, false);
        }),
    );
}

function useExpandCollapseAnimation(isExpanded: boolean, shouldAddBorderHeight: boolean, resetKey?: string) {
    const contentHeight = useSharedValue(0);
    const animatedHeight = useSharedValue(0);
    const [isRendered, setIsRendered] = useState(isExpanded);
    const prevResetKeyRef = useRef<string | undefined>(undefined);
    const prevIsExpandedRef = useRef(isExpanded);

    // Only an expand/collapse the user asked for animates. A measurement nobody asked for, such as a fresh or
    // recycled list cell scrolling back into view, lands on its final height instead, so scrolling the
    // list does not replay the expand animation.
    const shouldAnimateNextMeasurementRef = useRef(false);

    // FlashList may recycle this cell for a different group — reset measured height when the row identity changes.
    useLayoutEffect(() => {
        if (prevResetKeyRef.current !== undefined && prevResetKeyRef.current !== resetKey) {
            contentHeight.set(0);
            animatedHeight.set(0);
            shouldAnimateNextMeasurementRef.current = false;
            prevIsExpandedRef.current = isExpanded;
            setIsRendered(isExpanded);
        }
        prevResetKeyRef.current = resetKey;
    }, [resetKey, isExpanded, contentHeight, animatedHeight]);

    // Mount content for collapse animation once expanded; unmount after animation via scheduleOnRN callback.
    if (isExpanded && !isRendered) {
        setIsRendered(true);
    }

    useLayoutEffect(() => {
        if (prevIsExpandedRef.current === isExpanded) {
            return;
        }
        prevIsExpandedRef.current = isExpanded;

        if (isExpanded && !contentHeight.get()) {
            // The content has never been measured, so its height is still unknown: onLayout owns this animation.
            shouldAnimateNextMeasurementRef.current = true;
            return;
        }
        animateHeightTo(animatedHeight, isExpanded ? contentHeight.get() : 0, setIsRendered);
    }, [isExpanded, contentHeight, animatedHeight]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.get() + (shouldAddBorderHeight ? 1 : 0),
        overflow: 'hidden',
    }));

    const onLayout = (e: LayoutChangeEvent) => {
        const height = e.nativeEvent.layout.height;
        if (!height || height === contentHeight.get()) {
            return;
        }
        contentHeight.set(height);

        if (shouldAnimateNextMeasurementRef.current) {
            shouldAnimateNextMeasurementRef.current = false;
            animateHeightTo(animatedHeight, isExpanded ? height : 0, setIsRendered);
            return;
        }

        // While collapsed the height is already zero or animating towards it, so leave that animation alone.
        // Overwriting it here would cancel it, and its completion callback is what unmounts the content.
        if (!isExpanded) {
            return;
        }
        animatedHeight.set(height);
    };

    return {isRendered, animatedStyle, onLayout};
}

export default useExpandCollapseAnimation;
