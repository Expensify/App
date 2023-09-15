import React from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import themeColors from '../../styles/themes/default';
import {radioListItemPropTypes} from './selectionListPropTypes';
import * as StyleUtils from '../../styles/StyleUtils';
import UserListItem from './UserListItem';
import RadioListItem from './RadioListItem';
import OfflineWithFeedback from '../OfflineWithFeedback';

function BaseListItem({item, isFocused = false, isDisabled = false, showTooltip, canSelectMultiple, onSelectRow, onDismissError = () => {}}) {
    const isUserItem = Boolean(item.avatar);
    const ListItem = isUserItem ? UserListItem : RadioListItem;

    return (
        <OfflineWithFeedback
            onClose={() => onDismissError(item)}
            pendingAction={item.pendingAction}
            errors={item.errors}
            errorRowStyles={styles.ph5}
        >
            <PressableWithFeedback
                onPress={() => onSelectRow(item)}
                disabled={isDisabled}
                accessibilityLabel={item.text}
                accessibilityRole="button"
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                focusStyle={styles.hoveredComponentBG}
            >
                <View
                    style={[
                        styles.flex1,
                        styles.justifyContentBetween,
                        styles.sidebarLinkInner,
                        styles.userSelectNone,
                        isUserItem ? styles.peopleRow : styles.optionRow,
                        isFocused && styles.sidebarLinkActive,
                    ]}
                >
                    {canSelectMultiple && (
                        <View style={styles.checkboxPressable}>
                            <View
                                style={[
                                    StyleUtils.getCheckboxContainerStyle(20, 4),
                                    item.isSelected && styles.checkedContainer,
                                    item.isSelected && styles.borderColorFocus,
                                    item.isDisabled && styles.cursorDisabled,
                                    item.isDisabled && styles.buttonOpacityDisabled,
                                ]}
                            >
                                {item.isSelected && (
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={themeColors.textLight}
                                        height={14}
                                        width={14}
                                    />
                                )}
                            </View>
                        </View>
                    )}

                    <ListItem
                        item={item}
                        isFocused={isFocused}
                        isDisabled={isDisabled}
                        onSelectRow={onSelectRow}
                        showTooltip={showTooltip}
                    />

                    {!canSelectMultiple && item.isSelected && (
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
        </OfflineWithFeedback>
    );
}

BaseListItem.displayName = 'BaseListItem';
BaseListItem.propTypes = radioListItemPropTypes;

export default BaseListItem;
