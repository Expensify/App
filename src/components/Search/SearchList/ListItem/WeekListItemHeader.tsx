import React from 'react';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';
import type {TransactionWeekGroupListItemType} from './types';

type WeekListItemHeaderProps = Omit<BaseListItemHeaderProps, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The week group currently being looked at */
    week: TransactionWeekGroupListItemType;
};

function WeekListItemHeader({week: weekItem, ...baseProps}: WeekListItemHeaderProps) {
    return (
        <BaseListItemHeader
            {...baseProps}
            item={weekItem}
            displayName={weekItem.formattedWeek}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK}
        />
    );
}

export default WeekListItemHeader;
