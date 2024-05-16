import React from 'react';
import type {ListItem, ReportListItemProps} from './types';

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
    return null;
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
