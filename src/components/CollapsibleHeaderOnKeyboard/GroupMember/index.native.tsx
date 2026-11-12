import {useCollapsibleHeaderOnKeyboardGroup} from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderOnKeyboardGroupContext';
import CollapsibleHeaderView from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderView';
import {MIN_HEADER_HEIGHT_ON_COLLAPSE} from '@components/CollapsibleHeaderOnKeyboard/constants';
import type {CollapsibleHeaderOnKeyboardGroupMemberProps} from '@components/CollapsibleHeaderOnKeyboard/types';
import useCollapsibleHeader, {collapseHeaderTo, restoreHeaderTo} from '@components/CollapsibleHeaderOnKeyboard/useCollapsibleHeader';

import React, {useEffect, useId, useRef} from 'react';
import {useAnimatedReaction, useSharedValue} from 'react-native-reanimated';

/**
 * One element of a `CollapsibleHeaderOnKeyboardGroup`. Reports its measured height to the group and then follows the
 * group's single decision, collapsing fully together with the group's other members.
 *
 * Use this instead of `CollapsibleHeaderOnKeyboard` whenever several collapsing elements stack on top of each other,
 * so the space above the keyboard is weighed once against all of them rather than once per element.
 */
function CollapsibleHeaderOnKeyboardGroupMember({children}: CollapsibleHeaderOnKeyboardGroupMemberProps) {
    const group = useCollapsibleHeaderOnKeyboardGroup();
    const memberID = useId();
    // `onLayout` only reports a height when it changes, so the last reported one is kept here to re-register with.
    const reportedNaturalHeightRef = useRef(-1);
    const collapsibleHeader = useCollapsibleHeader((height) => {
        reportedNaturalHeightRef.current = height;
        group?.setMemberNaturalHeight(memberID, height);
    });
    const {naturalHeight, animatedHeight, isFocusedSV, isInLandscapeModeSV} = collapsibleHeader;

    const ungroupedShouldCollapse = useSharedValue(false);
    const shouldCollapseSV = group?.shouldCollapse ?? ungroupedShouldCollapse;

    // The cleanup drops this member's contribution to the group total. It runs on unmount, but also whenever the
    // context value gets a new identity, so the height has to be put back on every run.
    useEffect(() => {
        if (!group) {
            return;
        }
        if (reportedNaturalHeightRef.current !== -1) {
            group.setMemberNaturalHeight(memberID, reportedNaturalHeightRef.current);
        }
        return () => group.unregisterMember(memberID);
    }, [group, memberID]);

    useAnimatedReaction(
        () => ({shouldCollapse: shouldCollapseSV.get(), naturalHeightValue: naturalHeight.get()}),
        ({shouldCollapse, naturalHeightValue}) => {
            if (!isFocusedSV.get() || !isInLandscapeModeSV.get() || naturalHeightValue === -1) {
                return;
            }

            if (shouldCollapse) {
                collapseHeaderTo(animatedHeight, MIN_HEADER_HEIGHT_ON_COLLAPSE);
                return;
            }
            restoreHeaderTo(animatedHeight, naturalHeightValue);
        },
    );

    return <CollapsibleHeaderView collapsibleHeader={collapsibleHeader}>{children}</CollapsibleHeaderView>;
}

export default CollapsibleHeaderOnKeyboardGroupMember;
