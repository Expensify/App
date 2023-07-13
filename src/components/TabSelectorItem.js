import {Text, View} from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';
import withLocalize from './withLocalize';
import Icon from './Icon';
import Colors from '../styles/colors';
import Styles from '../styles/styles';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

const propTypes = {
    /** Function to call when onPress */
    onPress: PropTypes.func,

    /** Icon to display on tab */
    icon: PropTypes.func,

    /** True if tab is the selected item */
    selected: PropTypes.bool,

    /** Title of the tab */
    title: PropTypes.string,
};

const defaultProps = {
    onPress: () => {},
    icon: () => {},
    selected: false,
    title: '',
};

function TabSelectorItem(props) {
    const textStyle = props.selected ? [Styles.textStrong, Styles.mt2, Styles.textWhite] : [Styles.mt2, Styles.colorMuted];
    return (
        <View>
            <PressableWithFeedback
                accessibilityRole="button"
                style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    marginHorizontal: 8,
                    alignItems: 'center',
                }}
                onPress={props.onPress}
            >
                <Icon
                    src={props.icon}
                    fill={props.selected ? Colors.green : Colors.greenIcons}
                />
                <Text style={textStyle}>{props.title}</Text>
            </PressableWithFeedback>
        </View>
    );
}

TabSelectorItem.propTypes = propTypes;
TabSelectorItem.defaultProps = defaultProps;
TabSelectorItem.displayName = 'TabSelectorItem';

export default withLocalize(TabSelectorItem);
