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
};

const defaultProps = {
    avatarImageURLs: [],
    optionIsFocused: false,
    size: 'default',
};

const MultipleAvatars = ({avatarImageURLs, optionIsFocused, size}) => {
    if (!avatarImageURLs.length) {
        return null;
    }

    if (avatarImageURLs.length === 1) {
        return (
            <View style={size === 'small' ? styles.emptyAvatarSmall : styles.emptyAvatar}>
                <Avatar source={avatarImageURLs[0]} size={size} />
            </View>
        );
    }

    return (
        <View style={size === 'small' ? styles.emptyAvatarSmall : styles.emptyAvatar}>
            <View
                style={size === 'small' ? styles.singleAvatarSmall : styles.singleAvatar}
            >
                <Image
                    source={{uri: avatarImageURLs[0]}}
                    style={size === 'small' ? styles.singleAvatarSmall : styles.singleAvatar}
                />
                <View
                    style={[
                        size === 'small' ? styles.secondAvatarSmall : styles.secondAvatar,
                        optionIsFocused ? styles.focusedAvatar : styles.avatar,
                    ]}
                >
                    {avatarImageURLs.length === 2 ? (
                        <Image
                            source={{uri: avatarImageURLs[1]}}
                            style={[
                                size === 'small' ? styles.singleAvatarSmall : styles.singleAvatar,
                            ]}
                        />
                    ) : (
                        <View
                            style={[
                                size === 'small' ? styles.singleAvatarSmall : styles.singleAvatar,
                            ]}
                        >
                            <Text style={size === 'small' ? styles.avatarInnerTextSmall : styles.avatarInnerText}>
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
