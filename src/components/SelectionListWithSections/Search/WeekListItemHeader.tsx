import React from 'react';
import type {ListItem, TransactionWeekGroupListItemType} from '@components/SelectionListWithSections/types';
import CONST from '@src/CONST';
import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import BaseListItemHeader from './BaseListItemHeader';

type WeekListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    /** The week group currently being looked at */
    week: TransactionWeekGroupListItemType;
};

function WeekListItemHeader<TItem extends ListItem>({
    week: weekItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: WeekListItemHeaderProps<TItem>) {
    const weekName = weekItem.formattedWeek;

    return (
        <BaseListItemHeader
            item={weekItem}
            displayName={weekName}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_WEEK}
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

export default WeekListItemHeader;
