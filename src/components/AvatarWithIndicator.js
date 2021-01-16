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
};

const defaultProps = {
    isActive: false,
};

const AvatarWithIndicator = ({
    isActive,
    source,
}) => {
    const indicatorStyles = [
        styles.statusIndicator,
        isActive ? styles.statusIndicatorOnline : styles.statusIndicatorOffline,
    ];

    return (
        <View style={[styles.sidebarAvatar]}>
            <Avatar
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
