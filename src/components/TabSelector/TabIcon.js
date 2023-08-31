import {StyleSheet, View, Animated} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import themeColors from '../../styles/themes/default';

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
    return (
        <View>
            <Animated.View style={{opacity: inactiveOpacity}}>
                <Icon
                    src={icon}
                    fill={themeColors.icon}
                />
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, {opacity: activeOpacity}]}>
                <Icon
                    src={icon}
                    fill={themeColors.iconMenu}
                />
            </Animated.View>
        </View>
    );
}

TabIcon.propTypes = propTypes;
TabIcon.defaultProps = defaultProps;
TabIcon.displayName = 'TabIcon';

export default TabIcon;
