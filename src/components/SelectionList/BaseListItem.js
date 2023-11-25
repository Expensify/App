import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import RadioListItem from './RadioListItem';
import {baseListItemPropTypes} from './selectionListPropTypes';
import UserListItem from './UserListItem';

function BaseListItem({
    item,
    isFocused = false,
    isDisabled = false,
    showTooltip,
    shouldPreventDefaultFocusOnSelectRow = false,
    canSelectMultiple = false,
    onSelectRow,
    onDismissError = () => {},
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isUserItem = lodashGet(item, 'icons.length', 0) > 0;
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
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                onMouseDown={shouldPreventDefaultFocusOnSelectRow ? (e) => e.preventDefault() : undefined}
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
                        <View style={StyleUtils.getCheckboxPressableStyle()}>
                            <View
                                style={[
                                    StyleUtils.getCheckboxContainerStyle(20),
                                    styles.mr3,
                                    item.isSelected && styles.checkedContainer,
                                    item.isSelected && styles.borderColorFocus,
                                    item.isDisabled && styles.cursorDisabled,
                                    item.isDisabled && styles.buttonOpacityDisabled,
                                ]}
                            >
                                {item.isSelected && (
                                    <Icon
                                        src={Expensicons.Checkmark}
                                        fill={theme.textLight}
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
                            style={[styles.flexRow, styles.alignItemsCenter, styles.ml3]}
                            accessible={false}
                        >
                            <View>
                                <Icon
                                    src={Expensicons.Checkmark}
                                    fill={theme.success}
                                />
                            </View>
                        </View>
                    )}
                </View>
                {Boolean(item.invitedSecondaryLogin) && (
                    <Text style={[styles.ml9, styles.ph5, styles.pb3, styles.textLabelSupporting]}>
                        {translate('workspace.people.invitedBySecondaryLogin', {secondaryLogin: item.invitedSecondaryLogin})}
                    </Text>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

BaseListItem.displayName = 'BaseListItem';
BaseListItem.propTypes = baseListItemPropTypes;

export default BaseListItem;
