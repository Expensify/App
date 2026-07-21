import Avatar from '@components/Avatar';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {AvatarSource} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type MenuItemAvatarProps = {
    /** The source of the avatar image */
    source: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type?: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    /** Account id if it's a user avatar or policy id if it's a workspace avatar */
    avatarID?: number | string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL */
    fallbackIcon?: IconAsset;

    /** The size of the avatar */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Owner name, used as the avatar fallback name */
    name?: string;

    /** Any additional styles to apply to the avatar container */
    style?: StyleProp<ViewStyle>;
};

/**
 * The leading avatar cell of a `MenuItem.Row`. Use instead of `MenuItem.Icon` when the row
 * represents a user or a workspace.
 */
function MenuItemAvatar({source, type = CONST.ICON_TYPE_AVATAR, avatarID, fallbackIcon, size = CONST.AVATAR_SIZE.DEFAULT, name, style}: MenuItemAvatarProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <View style={[styles.popoverMenuIcon, StyleUtils.getAvatarWidthStyle(size), style]}>
            <Avatar
                imageStyles={[styles.alignSelfCenter]}
                source={source}
                avatarID={avatarID}
                fallbackIcon={fallbackIcon ?? icons.FallbackAvatar}
                size={size}
                name={name}
                type={type}
            />
        </View>
    );
}

MenuItemAvatar.displayName = 'MenuItemAvatar';

export type {MenuItemAvatarProps};
export default MenuItemAvatar;
