import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';
import Icon from '@components/Icon';

import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCardFeedIcon} from '@libs/CardUtils';

import variables from '@styles/variables';

import type {CardFeed} from '@src/types/onyx/CardFeeds';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

import type {ColorValue, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {BaseAvatarProps} from './types';

import SubscriptAvatarFrame from './SubscriptAvatarFrame';

type SubscriptCardFeedAvatarProps = BaseAvatarProps & {
    /** The primary (main) avatar icon */
    primaryAvatar: IconType;

    /** Card feed to display as the subscript */
    cardFeed: CardFeed;

    /** Size of the subscript card feed icon */
    cardFeedIconSize?: {width: number; height: number};

    /** Border color for the subscript card feed icon container */
    subscriptAvatarBorderColor?: ColorValue;

    /** Style for the avatar container */
    containerStyle?: StyleProp<ViewStyle>;
};

/** `SubscriptCardFeedAvatar` renders a primary avatar with a card-feed icon overlaid as a subscript in the bottom-right corner. */
function SubscriptCardFeedAvatar({
    primaryAvatar,
    cardFeed,
    size,
    subscriptAvatarBorderColor,
    fallbackDisplayName,
    containerStyle,
    cardFeedIconSize = {
        width: variables.cardAvatarWidth,
        height: variables.cardAvatarHeight,
    },
}: SubscriptCardFeedAvatarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();

    return (
        <SubscriptAvatarFrame
            size={size}
            containerStyle={containerStyle}
            primary={
                <AvatarTooltip
                    avatar={primaryAvatar}
                    fallbackDisplayName={fallbackDisplayName}
                >
                    <AvatarFromIcon
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size))}
                        icon={primaryAvatar}
                        size={size}
                        testID="ReportActionAvatars-Subscript-MainAvatar"
                    />
                </AvatarTooltip>
            }
            secondary={
                <View
                    style={[
                        // Nullish coalescing thinks that empty strings are truthy, thus I'm using OR operator
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor || theme.sidebar),
                        StyleUtils.getAvatarSubscriptIconContainerStyle(cardFeedIconSize.width, cardFeedIconSize.height),
                        styles.dFlex,
                        styles.justifyContentCenter,
                    ]}
                >
                    <Icon
                        src={getCardFeedIcon(cardFeed, illustrations, companyCardFeedIcons)}
                        width={cardFeedIconSize.width}
                        height={cardFeedIconSize.height}
                        additionalStyles={styles.alignSelfCenter}
                        testID="ReportActionAvatars-Subscript-CardIcon"
                    />
                </View>
            }
        />
    );
}

export default SubscriptCardFeedAvatar;
