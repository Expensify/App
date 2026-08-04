import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useStyleUtils from '@hooks/useStyleUtils';

import {buildUserIcon} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

type AccountAvatarProps = {
    /** Account ID of the user to display the avatar for */
    accountID: number;

    /** Size of the avatar */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Whether to show the tooltip on hover */
    shouldShowTooltip?: boolean;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;

    /** Container styles for the avatar. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Renders a single account's avatar, resolving the icon from the personal-details context (zero Onyx subscriptions).
 * Use whenever exactly one account is rendered. Pass `Avatar/UserAvatar` a `source` instead when the avatar is already resolved.
 */
function AccountAvatar({accountID, size = CONST.AVATAR_SIZE.DEFAULT, shouldShowTooltip = true, fallbackDisplayName, containerStyle}: AccountAvatarProps) {
    const personalDetails = usePersonalDetails();
    const defaultAvatars = useDefaultAvatars();
    const StyleUtils = useStyleUtils();

    const icon = buildUserIcon({accountID, personalDetails, defaultAvatars});

    return (
        <SingleAvatar
            avatar={icon}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            shouldShowTooltip={shouldShowTooltip}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default AccountAvatar;
