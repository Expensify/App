import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, Text, View} from 'react-native';
import styles from '../styles/styles';
import Avatar from './Avatar';

const propTypes = {
    /** Array of avatar URL */
    avatarImageURLs: PropTypes.arrayOf(PropTypes.string),

    /** Set the sie of avatars */
    size: PropTypes.oneOf(['default', 'small']),

    /** Style for Second Avatar */
    // eslint-disable-next-line react/forbid-prop-types
    secondAvatarStyle: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    avatarImageURLs: [],
    size: 'default',
    secondAvatarStyle: [styles.secondAvatarHovered],
};

const MultipleAvatars = ({
    avatarImageURLs, size, secondAvatarStyle,
}) => {
    const avatarContainerStyles = size === 'small' ? styles.emptyAvatarSmall : styles.emptyAvatar;
    const singleAvatarStyles = size === 'small' ? styles.singleAvatarSmall : styles.singleAvatar;
    const secondAvatarStyles = [
        size === 'small' ? styles.secondAvatarSmall : styles.secondAvatar,
        ...secondAvatarStyle,
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
                            style={[singleAvatarStyles, styles.alignItemsCenter, styles.justifyContentCenter]}
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
