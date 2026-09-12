import ListSelectionButton from '@components/SelectionList/components/ListSelectionButton';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import {useListItemContext} from '@components/SelectionList/ListItemContext';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

type ListItemSelectionButtonProps<TItem extends ListItem> = {
    /** The item the button selects */
    item: TItem;

    /** Callback to fire when the button is pressed */
    onPress: (item: TItem) => void;

    /** Whether the button renders as a checkbox (multi-select) or a radio button (single-select) */
    canSelectMultiple?: boolean;

    /** Which side of the row content the button sits on */
    position?: ValueOf<typeof CONST.SELECTION_BUTTON_POSITION>;
};

/** A checkbox (multi-select) or radio (single-select) selection button */
function ListItemSelectionButton<TItem extends ListItem>({item, onPress, canSelectMultiple = false, position = CONST.SELECTION_BUTTON_POSITION.RIGHT}: ListItemSelectionButtonProps<TItem>) {
    const {isDisabled} = useListItemContext();
    const styles = useThemeStyles();

    return (
        <ListSelectionButton
            role={canSelectMultiple ? CONST.ROLE.CHECKBOX : CONST.ROLE.RADIO}
            item={item}
            onSelectRow={onPress}
            disabled={isDisabled || !!item.isDisabledCheckbox}
            // Radio buttons are removed from the tab order - the row itself is the single-select tab stop.
            tabIndex={canSelectMultiple ? undefined : -1}
            style={position === CONST.SELECTION_BUTTON_POSITION.LEFT ? styles.mr3 : styles.ml3}
        />
    );
}

export default ListItemSelectionButton;
