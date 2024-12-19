import React from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, TransactionListItemProps, TransactionListItemType} from '@components/SelectionList/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@libs/actions/Search';
import variables from '@styles/variables';
import TransactionListItemRow from './TransactionListItemRow';

function TransactionListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    isLoading,
}: TransactionListItemProps<TItem>) {
    const transactionItem = item as unknown as TransactionListItemType;
    const styles = useThemeStyles();
    const theme = useTheme();

    const {isLargeScreenWidth} = useResponsiveLayout();
    const {currentSearchHash} = useSearchContext();

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv3,
        styles.ph3,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
    ];

    const listItemWrapperStyle = [
        styles.flex1,
        styles.userSelectNone,
        isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={listItemWrapperStyle}
            containerStyle={[styles.mb2]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            onLongPressRow={onLongPressRow}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
        >
            <TransactionListItemRow
                item={transactionItem}
                showTooltip={showTooltip}
                onButtonPress={() => {
                    handleActionButtonPress(currentSearchHash, transactionItem, () => onSelectRow(item));
                }}
                onCheckboxPress={() => onCheckboxPress?.(item)}
                isDisabled={!!isDisabled}
                canSelectMultiple={!!canSelectMultiple}
                isButtonSelected={item.isSelected}
                shouldShowTransactionCheckbox={false}
                isLoading={isLoading ?? transactionItem.isActionLoading}
            />
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
