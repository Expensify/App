import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import styles from '../styles/styles';
import Avatar from './Avatar';
import Tooltip from './Tooltip';
import Text from './Text';
import themeColors from '../styles/themes/default';

const propTypes = {
    /** Array of avatar URLs or icons */
    avatarIcons: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.func])),

    /** Set the sie of avatars */
    size: PropTypes.oneOf(['default', 'small']),

    /** Style for Second Avatar */
    // eslint-disable-next-line react/forbid-prop-types
    secondAvatarStyle: PropTypes.arrayOf(PropTypes.object),

    /** Tooltip for the Avatar */
    avatarTooltips: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    avatarIcons: [],
    size: 'default',
    secondAvatarStyle: [styles.secondAvatarHovered],
    avatarTooltips: [],
};

const MultipleAvatars = (props) => {
    const avatarContainerStyles = props.size === 'small' ? styles.emptyAvatarSmall : styles.emptyAvatar;
    const singleAvatarStyles = props.size === 'small' ? styles.singleAvatarSmall : styles.singleAvatar;
    const secondAvatarStyles = [
        props.size === 'small' ? styles.secondAvatarSmall : styles.secondAvatar,
        ...props.secondAvatarStyle,
    ];

    if (!props.avatarIcons.length) {
        return null;
    }

    if (props.avatarIcons.length === 1) {
        return (
            <View style={avatarContainerStyles}>
                <Tooltip text={props.avatarTooltips[0]}>
                    <Avatar
                        source={props.avatarIcons[0]}
                        size={props.size}
                        fill={themeColors.iconSuccessFill}
                    />
                </Tooltip>
            </View>
        );
    }

    return (
        <View style={avatarContainerStyles}>
            <View
                style={singleAvatarStyles}
            >
                <Tooltip text={props.avatarTooltips[0]} absolute>
                    <Image
                        source={{uri: props.avatarIcons[0]}}
                        style={singleAvatarStyles}
                    />
                </Tooltip>
                <View
                    style={secondAvatarStyles}
                >
                    {props.avatarIcons.length === 2 ? (
                        <Tooltip text={props.avatarTooltips[1]} absolute>
                            <Image
                                source={{uri: props.avatarIcons[1]}}
                                style={singleAvatarStyles}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip text={props.avatarTooltips.slice(1).join(', ')} absolute>
                            <View
                                style={[singleAvatarStyles, styles.alignItemsCenter, styles.justifyContentCenter]}
                            >
                                <Text style={props.size === 'small'
                                    ? styles.avatarInnerTextSmall
                                    : styles.avatarInnerText}
                                >
                                    {`+${props.avatarIcons.length - 1}`}
                                </Text>
                            </View>
                        </Tooltip>
                    )}
                </View>
            </View>
        </View>
    );
};

MultipleAvatars.defaultProps = defaultProps;
MultipleAvatars.propTypes = propTypes;
export default memo(MultipleAvatars);
