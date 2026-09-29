import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import React, {useEffect} from 'react';
import {useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import {useAnimatedReaction, useSharedValue} from 'react-native-reanimated';

import type {CollapsibleHeaderOnKeyboardProps} from './types';

import CollapsibleHeaderView from './CollapsibleHeaderView';
import {isKeyboardOpeningAtGivenProgress, KEYBOARD_OPENING_PROGRESS_THRESHOLDS, MIN_HEADER_HEIGHT_ON_COLLAPSE, VERTICAL_SPACE_FOR_FOCUSED_INPUT} from './constants';
import useCollapsibleHeader, {collapseHeaderTo, restoreHeaderTo} from './useCollapsibleHeader';

/**
 * Wraps a header and collapses it upward when the keyboard is open and there is not enough
 * vertical space for a focused input between the header bottom and the keyboard top.
 * Restores the header when the keyboard closes.
 */
function CollapsibleHeaderOnKeyboard({children, collapsibleHeaderOffset = 0, alwaysCollapseHeaderOnKeyboard = false}: CollapsibleHeaderOnKeyboardProps) {
    const collapsibleHeader = useCollapsibleHeader();
    const {naturalHeight, animatedHeight, isFocusedSV, isInLandscapeModeSV} = collapsibleHeader;

    const {height: keyboardHeightSV, progress: keyboardProgressSV} = useReanimatedKeyboardAnimation();

    const {windowHeight} = useWindowDimensions();
    const {top: topSafeAreaInset} = useSafeAreaInsets();
    const availableWindowHeight = windowHeight - topSafeAreaInset;
    // Keep window dimensions and offset accessible on the UI thread. Stable refs, excluded from deps.
    const availableWindowHeightSV = useSharedValue(availableWindowHeight);
    const collapsibleHeaderOffsetSV = useSharedValue(collapsibleHeaderOffset);
    useEffect(() => {
        availableWindowHeightSV.set(availableWindowHeight);
    }, [availableWindowHeight, availableWindowHeightSV]);
    useEffect(() => {
        collapsibleHeaderOffsetSV.set(collapsibleHeaderOffset);
    }, [collapsibleHeaderOffset, collapsibleHeaderOffsetSV]);

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
            availableWindowHeightValue: availableWindowHeightSV.get(),
        }),
        ({keyboardHeight, keyboardProgress, availableWindowHeightValue}, previous) => {
            // If the screen is not focused, bail out
            if (!isFocusedSV.get() || !isInLandscapeModeSV.get()) {
                return;
            }

            // If the keyboard is closed, restore the header
            const isKeyboardClosed = keyboardProgress === 0 && keyboardHeight === 0;
            if (isKeyboardClosed) {
                restoreHeaderTo(animatedHeight, naturalHeight.get());
                return;
            }

            // If the keyboard is closing, bail out
            const prevKeyboardProgress = previous?.keyboardProgress ?? 0;
            if (prevKeyboardProgress > keyboardProgress) {
                return;
            }

            // Only act when the keyboard is starting to open, reaching a threshold or fully open, not on every intermediate frame.
            const isKeyboardStartingOpening = prevKeyboardProgress === 0 && keyboardProgress > 0;
            const isKeyboardOpeningAndReachingThreshold = isKeyboardOpeningAtGivenProgress(keyboardProgress, prevKeyboardProgress, KEYBOARD_OPENING_PROGRESS_THRESHOLDS);
            const isKeyboardFullyOpen = keyboardProgress === 1;

            if (!isKeyboardStartingOpening && !isKeyboardOpeningAndReachingThreshold && !isKeyboardFullyOpen) {
                return;
            }

            // keyboardHeight is negative when open (e.g. -291), so keyboardTop = availableWindowHeightValue + keyboardHeight.
            // Target header height: give the input exactly the space it needs above the keyboard,
            // the header gets what remains. Clamped to [MIN_HEADER_HEIGHT_ON_COLLAPSE, naturalHeight].
            const keyboardTop = availableWindowHeightValue + keyboardHeight;
            const targetHeight = alwaysCollapseHeaderOnKeyboard
                ? MIN_HEADER_HEIGHT_ON_COLLAPSE
                : Math.max(MIN_HEADER_HEIGHT_ON_COLLAPSE, keyboardTop - VERTICAL_SPACE_FOR_FOCUSED_INPUT - collapsibleHeaderOffsetSV.get());
            const naturalHeightValue = naturalHeight.get();

            if (targetHeight >= naturalHeightValue) {
                // Enough space for the full header plus the input — restore or keep.
                restoreHeaderTo(animatedHeight, naturalHeightValue);
            } else {
                collapseHeaderTo(animatedHeight, targetHeight);
            }
        },
    );

    return <CollapsibleHeaderView collapsibleHeader={collapsibleHeader}>{children}</CollapsibleHeaderView>;
}

export default CollapsibleHeaderOnKeyboard;
