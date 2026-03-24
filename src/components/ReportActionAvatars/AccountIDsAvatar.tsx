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
import type {HorizontalStacking} from './ReportActionAvatar';
import ReportActionAvatar from './ReportActionAvatar';

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

    const shouldStackHorizontally = !!horizontalStacking;
    const isHorizontalStackingAnObject = shouldStackHorizontally && typeof horizontalStacking !== 'boolean';
    const {isHovered = false} = isHorizontalStackingAnObject ? horizontalStacking : {};

    if (subscriptCardFeed) {
        const [primaryAvatar] = icons;
        if (!primaryAvatar) {
            return null;
        }
        return (
            <ReportActionAvatar.Subscript
                primaryAvatar={primaryAvatar}
                secondaryAvatar={icons.at(1) ?? primaryAvatar}
                size={size}
                shouldShowTooltip={shouldShowTooltip}
                noRightMarginOnContainer={noRightMarginOnSubscriptContainer}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                subscriptCardFeed={subscriptCardFeed}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    if (icons.length === 0) {
        return null;
    }

    if (shouldStackHorizontally) {
        return (
            <ReportActionAvatar.Multiple.Horizontal
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...(isHorizontalStackingAnObject ? horizontalStacking : {})}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                shouldShowTooltip={shouldShowTooltip}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    const [primaryAvatar, secondaryAvatar] = icons;

    if (icons.length >= 2 && secondaryAvatar?.name) {
        return (
            <ReportActionAvatar.Multiple.Diagonal
                shouldShowTooltip={shouldShowTooltip}
                size={size}
                icons={icons}
                isInReportAction={isInReportAction}
                useMidSubscriptSize={useMidSubscriptSizeForMultipleAvatars}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
                isHovered={isHovered}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    return (
        <ReportActionAvatar.Single
            avatar={primaryAvatar}
            size={size}
            shouldShowTooltip={shouldShowTooltip}
            accountID={Number(primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
            fallbackIcon={primaryAvatar.fallbackIcon}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

AccountIDsAvatar.displayName = 'AccountIDsAvatar';

export default AccountIDsAvatar;
