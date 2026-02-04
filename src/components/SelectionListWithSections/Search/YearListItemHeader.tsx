import React from 'react';
import type {ListItem, TransactionYearGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';

type YearListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The year group currently being looked at */
    year: TransactionYearGroupListItemType;
};

function YearListItemHeader<TItem extends ListItem>({
    year: yearItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: YearListItemHeaderProps<TItem>) {
    const yearName = yearItem.formattedYear;

    return (
        <BaseListItemHeader
            item={yearItem}
            displayName={yearName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_YEAR}
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

export default YearListItemHeader;
