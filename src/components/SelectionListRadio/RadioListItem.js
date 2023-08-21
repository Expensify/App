import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import styles from '../../styles/styles';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import {radioListItemPropTypes} from './selectionListRadioPropTypes';

const propTypes = {
    /** The section list item */
    item: PropTypes.shape(radioListItemPropTypes),

    /** Whether this item is focused (for arrow key controls) */
    isFocused: PropTypes.bool,

    /** Whether this item is disabled */
    isDisabled: PropTypes.bool,

    /** Callback to fire when the item is pressed */
    onSelectRow: PropTypes.func,
};

const defaultProps = {
    item: {},
    isFocused: false,
    isDisabled: false,
    onSelectRow: () => {},
};

function RadioListItem(props) {
    return (
        <PressableWithFeedback
            onPress={() => props.onSelectRow(props.item)}
            disabled={props.isDisabled}
            accessibilityLabel={props.item.text}
            accessibilityRole="button"
            hoverDimmingValue={1}
            hoverStyle={styles.hoveredComponentBG}
        >
            <View style={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.optionRow, props.isFocused && styles.sidebarLinkActive]}>
                <View style={[styles.flex1, styles.alignItemsStart]}>
                    <Text style={[styles.optionDisplayName, props.isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, props.item.isSelected && styles.sidebarLinkTextBold]}>
                        {props.item.text}
                    </Text>

                    {Boolean(props.item.alternateText) && (
                        <Text style={[props.isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}>
                            {props.item.alternateText}
                        </Text>
                    )}
                </View>

                {props.item.isSelected && (
                    <View
                        style={[styles.flexRow, styles.alignItemsCenter]}
                        accessible={false}
                    >
                        <View>
                            <Icon
                                src={Expensicons.Checkmark}
                                fill={themeColors.success}
                            />
                        </View>
                    </View>
                )}
            </View>
        </PressableWithFeedback>
    );
}

RadioListItem.displayName = 'RadioListItem';
RadioListItem.propTypes = propTypes;
RadioListItem.defaultProps = defaultProps;

export default RadioListItem;
