import React from 'react';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getDefaultAvatar} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {CardFeed} from '@src/types/onyx/CardFeeds';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import IconsAvatar from './IconsAvatar';
import type {HorizontalStacking} from './ReportActionAvatar';

type AccountIDsAvatarProps = {
    accountIDs: number[];

    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    shouldShowTooltip?: boolean;

    horizontalStacking?: HorizontalStacking | boolean;

    subscriptCardFeed?: CardFeed;

    subscriptAvatarBorderColor?: ColorValue;

    noRightMarginOnSubscriptContainer?: boolean;

    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    fallbackDisplayName?: string;

    invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs;

    shouldUseCustomFallbackAvatar?: boolean;

    isInReportAction?: boolean;

    useMidSubscriptSizeForMultipleAvatars?: boolean;
};

/**
 * Lightweight avatar component that resolves accountIDs via usePersonalDetails context,
 * avoiding the heavy Onyx subscriptions in ReportActionAvatars/useReportActionAvatars.
 * Use this for call sites that only need accountIDs (no reportID, action, or policyID).
 */
function AccountIDsAvatar({
    accountIDs: rawAccountIDs,
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldShowTooltip = true,
    horizontalStacking,
    subscriptCardFeed,
    subscriptAvatarBorderColor,
    noRightMarginOnSubscriptContainer = false,
    secondaryAvatarContainerStyle,
    fallbackDisplayName,
    invitedEmailsToAccountIDs,
    shouldUseCustomFallbackAvatar = false,
    isInReportAction = false,
    useMidSubscriptSizeForMultipleAvatars = false,
}: AccountIDsAvatarProps) {
    const personalDetails = usePersonalDetails();
    const defaultAvatars = useDefaultAvatars();

    const accountIDs = rawAccountIDs.filter((id) => id !== CONST.DEFAULT_NUMBER_ID);

    const icons: Icon[] = accountIDs.map((id) => {
        const invitedEmail = invitedEmailsToAccountIDs ? Object.keys(invitedEmailsToAccountIDs).find((email) => invitedEmailsToAccountIDs[email] === id) : undefined;
        return {
            id,
            type: CONST.ICON_TYPE_AVATAR,
            source: personalDetails?.[id]?.avatar ?? defaultAvatars.FallbackAvatar,
            name: personalDetails?.[id]?.login ?? invitedEmail ?? '',
            fallbackIcon: shouldUseCustomFallbackAvatar ? getDefaultAvatar({accountID: id, accountEmail: addSMSDomainIfPhoneNumber(invitedEmail ?? ''), defaultAvatars}) : undefined,
        };
    });

    return (
        <IconsAvatar
            icons={icons}
            horizontalStacking={horizontalStacking}
            subscriptCardFeed={subscriptCardFeed}
            size={size}
            shouldShowTooltip={shouldShowTooltip}
            isInReportAction={isInReportAction}
            fallbackDisplayName={fallbackDisplayName}
            subscriptAvatarBorderColor={subscriptAvatarBorderColor}
            noRightMarginOnSubscriptContainer={noRightMarginOnSubscriptContainer}
            secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
            useMidSubscriptSize={useMidSubscriptSizeForMultipleAvatars}
        />
    );
}

AccountIDsAvatar.displayName = 'AccountIDsAvatar';

export default AccountIDsAvatar;
