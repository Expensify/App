import PropTypes from 'prop-types';
import React from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';

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
    inactiveOpacity: 1,
    activeOpacity: 0,
};

function TabLabel({title, activeOpacity, inactiveOpacity}) {
    const styles = useThemeStyles();
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
