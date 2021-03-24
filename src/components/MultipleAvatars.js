import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, Text, View} from 'react-native';
import globalStyles from '../styles/styles';
import Avatar from './Avatar';

const propTypes = {
    // Array of avatar URL
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool,

    // Set the sie of avatars
    size: PropTypes.oneOf(['default', 'small']),

    // Styles to override the basic component styles
    styles: PropTypes.shape({
        // Style for First Avatar on Multiple Avatars
        // eslint-disable-next-line react/forbid-prop-types
        singleAvatar: PropTypes.object,

        // Style for Second Avatar on Multiple Avatars
        // eslint-disable-next-line react/forbid-prop-types
        secondAvatar: PropTypes.object,

        // Style for avatar Container
        // eslint-disable-next-line react/forbid-prop-types
        emptyAvatar: PropTypes.object,
    }),
};

const defaultProps = {
    avatarImageURLs: [],
    optionIsFocused: false,
    size: 'default',
    styles: {},
};

const MultipleAvatars = ({
    avatarImageURLs, optionIsFocused, size, styles,
}) => {
    const avatarContainerStyles = [
        size === 'small' ? globalStyles.emptyAvatarSmall : globalStyles.emptyAvatar, styles.emptyAvatar,
    ];
    const singleAvatarStyles = [
        size === 'small' ? globalStyles.singleAvatarSmall : globalStyles.singleAvatar, styles.singleAvatar,
    ];
    const secondAvatarStyles = [
        size === 'small' ? globalStyles.secondAvatarSmall : globalStyles.secondAvatar,
        optionIsFocused ? globalStyles.focusedAvatar : globalStyles.avatar,
        styles.secondAvatar,
    ];
    console.debug(styles, secondAvatarStyles);

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
                                ? globalStyles.avatarInnerTextSmall
                                : globalStyles.avatarInnerText}
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
