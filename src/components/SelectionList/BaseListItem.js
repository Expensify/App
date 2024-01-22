import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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
    rightHandSideComponent,
    keyForList,
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const isUserItem = lodashGet(item, 'icons.length', 0) > 0;
    const ListItem = isUserItem ? UserListItem : RadioListItem;

    const rightHandSideComponentRender = () => {
        if (canSelectMultiple || !rightHandSideComponent) {
            return null;
        }

        if (typeof rightHandSideComponent === 'function') {
            return rightHandSideComponent(item);
        }

        return rightHandSideComponent;
    };

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
                role={CONST.ROLE.BUTTON}
                hoverDimmingValue={1}
                hoverStyle={styles.hoveredComponentBG}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                onMouseDown={shouldPreventDefaultFocusOnSelectRow ? (e) => e.preventDefault() : undefined}
                nativeID={keyForList}
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
                        <View
                            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                            style={StyleUtils.getCheckboxPressableStyle()}
                        >
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
                        textStyles={[
                            styles.optionDisplayName,
                            isFocused ? styles.sidebarLinkActiveText : styles.sidebarLinkText,
                            styles.sidebarLinkTextBold,
                            styles.pre,
                            item.alternateText ? styles.mb1 : null,
                        ]}
                        alternateTextStyles={[styles.textLabelSupporting, styles.lh16, styles.pre]}
                        isDisabled={isDisabled}
                        onSelectRow={onSelectRow}
                        showTooltip={showTooltip}
                    />
                    {!canSelectMultiple && item.isSelected && !rightHandSideComponent && (
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
                    {rightHandSideComponentRender()}
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
