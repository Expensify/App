import React, {memo, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Avatar from './Avatar';
import Tooltip from './Tooltip';
import Text from './Text';
import themeColors from '../styles/themes/default';
import * as StyleUtils from '../styles/StyleUtils';
import CONST from '../CONST';
import variables from '../styles/variables';
import avatarPropTypes from './avatarPropTypes';
import UserDetailsTooltip from './UserDetailsTooltip';

const propTypes = {
    /** Array of avatar URLs or icons */
    icons: PropTypes.arrayOf(avatarPropTypes),

    /** Set the size of avatars */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Style for Second Avatar */
    // eslint-disable-next-line react/forbid-prop-types
    secondAvatarStyle: PropTypes.arrayOf(PropTypes.object),

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon: PropTypes.func,

    /** Prop to identify if we should load avatars vertically instead of diagonally */
    shouldStackHorizontally: PropTypes.bool,

    /** Prop to identify if we should display avatars in rows */
    shouldDisplayAvatarsInRows: PropTypes.bool,

    /** Whether the avatars are hovered */
    isHovered: PropTypes.bool,

    /** Whether the avatars are in an element being pressed */
    isPressed: PropTypes.bool,

    /** Whether #focus mode is on */
    isFocusMode: PropTypes.bool,

    /** Whether avatars are displayed within a reportAction */
    isInReportAction: PropTypes.bool,

    /** Whether to show the toolip text */
    shouldShowTooltip: PropTypes.bool,

    /** Whether avatars are displayed with the highlighted background color instead of the app background color. This is primarily the case for IOU previews. */
    shouldUseCardBackground: PropTypes.bool,

    /** Prop to limit the amount of avatars displayed horizontally */
    maxAvatarsInRow: PropTypes.number,
};

const defaultProps = {
    icons: [],
    size: CONST.AVATAR_SIZE.DEFAULT,
    secondAvatarStyle: [StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG)],
    fallbackIcon: undefined,
    shouldStackHorizontally: false,
    shouldDisplayAvatarsInRows: false,
    isHovered: false,
    isPressed: false,
    isFocusMode: false,
    isInReportAction: false,
    shouldShowTooltip: true,
    shouldUseCardBackground: false,
    maxAvatarsInRow: CONST.AVATAR_ROW_SIZE.DEFAULT,
};

