import type {ListItem} from '@components/SelectionList/types';

import CONST from '@src/CONST';

import React from 'react';

import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import type {TransactionDayGroupListItemType} from './types';

import BaseListItemHeader from './BaseListItemHeader';

type DayListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    day: TransactionDayGroupListItemType;
};

function DayListItemHeader<TItem extends ListItem>({
    day: dayItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: DayListItemHeaderProps<TItem>) {
    return (
        <BaseListItemHeader
            item={dayItem}
            displayName={dayItem.formattedDay}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_DAY}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_DAY}
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

export default DayListItemHeader;
