import type {HorizontalStackingOptions} from '@components/Avatar/layouts/HorizontalAvatars';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useStyleUtils from '@hooks/useStyleUtils';

import {getIconsForParticipants, isOneOnOneChat, isSelfDM, isSystemChat, isTripRoom} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {accountIDSelector} from '@selectors/Session';
import React, {use} from 'react';

import TripRoomAvatar from './TripRoomAvatar';

type SortingOption = ValueOf<typeof CONST.REPORT_ACTION_AVATARS.SORT_BY>;

type DefaultReportAvatarProps = {
    /** Report whose avatar to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether (and how) to stack the avatars horizontally. Only a trip room fills a stack; every other report renders its single avatar */
    horizontalStacking?: HorizontalStackingOptions | boolean;

    /** How to order the avatars before rendering them. Only applies to a horizontal stack, where every avatar sits in an equivalent slot */
    sort?: SortingOption | SortingOption[];

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;
};

/** Picks the account a chat is pictured by: the current user in their self DM, Notifications in the system chat, the other member of a 1:1 DM, otherwise the first participant. */
function getChatAccountID(report: OnyxEntry<Report>, currentUserAccountID: number | undefined): number {
    if (isSelfDM(report)) {
        return currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID;
    }
    if (isSystemChat(report)) {
        return CONST.ACCOUNT_ID.NOTIFICATIONS;
    }
    const participantAccountIDs = Object.keys(report?.participants ?? {}).map(Number);
    if (isOneOnOneChat(report, currentUserAccountID)) {
        return participantAccountIDs.find((accountID) => accountID !== currentUserAccountID) ?? CONST.DEFAULT_NUMBER_ID;
    }
    return participantAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID;
}

/** Renders the avatar of a DM, self DM, system chat or any other report without a dedicated avatar: the account the chat is pictured by. */
function DefaultReportAvatar({reportID, size, containerStyle, horizontalStacking, sort, fallbackDisplayName}: DefaultReportAvatarProps) {
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isReportTripRoom] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: isTripRoom});
    // Resolved inside the selector, so a participants change only re-renders when the pictured account changes.
    const chatAccountIDSelector = (report: OnyxEntry<Report>) => getChatAccountID(report, currentUserAccountID);
    const [accountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: chatAccountIDSelector});
    const [personalDetailsFromSnapshot] = useAllPersonalDetails();
    // On Search, the snapshot can hold an account missing from the live list. The live list covers the gap while the snapshot loads.
    const personalDetails = personalDetailsFromSnapshot ?? use(PersonalDetailsContext);

    if (isReportTripRoom) {
        return (
            <TripRoomAvatar
                reportID={reportID}
                size={size}
                containerStyle={containerStyle}
                horizontalStacking={horizontalStacking}
                sort={sort}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    // The unknown account stands in while there is no account to picture, such as a report that hasn't loaded.
    const avatar = (accountID ? getIconsForParticipants([accountID], personalDetails).at(0) : undefined) ?? {
        id: CONST.DEFAULT_NUMBER_ID,
        type: CONST.ICON_TYPE_AVATAR,
        source: defaultAvatars.FallbackAvatar,
        name: '',
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

export default DefaultReportAvatar;
