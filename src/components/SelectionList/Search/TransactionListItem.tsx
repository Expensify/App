import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import {useSearchContext} from '@components/Search/SearchContext';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, TransactionListItemProps, TransactionListItemType} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@libs/actions/Search';
import shouldShowTransactionYear from '@libs/TransactionUtils/shouldShowTransactionYear';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';

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

    const dateColumnSize = useMemo(() => {
        const shouldShowYearForSomeTransaction = shouldShowTransactionYear(transactionItem);
        return shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    }, [transactionItem]);

    const {COLUMNS} = CONST.REPORT.TRANSACTION_LIST;

    const columns = [
        COLUMNS.RECEIPT,
        COLUMNS.TYPE,
        COLUMNS.DATE,
        COLUMNS.MERCHANT,
        COLUMNS.FROM,
        COLUMNS.TO,
        ...(transactionItem?.shouldShowCategory ? [COLUMNS.CATEGORY] : []),
        ...(transactionItem?.shouldShowTag ? [COLUMNS.TAG] : []),
        ...(transactionItem?.shouldShowTax ? [COLUMNS.TAX] : []),
        COLUMNS.TOTAL_AMOUNT,
        COLUMNS.ACTION,
    ] as Array<ValueOf<typeof COLUMNS>>;

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
            {(hovered) => (
                <>
                    {!isLargeScreenWidth && (
                        <UserInfoAndActionButtonRow
                            item={transactionItem}
                            handleActionButtonPress={() => {
                                handleActionButtonPress(currentSearchHash, transactionItem, () => onSelectRow(item));
                            }}
                        />
                    )}
                    <TransactionItemRow
                        transactionItem={transactionItem}
                        shouldShowTooltip={showTooltip}
                        onButtonPress={() => {
                            handleActionButtonPress(currentSearchHash, transactionItem, () => onSelectRow(item));
                        }}
                        onCheckboxPress={() => onCheckboxPress?.(item)}
                        shouldUseNarrowLayout={!isLargeScreenWidth}
                        columns={columns}
                        isParentHovered={hovered}
                        isActionLoading={isLoading ?? transactionItem.isActionLoading}
                        isSelected={!!transactionItem.isSelected}
                        dateColumnSize={dateColumnSize}
                        shouldShowCheckbox={!!canSelectMultiple}
                        columnWrapperStyles={[styles.ph3, styles.pv1half]}
                        isChildListItem={false}
                        usedInExpenses
                    />
                </>
            )}
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
