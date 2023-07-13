import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import styles from '../../styles/styles';
import Text from '../Text';
import {checkboxListItemPropTypes} from './selectionListPropTypes';
import Checkbox from '../Checkbox';
import Avatar from '../Avatar';
import OfflineWithFeedback from '../OfflineWithFeedback';
import useLocalize from '../../hooks/useLocalize';

function CheckboxListItem({item, isFocused = false, onSelectRow, onDismissError = () => {}}) {
    const {translate} = useLocalize();
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
                {item.avatar && (
                    <Avatar
                        containerStyles={styles.pl5}
                        source={item.avatar.source}
                        name={item.avatar.name}
                        type={item.avatar.type}
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
                {item.isAdmin && (
                    <View style={[styles.badge, styles.peopleBadge]}>
                        <Text style={styles.peopleBadgeText}>{translate('common.admin')}</Text>
                    </View>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

CheckboxListItem.displayName = 'CheckboxListItem';
CheckboxListItem.propTypes = checkboxListItemPropTypes;

export default CheckboxListItem;
