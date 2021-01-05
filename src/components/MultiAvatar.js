import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Image, Text, View} from 'react-native';
import styles from '../styles/styles';

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

const MultiAvatar = props => (
    <>
        {props.avatarImageURLs !== undefined && (
            <>
                <View
                    style={[
                        props.avatarImageURLs.length > 1
                            ? [styles.chatSwitcherSingleAvatar, styles.chatSwitcherAvatar1]
                            : [styles.chatSwitcherBigAvatar, styles.chatSwitcherEmptyAvatar1],
                    ]}
                >
                    <Image
                        source={{uri: props.avatarImageURLs[0]}}
                        style={
                            props.avatarImageURLs.length > 1
                                ? styles.chatSwitcherSingleAvatar
                                : styles.chatSwitcherBigAvatar
                        }
                    />
                </View>
                {props.avatarImageURLs.length > 1 && (
                    <View
                        style={[
                            styles.chatSwitcherSingleAvatar,
                            props.avatarImageURLs.length > 1 ? styles.chatSwitcherAvatar2 : null,
                            props.optionIsFocused ? styles.chatSwitcherFocusedAvatar : styles.chatSwitcherAvatar,
                        ]}
                    >
                        {props.avatarImageURLs.length > 2 && (
                            <View
                                style={[
                                    styles.chatSwitcherAvatarText,
                                    styles.chatSwitcherAvatarSpace,
                                ]}
                            >
                                <Text style={styles.chatSwitcherAvatarInnerText}>
                                    {props.avatarImageURLs.length}
                                </Text>
                            </View>
                        )}
                        {props.avatarImageURLs.length === 2 && (
                            <Image
                                source={{uri: props.avatarImageURLs[1]}}
                                style={[
                                    styles.chatSwitcherSingleAvatar,
                                    styles.chatSwitcherAvatarSpace,
                                ]}
                            />
                        )}
                    </View>
                )}
            </>
        )}
    </>
);

MultiAvatar.defaultProps = defaultProps;
MultiAvatar.propTypes = propTypes;
export default memo(MultiAvatar);
