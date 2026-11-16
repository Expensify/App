import HorizontalAvatars from '@components/Avatar/layouts/HorizontalAvatars';
import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {reportAvatarFieldsSelector} from '@selectors/Report';
import React from 'react';

import useReportWorkspaceIcon from './useReportWorkspaceIcon';
import useSortedIcons from './useSortedIcons';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type TripRoomAvatarProps = {
    /** Trip room whose avatar to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether (and how) to stack the avatars horizontally. An archived trip room renders its single avatar instead */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Renders the avatar of a trip room that isn't linked to its trip preview: its workspace alone, or with an empty second slot inside a horizontal stack. */
function TripRoomAvatar({reportID, size, containerStyle, horizontalStacking, sort, fallbackDisplayName}: TripRoomAvatarProps) {
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const [tripRoom] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportAvatarFieldsSelector});
    const isArchived = useReportIsArchived(reportID);
    const workspaceIcon = useReportWorkspaceIcon(tripRoom);

    // A trip room without a policyID has no workspace to show, so the unknown account stands in for it.
    const primaryAvatar: Icon = tripRoom?.policyID
        ? // The raw policyID, `_FAKE_` included, seeds the default avatar's color and the tooltip.
          {...workspaceIcon, id: tripRoom.policyID}
        : {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};
    // Without its trip preview the room has no traveler to pair with the workspace, so a stack keeps an empty second slot.
    const blankIcon: Icon = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: '', name: ''};
    const icons = useSortedIcons([primaryAvatar, blankIcon], sort);

    if (horizontalStacking && !isArchived) {
        return (
            <HorizontalAvatars
                {...(horizontalStacking === true ? {} : horizontalStacking)}
                size={size}
                icons={icons}
                isInReportAction={false}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    return (
        <SingleAvatar
            avatar={primaryAvatar}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default TripRoomAvatar;
