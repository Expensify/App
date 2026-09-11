import getAvatarLayout from '@components/Avatar/layouts/getAvatarLayout';
import SingleAvatar from '@components/Avatar/layouts/SingleAvatar';
import SubscriptAvatar from '@components/Avatar/layouts/SubscriptAvatar';

import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';

import usePolicyIcons from './usePolicyIcons';

type PolicyAvatarProps = {
    /** Policy whose workspace avatar to render */
    policyID: string;

    /** Account to render as the subscript on the workspace avatar. Omit to render the workspace avatar on its own. */
    accountID?: number;

    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Workspace name used to seed the default avatar, and as a fallback for the avatar tooltip */
    fallbackDisplayName?: string;

    /** Container styles for the avatar. Replaces the size-derived default container styles when provided. Only applies to the single-avatar layout. */
    containerStyle?: StyleProp<ViewStyle>;

    subscriptAvatarBorderColor?: ColorValue;
};

/** Renders a workspace avatar, resolving it from the policy's `avatarURL` and `name` alone. Pass an `accountID` to render that account as the subscript. */
function PolicyAvatar({policyID, accountID, size = CONST.AVATAR_SIZE.DEFAULT, fallbackDisplayName, containerStyle, subscriptAvatarBorderColor}: PolicyAvatarProps) {
    const StyleUtils = useStyleUtils();
    const icons = usePolicyIcons(policyID, accountID, fallbackDisplayName);

    const {layout, primaryIcon, secondaryIcon} = getAvatarLayout({
        icons,
        avatarType: accountID ? CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT : CONST.REPORT_ACTION_AVATARS.TYPE.SINGLE,
        // The account icon is a nameless placeholder until personal details load, and a nameless subscript renders as an empty ring.
        shouldRequireSecondaryIconName: true,
    });

    if (layout === CONST.REPORT_ACTION_AVATARS.TYPE.SUBSCRIPT) {
        return (
            <SubscriptAvatar
                primaryAvatar={primaryIcon}
                secondaryAvatar={secondaryIcon}
                size={size}
                subscriptAvatarBorderColor={subscriptAvatarBorderColor}
                fallbackDisplayName={fallbackDisplayName}
            />
        );
    }

    return (
        <SingleAvatar
            avatar={primaryIcon}
            size={size}
            containerStyles={containerStyle ?? StyleUtils.getContainerStyles(size)}
            fallbackDisplayName={fallbackDisplayName}
        />
    );
}

export default PolicyAvatar;
