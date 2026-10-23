import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import useStyleUtils from '@hooks/useStyleUtils';

import {getIconsForParticipants, getParticipantIcon, isOneOnOneChat, isSelfDM, isSupportTicket, isSystemChat} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {accountIDSelector} from '@selectors/Session';
import React, {use} from 'react';

type DefaultReportAvatarProps = {
    /** Report whose avatar to render */
    reportID: string;

    /** Size of the avatar */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Container styles for the single-avatar layout. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;
};

/** Picks the account a chat is pictured by: the assigned rep of a support ticket, the current user in their self DM, Notifications in the system chat, the other member of a 1:1 DM, otherwise the first participant. */
function getChatAccountID(report: OnyxEntry<Report>, currentUserAccountID: number | undefined): number {
    if (isSupportTicket(report)) {
        return report?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    }
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

/** Renders the avatar of a DM, self DM, system chat, support ticket or any other report without a dedicated avatar: the account the chat is pictured by. */
function DefaultReportAvatar({reportID, size, containerStyle, fallbackDisplayName}: DefaultReportAvatarProps) {
    const StyleUtils = useStyleUtils();
    const defaultAvatars = useDefaultAvatars();
    const {formatPhoneNumber, translate} = useLocalize();
    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});
    const [isReportSupportTicket] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: isSupportTicket});
    // Resolved inside the selector, so a participants change only re-renders when the pictured account changes.
    const chatAccountIDSelector = (report: OnyxEntry<Report>) => getChatAccountID(report, currentUserAccountID);
    const [accountID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: chatAccountIDSelector});
    const [personalDetailsFromSnapshot] = useAllPersonalDetails();
    // On Search, the snapshot can hold an account missing from the live list. The live list covers the gap while the snapshot loads.
    const personalDetails = personalDetailsFromSnapshot ?? use(PersonalDetailsContext);

    // The unknown account stands in while there is no account to picture, such as a report that hasn't loaded.
    let avatar: Icon = {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};
    if (accountID) {
        // A support ticket names its rep the way a display name reads elsewhere: a formatted phone number, "Concierge", or "Hidden" while their details are missing.
        avatar = isReportSupportTicket
            ? getParticipantIcon(accountID, personalDetails, formatPhoneNumber, translate, true)
            : (getIconsForParticipants([accountID], personalDetails).at(0) ?? avatar);
    }

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
