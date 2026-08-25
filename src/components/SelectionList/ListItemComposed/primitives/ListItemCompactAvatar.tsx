import Avatar from '@components/Avatar';

import useThemeStyles from '@hooks/useThemeStyles';

import type {AvatarSizeName} from '@styles/utils';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ListItemCompactAvatarProps = {
    /** Pre-resolved icon entry to render (typically the first entry of item.icons) */
    icon: Icon;

    /** Avatar size, defaults to the extra-small size compact rows use */
    size?: AvatarSizeName;

    /** Fill color, only applies when the source is an icon rather than an image */
    fill?: string;

    /** Additional styles merged onto the avatar container */
    style?: StyleProp<ViewStyle>;
};

/** A 24x24 container with a small avatar, used by compact selection and suggestion rows. */
function ListItemCompactAvatar({icon, size = CONST.AVATAR_SIZE.X_SMALL, fill, style}: ListItemCompactAvatarProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.mentionSuggestionsAvatarContainer, style]}>
            <Avatar
                source={icon.source}
                size={size}
                name={icon.name}
                avatarID={icon.id}
                type={icon.type ?? CONST.ICON_TYPE_AVATAR}
                fill={fill}
                fallbackIcon={icon.fallbackIcon}
            />
        </View>
    );
}

export default ListItemCompactAvatar;
