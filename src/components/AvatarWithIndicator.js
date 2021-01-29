import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import styles from '../styles/styles';

const propTypes = {
    // Is user active?
    isActive: PropTypes.bool,

    // url for the avatar
    source: PropTypes.string.isRequired,

    // avatar size
    size: PropTypes.string,

};

const defaultProps = {
    isActive: false,
    size: 'default',
};

const AvatarWithIndicator = ({
    isActive,
    source,
    size,
}) => {
    const indicatorStyles = [
        size === 'large' ? styles.statusIndicatorLarge : styles.statusIndicator,
        isActive ? styles.statusIndicatorOnline : styles.statusIndicatorOffline,
    ];

    return (
        <View
            style={[size === 'large' ? styles.avatarLarge : styles.sidebarAvatar]}
        >
            <Avatar
                style={[size === 'large' ? styles.avatarLarge : null]}
                source={source}
            />
            <View style={StyleSheet.flatten(indicatorStyles)} />
        </View>
    );
};

AvatarWithIndicator.defaultProps = defaultProps;
AvatarWithIndicator.propTypes = propTypes;
AvatarWithIndicator.displayName = 'AvatarWithIndicator';
export default memo(AvatarWithIndicator);
