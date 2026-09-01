import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';

import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import useAccountIcons from './useAccountIcons';

type AccountAvatarProps = {
    /** Account ID of the user to display the avatar for */
    accountID: number;

    /** Size of the avatar */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Display name used as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;

    /** Container styles for the avatar. Replaces the size-derived default container styles when provided */
    containerStyle?: StyleProp<ViewStyle>;

    /** Login of the account. Seeds a deterministic letter avatar when personal details aren't loaded yet */
    accountEmail?: string;
};

/**
 * Renders a single account's avatar, resolving the icon from the personal-details context (zero Onyx subscriptions).
 * Use whenever exactly one account is rendered. Reach for `AccountAvatars` when several accounts share one slot,
 * or pass `Avatar/UserAvatar` a `source` instead when the avatar is already resolved.
 */
function AccountAvatar({accountID, size = CONST.AVATAR_SIZE.DEFAULT, fallbackDisplayName, containerStyle, accountEmail}: AccountAvatarProps) {
    const StyleUtils = useStyleUtils();
    const [icon] = useAccountIcons([accountID], undefined, [accountEmail]);

    return (
        <SingleAvatar
            avatar={icon}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default AccountAvatar;
