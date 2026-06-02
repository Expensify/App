import React from 'react';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';
import type {TransactionQuarterGroupListItemType} from './types';

type QuarterListItemHeaderProps = Omit<BaseListItemHeaderProps, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The quarter group currently being looked at */
    quarter: TransactionQuarterGroupListItemType;
};

function QuarterListItemHeader({quarter: quarterItem, ...baseProps}: QuarterListItemHeaderProps) {
    return (
        <BaseListItemHeader
            {...baseProps}
            item={quarterItem}
            displayName={quarterItem.formattedQuarter}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER}
        />
    );
}

export default QuarterListItemHeader;