function getContainerStyles(size, isInReportAction) {
    let containerStyles;

    switch (size) {
        case CONST.AVATAR_SIZE.SMALL:
            containerStyles = [styles.emptyAvatarSmall, styles.emptyAvatarMarginSmall];
            break;
        case CONST.AVATAR_SIZE.SMALLER:
            containerStyles = [styles.emptyAvatarSmaller, styles.emptyAvatarMarginSmaller];
            break;
        case CONST.AVATAR_SIZE.MEDIUM:
            containerStyles = [styles.emptyAvatarMedium, styles.emptyAvatarMargin];
            break;
        default:
            containerStyles = [styles.emptyAvatar, isInReportAction ? styles.emptyAvatarMarginChat : styles.emptyAvatarMargin];
    }

    return containerStyles;
}
function MultipleAvatars(props) {
    const [avatarRows, setAvatarRows] = useState([props.icons]);
    let avatarContainerStyles = getContainerStyles(props.size, props.isInReportAction);
    const singleAvatarStyle = props.size === CONST.AVATAR_SIZE.SMALL ? styles.singleAvatarSmall : styles.singleAvatar;
    const secondAvatarStyles = [props.size === CONST.AVATAR_SIZE.SMALL ? styles.secondAvatarSmall : styles.secondAvatar, ...props.secondAvatarStyle];
    const tooltipTexts = props.shouldShowTooltip ? _.pluck(props.icons, 'name') : [''];

    const calculateAvatarRows = () => {
        // If we're not displaying avatars in rows or the number of icons is less than or equal to the max avatars in a row, return a single row
        if (!props.shouldDisplayAvatarsInRows || props.icons.length <= props.maxAvatarsInRow) {
            setAvatarRows([props.icons]);
            return;
        }

        // Calculate the size of each row
        const rowSize = Math.min(Math.ceil(props.icons.length / 2), props.maxAvatarsInRow);

        // Slice the icons array into two rows
        const firstRow = props.icons.slice(rowSize);
        const secondRow = props.icons.slice(0, rowSize);

        // Update the state with the two rows as an array
        setAvatarRows([firstRow, secondRow]);
    };

    useEffect(() => {
        calculateAvatarRows();

        // The only dependencies of the effect are based on props, so we can safely disable the exhaustive-deps rule
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.icons, props.maxAvatarsInRow, props.shouldDisplayAvatarsInRows]);

    if (!props.icons.length) {
        return null;
    }

    if (props.icons.length === 1 && !props.shouldStackHorizontally) {
        return (
            <UserDetailsTooltip
                accountID={props.icons[0].id}
                icon={props.icons[0]}
                fallbackUserDetails={{
                    displayName: props.icons[0].name,
                    avatar: props.icons[0].avatar,
                }}
            >
                <View style={avatarContainerStyles}>
                    <Avatar
                        source={props.icons[0].source}
                        size={props.size}
                        fill={themeColors.iconSuccessFill}
                        name={props.icons[0].name}
                        type={props.icons[0].type}
                    />
                </View>
            </UserDetailsTooltip>
        );
    }

    const oneAvatarSize = StyleUtils.getAvatarStyle(props.size);
    const oneAvatarBorderWidth = StyleUtils.getAvatarBorderWidth(props.size).borderWidth;
    const overlapSize = oneAvatarSize.width / 3;

    if (props.shouldStackHorizontally) {
        // Height of one avatar + border space
        const height = oneAvatarSize.height + 2 * oneAvatarBorderWidth;
        avatarContainerStyles = StyleUtils.combineStyles([styles.alignItemsCenter, styles.flexRow, StyleUtils.getHeight(height)]);
    }

    return (
        <>
            {props.shouldStackHorizontally ? (
                _.map(avatarRows, (avatars, rowIndex) => (
                    <View
                        style={avatarContainerStyles}
                        key={`avatarRow-${rowIndex}`}
                    >
                        {_.map([...avatars].splice(0, props.maxAvatarsInRow), (icon, index) => (
                            <UserDetailsTooltip
                                key={`stackedAvatars-${index}`}
                                accountID={icon.id}
                                icon={icon}
                                fallbackUserDetails={{
                                    displayName: icon.name,
                                    avatar: icon.avatar,
                                }}
                            >
                                <View style={[StyleUtils.getHorizontalStackedAvatarStyle(index, overlapSize), StyleUtils.getAvatarBorderRadius(props.size, icon.type)]}>
                                    <Avatar
                                        iconAdditionalStyles={[
                                            StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                                isHovered: props.isHovered,
                                                isPressed: props.isPressed,
                                                isInReportAction: props.isInReportAction,
                                                shouldUseCardBackground: props.shouldUseCardBackground,
                                            }),
                                            StyleUtils.getAvatarBorderWidth(props.size),
                                        ]}
                                        source={icon.source || props.fallbackIcon}
                                        fill={themeColors.iconSuccessFill}
                                        size={props.size}
                                        name={icon.name}
                                        type={icon.type}
                                    />
                                </View>
                            </UserDetailsTooltip>
                        ))}
                        {avatars.length > props.maxAvatarsInRow && (
                            <Tooltip
                                // We only want to cap tooltips to only 10 users or so since some reports have hundreds of users, causing performance to degrade.
                                text={tooltipTexts.slice(avatarRows.length * props.maxAvatarsInRow - 1, avatarRows.length * props.maxAvatarsInRow + 9).join(', ')}
                            >
                                <View
                                    style={[
                                        styles.alignItemsCenter,
                                        styles.justifyContentCenter,
                                        StyleUtils.getHorizontalStackedAvatarBorderStyle({
                                            isHovered: props.isHovered,
                                            isPressed: props.isPressed,
                                            isInReportAction: props.isInReportAction,
                                            shouldUseCardBackground: props.shouldUseCardBackground,
                                        }),

                                        // Set overlay background color with RGBA value so that the text will not inherit opacity
                                        StyleUtils.getBackgroundColorWithOpacityStyle(themeColors.overlay, variables.overlayOpacity),
                                        StyleUtils.getHorizontalStackedOverlayAvatarStyle(oneAvatarSize, oneAvatarBorderWidth),
                                        props.icons[3].type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(props.size, props.icons[3].type) : {},
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
                                            selectable={false}
                                            style={[styles.avatarInnerTextSmall, StyleUtils.getAvatarExtraFontSizeStyle(props.size)]}
                                        >{`+${avatars.length - props.maxAvatarsInRow}`}</Text>
                                    </View>
                                </View>
                            </Tooltip>
                        )}
                    </View>
                ))
            ) : (
                <View style={avatarContainerStyles}>
                    <View style={[singleAvatarStyle, props.icons[0].type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(props.size, props.icons[0].type) : {}]}>
                        <UserDetailsTooltip
                            accountID={props.icons[0].id}
                            icon={props.icons[0]}
                            fallbackUserDetails={{
                                displayName: props.icons[0].name,
                                avatar: props.icons[0].avatar,
                            }}
                        >
                            {/* View is necessary for tooltip to show for multiple avatars in LHN */}
                            <View>
                                <Avatar
                                    source={props.icons[0].source || props.fallbackIcon}
                                    fill={themeColors.iconSuccessFill}
                                    size={props.isFocusMode ? CONST.AVATAR_SIZE.MID_SUBSCRIPT : CONST.AVATAR_SIZE.SMALLER}
                                    imageStyles={[singleAvatarStyle]}
                                    name={props.icons[0].name}
                                    type={props.icons[0].type}
                                />
                            </View>
                        </UserDetailsTooltip>
                        <View style={[...secondAvatarStyles, props.icons[1].type === CONST.ICON_TYPE_WORKSPACE ? StyleUtils.getAvatarBorderRadius(props.size, props.icons[1].type) : {}]}>
                            {props.icons.length === 2 ? (
                                <UserDetailsTooltip
                                    accountID={props.icons[1].id}
                                    icon={props.icons[1]}
                                    fallbackUserDetails={{
                                        displayName: props.icons[1].name,
                                        avatar: props.icons[1].avatar,
                                    }}
                                >
                                    <View>
                                        <Avatar
                                            source={props.icons[1].source || props.fallbackIcon}
                                            fill={themeColors.iconSuccessFill}
                                            size={props.isFocusMode ? CONST.AVATAR_SIZE.MID_SUBSCRIPT : CONST.AVATAR_SIZE.SMALLER}
                                            imageStyles={[singleAvatarStyle]}
                                            name={props.icons[1].name}
                                            type={props.icons[1].type}
                                        />
                                    </View>
                                </UserDetailsTooltip>
                            ) : (
                                <Tooltip text={tooltipTexts.slice(1).join(', ')}>
                                    <View style={[singleAvatarStyle, styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Text
                                            selectable={false}
                                            style={props.size === CONST.AVATAR_SIZE.SMALL ? styles.avatarInnerTextSmall : styles.avatarInnerText}
                                        >
                                            {`+${props.icons.length - 1}`}
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

MultipleAvatars.defaultProps = defaultProps;
MultipleAvatars.propTypes = propTypes;
MultipleAvatars.displayName = 'MultipleAvatars';

export default memo(MultipleAvatars);
