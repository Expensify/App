import React, {memo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import type IconAsset from '@src/types/utils/IconAsset';
import Avatar from './Avatar';
import Icon from './Icon';
import {FallbackAvatar} from './Icon/Expensicons';
import UserDetailsTooltip from './UserDetailsTooltip';

type SubIcon = {
    /** Avatar source to display */
    source: IconAsset;

    /** Width of the icon */
    width?: number;

    /** Height of the icon */
    height?: number;

    /** The fill color for the icon. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill?: string;
};

type SubscriptAvatarProps = {
    /** Avatar icon */
    mainAvatar?: IconType;

    /** Subscript avatar URL or icon */
    secondaryAvatar?: IconType;

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Background color used for subscript avatar border */
    backgroundColor?: string;

    /** Subscript icon */
    subscriptIcon?: SubIcon;

    /** Removes margin from around the avatar, used for the chat view */
    noMargin?: boolean;

    /** Whether to show the tooltip */
    showTooltip?: boolean;

    /** Additional style for container of subscription icon */
    subscriptionContainerAdditionalStyles?: StyleProp<ViewStyle>;
};

const fallbackIcon: IconType = {
    source: FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};

function SubscriptAvatar({
    mainAvatar = fallbackIcon,
    secondaryAvatar,
    subscriptIcon,
    size = CONST.AVATAR_SIZE.DEFAULT,
    backgroundColor,
    noMargin = false,
    showTooltip = true,
    subscriptionContainerAdditionalStyles = undefined,
}: SubscriptAvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isSmall = size === CONST.AVATAR_SIZE.SMALL;
    const subscriptStyle = size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.secondAvatarSubscriptSmallNormal : styles.secondAvatarSubscript;
    const containerStyle = StyleUtils.getContainerStyles(size);

    return (
        <View style={[containerStyle, noMargin ? styles.mr0 : {}]}>
            <UserDetailsTooltip
                shouldRender={showTooltip}
                accountID={Number(mainAvatar?.id ?? -1)}
                icon={mainAvatar}
            >
                <View>
                    <Avatar
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                        source={mainAvatar?.source}
                        size={size}
                        name={mainAvatar?.name}
                        avatarID={mainAvatar?.id}
                        type={mainAvatar?.type}
                        fallbackIcon={mainAvatar?.fallbackIcon}
                    />
                </View>
            </UserDetailsTooltip>
            {secondaryAvatar && (
                <UserDetailsTooltip
                    shouldRender={showTooltip}
                    accountID={Number(secondaryAvatar.id ?? -1)}
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
                            fill={secondaryAvatar.fill}
                            name={secondaryAvatar.name}
                            avatarID={secondaryAvatar.id}
                            type={secondaryAvatar.type}
                            fallbackIcon={secondaryAvatar.fallbackIcon}
                        />
                    </View>
                </UserDetailsTooltip>
            )}
            {subscriptIcon && (
                <View
                    style={[
                        size === CONST.AVATAR_SIZE.SMALL_NORMAL ? styles.flex1 : {},
                        StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.SMALL, CONST.ICON_TYPE_AVATAR),
                        StyleUtils.getAvatarBorderWidth(CONST.AVATAR_SIZE.SMALL),
                        // Nullish coalescing thinks that empty strings are truthy, thus I'm using OR operator
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        StyleUtils.getBorderColorStyle(backgroundColor || theme.sidebar),
                        styles.subscriptIcon,
                        styles.dFlex,
                        styles.justifyContentCenter,
                        subscriptionContainerAdditionalStyles,
                    ]}
                    // Hover on overflowed part of icon will not work on Electron if dragArea is true
                    // https://stackoverflow.com/questions/56338939/hover-in-css-is-not-working-with-electron
                    dataSet={{dragArea: false}}
                >
                    <Icon
                        src={subscriptIcon.source}
                        width={subscriptIcon.width}
                        height={subscriptIcon.height}
                        additionalStyles={styles.alignSelfCenter}
                        fill={subscriptIcon.fill ?? theme.icon}
                    />
                </View>
            )}
        </View>
    );
}

SubscriptAvatar.displayName = 'SubscriptAvatar';

export default memo(SubscriptAvatar);
export type {SubscriptAvatarProps};
