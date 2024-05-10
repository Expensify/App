import React from 'react';
import {View} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ListItem, ReportListItemProps} from '@components/SelectionList/types';

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
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useWindowDimensions();

    
    if (!isLargeScreenWidth) {
        return (
            <></>
        );
    }

    return (
        <></>
    );
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
