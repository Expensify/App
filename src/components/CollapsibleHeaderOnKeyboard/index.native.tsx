import React, {useEffect, useRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import Reanimated, {useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeMode from '@libs/isInLandscapeMode';
import type {CollapsibleHeaderOnKeyboardProps} from './types';

const COLLAPSE_DURATION = 200;
const RESTORE_DURATION = 300;
// Assumed vertical space for the focused input field — used to reserve space above the keyboard.
const VERTICAL_SPACE_FOR_FOCUSED_INPUT = 120;

/**
 * Wraps a header and collapses it upward when the keyboard is open and there is not enough
 * vertical space for a focused input between the header bottom and the keyboard top.
 * Restores the header when the keyboard closes.
 *
 * Intended for landscape mode on phones where the keyboard + header can leave no room for inputs.
 * Uses height animation (not translateY) so the freed space is reclaimed by the layout below.
 */
function CollapsibleHeaderOnKeyboard({children, collapsibleHeaderOffset = 0}: CollapsibleHeaderOnKeyboardProps) {
    // JS ref guards against re-measurement when the Reanimated.View fires onLayout with height=0
    const naturalHeightRef = useRef(-1);
    // Worklet-accessible mirror of naturalHeightRef. -1 signals "not yet measured".
    const naturalHeight = useSharedValue(-1);
    // Drives the animated style
    const animatedHeight = useSharedValue(0);

    const {height: keyboardHeightSV, progress: keyboardProgressSV} = useReanimatedKeyboardAnimation();

    const {windowWidth, windowHeight} = useWindowDimensions();
    // Keep window dimensions and offset accessible on the UI thread. Stable refs, excluded from deps.
    const windowHeightSV = useSharedValue(windowHeight);
    const isLandscapeSV = useSharedValue(isInLandscapeMode(windowWidth, windowHeight));
    const collapsibleHeaderOffsetSV = useSharedValue(collapsibleHeaderOffset);
    useEffect(() => {
        windowHeightSV.set(windowHeight);
        isLandscapeSV.set(isInLandscapeMode(windowWidth, windowHeight));
    }, [windowWidth, windowHeight]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        collapsibleHeaderOffsetSV.set(collapsibleHeaderOffset);
    }, [collapsibleHeaderOffset]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Runs on the UI thread whenever keyboard state changes.
    // Fires at two key moments:
    // 1. When keyboard just starts opening: on iOS keyboardHeight is already at its final value
    //    (set by onKeyboardMoveStart), so the collapse begins before the list scrolls the
    //    input into place — preventing the input from ending up behind the collapsed header.
    // 2. When keyboard is fully open: on Android keyboardHeight only reaches its final value at
    //    this point (set by onKeyboardMoveEnd), so this is the earliest we can act correctly.
    useAnimatedReaction(
        () => ({keyboardHeight: keyboardHeightSV.get(), keyboardProgress: keyboardProgressSV.get(), isLandscape: isLandscapeSV.get(), windowHeightValue: windowHeightSV.get()}),
        ({keyboardHeight, keyboardProgress, isLandscape, windowHeightValue}, previous) => {
            const prevKeyboardProgress = previous?.keyboardProgress ?? 0;
            const naturalHeightValue = naturalHeight.get();

            // Keyboard fully closed — restore header (guard avoids redundant withTiming calls
            // during the first few frames of keyboard opening when keyboardProgress is still < 0.01).
            if (keyboardProgress < 0.01) {
                if (animatedHeight.get() < naturalHeightValue) {
                    animatedHeight.set(withTiming(naturalHeightValue, {duration: RESTORE_DURATION}));
                }
                return;
            }

            // Portrait mode — no collapse needed. Snap to full height in case orientation
            // changed while the header was collapsed, then bail out.
            if (!isLandscape) {
                animatedHeight.set(naturalHeightValue);
                return;
            }

            // Only act at the two transition points described above, not on every intermediate frame.
            const keyboardJustStartedOpening = prevKeyboardProgress < 0.01;
            const keyboardJustFullyOpened = keyboardProgress > 0.99 && prevKeyboardProgress <= 0.99;

            if (!keyboardJustStartedOpening && !keyboardJustFullyOpened) {
                return;
            }

            // keyboardHeight is negative when open (e.g. -291), so keyboardTop = windowHeightValue + keyboardHeight.
            // Target header height: give the input exactly the space it needs above the keyboard,
            // the header gets what remains. Clamped to [0, naturalHeight].
            const keyboardTop = windowHeightValue + keyboardHeight;
            const targetHeight = Math.max(0, keyboardTop - VERTICAL_SPACE_FOR_FOCUSED_INPUT - collapsibleHeaderOffsetSV.get());

            if (targetHeight >= naturalHeightValue) {
                // Enough space for the full header plus the input — restore or keep.
                animatedHeight.set(withTiming(naturalHeightValue, {duration: RESTORE_DURATION}));
            } else {
                animatedHeight.set(withTiming(targetHeight, {duration: COLLAPSE_DURATION}));
            }
        },
    );

    // Outer wrapper controls layout space (height collapses to 0, clips overflowing content).
    const outerStyle = useAnimatedStyle(() => {
        // When fully open, leave height undefined so the view sizes itself naturally.
        // This avoids fighting the layout engine during orientation changes.
        if (animatedHeight.get() > naturalHeight.get()) {
            return {overflow: 'hidden'};
        }
        return {height: animatedHeight.get(), overflow: 'hidden'};
    });

    // Inner wrapper slides the content upward. translateY = animatedHeight - naturalHeight,
    // so it goes from 0 (fully open) to -naturalHeight (fully collapsed), making the header
    // appear to exit through the top while the outer clip hides it progressively.
    const innerStyle = useAnimatedStyle(() => {
        if (animatedHeight.get() > naturalHeight.get()) {
            return {};
        }
        return {transform: [{translateY: animatedHeight.get() - naturalHeight.get()}]};
    });

    return (
        <Reanimated.View
            style={outerStyle}
            onLayout={onLayout}
        >
            <Reanimated.View style={innerStyle}>{children}</Reanimated.View>
        </Reanimated.View>
    );
}

export default CollapsibleHeaderOnKeyboard;
