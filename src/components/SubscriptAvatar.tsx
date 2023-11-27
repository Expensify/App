import React, {memo} from 'react';
import {View} from 'react-native';
import {ValueOf} from 'type-fest';
import type {AvatarSource} from '@libs/UserUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import Avatar from './Avatar';
import UserDetailsTooltip from './UserDetailsTooltip';

type SubAvatar = {
    /** Avatar source to display */
    source?: AvatarSource;

    /** Denotes whether it is an avatar or a workspace avatar */
    type?: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;

    /** Owner of the avatar. If user, displayName. If workspace, policy name */
    name?: string;

    /** Avatar id */
    id?: number | string;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;
};

type SubscriptAvatarProps = {
    /** Avatar URL or icon */
    mainAvatar?: SubAvatar;

    /** Subscript avatar URL or icon */
    secondaryAvatar?: SubAvatar;

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Background color used for subscript avatar border */
    backgroundColor?: string;

    /** Removes margin from around the avatar, used for the chat view */
    noMargin?: boolean;

    /** Whether to show the tooltip */
    showTooltip?: boolean;
};

function SubscriptAvatar({mainAvatar = {}, secondaryAvatar = {}, size = CONST.AVATAR_SIZE.DEFAULT, backgroundColor, noMargin = false, showTooltip = true}: SubscriptAvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const isSmall = size === CONST.AVATAR_SIZE.SMALL;
    const subscriptStyle = size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.secondAvatarSubscriptSmallNormal : styles.secondAvatarSubscript;
    const containerStyle = StyleUtils.getContainerStyles(size);

    return (
        <View style={[containerStyle, noMargin ? styles.mr0 : {}]}>
            <UserDetailsTooltip
                shouldRender={showTooltip}
                accountID={mainAvatar.id ?? -1}
                icon={mainAvatar}
            >
                <View>
                    <Avatar
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                        source={mainAvatar.source}
                        size={size}
                        name={mainAvatar.name}
                        type={mainAvatar.type}
                        fallbackIcon={mainAvatar.fallbackIcon}
                    />
                </View>
            </UserDetailsTooltip>
            <UserDetailsTooltip
                shouldRender={showTooltip}
                accountID={secondaryAvatar.id ?? -1}
                icon={secondaryAvatar}
            >
                <View
                    style={[size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {}, isSmall ? styles.secondAvatarSubscriptCompact : subscriptStyle]}
                    // Hover on overflowed part of icon will not work on Electron if dragArea is true
                    // https://stackoverflow.com/questions/56338939/hover-in-css-is-not-working-with-electron
                    dataSet={{dragArea: false}}
                >
                    <Avatar
                        iconAdditionalStyles={[
                            StyleUtils.getAvatarBorderWidth(isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST.AVATAR_SIZE.SUBSCRIPT),
                            StyleUtils.getBorderColorStyle(backgroundColor ?? theme.componentBG),
                        ]}
                        source={secondaryAvatar.source}
                        size={isSmall ? CONST.AVATAR_SIZE.SMALL_SUBSCRIPT : CONST.AVATAR_SIZE.SUBSCRIPT}
                        fill={theme.iconSuccessFill}
                        name={secondaryAvatar.name}
                        type={secondaryAvatar.type}
                        fallbackIcon={secondaryAvatar.fallbackIcon}
                    />
                </View>
            </UserDetailsTooltip>
        </View>
    );
}

SubscriptAvatar.displayName = 'SubscriptAvatar';

export default memo(SubscriptAvatar);
