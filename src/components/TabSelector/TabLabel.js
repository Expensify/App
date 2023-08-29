import {StyleSheet, View, Text, Animated} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    /** Title of the tab */
    title: PropTypes.string,

    /** Animated opacity value while the label is inactive state */
    inactiveOpacity: PropTypes.number,

    /** Animated opacity value while the label is in active state */
    activeOpacity: PropTypes.number,
};

const defaultProps = {
    title: '',
    inactiveOpacity: 1,
    activeOpacity: 0,
};

function TabLabel({title, activeOpacity, inactiveOpacity}) {
    return (
        <View>
            <Animated.View style={[{opacity: activeOpacity}]}>
                <Text style={styles.tabText(true)}>{title}</Text>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, {opacity: inactiveOpacity}]}>
                <Text style={styles.tabText(false)}>{title}</Text>
            </Animated.View>
        </View>
    );
}

TabLabel.propTypes = propTypes;
TabLabel.defaultProps = defaultProps;
TabLabel.displayName = 'TabLabel';

export default TabLabel;
