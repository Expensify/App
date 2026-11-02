import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ColumnsSettingsListItemProps} from './ColumnsSettingsListItem';

import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import MultiSelectListItem from './SelectionList/ListItem/MultiSelectListItem';

function ColumnsSettingsListItem({item, isFocused, drag, isActive, onSelectRow, onMoveUp, onMoveDown}: ColumnsSettingsListItemProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isScreenReaderEnabled = Accessibility.useScreenReaderStatus();
    const accessibilityActions = [
        ...(onMoveUp ? [{name: 'moveUp', label: translate('common.moveUp')}] : []),
        ...(onMoveDown ? [{name: 'moveDown', label: translate('common.moveDown')}] : []),
    ];
    const startDrag = () => {
        if (item.isDragDisabled || isActive) {
            return;
        }
        drag();
    };
    const rowItem = {
        ...item,
        leftElement: (
            <PressableWithoutFeedback
                accessible={false}
                testID={`column-drag-handle-${item.value}`}
                disabled={item.isDragDisabled || isActive}
                onPressIn={(event) => {
                    // Dragging must not toggle the checkbox.
                    event.stopPropagation();
                    startDrag();
                }}
                onPress={(event) => event?.stopPropagation()}
                sentryLabel={CONST.SENTRY_LABEL.SELECTION_LIST.BASE_LIST_ITEM}
            >
                {item.leftElement}
            </PressableWithoutFeedback>
        ),
    };

    return (
        // Press feedback dims the row, so its backing must hide other rows during a drag.
        <View style={styles.appBG}>
            <MultiSelectListItem
                item={rowItem}
                isFocused={isActive ? true : isFocused}
                showTooltip={false}
                onSelectRow={onSelectRow}
                onLongPressRow={isScreenReaderEnabled ? undefined : startDrag}
                isDisabled={item.isDisabled}
                accessibilityActions={accessibilityActions}
                onAccessibilityAction={({nativeEvent}) => {
                    if (nativeEvent.actionName === 'moveUp') {
                        onMoveUp?.();
                    } else if (nativeEvent.actionName === 'moveDown') {
                        onMoveDown?.();
                    }
                }}
            />
        </View>
    );
}

export default ColumnsSettingsListItem;
