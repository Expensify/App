import React from 'react';
import {useAnimatedReaction} from 'react-native-reanimated';

import type {CollapsibleHeaderOnKeyboardProps} from './types';

import CollapsibleHeaderView from './CollapsibleHeaderView';
import {getAvailableHeightForCollapsibleContent, getKeyboardCollapseState, MIN_HEADER_HEIGHT_ON_COLLAPSE} from './constants';
import useCollapsibleHeader, {collapseHeaderTo, restoreHeaderTo} from './useCollapsibleHeader';
import useKeyboardCollapseMetrics from './useKeyboardCollapseMetrics';

/**
 * Wraps a header and collapses it upward when the keyboard is open and there is not enough
 * vertical space for a focused input between the header bottom and the keyboard top.
 * Restores the header when the keyboard closes.
 *
 * Intended for landscape mode on phones where the keyboard + header can leave no room for inputs.
 * Uses height animation (not translateY) so the freed space is reclaimed by the layout below.
 */
function CollapsibleHeaderOnKeyboard({children, collapsibleHeaderOffset = 0, alwaysCollapseHeaderOnKeyboard = false}: CollapsibleHeaderOnKeyboardProps) {
    const collapsibleHeader = useCollapsibleHeader();
    const {naturalHeight, animatedHeight, isFocusedSV, isInLandscapeModeSV} = collapsibleHeader;

    const {keyboardHeightSV, keyboardProgressSV, availableWindowHeightSV, collapsibleHeaderOffsetSV} = useKeyboardCollapseMetrics(collapsibleHeaderOffset);

    // Runs on the UI thread whenever keyboard state changes. `getKeyboardCollapseState` picks the frames worth
    // reacting to; everything below only decides what this single header does with them.
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

            const {isKeyboardClosed, shouldReact} = getKeyboardCollapseState(keyboardProgress, previous?.keyboardProgress ?? 0, keyboardHeight);

            // If the keyboard is closed, restore the header
            if (isKeyboardClosed) {
                restoreHeaderTo(animatedHeight, naturalHeight.get());
                return;
            }

            if (!shouldReact) {
                return;
            }

            // Target header height: give the input exactly the space it needs above the keyboard,
            // the header gets what remains. Clamped to [MIN_HEADER_HEIGHT_ON_COLLAPSE, naturalHeight].
            const availableHeightForHeader = getAvailableHeightForCollapsibleContent(availableWindowHeightValue, keyboardHeight, collapsibleHeaderOffsetSV.get());
            const targetHeight = alwaysCollapseHeaderOnKeyboard ? MIN_HEADER_HEIGHT_ON_COLLAPSE : Math.max(MIN_HEADER_HEIGHT_ON_COLLAPSE, availableHeightForHeader);
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
