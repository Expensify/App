import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import styles from '../../styles/styles';
import Text from '../Text';
import {checkboxListItemPropTypes} from './selectionListPropTypes';
import Avatar from '../Avatar';
import OfflineWithFeedback from '../OfflineWithFeedback';
import CONST from '../../CONST';
import * as StyleUtils from '../../styles/StyleUtils';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import themeColors from '../../styles/themes/default';

function CheckboxListItem({item, isFocused = false, onSelectRow, onDismissError = () => {}}) {
    const hasError = !_.isEmpty(item.errors);

    return (
        <OfflineWithFeedback
            onClose={() => onDismissError(item)}
            pendingAction={item.pendingAction}
            errors={item.errors}
            errorRowStyles={styles.ph5}
        >
            <PressableWithFeedback
                style={[styles.peopleRow, styles.userSelectNone, isFocused && styles.sidebarLinkActive, hasError && styles.borderColorDanger]}
                onPress={() => onSelectRow(item)}
                disabled={item.isDisabled}
                accessibilityLabel={item.text}
                accessibilityRole="checkbox"
                accessibilityState={{checked: item.isSelected}}
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                focusStyle={styles.hoveredComponentBG}
            >
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
                {Boolean(item.avatar) && (
                    <Avatar
                        containerStyles={styles.pl5}
                        source={lodashGet(item, 'avatar.source', '')}
                        name={lodashGet(item, 'avatar.name', item.text)}
                        type={lodashGet(item, 'avatar.type', CONST.ICON_TYPE_AVATAR)}
                    />
                )}
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.pl3, styles.optionRow]}>
                    <Text
                        style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.sidebarLinkTextBold]}
                        numberOfLines={1}
                    >
                        {item.text}
                    </Text>
                    {Boolean(item.alternateText) && (
                        <Text
                            style={[isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                            numberOfLines={1}
                        >
                            {item.alternateText}
                        </Text>
                    )}
                </View>
                {Boolean(item.rightElement) && item.rightElement}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

CheckboxListItem.displayName = 'CheckboxListItem';
CheckboxListItem.propTypes = checkboxListItemPropTypes;

export default CheckboxListItem;
