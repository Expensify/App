import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, Text, View} from 'react-native';
import styles from '../styles/styles';
import Avatar from './Avatar';

const propTypes = {
    // Array of avatar URL
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool,

    // Set the sie of avatars
    size: PropTypes.oneOf(['default', 'small']),

    // Style for Second Avatar on Multiple Avatars
    // eslint-disable-next-line react/forbid-prop-types
    secondAvatarStyle: PropTypes.object,

};

const defaultProps = {
    avatarImageURLs: [],
    optionIsFocused: false,
    size: 'default',
    secondAvatarStyle: {},
};

const MultipleAvatars = ({
    avatarImageURLs, optionIsFocused, size, secondAvatarStyle,
}) => {
    const avatarContainerStyles = size === 'small' ? styles.emptyAvatarSmall : styles.emptyAvatar;
    const singleAvatarStyles = size === 'small' ? styles.singleAvatarSmall : styles.singleAvatar;
    const secondAvatarStyles = [
        size === 'small' ? styles.secondAvatarSmall : styles.secondAvatar,
        optionIsFocused ? styles.focusedAvatar : styles.avatar,
        secondAvatarStyle,
    ];

    if (!avatarImageURLs.length) {
        return null;
    }

    if (avatarImageURLs.length === 1) {
        return (
            <View style={avatarContainerStyles}>
                <Avatar source={avatarImageURLs[0]} size={size} />
            </View>
        );
    }

    return (
        <View style={avatarContainerStyles}>
            <View
                style={singleAvatarStyles}
            >
                <Image
                    source={{uri: avatarImageURLs[0]}}
                    style={singleAvatarStyles}
                />
                <View
                    style={secondAvatarStyles}
                >
                    {avatarImageURLs.length === 2 ? (
                        <Image
                            source={{uri: avatarImageURLs[1]}}
                            style={singleAvatarStyles}
                        />
                    ) : (
                        <View
                            style={singleAvatarStyles}
                        >
                            <Text style={size === 'small'
                                ? styles.avatarInnerTextSmall
                                : styles.avatarInnerText}
                            >
                                {`+${avatarImageURLs.length - 1}`}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

MultipleAvatars.defaultProps = defaultProps;
MultipleAvatars.propTypes = propTypes;
export default memo(MultipleAvatars);
