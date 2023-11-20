import PropTypes from 'prop-types';
import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import Icon from '@components/Icon';
import useTheme from '@styles/themes/useTheme';

const propTypes = {
    /** Icon to display on tab */
    icon: PropTypes.func,

    /** Animated opacity value while the label is inactive state */
    // eslint-disable-next-line
    inactiveOpacity: PropTypes.any,

    /** Animated opacity value while the label is in active state */
    // eslint-disable-next-line
    activeOpacity: PropTypes.any,
};

const defaultProps = {
    icon: '',
    inactiveOpacity: 1,
    activeOpacity: 0,
};

function TabIcon({icon, activeOpacity, inactiveOpacity}) {
    const theme = useTheme();
    return (
        <View>
            <Animated.View style={{opacity: inactiveOpacity}}>
                <Icon
                    src={icon}
                    fill={theme.icon}
                />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, {opacity: activeOpacity}]}>
                <Icon
                    src={icon}
                    fill={theme.iconMenu}
                />
            </Animated.View>
        </View>
    );
}

TabIcon.propTypes = propTypes;
TabIcon.defaultProps = defaultProps;
TabIcon.displayName = 'TabIcon';

export default TabIcon;
