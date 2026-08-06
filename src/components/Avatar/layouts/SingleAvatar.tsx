import type {AvatarIcon} from '@components/Avatar/types';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {BaseAvatarProps} from './types';

import Avatar from '..';

type SingleAvatarProps = BaseAvatarProps & {
    /** The resolved avatar icon to render */
    avatar: AvatarIcon;

    /** Container styles for the avatar */
    containerStyles: StyleProp<ViewStyle>;
};

/** `SingleAvatar` renders one avatar wrapped in a `UserDetailsTooltip`, used when there is a single actor to display. */
function SingleAvatar({avatar, size, containerStyles, shouldShowTooltip, fallbackDisplayName}: SingleAvatarProps) {
    const tooltipAccountID = avatar.copilot?.actedForAccountID ?? Number(avatar.id ?? CONST.DEFAULT_NUMBER_ID);

    return (
        <UserDetailsTooltip
            accountID={tooltipAccountID}
            delegateAccountID={avatar.copilot?.accountID}
            icon={avatar}
            fallbackUserDetails={{
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                displayName: fallbackDisplayName || avatar.name,
            }}
            shouldRender={shouldShowTooltip}
        >
            <View>
                <Avatar
                    containerStyles={containerStyles}
                    type={avatar.type}
                    source={avatar.source}
                    name={avatar.name ?? ''}
                    avatarID={avatar.id ?? CONST.DEFAULT_NUMBER_ID}
                    fallbackIcon={avatar.fallbackIcon}
                    fill={avatar.fill}
                    size={size}
                    testID="ReportActionAvatars-SingleAvatar"
                />
            </View>
        </UserDetailsTooltip>
    );
}

export default SingleAvatar;
