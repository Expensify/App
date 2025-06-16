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
        styles.pv0,
        !isLargeScreenWidth && styles.pt3,
        styles.ph0,
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

    const {amountColumnSize, dateColumnSize, taxAmountColumnSize} = useMemo(() => {
        return {
            amountColumnSize: transactionItem.isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: transactionItem.isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: transactionItem.shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [transactionItem]);

    const columns = useMemo(
        () =>
            [
                CONST.REPORT.TRANSACTION_LIST.COLUMNS.RECEIPT,
                CONST.REPORT.TRANSACTION_LIST.COLUMNS.TYPE,
                CONST.REPORT.TRANSACTION_LIST.COLUMNS.DATE,
                CONST.REPORT.TRANSACTION_LIST.COLUMNS.MERCHANT,
                CONST.REPORT.TRANSACTION_LIST.COLUMNS.FROM,
                CONST.REPORT.TRANSACTION_LIST.COLUMNS.TO,
                ...(transactionItem?.shouldShowCategory ? [CONST.REPORT.TRANSACTION_LIST.COLUMNS.CATEGORY] : []),
                ...(transactionItem?.shouldShowTag ? [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAG] : []),
                ...(transactionItem?.shouldShowTax ? [CONST.REPORT.TRANSACTION_LIST.COLUMNS.TAX] : []),
                CONST.REPORT.TRANSACTION_LIST.COLUMNS.TOTAL_AMOUNT,
                CONST.REPORT.TRANSACTION_LIST.COLUMNS.ACTION,
            ] satisfies Array<ValueOf<typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS>>,
        [transactionItem?.shouldShowCategory, transactionItem?.shouldShowTag, transactionItem?.shouldShowTax],
    );

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
                            shouldShowUserInfo={!!transactionItem?.from}
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
                        amountColumnSize={amountColumnSize}
                        taxAmountColumnSize={taxAmountColumnSize}
                        shouldShowCheckbox={!!canSelectMultiple}
                    />
                </>
            )}
        </BaseListItem>
    );
}

TransactionListItem.displayName = 'TransactionListItem';

export default TransactionListItem;
