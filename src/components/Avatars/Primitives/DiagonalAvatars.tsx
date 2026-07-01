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

type AvatarSizeToStyles = typeof CONST.AVATAR_SIZE.X_SMALL | typeof CONST.AVATAR_SIZE.XXX_LARGE | typeof CONST.AVATAR_SIZE.XXXXX_LARGE | typeof CONST.AVATAR_SIZE.DEFAULT;

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

    const primaryIcon = icons.at(0);
    const secondaryIcon = icons.at(1);

    const tooltipTexts = shouldShowTooltip ? icons.map((icon) => getUserDetailTooltipText(Number(icon.id), formatPhoneNumber, icon.name)) : [''];
    const removeRightMargin = icons.length === 2 && size === CONST.AVATAR_SIZE.XXXXX_LARGE;
    const avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);

    const avatarSizeToStylesMap: AvatarSizeToStylesMap = {
        [CONST.AVATAR_SIZE.X_SMALL]: {
            singleAvatarStyle: styles.singleAvatarXxxxSmall,
            secondAvatarStyles: styles.secondAvatarXxxxSmall,
        },
        [CONST.AVATAR_SIZE.XXX_LARGE]: {
            singleAvatarStyle: styles.singleAvatarXLarge,
            secondAvatarStyles: styles.secondAvatarXLarge,
        },
        [CONST.AVATAR_SIZE.XXXXX_LARGE]: {
            singleAvatarStyle: styles.singleAvatarXxLarge,
            secondAvatarStyles: styles.secondAvatarXxLarge,
        },
        [CONST.AVATAR_SIZE.DEFAULT]: {
            singleAvatarStyle: styles.singleAvatarXxSmall,
            secondAvatarStyles: styles.secondAvatarXxSmall,
        },
    };

    let avatarSize;
    if (useMidSubscriptSize) {
        avatarSize = CONST.AVATAR_SIZE.XXXX_SMALL;
    } else if (size === CONST.AVATAR_SIZE.XXX_LARGE) {
        avatarSize = CONST.AVATAR_SIZE.X_LARGE;
    } else if (size === CONST.AVATAR_SIZE.XXXXX_LARGE) {
        avatarSize = CONST.AVATAR_SIZE.XX_LARGE;
    } else {
        avatarSize = CONST.AVATAR_SIZE.XX_SMALL;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const {singleAvatarStyle, secondAvatarStyles} = avatarSizeToStylesMap[size as AvatarSizeToStyles] ?? avatarSizeToStylesMap[CONST.AVATAR_SIZE.DEFAULT];
    const secondaryAvatarContainerStyles = secondaryAvatarContainerStyle ?? [StyleUtils.getBackgroundAndBorderStyle(isHovered ? theme.activeComponentBG : theme.componentBG)];

    return (
        <View style={[avatarContainerStyles, removeRightMargin && styles.mr0]}>
            <View
                style={[singleAvatarStyle, primaryIcon?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, primaryIcon?.type)]}
                testID="ReportActionAvatars-MultipleAvatars"
            >
                <UserDetailsTooltip
                    accountID={Number(primaryIcon?.id)}
                    icon={primaryIcon}
                    fallbackUserDetails={{
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: fallbackDisplayName || primaryIcon?.name,
                    }}
                    shouldRender={shouldShowTooltip}
                >
                    {/* View is necessary for tooltip to show for multiple avatars in LHN */}
                    <View>
                        <ProfileAvatar
                            useProfileNavigationWrapper={useProfileNavigationWrapper}
                            source={primaryIcon?.source ?? WorkspaceBuilding}
                            size={avatarSize}
                            imageStyles={[singleAvatarStyle]}
                            name={primaryIcon?.name}
                            type={primaryIcon?.type ?? CONST.ICON_TYPE_AVATAR}
                            avatarID={primaryIcon?.id}
                            fallbackIcon={primaryIcon?.fallbackIcon}
                            testID="ReportActionAvatars-MultipleAvatars-MainAvatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
                <View
                    style={[
                        secondAvatarStyles,
                        secondaryAvatarContainerStyles,
                        secondaryIcon?.type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, secondaryIcon?.type) : {},
                    ]}
                >
                    {icons.length === 2 ? (
                        <UserDetailsTooltip
                            accountID={Number(secondaryIcon?.id)}
                            icon={secondaryIcon}
                            fallbackUserDetails={{
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                displayName: fallbackDisplayName || secondaryIcon?.name,
                            }}
                            shouldRender={shouldShowTooltip}
                        >
                            <View>
                                <ProfileAvatar
                                    useProfileNavigationWrapper={useProfileNavigationWrapper}
                                    source={secondaryIcon?.source ?? WorkspaceBuilding}
                                    size={avatarSize}
                                    imageStyles={[singleAvatarStyle]}
                                    name={secondaryIcon?.name}
                                    avatarID={secondaryIcon?.id}
                                    type={secondaryIcon?.type ?? CONST.ICON_TYPE_AVATAR}
                                    fallbackIcon={secondaryIcon?.fallbackIcon}
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
                                    style={[styles.userSelectNone, size === CONST.AVATAR_SIZE.X_SMALL ? styles.avatarInnerTextSmall : styles.avatarInnerText]}
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
