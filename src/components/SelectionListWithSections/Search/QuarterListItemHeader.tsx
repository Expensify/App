import React from 'react';
import type {ListItem, TransactionQuarterGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';

type QuarterListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The quarter group currently being looked at */
    quarter: TransactionQuarterGroupListItemType;
};

function QuarterListItemHeader<TItem extends ListItem>({
    quarter: quarterItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: QuarterListItemHeaderProps<TItem>) {
    const quarterName = quarterItem.formattedQuarter;

    return (
        <BaseListItemHeader
            item={quarterItem}
            displayName={quarterName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_QUARTER}
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

export default QuarterListItemHeader;
