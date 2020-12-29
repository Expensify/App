import React from 'react';
import PropTypes from 'prop-types';
import {Image, Text, View} from 'react-native';
import styles from '../styles/styles';

const propTypes = {
    // Array of avatar URL
    avatars: PropTypes.arrayOf(PropTypes.any),

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool,
};

const defaultProps = {
    avatars: [],
    optionIsFocused: false,
};

const MultipleAvatars = (props) => {
    const {avatars, optionIsFocused} = props;
    return (
        <>
            {avatars !== undefined && (
                <>
                    <View
                        style={[
                            styles.chatSwitcherSingleAvatar,
                            avatars.length > 1 ? styles.chatSwitcherAvatar1 : styles.chatSwitcherEmptyAvatar1,
                        ]}
                    >
                        <Image
                            source={{uri: avatars[0]}}
                            style={styles.chatSwitcherSingleAvatar}
                        />
                    </View>
                    <View
                        style={[
                            styles.chatSwitcherSingleAvatar,
                            avatars.length > 1 ? styles.chatSwitcherAvatar2 : null,
                            optionIsFocused ? styles.chatSwitcherFocusedAvatar : styles.chatSwitcherAvatar,
                        ]}
                    >
                        {avatars.length > 2 && (
                            <View
                                style={[
                                    styles.chatSwitcherAvatarText,
                                    styles.chatSwitcherAvatarSpace,
                                ]}
                            >
                                <Text style={styles.chatSwitcherAvatarInnerText}>
                                    {avatars.length}
                                </Text>
                            </View>
                        )}
                        {avatars.length === 2 && (
                            <Image
                                source={{uri: avatars[1]}}
                                style={[
                                    styles.chatSwitcherSingleAvatar,
                                    styles.chatSwitcherAvatarSpace,
                                ]}
                            />
                        )}
                    </View>
                </>
            )}
        </>
    );
};

MultipleAvatars.defaultProps = defaultProps;
MultipleAvatars.propTypes = propTypes;
export default MultipleAvatars;
