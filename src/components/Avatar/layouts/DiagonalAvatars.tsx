import AvatarNamesTooltip from '@components/Avatar/tooltips/AvatarNamesTooltip';
import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

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
function DiagonalAvatars({size, icons, isInReportAction, secondaryAvatarContainerStyle, isHovered = false, fallbackDisplayName}: DiagonalAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const primaryIcon = icons.at(0);
    const secondaryIcon = icons.at(1);

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
                <AvatarTooltip
                    avatar={primaryIcon}
                    fallbackDisplayName={fallbackDisplayName}
                >
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
                </AvatarTooltip>
            }
            secondary={
                icons.length === 2 ? (
                    <AvatarTooltip
                        avatar={secondaryIcon}
                        fallbackDisplayName={fallbackDisplayName}
                    >
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
                    </AvatarTooltip>
                ) : (
                    <AvatarNamesTooltip avatars={icons.slice(1)}>
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
                    </AvatarNamesTooltip>
                )
            }
        />
    );
}

export default DiagonalAvatars;
