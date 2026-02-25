import React from 'react';
import type {ListItem, TransactionMonthGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';

type MonthListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The month group currently being looked at */
    month: TransactionMonthGroupListItemType;
};

function MonthListItemHeader<TItem extends ListItem>({
    month: monthItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: MonthListItemHeaderProps<TItem>) {
    const monthName = monthItem.formattedMonth;

    return (
        <BaseListItemHeader
            item={monthItem}
            displayName={monthName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH}
            onCheckboxPress={onCheckboxPress}
            isDisabled={isDisabled}
            canSelectMultiple={canSelectMultiple}
            isSelectAllChecked={isSelectAllChecked}
            isIndeterminate={isIndeterminate}
            isExpanded={isExpanded}
            onDownArrowClick={onDownArrowClick}
            columns={columns}
        />
    );
}

export default MonthListItemHeader;
