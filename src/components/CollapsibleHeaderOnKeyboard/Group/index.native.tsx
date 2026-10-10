import CollapsibleHeaderOnKeyboardGroupContext from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderOnKeyboardGroupContext';
import {getAvailableHeightForCollapsibleContent, getKeyboardCollapseState} from '@components/CollapsibleHeaderOnKeyboard/constants';
import type {CollapsibleHeaderOnKeyboardGroupProps} from '@components/CollapsibleHeaderOnKeyboard/types';
import useCollapsibleScreenState from '@components/CollapsibleHeaderOnKeyboard/useCollapsibleScreenState';
import useKeyboardCollapseMetrics from '@components/CollapsibleHeaderOnKeyboard/useKeyboardCollapseMetrics';

import React, {useEffect, useRef} from 'react';
import {useAnimatedReaction, useSharedValue} from 'react-native-reanimated';

/**
 * Makes a single collapse decision for several `CollapsibleHeaderOnKeyboardGroupMember` instances
 * that cannot share one wrapper because their JSX lives in different subtrees
 */
function CollapsibleHeaderOnKeyboardGroup({children, collapsibleHeaderOffset = 0}: CollapsibleHeaderOnKeyboardGroupProps) {
    const shouldCollapse = useSharedValue(false);
    const memberNaturalHeightsRef = useRef<Record<string, number>>({});
    const totalNaturalHeight = useSharedValue(0);

    const {isFocused, isInLandscapeMode, isFocusedSV, isInLandscapeModeSV} = useCollapsibleScreenState();
    const {keyboardHeightSV, keyboardProgressSV, availableWindowHeightSV, collapsibleHeaderOffsetSV} = useKeyboardCollapseMetrics(collapsibleHeaderOffset);

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

            const {isKeyboardClosed, shouldReact} = getKeyboardCollapseState(keyboardProgress, previous?.keyboardProgress ?? 0, keyboardHeight);

            // If the keyboard is closed, restore the members
            if (isKeyboardClosed) {
                shouldCollapse.set(false);
                return;
            }

            if (!shouldReact) {
                return;
            }

            // Nothing has been measured yet, so there is no total to compare against.
            if (totalNaturalHeightValue <= 0) {
                return;
            }

            // The members share what is left once the focused input and everything outside the group have their space.
            const availableHeightForMembers = getAvailableHeightForCollapsibleContent(availableWindowHeightValue, keyboardHeight, collapsibleHeaderOffsetSV.get());

            shouldCollapse.set(availableHeightForMembers < totalNaturalHeightValue);
        },
    );

    return <CollapsibleHeaderOnKeyboardGroupContext.Provider value={{shouldCollapse, setMemberNaturalHeight, unregisterMember}}>{children}</CollapsibleHeaderOnKeyboardGroupContext.Provider>;
}

export default CollapsibleHeaderOnKeyboardGroup;
