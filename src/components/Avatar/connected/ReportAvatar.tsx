import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import ReportActionAvatars from '@components/ReportActionAvatars';

import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {reportAvatarKindSelector} from '@selectors/Report';
import React from 'react';

import AccountAvatar from './AccountAvatar';
import GroupChatAvatar from './GroupChatAvatar';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type ReportAvatarProps = {
    /** Report whose avatars to render */
    reportID?: string;

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Single avatar container styles */
    singleAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Style for the second avatar */
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Whether to show the subscript avatar without margin */
    noRightMarginOnSubscriptContainer?: boolean;

    /** Whether (and how) to stack the avatars horizontally */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for avatar tooltip */
    fallbackDisplayName?: string;
};

/** Renders a report's avatars by delegating to the connected avatar matching the report's type. */
function ReportAvatar({reportID, size = CONST.AVATAR_SIZE.DEFAULT, singleAvatarContainerStyle, horizontalStacking, fallbackDisplayName, ...rest}: ReportAvatarProps) {
    const [kindFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: reportAvatarKindSelector});
    const kind = kindFromOnyx ?? CONST.REPORT_AVATAR_KIND.DEFAULT;

    if (!reportID) {
        return (
            <AccountAvatar
                accountID={CONST.DEFAULT_NUMBER_ID}
                size={size}
                containerStyle={horizontalStacking ? [] : singleAvatarContainerStyle}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    switch (kind) {
        case CONST.REPORT_AVATAR_KIND.GROUP_CHAT:
            return (
                <GroupChatAvatar
                    reportID={reportID}
                    size={size}
                    // The layout is always single, but the legacy component still drops the single avatar's container styles when horizontal stacking is requested.
                    containerStyle={horizontalStacking ? [] : singleAvatarContainerStyle}
                    fallbackDisplayName={fallbackDisplayName}
                />
            );
        // TODO: The remaining kinds still render the legacy component. https://github.com/Expensify/App/issues/94590 adds a
        // dedicated wrapper per kind, one PR at a time. The last of those deletes the ReportActionAvatars import and simplifies props.
        case CONST.REPORT_AVATAR_KIND.EXPENSE:
        case CONST.REPORT_AVATAR_KIND.IOU:
        case CONST.REPORT_AVATAR_KIND.TASK:
        case CONST.REPORT_AVATAR_KIND.INVOICE:
        case CONST.REPORT_AVATAR_KIND.CHAT_THREAD:
        case CONST.REPORT_AVATAR_KIND.POLICY_EXPENSE_CHAT:
        case CONST.REPORT_AVATAR_KIND.ROOM:
        case CONST.REPORT_AVATAR_KIND.DEFAULT:
        default:
            return (
                <ReportActionAvatars
                    reportID={reportID}
                    size={size}
                    singleAvatarContainerStyle={singleAvatarContainerStyle}
                    horizontalStacking={horizontalStacking}
                    fallbackDisplayName={fallbackDisplayName}
                    {...rest}
                />
            );
    }
}

export default ReportAvatar;
