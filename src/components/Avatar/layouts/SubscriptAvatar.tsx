import Icon from '@components/Icon';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCardFeedIcon} from '@libs/CardUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {CardFeed} from '@src/types/onyx/CardFeeds';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {BaseAvatarProps} from './types';

import Avatar from '..';

type SubscriptAvatarProps = BaseAvatarProps & {
    /** The primary (main) avatar icon */
    primaryAvatar: IconType;

    /** The secondary (subscript) avatar icon */
    secondaryAvatar?: IconType;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Card feed to display as the subscript instead of the secondary avatar */
    subscriptCardFeed?: CardFeed;

    /** Size of the subscript card feed icon */
    subscriptCardFeedIconSize?: {width: number; height: number};

    /** Style for  avatar container */
    containerStyle?: StyleProp<ViewStyle>;
};

/** `SubscriptAvatar` renders a primary avatar with a smaller secondary avatar (or a card-feed icon) overlaid as a subscript in the bottom-right corner. */
function SubscriptAvatar({
    primaryAvatar,
    secondaryAvatar,
    size,
    shouldShowTooltip,
    subscriptAvatarBorderColor,
    subscriptCardFeed,
    fallbackDisplayName,
    containerStyle,
    subscriptCardFeedIconSize = {
        width: variables.cardAvatarWidth,
        height: variables.cardAvatarHeight,
    },
}: SubscriptAvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    const isSmall = size === CONST.AVATAR_SIZE.SMALL;

    let subscriptAvatarStyle;
    if (size === CONST.AVATAR_SIZE.SMALL) {
        subscriptAvatarStyle = styles.secondAvatarSubscriptSmall;
    } else if (size === CONST.AVATAR_SIZE.XXXX_LARGE) {
        subscriptAvatarStyle = styles.secondAvatarSubscriptXxxxLarge;
    } else {
        subscriptAvatarStyle = styles.secondAvatarSubscript;
    }

    const subscriptAvatarSize = size === CONST.AVATAR_SIZE.XXXX_LARGE ? CONST.AVATAR_SIZE.DEFAULT : CONST.AVATAR_SIZE.XX_SMALL;

    return (
        <View
            style={[StyleUtils.getContainerStyles(size), containerStyle]}
            testID="ReportActionAvatars-Subscript"
        >
            <UserDetailsTooltip
                shouldRender={shouldShowTooltip}
                accountID={Number(primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                icon={primaryAvatar}
                fallbackUserDetails={{
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    displayName: fallbackDisplayName || primaryAvatar.name,
                }}
            >
                <View>
                    <Avatar
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                        type={primaryAvatar.type}
                        source={primaryAvatar.source}
                        name={primaryAvatar.name ?? ''}
                        avatarID={primaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID}
                        fallbackIcon={primaryAvatar.fallbackIcon}
                        fill={primaryAvatar.fill}
                        size={size}
                        testID="ReportActionAvatars-Subscript-MainAvatar"
                    />
                </View>
            </UserDetailsTooltip>
            {!!secondaryAvatar && !subscriptCardFeed && (
                <UserDetailsTooltip
                    shouldRender={shouldShowTooltip}
                    accountID={Number(secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={secondaryAvatar}
                >
                    <View style={subscriptAvatarStyle}>
                        <Avatar
                            iconAdditionalStyles={[
                                // The medium subscript on a xxxx-large avatar keeps the small border width (as before the size migration) — the default border width for its size is 1px thicker and would shrink the visible avatar.
                                size === CONST.AVATAR_SIZE.XXXX_LARGE
                                    ? StyleUtils.getAvatarBorderWidth(CONST.AVATAR_SIZE.SMALL)
                                    : StyleUtils.getAvatarBorderWidth(isSmall ? CONST.AVATAR_SIZE.XXXX_SMALL : subscriptAvatarSize),
                                StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor ?? theme.componentBG),
                            ]}
                            type={secondaryAvatar.type}
                            source={secondaryAvatar.source}
                            name={secondaryAvatar.name ?? ''}
                            avatarID={secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID}
                            fallbackIcon={secondaryAvatar.fallbackIcon}
                            fill={secondaryAvatar.fill}
                            size={isSmall ? CONST.AVATAR_SIZE.XXXX_SMALL : subscriptAvatarSize}
                            testID="ReportActionAvatars-Subscript-SecondaryAvatar"
                        />
                    </View>
                </UserDetailsTooltip>
            )}
            {!!subscriptCardFeed && (
                <View
                    style={[
                        // Nullish coalescing thinks that empty strings are truthy, thus I'm using OR operator
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor || theme.sidebar),
                        StyleUtils.getAvatarSubscriptIconContainerStyle(subscriptCardFeedIconSize.width, subscriptCardFeedIconSize.height),
                        styles.dFlex,
                        styles.justifyContentCenter,
                    ]}
                >
                    <Icon
                        src={getCardFeedIcon(subscriptCardFeed, illustrations, companyCardFeedIcons)}
                        width={subscriptCardFeedIconSize.width}
                        height={subscriptCardFeedIconSize.height}
                        additionalStyles={styles.alignSelfCenter}
                        testID="ReportActionAvatars-Subscript-CardIcon"
                    />
                </View>
            )}
        </View>
    );
}

export default SubscriptAvatar;
