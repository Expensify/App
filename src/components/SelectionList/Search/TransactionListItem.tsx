import React from 'react';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, TransactionListItemProps, TransactionListItemType} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import TransactionListItemRow from './TransactionListItemRow';

function TransactionListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onDismissError,
    onFocus,
    shouldSyncFocus,
}: TransactionListItemProps<TItem>) {
    const transactionItem = item as unknown as TransactionListItemType;
    const styles = useThemeStyles();

    const {isLargeScreenWidth} = useWindowDimensions();

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, styles.pv3, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    const listItemWrapperStyle = [
        styles.flex1,
        styles.userSelectNone,
        isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={listItemWrapperStyle}
            containerStyle={[styles.mb3]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            <TransactionListItemRow
                item={transactionItem}
                showTooltip={showTooltip}
                onButtonPress={() => {
                    onSelectRow(item);
                }}
                onCheckboxPress={() => onCheckboxPress?.(item)}
                isDisabled={!!isDisabled}
                canSelectMultiple={!!canSelectMultiple}
                isButtonSelected={item.isSelected}
            />
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
