import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type ListItemCompactAvatarProps = {
    /** Pre-resolved icon entry to render (typically the first entry of item.icons) */
    icon: Icon;

    /** Additional styles merged onto the avatar container */
    style?: StyleProp<ViewStyle>;
};

/** A small avatar in a fixed-size container, used by compact selection and suggestion rows. */
function ListItemCompactAvatar({icon, style}: ListItemCompactAvatarProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.compactAvatarContainer, style]}>
            <AvatarFromIcon
                icon={icon}
                size={CONST.AVATAR_SIZE.X_SMALL}
            />
        </View>
    );
}

export default ListItemCompactAvatar;
