import React from 'react';
import type {ImageStyle, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {WorkspaceBuilding} from '@components/Icon/WorkspaceDefaultAvatars';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getUserDetailTooltipText} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ProfileAvatar from './ProfileAvatar';
import type {MultipleAvatarsProps} from './types';

type AvatarStyles = {
    singleAvatarStyle: ViewStyle & ImageStyle;
    secondAvatarStyles: ViewStyle & ImageStyle;
};

type AvatarSizeToStyles = typeof CONST.AVATAR_SIZE.SMALL | typeof CONST.AVATAR_SIZE.LARGE | typeof CONST.AVATAR_SIZE.X_LARGE | typeof CONST.AVATAR_SIZE.DEFAULT;

type AvatarSizeToStylesMap = Record<AvatarSizeToStyles, AvatarStyles>;

type DiagonalAvatarsProps = MultipleAvatarsProps & {
    /** Whether to use the mid-subscript size for the avatars */
    useMidSubscriptSize: boolean;

    /** Style for the secondary avatar container */
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Whether the avatars are hovered */
    isHovered?: boolean;
};

function DiagonalAvatars({
    size,
    shouldShowTooltip,
    icons,
    isInReportAction,
    useMidSubscriptSize,
    secondaryAvatarContainerStyle,
    isHovered = false,
    useProfileNavigationWrapper,
    fallbackDisplayName,
    reportID,
}: DiagonalAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {formatPhoneNumber} = useLocalize();

    const tooltipTexts = shouldShowTooltip ? icons.map((icon) => getUserDetailTooltipText(Number(icon.id), formatPhoneNumber, icon.name)) : [''];
    const removeRightMargin = icons.length === 2 && size === CONST.AVATAR_SIZE.X_LARGE;
    const avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);

    const avatarSizeToStylesMap: AvatarSizeToStylesMap = {
        [CONST.AVATAR_SIZE.SMALL]: {
            singleAvatarStyle: styles.singleAvatarSmall,
            secondAvatarStyles: styles.secondAvatarSmall,
        },
        [CONST.AVATAR_SIZE.LARGE]: {
            singleAvatarStyle: styles.singleAvatarMedium,
            secondAvatarStyles: styles.secondAvatarMedium,
        },
        [CONST.AVATAR_SIZE.X_LARGE]: {
            singleAvatarStyle: styles.singleAvatarMediumLarge,
            secondAvatarStyles: styles.secondAvatarMediumLarge,
        },
        [CONST.AVATAR_SIZE.DEFAULT]: {
            singleAvatarStyle: styles.singleAvatar,
            secondAvatarStyles: styles.secondAvatar,
        },
    };

    let avatarSize;
    if (useMidSubscriptSize) {
        avatarSize = CONST.AVATAR_SIZE.MID_SUBSCRIPT;
    } else if (size === CONST.AVATAR_SIZE.LARGE) {
        avatarSize = CONST.AVATAR_SIZE.MEDIUM;
    } else if (size === CONST.AVATAR_SIZE.X_LARGE) {
        avatarSize = CONST.AVATAR_SIZE.MEDIUM_LARGE;
    } else {
        avatarSize = CONST.AVATAR_SIZE.SMALLER;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {singleAvatarStyle, secondAvatarStyles} = avatarSizeToStylesMap[size as AvatarSizeToStyles] ?? avatarSizeToStylesMap.default;
    const secondaryAvatarContainerStyles = secondaryAvatarContainerStyle ?? [StyleUtils.getBackgroundAndBorderStyle(isHovered ? theme.activeComponentBG : theme.componentBG)];

    return (
        <View style={[avatarContainerStyles, removeRightMargin && styles.mr0]}>
            <View
                style={[singleAvatarStyle, icons.at(0)?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, icons.at(0)?.type)]}
                testID="ReportActionAvatars-MultipleAvatars"
            >
                <UserDetailsTooltip
                    accountID={Number(icons.at(0)?.id)}
                    icon={icons.at(0)}
                    fallbackUserDetails={{
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: fallbackDisplayName || icons.at(0)?.name,
                    }}
                    shouldRender={shouldShowTooltip}
                >
                    {/* View is necessary for tooltip to show for multiple avatars in LHN */}
                    <View>
                        <ProfileAvatar
                            useProfileNavigationWrapper={useProfileNavigationWrapper}
                            source={icons.at(0)?.source ?? WorkspaceBuilding}
                            size={avatarSize}
                            imageStyles={[singleAvatarStyle]}
                            name={icons.at(0)?.name}
                            type={icons.at(0)?.type ?? CONST.ICON_TYPE_AVATAR}
                            avatarID={icons.at(0)?.id}
                            fallbackIcon={icons.at(0)?.fallbackIcon}
                            testID="ReportActionAvatars-MultipleAvatars-MainAvatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
                <View
                    style={[
                        secondAvatarStyles,
                        secondaryAvatarContainerStyles,
                        icons.at(1)?.type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, icons.at(1)?.type) : {},
                    ]}
                >
                    {icons.length === 2 ? (
                        <UserDetailsTooltip
                            accountID={Number(icons.at(1)?.id)}
                            icon={icons.at(1)}
                            fallbackUserDetails={{
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                displayName: fallbackDisplayName || icons.at(1)?.name,
                            }}
                            shouldRender={shouldShowTooltip}
                        >
                            <View>
                                <ProfileAvatar
                                    useProfileNavigationWrapper={useProfileNavigationWrapper}
                                    source={icons.at(1)?.source ?? WorkspaceBuilding}
                                    size={avatarSize}
                                    imageStyles={[singleAvatarStyle]}
                                    name={icons.at(1)?.name}
                                    avatarID={icons.at(1)?.id}
                                    type={icons.at(1)?.type ?? CONST.ICON_TYPE_AVATAR}
                                    fallbackIcon={icons.at(1)?.fallbackIcon}
                                    testID="ReportActionAvatars-MultipleAvatars-SecondaryAvatar"
                                    reportID={reportID}
                                />
                            </View>
                        </UserDetailsTooltip>
                    ) : (
                        <Tooltip
                            text={tooltipTexts.slice(1).join(', ')}
                            shouldRender={shouldShowTooltip}
                        >
                            <View
                                style={[singleAvatarStyle, styles.alignItemsCenter, styles.justifyContentCenter]}
                                testID="ReportActionAvatars-MultipleAvatars-LimitReached"
                            >
                                <Text
                                    style={[styles.userSelectNone, size === CONST.AVATAR_SIZE.SMALL ? styles.avatarInnerTextSmall : styles.avatarInnerText]}
                                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                >
                                    {`+${icons.length - 1}`}
                                </Text>
                            </View>
                        </Tooltip>
                    )}
                </View>
            </View>
        </View>
    );
}

export default DiagonalAvatars;
export type {DiagonalAvatarsProps};
