import usePrevious from '@hooks/usePrevious';

import type {LayoutChangeEvent, ViewStyle} from 'react-native';
import type {AnimatedStyle, SharedValue} from 'react-native-reanimated';

import {useEffect, useRef} from 'react';
import {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

import {COLLAPSE_DURATION, RESTORE_DURATION} from './constants';
import useCollapsibleScreenState from './useCollapsibleScreenState';

type CollapsibleHeader = {
    /** Measured height of the wrapped content. -1 signals "not yet measured". */
    naturalHeight: SharedValue<number>;

    /** Height the wrapper is currently animated to. Callers drive the collapse by writing to it. */
    animatedHeight: SharedValue<number>;

    /** UI-thread mirror of the screen's focus state. */
    isFocusedSV: SharedValue<boolean>;

    /** UI-thread mirror of whether the window is in landscape. */
    isInLandscapeModeSV: SharedValue<boolean>;

    /** To be spread onto `CollapsibleHeaderView`, which owns the two animated wrappers. */
    onLayout: (e: LayoutChangeEvent) => void;
    outerStyle: AnimatedStyle<ViewStyle>;
    innerStyle: AnimatedStyle<ViewStyle>;
};

/** Collapses the wrapped content to `targetHeight`. Quick, so the header is out of the way before the input lands. */
function collapseHeaderTo(animatedHeight: SharedValue<number>, targetHeight: number) {
    'worklet';

    animatedHeight.set(withTiming(targetHeight, {duration: COLLAPSE_DURATION, easing: Easing.out(Easing.cubic)}));
}

/** Gives the wrapped content its measured height back. */
function restoreHeaderTo(animatedHeight: SharedValue<number>, naturalHeight: number) {
    'worklet';

    animatedHeight.set(withTiming(naturalHeight, {duration: RESTORE_DURATION}));
}

/**
 * Measurement and animated styles shared by `CollapsibleHeaderOnKeyboard` and `CollapsibleHeaderOnKeyboardGroupMember`.
 */
function useCollapsibleHeader(onNaturalHeightChange?: (height: number) => void): CollapsibleHeader {
    const {isFocused, isInLandscapeMode, isFocusedSV, isInLandscapeModeSV} = useCollapsibleScreenState();
    const prevIsFocused = usePrevious(isFocused);
    // JS ref guards against re-measurement when the Reanimated.View fires onLayout with height=0
    const naturalHeightRef = useRef(-1);
    // Worklet-accessible mirror of naturalHeightRef. -1 signals "not yet measured".
    const naturalHeight = useSharedValue(-1);
    // Drives the animated style
    const animatedHeight = useSharedValue(0);

    const onLayout = (e: LayoutChangeEvent) => {
        const height = e.nativeEvent.layout.height;

        if (height <= 0) {
            return;
        }

        // Portrait: always sync height immediately in both directions (e.g. next step appears, or
        // Submit shows beside More after Retract). Avoids stale clipped height from the collapse animation.
        if (!isInLandscapeMode) {
            naturalHeightRef.current = height;
            naturalHeight.set(height);
            animatedHeight.set(height);
            onNaturalHeightChange?.(height);
            return;
        }

        // First measurement, or content changed while keyboard is fully open
        // (to skip onLayout calls triggered by our own height animation collapsing the view to 0)
        if (naturalHeightRef.current === -1 || (animatedHeight.get() >= naturalHeightRef.current && height !== naturalHeightRef.current)) {
            naturalHeightRef.current = height;
            naturalHeight.set(height);
            animatedHeight.set(height);
            onNaturalHeightChange?.(height);
        }
    };

    // Restores the header when the screen goes from landscape to portrait mode.
    useEffect(() => {
        const naturalHeightValue = naturalHeight.get();
        if (!isInLandscapeMode && isFocused && naturalHeightValue !== -1) {
            animatedHeight.set(withTiming(naturalHeightValue, {duration: RESTORE_DURATION}));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this effect when the screen orientation changes
    }, [isInLandscapeMode]);

    // Restores the header when the screen loses focus
    useEffect(() => {
        if (!prevIsFocused || isFocused) {
            return;
        }

        const naturalHeightValue = naturalHeight.get();
        if (naturalHeightValue === -1) {
            return;
        }
        animatedHeight.set(withTiming(naturalHeightValue, {duration: RESTORE_DURATION}));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this effect when the screen loses focus
    }, [isFocused]);

    // Outer wrapper controls layout space (height collapses to 0, clips overflowing content).
    const outerStyle = useAnimatedStyle<ViewStyle>(() => {
        // When fully open, leave height undefined so the view sizes itself naturally.
        // This avoids fighting the layout engine during orientation changes.
        if (animatedHeight.get() >= naturalHeight.get()) {
            return {overflow: 'hidden', height: 'auto'};
        }
        return {height: animatedHeight.get(), overflow: 'hidden'};
    });

    // Inner wrapper slides the content upward during landscape keyboard collapse only.
    const innerStyle = useAnimatedStyle<ViewStyle>(() => {
        if (animatedHeight.get() >= naturalHeight.get()) {
            return {transform: [{translateY: 0}]};
        }

        if (!isInLandscapeModeSV.get()) {
            return {transform: [{translateY: 0}]};
        }

        return {transform: [{translateY: animatedHeight.get() - naturalHeight.get()}]};
    });

    return {naturalHeight, animatedHeight, isFocusedSV, isInLandscapeModeSV, onLayout, outerStyle, innerStyle};
}

export default useCollapsibleHeader;
export {collapseHeaderTo, restoreHeaderTo};
export type {CollapsibleHeader};
