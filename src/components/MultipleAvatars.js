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
};

const defaultProps = {
    avatarImageURLs: [],
    optionIsFocused: false,
};

const MultipleAvatars = ({avatarImageURLs, optionIsFocused}) => {
    if (!avatarImageURLs.length) {
        return null;
    }

    if (avatarImageURLs.length === 1) {
        return (
            <View style={styles.emptyAvatar}>
                <Avatar source={avatarImageURLs[0]} />
            </View>
        );
    }

    return (
        <View style={styles.emptyAvatar}>
            <View
                style={styles.singleAvatar}
            >
                <Image
                    source={{uri: avatarImageURLs[0]}}
                    style={styles.singleAvatar}
                />
                <View
                    style={[
                        styles.singleAvatar,
                        optionIsFocused ? styles.focusedAvatar : styles.avatar,
                        styles.secondAvatar,
                    ]}
                >
                    {avatarImageURLs.length === 2 ? (
                        <Image
                            source={{uri: avatarImageURLs[1]}}
                            style={[
                                styles.singleAvatar,
                            ]}
                        />
                    ) : (
                        <View
                            style={[
                                styles.avatarText,
                            ]}
                        >
                            <Text style={styles.avatarInnerText}>
                                +
                                {avatarImageURLs.length - 1}
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
