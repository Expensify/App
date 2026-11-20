import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import AvatarPressSlot from '@components/Avatar/pressable/AvatarPressSlot';
import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';
import type {AvatarIcon} from '@components/Avatar/types';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import type {BaseAvatarProps} from './types';

type SingleAvatarProps = BaseAvatarProps & {
    /** The resolved avatar icon to render */
    avatar: AvatarIcon;

    containerStyles: StyleProp<ViewStyle>;

    /** Styles for the tooltip wrapper. Put outer spacing here so the tooltip centers on the avatar, not on the avatar plus its margin. */
    style?: StyleProp<ViewStyle>;
};

/** `SingleAvatar` renders one avatar wrapped in a `UserDetailsTooltip`, used when there is a single actor to display. */
function SingleAvatar({avatar, size, containerStyles, fallbackDisplayName, style}: SingleAvatarProps) {
    return (
        <AvatarTooltip
            avatar={avatar}
            fallbackDisplayName={fallbackDisplayName}
            style={style}
        >
            <AvatarPressSlot avatar={avatar}>
                <AvatarFromIcon
                    containerStyles={containerStyles}
                    icon={avatar}
                    size={size}
                    testID="SingleAvatar"
                />
            </AvatarPressSlot>
        </AvatarTooltip>
    );
}

export default SingleAvatar;
