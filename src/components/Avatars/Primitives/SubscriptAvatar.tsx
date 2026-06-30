import React from 'react';
import type {ColorValue} from 'react-native';
import {View} from 'react-native';
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
import ProfileAvatar from './ProfileAvatar';
import type {BaseAvatarProps} from './types';

type SubscriptAvatarProps = BaseAvatarProps & {
    /** The primary (main) avatar icon */
    primaryAvatar: IconType;

    /** The secondary (subscript) avatar icon */
    secondaryAvatar?: IconType;

    /** Whether to remove the right margin on the container */
    noRightMarginOnContainer?: boolean;

    /** Border color for the subscript avatar */
    subscriptAvatarBorderColor?: ColorValue;

    /** Card feed to display as the subscript instead of the secondary avatar */
    subscriptCardFeed?: CardFeed;

    /** Size of the subscript card feed icon */
    subscriptCardFeedIconSize?: {width: number; height: number};
};

function SubscriptAvatar({
    primaryAvatar,
    secondaryAvatar,
    size,
    shouldShowTooltip,
    noRightMarginOnContainer,
    subscriptAvatarBorderColor,
    subscriptCardFeed,
    fallbackDisplayName,
    useProfileNavigationWrapper,
    reportID,
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

    const isSmall = size === CONST.AVATAR_SIZE.X_SMALL;
    const containerStyle = StyleUtils.getContainerStyles(size);

    let subscriptAvatarStyle;
    if (size === CONST.AVATAR_SIZE.X_SMALL) {
        subscriptAvatarStyle = styles.secondAvatarSubscriptXSmall;
    } else if (size === CONST.AVATAR_SIZE.SMALL) {
        subscriptAvatarStyle = styles.secondAvatarSubscriptSmall;
    } else if (size === CONST.AVATAR_SIZE.XXXXX_LARGE) {
        subscriptAvatarStyle = styles.secondAvatarSubscriptXxxxxLarge;
    } else {
        subscriptAvatarStyle = styles.secondAvatarSubscript;
    }

    const subscriptAvatarSize = size === CONST.AVATAR_SIZE.XXXXX_LARGE ? CONST.AVATAR_SIZE.MEDIUM : CONST.AVATAR_SIZE.XXX_SMALL;

    return (
        <View
            style={[containerStyle, noRightMarginOnContainer ? styles.mr0 : {}]}
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
                    <ProfileAvatar
                        useProfileNavigationWrapper={useProfileNavigationWrapper}
                        containerStyles={StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(size || CONST.AVATAR_SIZE.DEFAULT))}
                        source={primaryAvatar.source}
                        size={size}
                        name={primaryAvatar.name}
                        avatarID={primaryAvatar.id}
                        type={primaryAvatar.type}
                        fallbackIcon={primaryAvatar.fallbackIcon}
                        testID="ReportActionAvatars-Subscript-MainAvatar"
                        reportID={reportID}
                    />
                </View>
            </UserDetailsTooltip>
            {!!secondaryAvatar && !subscriptCardFeed && (
                <UserDetailsTooltip
                    shouldRender={shouldShowTooltip}
                    accountID={Number(secondaryAvatar.id ?? CONST.DEFAULT_NUMBER_ID)}
                    icon={secondaryAvatar}
                >
                    <View style={[size === CONST.AVATAR_SIZE.SMALL ? styles.flex1 : {}, subscriptAvatarStyle]}>
                        <ProfileAvatar
                            useProfileNavigationWrapper={useProfileNavigationWrapper}
                            iconAdditionalStyles={[
                                StyleUtils.getAvatarBorderWidth(isSmall ? CONST.AVATAR_SIZE.XXXXX_SMALL : subscriptAvatarSize),
                                StyleUtils.getBorderColorStyle(subscriptAvatarBorderColor ?? theme.componentBG),
                            ]}
                            source={secondaryAvatar.source}
                            size={isSmall ? CONST.AVATAR_SIZE.XXXXX_SMALL : subscriptAvatarSize}
                            fill={secondaryAvatar.fill}
                            name={secondaryAvatar.name}
                            avatarID={secondaryAvatar.id}
                            type={secondaryAvatar.type}
                            fallbackIcon={secondaryAvatar.fallbackIcon}
                            testID="ReportActionAvatars-Subscript-SecondaryAvatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
            )}
            {!!subscriptCardFeed && (
                <View
                    style={[
                        size === CONST.AVATAR_SIZE.SMALL ? styles.flex1 : {},
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
