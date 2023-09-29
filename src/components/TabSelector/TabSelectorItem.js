import {Animated, StyleSheet, View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';
import Hoverable from '../Hoverable';

const propTypes = {
    /** Function to call when onPress */
    onPress: PropTypes.func,

    /** Icon to display on tab */
    icon: PropTypes.func,

    /** Title of the tab */
    title: PropTypes.string,

    /** Animated background color value for the tab button */
    // eslint-disable-next-line
    backgroundColor: PropTypes.any,

    /** Hovered background color value for the tab button */
    hoverBackgroundColor: PropTypes.string,

    /** Animated opacity value while the label is inactive state */
    // eslint-disable-next-line
    inactiveOpacity: PropTypes.any,

    /** Animated opacity value while the label is in active state */
    // eslint-disable-next-line
    activeOpacity: PropTypes.any,

    /** Whether this tab is active */
    isFocused: PropTypes.bool,
};

const defaultProps = {
    onPress: () => {},
    icon: () => {},
    title: '',
    backgroundColor: '',
    hoverBackgroundColor: '',
    inactiveOpacity: 1,
    activeOpacity: 0,
    isFocused: false,
};

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

function TabSelectorItem({icon, title, onPress, backgroundColor, hoverBackgroundColor, activeOpacity, inactiveOpacity, isFocused}) {
    return (
        <View style={[styles.flex1]}>
            <Hoverable>
                {(hovered) => (
                    <AnimatedPressableWithFeedback
                        accessibilityLabel={title}
                        style={[styles.tabSelectorButton, {backgroundColor: Boolean(hoverBackgroundColor) && hovered && !isFocused ? hoverBackgroundColor : backgroundColor}]}
                        onPress={onPress}
                    >
                        <TabIcon
                            icon={icon}
                            activeOpacity={hovered && !isFocused ? 1 : activeOpacity}
                            inactiveOpacity={hovered && !isFocused ? 0 : inactiveOpacity}
                        />
                        <TabLabel
                            title={title}
                            activeOpacity={hovered && !isFocused ? 1 : activeOpacity}
                            inactiveOpacity={hovered && !isFocused ? 0 : inactiveOpacity}
                        />
                    </AnimatedPressableWithFeedback>
                )}
            </Hoverable>
        </View>
    );
}

TabSelectorItem.propTypes = propTypes;
TabSelectorItem.defaultProps = defaultProps;
TabSelectorItem.displayName = 'TabSelectorItem';

export default TabSelectorItem;
