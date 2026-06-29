import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useDefaultAvatars from '@hooks/useDefaultAvatars';
import {buildUserIcon} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import SingleAvatar from './Primitives/SingleAvatar';

type UserAvatarProps = {
    /** Account ID of the user to display the avatar for */
    accountID: number;

    /** Size of the avatar */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Whether to show the tooltip on hover */
    shouldShowTooltip?: boolean;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;

    /** Container styles for the avatar */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether the avatar is displayed within a report action */
    isInReportAction?: boolean;

    /** Whether clicking the avatar navigates to the profile page */
    useProfileNavigationWrapper?: boolean;

    /** Report ID for avatar navigation */
    reportID?: string;
};

/**
 * Renders a single user's avatar, resolving the icon from the personal-details context (zero Onyx subscriptions).
 * Use whenever exactly one user is rendered.
 */
function UserAvatar({
    accountID,
    size = CONST.AVATAR_SIZE.DEFAULT,
    shouldShowTooltip = true,
    fallbackDisplayName,
    containerStyle,
    isInReportAction = false,
    useProfileNavigationWrapper,
    reportID,
}: UserAvatarProps) {
    const personalDetails = usePersonalDetails();
    const defaultAvatars = useDefaultAvatars();

    const icon = buildUserIcon(accountID, personalDetails, defaultAvatars);

    return (
        <SingleAvatar
            avatar={icon}
            size={size}
            containerStyles={containerStyle}
            shouldShowTooltip={shouldShowTooltip}
            accountID={accountID}
            fallbackIcon={icon.fallbackIcon}
            fallbackDisplayName={fallbackDisplayName}
            isInReportAction={isInReportAction}
            useProfileNavigationWrapper={useProfileNavigationWrapper}
            reportID={reportID}
        />
    );
}

export default UserAvatar;
