import AvatarFromIcon from '@components/Avatar/AvatarFromIcon';
import AvatarNamesTooltip from '@components/Avatar/tooltips/AvatarNamesTooltip';
import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ColorValue} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {MultipleAvatarsProps} from './types';

type HorizontalStackingOptions = Partial<{
    isHovered: boolean;
    isActive: boolean;
    isPressed: boolean;
    overlapDivider: number;
    maxAvatarsPerRow: number;
    maxRows: number;
    avatarBorderColor: ColorValue;
}>;

type HorizontalAvatarsProps = HorizontalStackingOptions & MultipleAvatarsProps;

/** `HorizontalAvatars` renders a horizontally overlapping row of avatars, with a "+N" overflow indicator once `maxAvatarsPerRow` is exceeded.
 * When `maxRows` is greater than 1 and the icons overflow, they wrap onto additional rows (balanced evenly) before the overflow indicator kicks in.
 * `avatarBorderColor` should match the surface behind the avatars (e.g. `theme.cardBG` inside cards) and defaults to `theme.appBG`.
 */
function HorizontalAvatars({
    isHovered = false,
    isActive = false,
    isPressed = false,
    maxAvatarsPerRow = CONST.AVATAR_ROW_SIZE.DEFAULT,
    maxRows = 1,
    avatarBorderColor,
    overlapDivider = 3,
    size,
    icons,
    isInReportAction,
    fallbackDisplayName,
}: HorizontalAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const oneAvatarSize = StyleUtils.getAvatarStyle(size);
    const overlapSize = oneAvatarSize.width / overlapDivider;
    const oneAvatarBorderWidth = StyleUtils.getAvatarBorderWidth(size).borderWidth ?? 0;
    const height = oneAvatarSize.height + 2 * oneAvatarBorderWidth;
    const avatarContainerStyles = StyleUtils.combineStyles([styles.alignItemsCenter, styles.flexRow, StyleUtils.getHeight(height)]);

    const rowCount = Math.max(1, Math.min(maxRows, Math.ceil(icons.length / maxAvatarsPerRow)));
    const rowSize = Math.min(Math.ceil(icons.length / rowCount), maxAvatarsPerRow);
    // The last row takes the remainder so overflowing icons collapse into its "+N" indicator
    const avatarRows = Array.from({length: rowCount}, (_, rowIndex) =>
        rowIndex === rowCount - 1 ? icons.slice(rowIndex * rowSize) : icons.slice(rowIndex * rowSize, (rowIndex + 1) * rowSize),
    );

    return avatarRows.map((avatars, rowIndex) => (
        <View
            style={avatarContainerStyles}
            /* eslint-disable-next-line react/no-array-index-key */
            key={`avatarRow-${rowIndex}`}
            testID="ReportActionAvatars-MultipleAvatars-StackedHorizontally-Row"
        >
            {avatars.slice(0, maxAvatarsPerRow).map((icon, index) => (
                <AvatarTooltip
                    key={`stackedAvatars-${icon.id}`}
                    avatar={icon}
                    fallbackDisplayName={fallbackDisplayName}
                    style={[StyleUtils.getHorizontalStackedAvatarStyle(index, overlapSize), StyleUtils.getAvatarBorderRadius(size, StyleUtils.getShapeFromIconType(icon.type))]}
                >
                    <AvatarFromIcon
                        iconAdditionalStyles={[
                            StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                theme,
                                isHovered,
                                isPressed,
                                isInReportAction,
                                avatarBorderColor,
                                isActive,
                            }),
                            StyleUtils.getAvatarBorderWidth(size),
                        ]}
                        icon={icon}
                        size={size}
                        testID="ReportActionAvatars-MultipleAvatars-StackedHorizontally-Avatar"
                    />
                </AvatarTooltip>
            ))}
            {avatars.length > maxAvatarsPerRow && (
                <AvatarNamesTooltip avatars={icons.slice(avatarRows.length * maxAvatarsPerRow - 1, avatarRows.length * maxAvatarsPerRow + 9)}>
                    <View
                        testID="ReportActionAvatars-MultipleAvatars-StackedHorizontally-LimitReached"
                        style={[
                            styles.alignItemsCenter,
                            styles.justifyContentCenter,
                            StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                theme,
                                isHovered,
                                isPressed,
                                isInReportAction,
                                avatarBorderColor,
                            }),
                            StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, variables.overlayOpacity),
                            StyleUtils.getHorizontalStackedOverlayAvatarStyle(size),
                            icons.at(3)?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, CONST.AVATAR_SHAPE.ROUNDED_SQUARE),
                        ]}
                    >
                        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, StyleUtils.getHeight(oneAvatarSize.height), StyleUtils.getWidthStyle(oneAvatarSize.width)]}>
                            <Text
                                style={[styles.avatarInnerTextSmall, StyleUtils.getAvatarExtraFontSizeStyle(size), styles.userSelectNone]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >{`+${avatars.length - maxAvatarsPerRow}`}</Text>
                        </View>
                    </View>
                </AvatarNamesTooltip>
            )}
        </View>
    ));
}

export default HorizontalAvatars;
export type {HorizontalStackingOptions};
