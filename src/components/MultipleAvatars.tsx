import React, {memo, useMemo} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {ValueOf} from 'type-fest';
import {AvatarSource} from '@libs/UserUtils';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import themeColors from '@styles/themes/default';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import Avatar from './Avatar';
import Text from './Text';
import Tooltip from './Tooltip';
import UserDetailsTooltip from './UserDetailsTooltip';

type MultipleAvatarsProps = {
    /** Array of avatar URLs or icons */
    icons: Icon[];

    /** Set the size of avatars */
    size?: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Style for Second Avatar */
    secondAvatarStyle?: StyleProp<ViewStyle>;

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon?: AvatarSource;

    /** Prop to identify if we should load avatars vertically instead of diagonally */
    shouldStackHorizontally?: boolean;

    /** Prop to identify if we should display avatars in rows */
    shouldDisplayAvatarsInRows?: boolean;

    /** Whether the avatars are hovered */
    isHovered?: boolean;

    /** Whether the avatars are in an element being pressed */
    isPressed?: boolean;

    /** Whether #focus mode is on */
    isFocusMode?: boolean;

    /** Whether avatars are displayed within a reportAction */
    isInReportAction?: boolean;

    /** Whether to show the toolip text */
    shouldShowTooltip?: boolean;

    /** Whether avatars are displayed with the highlighted background color instead of the app background color. This is primarily the case for IOU previews. */
    shouldUseCardBackground?: boolean;

    /** Prop to limit the amount of avatars displayed horizontally */
    maxAvatarsInRow?: number;
};

type AvatarStyles = {
    singleAvatarStyle: ViewStyle;
    secondAvatarStyles: ViewStyle;
};

type AvatarSizeToStyles = typeof CONST.AVATAR_SIZE.SMALL | typeof CONST.AVATAR_SIZE.LARGE | typeof CONST.AVATAR_SIZE.DEFAULT;

type AvatarSizeToStylesMap = Record<AvatarSizeToStyles, AvatarStyles>;

const avatarSizeToStylesMap: AvatarSizeToStylesMap = {
    [CONST.AVATAR_SIZE.SMALL]: {
        singleAvatarStyle: styles.singleAvatarSmall,
        secondAvatarStyles: styles.secondAvatarSmall,
    },
    [CONST.AVATAR_SIZE.LARGE]: {
        singleAvatarStyle: styles.singleAvatarMedium,
        secondAvatarStyles: styles.secondAvatarMedium,
    },
    [CONST.AVATAR_SIZE.DEFAULT]: {
        singleAvatarStyle: styles.singleAvatar,
        secondAvatarStyles: styles.secondAvatar,
    },
};

