import {Animated, StyleSheet} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';

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
    inactiveOpacity: 1,
    activeOpacity: 0,
    isFocused: false,
};

function TabSelectorItem({icon, title, onPress, backgroundColor, activeOpacity, inactiveOpacity, isFocused}) {
    return (
        <PressableWithFeedback
            accessibilityLabel={title}
            style={[styles.tabSelectorButton]}
            wrapperStyle={[styles.flex1]}
            onPress={onPress}
        >
            {({hovered}) => (
                <Animated.View style={[styles.tabSelectorButton, StyleSheet.absoluteFill, styles.tabBackground(hovered, isFocused, backgroundColor)]}>
                    <TabIcon
                        icon={icon}
                        activeOpacity={styles.tabOpacity(hovered, isFocused, activeOpacity, inactiveOpacity).opacity}
                        inactiveOpacity={styles.tabOpacity(hovered, isFocused, inactiveOpacity, activeOpacity).opacity}
                    />
                    <TabLabel
                        title={title}
                        activeOpacity={styles.tabOpacity(hovered, isFocused, activeOpacity, inactiveOpacity).opacity}
                        inactiveOpacity={styles.tabOpacity(hovered, isFocused, inactiveOpacity, activeOpacity).opacity}
                    />
                </Animated.View>
            )}
        </PressableWithFeedback>
    );
}

TabSelectorItem.propTypes = propTypes;
TabSelectorItem.defaultProps = defaultProps;
TabSelectorItem.displayName = 'TabSelectorItem';

export default TabSelectorItem;
