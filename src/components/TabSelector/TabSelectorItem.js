import {Text} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import themeColors from '../../styles/themes/default';
import styles from '../../styles/styles';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';

const propTypes = {
    /** Function to call when onPress */
    onPress: PropTypes.func,

    /** Icon to display on tab */
    icon: PropTypes.func,

    /** True if tab is the selected item */
    isSelected: PropTypes.bool,

    /** Title of the tab */
    title: PropTypes.string,
};

const defaultProps = {
    onPress: () => {},
    icon: () => {},
    isSelected: false,
    title: '',
};

function TabSelectorItem(props) {
    return (
        <PressableWithFeedback
            accessibilityLabel={props.title}
            style={[styles.tabSelectorButton(props.isSelected)]}
            wrapperStyle={[styles.flex1]}
            onPress={props.onPress}
        >
            <Icon
                src={props.icon}
                fill={props.isSelected ? themeColors.iconMenu : themeColors.icon}
            />
            <Text style={styles.tabText(props.isSelected)}>{props.title}</Text>
        </PressableWithFeedback>
    );
}

TabSelectorItem.propTypes = propTypes;
TabSelectorItem.defaultProps = defaultProps;
TabSelectorItem.displayName = 'TabSelectorItem';

export default TabSelectorItem;