function MultipleAvatars({
    fallbackIcon,
    icons = [],
    size = CONST.AVATAR_SIZE.DEFAULT,
    secondAvatarStyle = [StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG)],
    shouldStackHorizontally = false,
    shouldDisplayAvatarsInRows = false,
    isHovered = false,
    isPressed = false,
    isFocusMode = false,
    isInReportAction = false,
    shouldShowTooltip = true,
    shouldUseCardBackground = false,
    maxAvatarsInRow = CONST.AVATAR_ROW_SIZE.DEFAULT,
}: MultipleAvatarsProps) {
    let avatarContainerStyles = StyleUtils.getContainerStyles(size, isInReportAction);
    const {singleAvatarStyle, secondAvatarStyles} = useMemo(() => avatarSizeToStylesMap[size as AvatarSizeToStyles] ?? avatarSizeToStylesMap.default, [size]);

    const tooltipTexts = useMemo(() => (shouldShowTooltip ? icons.map((icon) => icon.name) : ['']), [shouldShowTooltip, icons]);
    const avatarSize = useMemo(() => {
        if (isFocusMode) {
            return CONST.AVATAR_SIZE.MID_SUBSCRIPT;
        }

        if (size === CONST.AVATAR_SIZE.LARGE) {
            return CONST.AVATAR_SIZE.MEDIUM;
        }

        return CONST.AVATAR_SIZE.SMALLER;
    }, [isFocusMode, size]);

    const avatarRows = useMemo(() => {
        // If we're not displaying avatars in rows or the number of icons is less than or equal to the max avatars in a row, return a single row
        if (!shouldDisplayAvatarsInRows || icons.length <= maxAvatarsInRow) {
            return [icons];
        }

        // Calculate the size of each row
        const rowSize = Math.min(Math.ceil(icons.length / 2), maxAvatarsInRow);

        // Slice the icons array into two rows
        const firstRow = icons.slice(0, rowSize);
        const secondRow = icons.slice(rowSize);

        // Update the state with the two rows as an array
        return [firstRow, secondRow];
    }, [icons, maxAvatarsInRow, shouldDisplayAvatarsInRows]);

    if (!icons.length) {
        return null;
    }

    if (icons.length === 1 && !shouldStackHorizontally) {
        return (
            <UserDetailsTooltip
                accountID={icons[0].id}
                icon={icons[0]}
                fallbackUserDetails={{
                    displayName: icons[0].name,
                }}
            >
                <View style={avatarContainerStyles}>
                    <Avatar
                        source={icons[0].source}
                        size={size}
                        fill={themeColors.iconSuccessFill}
                        name={icons[0].name}
                        type={icons[0].type}
                        fallbackIcon={icons[0].fallbackIcon}
                    />
                </View>
            </UserDetailsTooltip>
        );
    }

    const oneAvatarSize = StyleUtils.getAvatarStyle(size);
    const oneAvatarBorderWidth = StyleUtils.getAvatarBorderWidth(size).borderWidth ?? 0;
    const overlapSize = oneAvatarSize.width / 3;

    if (shouldStackHorizontally) {
        // Height of one avatar + border space
        const height = oneAvatarSize.height + 2 * oneAvatarBorderWidth;
        avatarContainerStyles = StyleUtils.combineStyles([styles.alignItemsCenter, styles.flexRow, StyleUtils.getHeight(height)]);
    }

    return (
        <>
            {shouldStackHorizontally ? (
                avatarRows.map((avatars, rowIndex) => (
                    <View
                        style={avatarContainerStyles}
                        /* eslint-disable-next-line react/no-array-index-key */
                        key={`avatarRow-${rowIndex}`}
                    >
                        {[...avatars].splice(0, maxAvatarsInRow).map((icon, index) => (
                            <UserDetailsTooltip
                                key={`stackedAvatars-${icon.id}`}
                                accountID={icon.id}
                                icon={icon}
                                fallbackUserDetails={{
                                    displayName: icon.name,
                                }}
                            >
                                <View style={[StyleUtils.getHorizontalStackedAvatarStyle(index, overlapSize), StyleUtils.getAvatarBorderRadius(size, icon.type)]}>
                                    <Avatar
                                        iconAdditionalStyles={[
                                            StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                                isHovered,
                                                isPressed,
                                                isInReportAction,
                                                shouldUseCardBackground,
                                            }),
                                            StyleUtils.getAvatarBorderWidth(size),
                                        ]}
                                        source={icon.source ?? fallbackIcon}
                                        fill={themeColors.iconSuccessFill}
                                        size={size}
                                        name={icon.name}
                                        type={icon.type}
                                        fallbackIcon={icon.fallbackIcon}
                                    />
                                </View>
                            </UserDetailsTooltip>
                        ))}
                        {avatars.length > maxAvatarsInRow && (
                            <Tooltip
                                // We only want to cap tooltips to only 10 users or so since some reports have hundreds of users, causing performance to degrade.
                                text={tooltipTexts.slice(avatarRows.length * maxAvatarsInRow - 1, avatarRows.length * maxAvatarsInRow + 9).join(', ')}
                            >
                                <View
                                    style={[
                                        styles.alignItemsCenter,
                                        styles.justifyContentCenter,
                                        StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                            isHovered,
                                            isPressed,
                                            isInReportAction,
                                            shouldUseCardBackground,
                                        }),

                                        // Set overlay background color with RGBA value so that the text will not inherit opacity
                                        StyleUtils.getBackgroundColorWithOpacityStyle(themeColors.overlay, variables.overlayOpacity),
                                        StyleUtils.getHorizontalStackedOverlayAvatarStyle(oneAvatarSize, oneAvatarBorderWidth),
                                        icons[3].type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, icons[3].type) : {},
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.justifyContentCenter,
                                            styles.alignItemsCenter,
                                            StyleUtils.getHeight(oneAvatarSize.height),
                                            StyleUtils.getWidthStyle(oneAvatarSize.width),
                                        ]}
                                    >
                                        <Text
                                            style={[styles.avatarInnerTextSmall, StyleUtils.getAvatarExtraFontSizeStyle(size), styles.userSelectNone]}
                                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                        >{`+${avatars.length - maxAvatarsInRow}`}</Text>
                                    </View>
                                </View>
                            </Tooltip>
                        )}
                    </View>
                ))
            ) : (
                <View style={avatarContainerStyles}>
                    <View style={[singleAvatarStyle, icons[0].type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, icons[0].type) : {}]}>
                        <UserDetailsTooltip
                            accountID={icons[0].id}
                            icon={icons[0]}
                            fallbackUserDetails={{
                                displayName: icons[0].name,
                            }}
                        >
                            {/* View is necessary for tooltip to show for multiple avatars in LHN */}
                            <View>
                                <Avatar
                                    source={icons[0].source ?? fallbackIcon}
                                    fill={themeColors.iconSuccessFill}
                                    size={avatarSize}
                                    imageStyles={[singleAvatarStyle]}
                                    name={icons[0].name}
                                    type={icons[0].type}
                                    fallbackIcon={icons[0].fallbackIcon}
                                />
                            </View>
                        </UserDetailsTooltip>
                        <View style={[secondAvatarStyles, secondAvatarStyle, icons[1].type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(size, icons[1].type) : {}]}>
                            {icons.length === 2 ? (
                                <UserDetailsTooltip
                                    accountID={icons[1].id}
                                    icon={icons[1]}
                                    fallbackUserDetails={{
                                        displayName: icons[1].name,
                                    }}
                                >
                                    <View>
                                        <Avatar
                                            source={icons[1].source ?? fallbackIcon}
                                            fill={themeColors.iconSuccessFill}
                                            size={avatarSize}
                                            imageStyles={[singleAvatarStyle]}
                                            name={icons[1].name}
                                            type={icons[1].type}
                                            fallbackIcon={icons[1].fallbackIcon}
                                        />
                                    </View>
                                </UserDetailsTooltip>
                            ) : (
                                <Tooltip text={tooltipTexts.slice(1).join(', ')}>
                                    <View style={[singleAvatarStyle, styles.alignItemsCenter, styles.justifyContentCenter]}>
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
            )}
        </>
    );
}

MultipleAvatars.displayName = 'MultipleAvatars';

export default memo(MultipleAvatars);
