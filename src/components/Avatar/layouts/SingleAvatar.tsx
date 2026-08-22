import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';
import type {AvatarIcon} from '@components/Avatar/types';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import type {BaseAvatarProps} from './types';

import Avatar from '..';

type SingleAvatarProps = BaseAvatarProps & {
    /** The resolved avatar icon to render */
    avatar: AvatarIcon;

    /** Container styles for the avatar */
    containerStyles: StyleProp<ViewStyle>;
};

/** `SingleAvatar` renders one avatar wrapped in a `UserDetailsTooltip`, used when there is a single actor to display. */
function SingleAvatar({avatar, size, containerStyles, fallbackDisplayName}: SingleAvatarProps) {
    return (
        <AvatarTooltip
            avatar={avatar}
            fallbackDisplayName={fallbackDisplayName}
        >
            <Avatar
                containerStyles={containerStyles}
                type={avatar.type}
                source={avatar.source}
                name={avatar.name ?? ''}
                avatarID={avatar.id ?? CONST.DEFAULT_NUMBER_ID}
                fallbackIcon={avatar.fallbackIcon}
                fill={avatar.fill}
                size={size}
                testID="SingleAvatar"
            />
        </AvatarTooltip>
    );
}

export default SingleAvatar;
