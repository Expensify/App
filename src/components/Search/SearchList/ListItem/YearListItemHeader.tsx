import React from 'react';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';
import type {TransactionYearGroupListItemType} from './types';

type YearListItemHeaderProps = Omit<BaseListItemHeaderProps, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The year group currently being looked at */
    year: TransactionYearGroupListItemType;
};

function YearListItemHeader({year: yearItem, ...baseProps}: YearListItemHeaderProps) {
    return (
        <BaseListItemHeader
            {...baseProps}
            item={yearItem}
            displayName={yearItem.formattedYear}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR}
        />
    );
}

export default YearListItemHeader;
