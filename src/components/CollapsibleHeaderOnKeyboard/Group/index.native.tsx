import CollapsibleHeaderOnKeyboardGroupContext from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderOnKeyboardGroupContext';
import {isKeyboardOpeningAtGivenProgress, KEYBOARD_OPENING_PROGRESS_THRESHOLDS, VERTICAL_SPACE_FOR_FOCUSED_INPUT} from '@components/CollapsibleHeaderOnKeyboard/constants';
import type {CollapsibleHeaderOnKeyboardGroupProps} from '@components/CollapsibleHeaderOnKeyboard/types';

import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeModeUtil from '@libs/isInLandscapeMode';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import {useAnimatedReaction, useSharedValue} from 'react-native-reanimated';

/**
 * Makes a single collapse decision for several `CollapsibleHeaderOnKeyboardGroupMember` instances
 * that cannot share one wrapper because their JSX lives in different subtrees
 */
function CollapsibleHeaderOnKeyboardGroup({children, collapsibleHeaderOffset = 0}: CollapsibleHeaderOnKeyboardGroupProps) {
    const isFocused = useIsFocused();
    const shouldCollapse = useSharedValue(false);
    const memberNaturalHeightsRef = useRef<Record<string, number>>({});
    const totalNaturalHeight = useSharedValue(0);

    const {height: keyboardHeightSV, progress: keyboardProgressSV} = useReanimatedKeyboardAnimation();

    const {windowWidth, windowHeight} = useWindowDimensions();
    const {top: topSafeAreaInset} = useSafeAreaInsets();
    const availableWindowHeight = windowHeight - topSafeAreaInset;
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);
    const availableWindowHeightSV = useSharedValue(availableWindowHeight);
    const collapsibleHeaderOffsetSV = useSharedValue(collapsibleHeaderOffset);
    const isFocusedSV = useSharedValue(isFocused);
    const isInLandscapeModeSV = useSharedValue(isInLandscapeMode);
    useEffect(() => {
        availableWindowHeightSV.set(availableWindowHeight);
    }, [availableWindowHeight, availableWindowHeightSV]);
    useEffect(() => {
        collapsibleHeaderOffsetSV.set(collapsibleHeaderOffset);
    }, [collapsibleHeaderOffset, collapsibleHeaderOffsetSV]);
    useEffect(() => {
        isFocusedSV.set(isFocused);
    }, [isFocused, isFocusedSV]);
    useEffect(() => {
        isInLandscapeModeSV.set(isInLandscapeMode);
    }, [isInLandscapeMode, isInLandscapeModeSV]);

    // Collapsing only applies to a focused screen in landscape. Clear the flag on the way out so the members restore
    // and a later reaction never acts on a decision that was made for a layout that no longer exists.
    useEffect(() => {
        if (isInLandscapeMode && isFocused) {
            return;
        }
        shouldCollapse.set(false);
    }, [isInLandscapeMode, isFocused, shouldCollapse]);

    const updateTotalMembersNaturalHeight = () => {
        totalNaturalHeight.set(Object.values(memberNaturalHeightsRef.current).reduce((total, height) => total + height, 0));
    };

    const setMemberNaturalHeight = (memberID: string, height: number) => {
        if (memberNaturalHeightsRef.current[memberID] === height) {
            return;
        }
        memberNaturalHeightsRef.current[memberID] = height;
        updateTotalMembersNaturalHeight();
    };

    const unregisterMember = (memberID: string) => {
        if (!(memberID in memberNaturalHeightsRef.current)) {
            return;
        }
        delete memberNaturalHeightsRef.current[memberID];
        updateTotalMembersNaturalHeight();
    };

    // Mirrors the single-instance reaction in `CollapsibleHeaderOnKeyboard`, except that it compares the combined
    // natural height of every member instead of one header's height, and publishes a boolean the members follow.
    useAnimatedReaction(
        () => ({
            keyboardHeight: keyboardHeightSV.get(),
            keyboardProgress: keyboardProgressSV.get(),
            availableWindowHeightValue: availableWindowHeightSV.get(),
            totalNaturalHeightValue: totalNaturalHeight.get(),
        }),
        ({keyboardHeight, keyboardProgress, availableWindowHeightValue, totalNaturalHeightValue}, previous) => {
            // If the screen is not focused, bail out
            if (!isFocusedSV.get() || !isInLandscapeModeSV.get()) {
                return;
            }

            // If the keyboard is closed, restore the members
            const isKeyboardClosed = keyboardProgress === 0 && keyboardHeight === 0;
            if (isKeyboardClosed) {
                shouldCollapse.set(false);
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

            // Nothing has been measured yet, so there is no total to compare against.
            if (totalNaturalHeightValue <= 0) {
                return;
            }

            // keyboardHeight is negative when open (e.g. -291), so keyboardTop = availableWindowHeightValue + keyboardHeight.
            // The members share what is left once the focused input and everything outside the group have their space.
            const keyboardTop = availableWindowHeightValue + keyboardHeight;
            const availableHeightForMembers = keyboardTop - VERTICAL_SPACE_FOR_FOCUSED_INPUT - collapsibleHeaderOffsetSV.get();

            shouldCollapse.set(availableHeightForMembers < totalNaturalHeightValue);
        },
    );

    return <CollapsibleHeaderOnKeyboardGroupContext.Provider value={{shouldCollapse, setMemberNaturalHeight, unregisterMember}}>{children}</CollapsibleHeaderOnKeyboardGroupContext.Provider>;
}

export default CollapsibleHeaderOnKeyboardGroup;
