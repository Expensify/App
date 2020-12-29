import React, {PureComponent} from 'react';
import {Image, View, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    /**
     * Url source for the avatar
     */
    source: PropTypes.string.isRequired,

    /**
     * Extra styles to pass
     */
    style: PropTypes.arrayOf(PropTypes.any),

    /**
     * Display a status indicator when true
     */
    showIndicator: PropTypes.bool,

    /**
     * Shows the indicator as active or inactive
     */
    isIndicatorActive: PropTypes.bool,
};

const defaultProps = {
    style: [],
    showIndicator: false,
    isIndicatorActive: false,
};

/**
 * Avatar with status indicator
 */

class Avatar extends PureComponent {
    render() {
        const indicatorStyles = [
            styles.statusIndicator,
            this.props.isIndicatorActive
                ? styles.statusIndicatorActive
                : styles.statusIndicatorInactive
        ];
        return (
            <View
                style={[
                    styles.componentSizeNormal,
                    ...this.props.style,
                ]}
            >
                <Image
                    source={{uri: this.props.source}}
                    style={[styles.avatarImage]}
                />
                {this.props.showIndicator && (
                    <View style={StyleSheet.flatten(indicatorStyles)} />
                )}
            </View>
        );
    }
}

Avatar.defaultProps = defaultProps;
Avatar.propTypes = propTypes;
export default Avatar;
