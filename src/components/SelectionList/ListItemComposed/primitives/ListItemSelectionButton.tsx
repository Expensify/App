import ListSelectionButton from '@components/SelectionList/components/ListSelectionButton';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import {useListItemContext} from '@components/SelectionList/ListItemContext';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

type ListItemSelectionButtonProps<TItem extends ListItem> = {
    /** The item the button selects */
    item: TItem;

    /** Callback to fire when the button is pressed */
    onPress: (item: TItem) => void;

    /** Whether the button renders as a checkbox (multi-select) or a radio button (single-select) */
    canSelectMultiple?: boolean;

    /** Additional styles merged onto the button */
    style?: StyleProp<ViewStyle>;
};

/** A checkbox (multi-select) or radio (single-select) selection button; the disabled state follows the row's context. */
function ListItemSelectionButton<TItem extends ListItem>({item, onPress, canSelectMultiple = false, style}: ListItemSelectionButtonProps<TItem>) {
    const {isDisabled} = useListItemContext();

    return (
        <ListSelectionButton
            role={canSelectMultiple ? CONST.ROLE.CHECKBOX : CONST.ROLE.RADIO}
            item={item}
            onSelectRow={onPress}
            disabled={isDisabled || !!item.isDisabledCheckbox}
            // Radio buttons are removed from the tab order - the row itself is the single-select tab stop.
            tabIndex={canSelectMultiple ? undefined : -1}
            style={style}
        />
    );
}

export default ListItemSelectionButton;
