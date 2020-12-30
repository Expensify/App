import React, {memo} from 'react';
import {Image, View, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';

const propTypes = {
    // Avatar URLS of the participants in the group chat
    icons: PropTypes.arrayOf(String),

    // Whether this option is currently in focus so we can modify its style
    optionIsFocused: PropTypes.bool.isRequired,
};

const defaultProps = {
    icons: [],
};

const GroupAvatar = ({icons, optionIsFocused}) => {
    const groupAvatar2Styles = !optionIsFocused
        ? styles.chatSwitcherAvatar2ForGroupInactive
        : styles.chatSwitcherAvatar2ForGroupActive;
    const additionalUsersCount = (icons && icons.length > 2)
        ? icons.length - 1 : null;
    return (
        <>
            <View style={styles.chatSwitcherAvatar1ForGroup}>
                <Image
                    source={{uri: icons[0]}}
                    style={[styles.chatSwitcherAvatarImageForGroup]}
                />
            </View>
            <View style={[styles.chatSwitcherAvatar2ForGroup, groupAvatar2Styles]}>
                {
                    additionalUsersCount ? (
                        <Text style={styles.groupAvatarCircularCountText}>
                            {additionalUsersCount}
                        </Text>
                    ) : (
                        <Image
                            source={{uri: icons[1]}}
                            style={[styles.chatSwitcherAvatarImageForGroup]}
                        />
                    )
                }
            </View>
        </>
    );
};


GroupAvatar.defaultProps = defaultProps;
GroupAvatar.propTypes = propTypes;
export default memo(GroupAvatar);
