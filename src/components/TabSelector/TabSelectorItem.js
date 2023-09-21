import {Animated} from 'react-native';
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

    /** Hovered background color value for the tab button */
    // eslint-disable-next-line
    backgroundColor: PropTypes.string,

    /** Animated opacity value while the label is inactive state */
    // eslint-disable-next-line
    inactiveOpacity: PropTypes.any,

    /** Animated opacity value while the label is in active state */
    // eslint-disable-next-line
    activeOpacity: PropTypes.any,
};

const defaultProps = {
    onPress: () => {},
    icon: () => {},
    title: '',
    backgroundColor: '',
    hoverBackgroundColor: '',
    inactiveOpacity: 1,
    activeOpacity: 0,
};

function TabSelectorItem({icon, title, onPress, backgroundColor, hoverBackgroundColor, activeOpacity, inactiveOpacity}) {
    return (
        <PressableWithFeedback
            accessibilityLabel={title}
            wrapperStyle={[styles.flex1]}
            onPress={onPress}
        >{({hovered})=>(
            <Animated.View
                style={[
                    styles.tabSelectorButton,
                    { backgroundColor: Boolean(hoverBackgroundColor) && hovered ? hoverBackgroundColor : backgroundColor },
                ]}
            >
                <TabIcon
                    icon={icon}
                    activeOpacity={hovered ? 1 : activeOpacity}
                    inactiveOpacity={hovered ? 0 : inactiveOpacity}
                />
                <TabLabel
                    title={title}
                    activeOpacity={hovered ? 1 : activeOpacity}
                    inactiveOpacity={hovered ? 0 : inactiveOpacity}
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
