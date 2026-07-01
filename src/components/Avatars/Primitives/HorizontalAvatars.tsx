import React from 'react';
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
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ProfileAvatar from './ProfileAvatar';
import type {MultipleAvatarsProps} from './types';

type HorizontalStackingOptions = Partial<{
    displayInRows: boolean;
    isHovered: boolean;
    isActive: boolean;
    isPressed: boolean;
    overlapDivider: number;
    maxAvatarsInRow: number;
    useCardBG: boolean;
}>;

type HorizontalAvatarsProps = HorizontalStackingOptions & MultipleAvatarsProps;

function HorizontalAvatars({
    isHovered = false,
    isActive = false,
    isPressed = false,
    maxAvatarsInRow = CONST.AVATAR_ROW_SIZE.DEFAULT,
    displayInRows: shouldDisplayAvatarsInRows = false,
    useCardBG: shouldUseCardBackground = false,
    overlapDivider = 3,
    size,
    shouldShowTooltip,
    icons,
    isInReportAction,
    useProfileNavigationWrapper,
    fallbackDisplayName,
    reportID,
}: HorizontalAvatarsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {formatPhoneNumber} = useLocalize();

    const oneAvatarSize = StyleUtils.getAvatarStyle(size);
    const overlapSize = oneAvatarSize.width / overlapDivider;
    const oneAvatarBorderWidth = StyleUtils.getAvatarBorderWidth(size).borderWidth ?? 0;
    const height = oneAvatarSize.height + 2 * oneAvatarBorderWidth;
    const avatarContainerStyles = StyleUtils.combineStyles([styles.alignItemsCenter, styles.flexRow, StyleUtils.getHeight(height)]);

    let avatarRows;
    if (!shouldDisplayAvatarsInRows || icons.length <= maxAvatarsInRow) {
        avatarRows = [icons];
    } else {
        const rowSize = Math.min(Math.ceil(icons.length / 2), maxAvatarsInRow);
        avatarRows = [icons.slice(0, rowSize), icons.slice(rowSize)];
    }

    const tooltipTexts = shouldShowTooltip ? icons.map((icon) => getUserDetailTooltipText(Number(icon.id), formatPhoneNumber, icon.name)) : [''];

    return avatarRows.map((avatars, rowIndex) => (
        <View
            style={avatarContainerStyles}
            /* eslint-disable-next-line react/no-array-index-key */
            key={`avatarRow-${rowIndex}`}
            testID="ReportActionAvatars-MultipleAvatars-StackedHorizontally-Row"
        >
            {[...avatars].splice(0, maxAvatarsInRow).map((icon, index) => (
                <UserDetailsTooltip
                    key={`stackedAvatars-${icon.id}`}
                    accountID={Number(icon.id)}
                    icon={icon}
                    fallbackUserDetails={{
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: fallbackDisplayName || icon.name,
                    }}
                    shouldRender={shouldShowTooltip}
                >
                    <View style={[StyleUtils.getHorizontalStackedAvatarStyle(index, overlapSize), StyleUtils.getAvatarBorderRadius(size, icon.type)]}>
                        <ProfileAvatar
                            useProfileNavigationWrapper={useProfileNavigationWrapper}
                            iconAdditionalStyles={[
                                StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                    theme,
                                    isHovered,
                                    isPressed,
                                    isInReportAction,
                                    shouldUseCardBackground,
                                    isActive,
                                }),
                                StyleUtils.getAvatarBorderWidth(size),
                            ]}
                            source={icon.source ?? WorkspaceBuilding}
                            size={size}
                            name={icon.name}
                            avatarID={icon.id}
                            type={icon.type}
                            fallbackIcon={icon.fallbackIcon}
                            testID="ReportActionAvatars-MultipleAvatars-StackedHorizontally-Avatar"
                            reportID={reportID}
                        />
                    </View>
                </UserDetailsTooltip>
            ))}
            {avatars.length > maxAvatarsInRow && (
                <Tooltip
                    text={tooltipTexts.slice(avatarRows.length * maxAvatarsInRow - 1, avatarRows.length * maxAvatarsInRow + 9).join(', ')}
                    shouldRender={shouldShowTooltip}
                >
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
                                shouldUseCardBackground,
                            }),
                            StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, variables.overlayOpacity),
                            StyleUtils.getHorizontalStackedOverlayAvatarStyle(oneAvatarSize, oneAvatarBorderWidth),
                            icons.at(3)?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, icons.at(3)?.type),
                        ]}
                    >
                        <View style={[styles.justifyContentCenter, styles.alignItemsCenter, StyleUtils.getHeight(oneAvatarSize.height), StyleUtils.getWidthStyle(oneAvatarSize.width)]}>
                            <Text
                                style={[styles.avatarInnerTextSmall, StyleUtils.getAvatarExtraFontSizeStyle(size), styles.userSelectNone]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >{`+${avatars.length - maxAvatarsInRow}`}</Text>
                        </View>
                    </View>
                </Tooltip>
            )}
        </View>
    ));
}

export default HorizontalAvatars;
export type {HorizontalStackingOptions};
