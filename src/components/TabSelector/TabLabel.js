import {StyleSheet, View, Text, Animated} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    /** Title of the tab */
    title: PropTypes.string,

    /** Animated opacity value while the label is inactive state */
    // eslint-disable-next-line
    inactiveOpacity: PropTypes.any,

    /** Animated opacity value while the label is in active state */
    // eslint-disable-next-line
    activeOpacity: PropTypes.any,
};

const defaultProps = {
    title: '',
    inactiveOpacity: {opacity: 1},
    activeOpacity: {opacity: 0},
};

function TabLabel({title, activeOpacity, inactiveOpacity}) {
    return (
        <View>
            <Animated.View style={[activeOpacity]}>
                <Text style={styles.tabText(true)}>{title}</Text>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, inactiveOpacity]}>
                <Text style={styles.tabText(false)}>{title}</Text>
            </Animated.View>
        </View>
    );
}

TabLabel.propTypes = propTypes;
TabLabel.defaultProps = defaultProps;
TabLabel.displayName = 'TabLabel';

export default TabLabel;
