/** Keeps the reorder handle and checkbox separately focusable on native. */
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {AccessibilityActionEvent, AccessibilityActionInfo} from 'react-native';

import React from 'react';
import {AccessibilityInfo, View} from 'react-native';

import type ColumnsSettingsListItemProps from './types';

function ColumnsSettingsListItem({item, isFocused, onSelectRow, drag, position, selectedCount, moveUp, moveDown}: ColumnsSettingsListItemProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const rowItem = drag ? {...item, leftElement: undefined, itemStyle: styles.pl0} : item;
    const reorderActions: AccessibilityActionInfo[] = [];
    if (moveUp) {
        reorderActions.push({name: 'decrement'});
    }
    if (moveDown) {
        reorderActions.push({name: 'increment'});
    }

    const moveColumn = (event: AccessibilityActionEvent) => {
        const {actionName} = event.nativeEvent;
        if (actionName !== 'decrement' && actionName !== 'increment') {
            return;
        }

        const nextPosition = actionName === 'decrement' ? moveUp?.() : moveDown?.();
        if (nextPosition !== undefined) {
            AccessibilityInfo.announceForAccessibility(translate('common.currentOfTotal', {current: nextPosition, total: selectedCount}));
        }
    };

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            {!!drag && (
                <PressableWithoutFeedback
                    style={[styles.pl5, styles.alignSelfStretch, styles.justifyContentCenter]}
                    accessibilityLabel={item.text ?? ''}
                    accessibilityRole="adjustable"
                    accessibilityValue={{text: translate('common.currentOfTotal', {current: position, total: selectedCount})}}
                    accessibilityActions={reorderActions}
                    onAccessibilityAction={moveColumn}
                    onPressIn={drag}
                    sentryLabel={CONST.SENTRY_LABEL.COLUMNS_SETTINGS_LIST.REORDER}
                >
                    {item.leftElement}
                </PressableWithoutFeedback>
            )}
            <View style={styles.flex1}>
                <MultiSelectListItem
                    item={rowItem}
                    isFocused={isFocused}
                    isDisabled={item.isDisabled}
                    showTooltip={false}
                    onSelectRow={onSelectRow}
                />
            </View>
        </View>
    );
}

export default ColumnsSettingsListItem;
