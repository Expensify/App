import {useCollapsibleHeaderOnKeyboardGroup} from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderOnKeyboardGroupContext';
import CollapsibleHeaderView from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderView';
import {MIN_HEADER_HEIGHT_ON_COLLAPSE} from '@components/CollapsibleHeaderOnKeyboard/constants';
import type {CollapsibleHeaderOnKeyboardGroupMemberProps} from '@components/CollapsibleHeaderOnKeyboard/types';
import useCollapsibleHeader, {collapseHeaderTo, restoreHeaderTo} from '@components/CollapsibleHeaderOnKeyboard/useCollapsibleHeader';

import React, {useEffect, useId} from 'react';
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
    const collapsibleHeader = useCollapsibleHeader((height) => group?.setMemberNaturalHeight(memberID, height));
    const {naturalHeight, animatedHeight, isFocusedSV, isInLandscapeModeSV} = collapsibleHeader;

    const ungroupedShouldCollapse = useSharedValue(false);
    const shouldCollapseSV = group?.shouldCollapse ?? ungroupedShouldCollapse;

    useEffect(() => {
        if (!group) {
            return;
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
