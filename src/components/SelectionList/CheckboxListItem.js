import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import styles from '../../styles/styles';
import Text from '../Text';
import {checkboxListItemPropTypes} from './selectionListPropTypes';
import Checkbox from '../Checkbox';
import Avatar from '../Avatar';
import OfflineWithFeedback from '../OfflineWithFeedback';
import CONST from '../../CONST';

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
                <Checkbox
                    accessibilityLabel={item.text}
                    disabled={item.isDisabled}
                    isChecked={item.isSelected}
                    onPress={() => onSelectRow(item)}
                    style={item.isDisabled ? styles.buttonOpacityDisabled : {}}
                />
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
                        style={[styles.optionDisplayName, isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText, item.isSelected && styles.sidebarLinkTextBold]}
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
