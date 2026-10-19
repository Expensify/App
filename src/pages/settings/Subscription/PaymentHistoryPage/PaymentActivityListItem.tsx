import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import type {ListItem, ListItemProps} from '@components/SelectionList/ListItem/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

/** A read-only active user row, styled so consecutive rows render as one card under the active user count header. */
function PaymentActivityListItem<TItem extends ListItem>(props: ListItemProps<TItem>) {
    const styles = useThemeStyles();

    return (
        <BareUserListItem
            {...props}
            pressableStyle={[styles.mh5, styles.highlightBG, props.isLastItem ? styles.tableBottomRadius : styles.borderBottom]}
            wrapperStyle={[styles.ph4, styles.pv1]}
            shouldDisableHoverStyle
        />
    );
}

export default PaymentActivityListItem;
