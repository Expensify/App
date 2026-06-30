import React from 'react';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';
import type {TransactionMonthGroupListItemType} from './types';

type MonthListItemHeaderProps = Omit<BaseListItemHeaderProps, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The month group currently being looked at */
    month: TransactionMonthGroupListItemType;
};

function MonthListItemHeader({month: monthItem, ...baseProps}: MonthListItemHeaderProps) {
    return (
        <BaseListItemHeader
            {...baseProps}
            item={monthItem}
            displayName={monthItem.formattedMonth}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH}
        />
    );
}

export default MonthListItemHeader;
