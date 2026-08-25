import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import type {AvatarIcon} from '@components/Avatar/types';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';

import {getGroupChatName} from '@libs/ReportNameUtils';
import {getDefaultGroupAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {groupChatAvatarReportSelector} from '@selectors/Report';
import {pendingDeleteMemberAccountIDsSelector} from '@selectors/ReportMetaData';
import React from 'react';

type GroupChatAvatarProps = {
    /** Group chat whose avatar to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Container styles for the avatar. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;
};

/** Renders a group chat's avatar: the custom uploaded avatar when there is one, the reportID-seeded default group avatar otherwise. */
function GroupChatAvatar({reportID, size, containerStyle, fallbackDisplayName}: GroupChatAvatarProps) {
    const StyleUtils = useStyleUtils();
    const {formatPhoneNumber, translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: groupChatAvatarReportSelector});
    const [pendingDeleteMemberAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {
        selector: pendingDeleteMemberAccountIDsSelector,
    });
    const personalDetails = usePersonalDetails();

    const avatar: AvatarIcon = {
        // A group chat with no uploaded avatar stores an empty string, which has to fall through to the default avatar
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        source: report?.avatarUrl || getDefaultGroupAvatar(reportID),
        id: CONST.DEFAULT_MISSING_ID,
        type: CONST.ICON_TYPE_AVATAR,
        // Until the report row arrives there are no participants to build a name from, so fall back to the display name
        name: report ? getGroupChatName(formatPhoneNumber, translate, undefined, true, report, pendingDeleteMemberAccountIDs, personalDetails) : fallbackDisplayName,
    };

    return (
        <SingleAvatar
            avatar={avatar}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default GroupChatAvatar;
