import React from 'react';
import TransactionListItem from './TransactionListItem';
import type {ListItem, ReportListItemProps, ReportListItemType} from './types';

function ReportListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow,
    onFocus,
    shouldSyncFocus,
}: ReportListItemProps<TItem>) {
    const reportItem = item as unknown as ReportListItemType;

    if (reportItem.transactions.length === 1) {
        return (
            <TransactionListItem
                item={reportItem.transactions[0]}
                isFocused={isFocused}
                showTooltip={showTooltip}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                onSelectRow={onSelectRow}
                onDismissError={onDismissError}
                shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                onFocus={onFocus}
                shouldSyncFocus={shouldSyncFocus}
            />
        );
    }

    return null;
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
