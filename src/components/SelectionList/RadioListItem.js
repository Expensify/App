import React from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import styles from '../../styles/styles';
import Text from '../Text';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import {radioListItemPropTypes} from './selectionListPropTypes';

function RadioListItem({item, isFocused = false, isDisabled = false, onSelectRow}) {
    return (
        <PressableWithFeedback
            onPress={() => onSelectRow(item)}
            disabled={isDisabled}
            accessibilityLabel={item.text}
            accessibilityRole="button"
            hoverDimmingValue={1}
            hoverStyle={styles.hoveredComponentBG}
            focusStyle={styles.hoveredComponentBG}
        >
            <View style={[styles.flex1, styles.justifyContentBetween, styles.sidebarLinkInner, styles.optionRow, styles.userSelectNone, isFocused && styles.sidebarLinkActive]}>
                <View style={[styles.flex1, styles.alignItemsStart]}>
                    <Text style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, item.isSelected && styles.sidebarLinkTextBold]}>
                        {item.text}
                    </Text>

                    {Boolean(item.alternateText) && (
                        <Text style={[isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}>{item.alternateText}</Text>
                    )}
                </View>

                {item.isSelected && (
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
RadioListItem.propTypes = radioListItemPropTypes;

export default RadioListItem;
