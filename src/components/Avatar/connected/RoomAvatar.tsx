import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';

import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {RoomAvatarFields} from '@selectors/Report';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {roomAvatarFieldsSelector} from '@selectors/Report';
import React from 'react';

import InvoiceRoomAvatar from './InvoiceRoomAvatar';
import useReportWorkspaceIcon from './useReportWorkspaceIcon';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type RoomAvatarProps = {
    /** Room whose avatars to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Color of the row surface behind the avatar. Affects secondary avatar so it blends into the row. */
    backdropColor?: ColorValue;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Container styles for an invoice room's subscript stack, merged over its size-derived defaults */
    subscriptContainerStyle?: StyleProp<ViewStyle>;

    /** Whether (and how) to stack the avatars horizontally. Every room but an invoice room ignores it and renders its single avatar */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltips */
    fallbackDisplayName?: string;
};

/** Resolves a room's own icon: the domain for a domain room, otherwise its workspace, pictured by the room's own avatar when a member uploaded one. */
function getRoomIcon(room: RoomAvatarFields, workspaceIcon: Icon): Icon {
    if (room.chatType === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL) {
        // The room is named after its domain with a leading "#"
        const domainName = room.reportName?.substring(1);
        return {id: room.policyID, type: CONST.ICON_TYPE_WORKSPACE, name: domainName ?? '', source: getDefaultWorkspaceAvatar(domainName)};
    }

    return {
        ...workspaceIcon,
        // The raw policyID, `_FAKE_` included, seeds the default avatar's color and the tooltip.
        id: room.policyID,
        // Only a user-created room can carry its own avatar. '' (no uploaded avatar) falls through
        source: room.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ROOM && room.avatarUrl ? room.avatarUrl : workspaceIcon.source,
    };
}

/** Renders a room's avatar: its workspace or domain alone, or for an invoice room, the workspace together with the invoice receiver. */
function RoomAvatar({reportID, size, backdropColor, containerStyle, subscriptContainerStyle, horizontalStacking, sort, fallbackDisplayName}: RoomAvatarProps) {
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const [room] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: roomAvatarFieldsSelector});
    const workspaceIcon = useReportWorkspaceIcon(room);

    // A room without a policyID has no workspace to show, so the unknown account stands in for it.
    const primaryAvatar: Icon = room?.policyID
        ? getRoomIcon(room, workspaceIcon)
        : {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};

    if (room?.chatType === CONST.REPORT.CHAT_TYPE.INVOICE) {
        return (
            <InvoiceRoomAvatar
                invoiceReceiver={room.invoiceReceiver}
                primaryAvatar={primaryAvatar}
                size={size}
                backdropColor={backdropColor}
                containerStyle={containerStyle}
                subscriptContainerStyle={subscriptContainerStyle}
                horizontalStacking={horizontalStacking}
                sort={sort}
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

export default RoomAvatar;
