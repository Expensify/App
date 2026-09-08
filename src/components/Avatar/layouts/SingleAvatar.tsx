import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';
import type {AvatarIcon} from '@components/Avatar/types';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import type {BaseAvatarProps} from './types';

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
            <AvatarFromIcon
                containerStyles={containerStyles}
                icon={avatar}
                size={size}
                testID="SingleAvatar"
            />
        </AvatarTooltip>
    );
}

export default SingleAvatar;
