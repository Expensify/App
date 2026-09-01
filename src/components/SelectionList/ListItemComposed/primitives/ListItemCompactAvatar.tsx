import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';

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

    /** Additional styles merged onto the avatar container */
    style?: StyleProp<ViewStyle>;
};

/** A 24x24 container with a small avatar, used by compact selection and suggestion rows. */
function ListItemCompactAvatar({icon, size = CONST.AVATAR_SIZE.X_SMALL, style}: ListItemCompactAvatarProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.mentionSuggestionsAvatarContainer, style]}>
            <AvatarFromIcon
                icon={icon}
                size={size}
            />
        </View>
    );
}

export default ListItemCompactAvatar;
