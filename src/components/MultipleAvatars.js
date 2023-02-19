import React, {memo} from 'react';
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

const propTypes = {
    /** Array of avatar URLs or icons */
    icons: PropTypes.arrayOf(avatarPropTypes),

    /** Set the size of avatars */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Style for Second Avatar */
    // eslint-disable-next-line react/forbid-prop-types
    secondAvatarStyle: PropTypes.arrayOf(PropTypes.object),

    /** Tooltip for the Avatar */
    avatarTooltips: PropTypes.arrayOf(PropTypes.string),

    /** A fallback avatar icon to display when there is an error on loading avatar from remote URL. */
    fallbackIcon: PropTypes.func,

    /** Prop to identify if we should load avatars vertically instead of diagonally */
    shouldStackHorizontally: PropTypes.bool,

    /** Whether the avatars are hovered */
    isHovered: PropTypes.bool,

    /** Whether the avatars are in an element being pressed */
    isPressed: PropTypes.bool,

    /** Whether #focus mode is on */
    isFocusMode: PropTypes.bool,
};

const defaultProps = {
    icons: [],
    size: CONST.AVATAR_SIZE.DEFAULT,
    secondAvatarStyle: [StyleUtils.getBackgroundAndBorderStyle(themeColors.componentBG)],
    avatarTooltips: [],
    fallbackIcon: undefined,
    shouldStackHorizontally: false,
    isHovered: false,
    isPressed: false,
    isFocusMode: false,
};

const MultipleAvatars = (props) => {
    const avatarContainerStyles = props.size === CONST.AVATAR_SIZE.SMALL ? styles.emptyAvatarSmall : styles.emptyAvatar;
    const singleAvatarStyles = props.size === CONST.AVATAR_SIZE.SMALL ? styles.singleAvatarSmall : styles.singleAvatar;
    const secondAvatarStyles = [
        props.size === CONST.AVATAR_SIZE.SMALL ? styles.secondAvatarSmall : styles.secondAvatar,
        ...props.secondAvatarStyle,
    ];
    const horizontalStyles = [styles.horizontalStackedAvatar4, styles.horizontalStackedAvatar3, styles.horizontalStackedAvatar2, styles.horizontalStackedAvatar1];

    if (!props.icons.length) {
        return null;
    }

    if (props.icons.length === 1 && !props.shouldStackHorizontally) {
        return (
            <View style={avatarContainerStyles}>
                <Tooltip text={props.avatarTooltips[0]}>
                    <Avatar
                        source={props.icons[0].source}
                        size={props.size}
                        fill={themeColors.iconSuccessFill}
                        name={props.icons[0].name}
                        type={props.icons[0].type}
                    />
                </Tooltip>
            </View>
        );
    }

    return (
        <View style={avatarContainerStyles}>
            {props.shouldStackHorizontally ? (
                <>
                    {
                        _.map([...props.icons].splice(0, 4).reverse(), (icon, index) => (
                            <View
                                key={`stackedAvatars-${index}`}
                                style={[styles.horizontalStackedAvatar, StyleUtils.getHorizontalStackedAvatarBorderStyle(props.isHovered, props.isPressed), horizontalStyles[index],
                                    StyleUtils.getAvatarBorderRadius(props.size, icon.type)]}
                            >
                                <Avatar
                                    source={icon.source || props.fallbackIcon}
                                    fill={themeColors.iconSuccessFill}
                                    size={CONST.AVATAR_SIZE.SMALLER}
                                    name={icon.name}
                                    type={icon.type}
                                />
                            </View>
                        ))
                    }
                    {props.icons.length > 4 && (
                        <View
                            style={[
                                styles.alignItemsCenter,
                                styles.justifyContentCenter,
                                StyleUtils.getHorizontalStackedAvatarBorderStyle(props.isHovered, props.isPressed),

                                // Set overlay background color with RGBA value so that the text will not inherit opacity
                                StyleUtils.getBackgroundColorWithOpacityStyle(themeColors.overlay, variables.overlayOpacity),
                                styles.horizontalStackedAvatar4Overlay,
                                StyleUtils.getAvatarBorderRadius(props.size, props.icons[3].type),
                            ]}
                        >
                            <Text style={styles.avatarInnerTextSmall}>
                                {`+${props.icons.length - 4}`}
                            </Text>
                        </View>
                    )}
                </>
            ) : (
                <View
                    style={singleAvatarStyles}
                >
                    <Tooltip text={props.avatarTooltips[0]} absolute>
                        {/* View is necessary for tooltip to show for multiple avatars in LHN */}
                        <View>
                            <Avatar
                                source={props.icons[0].source || props.fallbackIcon}
                                fill={themeColors.iconSuccessFill}
                                size={props.isFocusMode ? CONST.AVATAR_SIZE.MID_SUBSCRIPT : CONST.AVATAR_SIZE.SMALLER}

                                imageStyles={[singleAvatarStyles]}
                                name={props.icons[0].name}
                                type={props.icons[0].type}
                            />
                        </View>
                    </Tooltip>
                    <View
                        style={secondAvatarStyles}
                    >
                        {props.icons.length === 2 ? (
                            <Tooltip text={props.avatarTooltips[1]} absolute>
                                <View>
                                    <Avatar
                                        source={props.icons[1].source || props.fallbackIcon}
                                        fill={themeColors.iconSuccessFill}
                                        size={props.isFocusMode ? CONST.AVATAR_SIZE.MID_SUBSCRIPT : CONST.AVATAR_SIZE.SMALLER}

                                        imageStyles={[singleAvatarStyles]}
                                        name={props.icons[1].name}
                                        type={props.icons[1].type}
                                    />
                                </View>
                            </Tooltip>
                        ) : (
                            <Tooltip text={props.avatarTooltips.slice(1).join(', ')} absolute>
                                <View
                                    style={[singleAvatarStyles, styles.alignItemsCenter, styles.justifyContentCenter]}
                                >
                                    <Text style={props.size === CONST.AVATAR_SIZE.SMALL
                                        ? styles.avatarInnerTextSmall
                                        : styles.avatarInnerText}
                                    >
                                        {`+${props.icons.length - 1}`}
                                    </Text>
                                </View>
                            </Tooltip>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};

MultipleAvatars.defaultProps = defaultProps;
MultipleAvatars.propTypes = propTypes;
MultipleAvatars.displayName = 'MultipleAvatars';

export default memo(MultipleAvatars);
