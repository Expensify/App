import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getUserDetailTooltipText} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {MultipleAvatarsProps} from './types';

import Avatar from '..';
import DiagonalAvatarsFrame from './DiagonalAvatarsFrame';
import getDiagonalAvatarSizing from './getDiagonalAvatarSizing';

type DiagonalAvatarsProps = MultipleAvatarsProps & {
    /** Style for the secondary avatar container */
    secondaryAvatarContainerStyle?: StyleProp<ViewStyle>;

    /** Whether the avatars are hovered */
    isHovered?: boolean;
};

/** `DiagonalAvatars` renders two avatars stacked diagonally — the primary in the top-left and the secondary in the bottom-right.
 * When more than two `icons` are passed, the secondary slot shows a "+N" overflow count instead of the second avatar.
 */
function DiagonalAvatars({size, shouldShowTooltip, icons, isInReportAction, secondaryAvatarContainerStyle, isHovered = false, fallbackDisplayName}: DiagonalAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {formatPhoneNumber, translate} = useLocalize();

    const primaryIcon = icons.at(0);
    const secondaryIcon = icons.at(1);

    const tooltipTexts = shouldShowTooltip ? icons.map((icon) => getUserDetailTooltipText(Number(icon.id), formatPhoneNumber, translate, icon.name)) : [''];

    const {avatarSize, singleAvatarStyleKey} = getDiagonalAvatarSizing(size);
    const secondaryAvatarContainerStyles = secondaryAvatarContainerStyle ?? [StyleUtils.getBackgroundAndBorderStyle(isHovered ? theme.activeComponentBG : theme.componentBG)];

    return (
        <DiagonalAvatarsFrame
            size={size}
            iconCount={icons.length}
            containerStyle={StyleUtils.getContainerStyles(size, isInReportAction)}
            primaryContainerStyle={primaryIcon?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, primaryIcon.type)}
            secondaryContainerStyle={[secondaryAvatarContainerStyles, secondaryIcon?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, secondaryIcon.type)]}
            primary={
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
                        <Avatar
                            type={primaryIcon?.type ?? CONST.ICON_TYPE_AVATAR}
                            source={primaryIcon?.source}
                            name={primaryIcon?.name ?? ''}
                            avatarID={primaryIcon?.id ?? CONST.DEFAULT_NUMBER_ID}
                            fallbackIcon={primaryIcon?.fallbackIcon}
                            fill={primaryIcon?.fill}
                            size={avatarSize}
                            imageStyles={styles[singleAvatarStyleKey]}
                            testID="ReportActionAvatars-MultipleAvatars-MainAvatar"
                        />
                    </View>
                </UserDetailsTooltip>
            }
            secondary={
                icons.length === 2 ? (
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
                            <Avatar
                                type={secondaryIcon?.type ?? CONST.ICON_TYPE_AVATAR}
                                source={secondaryIcon?.source}
                                name={secondaryIcon?.name ?? ''}
                                avatarID={secondaryIcon?.id ?? CONST.DEFAULT_NUMBER_ID}
                                fallbackIcon={secondaryIcon?.fallbackIcon}
                                fill={secondaryIcon?.fill}
                                size={avatarSize}
                                imageStyles={styles[singleAvatarStyleKey]}
                                testID="ReportActionAvatars-MultipleAvatars-SecondaryAvatar"
                            />
                        </View>
                    </UserDetailsTooltip>
                ) : (
                    <Tooltip
                        text={tooltipTexts.slice(1).join(', ')}
                        shouldRender={shouldShowTooltip}
                    >
                        <View
                            style={[styles[singleAvatarStyleKey], styles.alignItemsCenter, styles.justifyContentCenter]}
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
                )
            }
        />
    );
}

export default DiagonalAvatars;
