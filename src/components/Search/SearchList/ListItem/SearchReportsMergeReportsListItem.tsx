import RadioButton from '@components/RadioButton';
import BaseListItem from '@components/SelectionList/ListItem/BaseListItem';
import type {ListItemProps} from '@components/SelectionList/ListItem/types';
import type {ListItem} from '@components/SelectionList/types';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {ExpenseReportListItemType} from './types';

import ExpenseReportListItemRowNarrow from './ExpenseReportListItemRow/ExpenseReportListItemRowNarrow';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';

function SearchReportsMergeReportsListItem<TItem extends ListItem>({item, isFocused, showTooltip, onSelectRow, onFocus, shouldSyncFocus, isLastItem, isFirstItem}: ListItemProps<TItem>) {
    const reportItem = item as unknown as ExpenseReportListItemType;
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isSelected = item.isSelected ?? false;

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        isSelected && styles.activeComponentBG,
        styles.mh0,
        styles.noBorderRadius,
        isFirstItem && [styles.tableTopRadius, styles.overflowHidden],
        isLastItem && [styles.tableBottomRadius, styles.overflowHidden],
    ];

    const listItemWrapperStyle = [styles.flex1, styles.userSelectNone, {...styles.flexColumn, ...styles.alignItemsStretch}];

    const handleOnSelectRow = () => {
        onSelectRow(item);
    };

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={listItemWrapperStyle}
            isFocused={isFocused}
            showTooltip={showTooltip}
            canSelectMultiple={false}
            onSelectRow={onSelectRow}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[
                styles.mh5,
                isFirstItem && styles.tableTopRadius,
                isLastItem && styles.tableBottomRadius,
                !isLastItem && StyleUtils.getSelectedBorderBottomStyle(isSelected),
            ]}
            accessible={false}
            shouldShowRightCaret={false}
            isDisabled={false}
            shouldDisableHoverStyle={false}
        >
            {() => (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.flex1, styles.gap3, styles.cursorPointer]}>
                    <View style={[styles.flex1]}>
                        <UserInfoAndActionButtonRow
                            item={reportItem}
                            shouldShowUserInfo={!!reportItem?.from}
                            stateNum={reportItem.stateNum}
                            statusNum={reportItem.statusNum}
                            isSelected={isSelected}
                        />
                        <ExpenseReportListItemRowNarrow
                            item={reportItem}
                            onCheckboxPress={handleOnSelectRow}
                            canSelectMultiple={false}
                            isSelectAllChecked={isSelected}
                            isIndeterminate={false}
                            isDisabledCheckbox={false}
                        />
                    </View>
                    <RadioButton
                        onPress={handleOnSelectRow}
                        isChecked={isSelected}
                        containerStyle={styles.m0}
                        disabled={false}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={styles.cursorUnset}
                    />
                </View>
            )}
        </BaseListItem>
    );
}

SearchReportsMergeReportsListItem.displayName = 'SearchReportsMergeReportsListItem';

export default SearchReportsMergeReportsListItem;
