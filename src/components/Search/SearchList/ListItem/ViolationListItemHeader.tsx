import type {ListItem} from '@components/SelectionList/types';

import CONST from '@src/CONST';

import React from 'react';

import type {BaseListItemHeaderProps} from './BaseListItemHeader';
import type {TransactionViolationGroupListItemType} from './types';

import BaseListItemHeader from './BaseListItemHeader';

type ViolationListItemHeaderProps<TItem extends ListItem> = Omit<BaseListItemHeaderProps<TItem>, 'item' | 'displayName' | 'groupColumnKey' | 'columnStyleKey'> & {
    violation: TransactionViolationGroupListItemType;
};

function ViolationListItemHeader<TItem extends ListItem>({
    violation: violationItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isExpanded,
    onDownArrowClick,
    columns,
}: ViolationListItemHeaderProps<TItem>) {
    return (
        <BaseListItemHeader
            item={violationItem}
            displayName={violationItem.formattedViolation}
            groupColumnKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION}
            columnStyleKey={CONST.SEARCH.TABLE_COLUMNS.GROUP_VIOLATION}
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

export default ViolationListItemHeader;
