import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import Reanimated, {Easing, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import type {CollapsibleHeaderOnKeyboardProps} from './types';

const COLLAPSE_DURATION = 100;
const RESTORE_DURATION = 300;
// Assumed vertical space for the focused input field — used to reserve space above the keyboard.
const VERTICAL_SPACE_FOR_FOCUSED_INPUT = 120;
const KEYBOARD_OPENING_PROGRESS_THRESHOLDS = [0.5, 0.7, 0.8, 0.85, 0.9, 0.95, 0.99];

function isKeyboardOpeningAtGivenProgress(keyboardProgress: number, prevKeyboardProgress: number, requiredProgress: number[]): boolean {
    'worklet';

    return requiredProgress.some((progress) => keyboardProgress > progress && prevKeyboardProgress <= progress);
}

/**
 * Wraps a header and collapses it upward when the keyboard is open and there is not enough
 * vertical space for a focused input between the header bottom and the keyboard top.
 * Restores the header when the keyboard closes.
 *
 * Intended for landscape mode on phones where the keyboard + header can leave no room for inputs.
 * Uses height animation (not translateY) so the freed space is reclaimed by the layout below.
 */
function CollapsibleHeaderOnKeyboard({children, collapsibleHeaderOffset = 0}: CollapsibleHeaderOnKeyboardProps) {
    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);
    // JS ref guards against re-measurement when the Reanimated.View fires onLayout with height=0
    const naturalHeightRef = useRef(-1);
    // Worklet-accessible mirror of naturalHeightRef. -1 signals "not yet measured".
    const naturalHeight = useSharedValue(-1);
    // Drives the animated style
    const animatedHeight = useSharedValue(0);

    const {height: keyboardHeightSV, progress: keyboardProgressSV} = useReanimatedKeyboardAnimation();

    const {windowWidth, windowHeight} = useWindowDimensions();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);
    // Keep window dimensions and offset accessible on the UI thread. Stable refs, excluded from deps.
    const windowHeightSV = useSharedValue(windowHeight);
    const collapsibleHeaderOffsetSV = useSharedValue(collapsibleHeaderOffset);
    const isFocusedSV = useSharedValue(isFocused);
    const isInLandscapeModeSV = useSharedValue(isInLandscapeMode);
    useEffect(() => {
        windowHeightSV.set(windowHeight);
    }, [windowHeight, windowHeightSV]);
    useEffect(() => {
        collapsibleHeaderOffsetSV.set(collapsibleHeaderOffset);
    }, [collapsibleHeaderOffset, collapsibleHeaderOffsetSV]);
    useEffect(() => {
        isFocusedSV.set(isFocused);
    }, [isFocused, isFocusedSV]);
    useEffect(() => {
        isInLandscapeModeSV.set(isInLandscapeMode);
    }, [isInLandscapeMode, isInLandscapeModeSV]);

    const onLayout = (e: LayoutChangeEvent) => {
        const height = e.nativeEvent.layout.height;

        if (height <= 0) {
            return;
        }
        // First measurement, or content changed while header is fully open
        // (to skip onLayout calls triggered by our own height animation collapsing the view to 0)
        if (naturalHeightRef.current === -1 || animatedHeight.get() >= naturalHeightRef.current) {
            naturalHeightRef.current = height;
            naturalHeight.set(height);
            animatedHeight.set(height);
        }
    };

    // Restores the header when the screen goes from landscape to portrait mode.
    useEffect(() => {
        const naturalHeightValue = naturalHeightRef.current;
        if (!isInLandscapeMode && isFocused && naturalHeightValue !== -1) {
            animatedHeight.set(withTiming(naturalHeightValue, {duration: RESTORE_DURATION}));
        }
    }, [isInLandscapeMode, isFocused, animatedHeight]);

    // Restores the header when the screen loses focus
    useEffect(() => {
        if (!prevIsFocused || isFocused) {
            return;
        }

        const naturalHeightValue = naturalHeightRef.current;
        if (naturalHeightValue === -1) {
            return;
        }
        animatedHeight.set(withTiming(naturalHeightValue, {duration: RESTORE_DURATION}));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this effect when the screen loses focus
    }, [isFocused]);

    // Runs on the UI thread whenever keyboard state changes.
    // Fires at two key moments:
    // 1. When keyboard just starts opening: on iOS keyboardHeight is already at its final value
    //    (set by onKeyboardMoveStart), so the collapse begins before the list scrolls the
    //    input into place — preventing the input from ending up behind the collapsed header.
    // 2. When keyboard is reaching a threshold while opening: on Android keyboardHeight
    //    reaches its final value when fully open (set by onKeyboardMoveEnd), so we check at thresholds
    //    to smoothly collapse the header.
    useAnimatedReaction(
        () => ({
            keyboardHeight: keyboardHeightSV.get(),
            keyboardProgress: keyboardProgressSV.get(),
            windowHeightValue: windowHeightSV.get(),
        }),
        ({keyboardHeight, keyboardProgress, windowHeightValue}, previous) => {
            // If the screen is not focused, bail out
            if (!isFocusedSV.get() || !isInLandscapeModeSV.get()) {
                return;
            }

            // If the keyboard is closed, restore the header
            const isKeyboardClosed = keyboardProgress === 0 && keyboardHeight === 0;
            if (isKeyboardClosed) {
                animatedHeight.set(withTiming(naturalHeight.get(), {duration: RESTORE_DURATION}));
                return;
            }

            // If the keyboard is closing, bail out
            const prevKeyboardProgress = previous?.keyboardProgress ?? 0;
            if (prevKeyboardProgress >= keyboardProgress) {
                return;
            }

            // Only act when the keyboard is starting to open or reaching a threshold, not on every intermediate frame.
            const isKeyboardStartingOpening = prevKeyboardProgress === 0 && keyboardProgress > 0;
            const isKeyboardOpeningAndReachingThreshold = isKeyboardOpeningAtGivenProgress(keyboardProgress, prevKeyboardProgress, KEYBOARD_OPENING_PROGRESS_THRESHOLDS);

            if (!isKeyboardStartingOpening && !isKeyboardOpeningAndReachingThreshold) {
                return;
            }

            // keyboardHeight is negative when open (e.g. -291), so keyboardTop = windowHeightValue + keyboardHeight.
            // Target header height: give the input exactly the space it needs above the keyboard,
            // the header gets what remains. Clamped to [0, naturalHeight].
            const keyboardTop = windowHeightValue + keyboardHeight;
            const targetHeight = Math.max(0, keyboardTop - VERTICAL_SPACE_FOR_FOCUSED_INPUT - collapsibleHeaderOffsetSV.get());
            const naturalHeightValue = naturalHeight.get();

            if (targetHeight >= naturalHeightValue) {
                // Enough space for the full header plus the input — restore or keep.
                animatedHeight.set(withTiming(naturalHeightValue, {duration: RESTORE_DURATION}));
            } else {
                animatedHeight.set(withTiming(targetHeight, {duration: COLLAPSE_DURATION, easing: Easing.out(Easing.cubic)}));
            }
        },
    );

    // Outer wrapper controls layout space (height collapses to 0, clips overflowing content).
    const outerStyle = useAnimatedStyle(() => {
        // When fully open, leave height undefined so the view sizes itself naturally.
        // This avoids fighting the layout engine during orientation changes.
        if (animatedHeight.get() >= naturalHeight.get()) {
            return {overflow: 'hidden'};
        }
        return {height: animatedHeight.get(), overflow: 'hidden'};
    });

    // Inner wrapper slides the content upward. translateY = animatedHeight - naturalHeight,
    // so it goes from 0 (fully open) to -naturalHeight (fully collapsed), making the header
    // appear to exit through the top while the outer clip hides it progressively.
    const innerStyle = useAnimatedStyle(() => {
        if (animatedHeight.get() >= naturalHeight.get()) {
            return {};
        }
        return {transform: [{translateY: animatedHeight.get() - naturalHeight.get()}]};
    });

    return (
        <Reanimated.View style={outerStyle}>
            <Reanimated.View
                onLayout={onLayout}
                style={innerStyle}
            >
                {children}
            </Reanimated.View>
        </Reanimated.View>
    );
}

export default CollapsibleHeaderOnKeyboard;
