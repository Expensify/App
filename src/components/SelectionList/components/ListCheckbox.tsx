import React from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import CONST from '@src/CONST';
import ListSelectionButton from './ListSelectionButton';
import type {ListSelectionButtonProps} from './ListSelectionButton';

/**
 * A square checkbox indicator for use in selection list rows.
 * Use in multi-select lists where items are toggled independently.
 */
function ListCheckbox<TItem extends ListItem>({
    item,
    onSelectRow,
    accessibilityLabel,
    disabled,
    style,
    containerStyle,
    shouldStopMouseDownPropagation,
    testID,
}: ListSelectionButtonProps<TItem>) {
    return (
        <ListSelectionButton
            role={CONST.ROLE.CHECKBOX}
            item={item}
            onSelectRow={onSelectRow}
            accessibilityLabel={accessibilityLabel}
            disabled={disabled}
            style={style}
            containerStyle={containerStyle}
            shouldStopMouseDownPropagation={shouldStopMouseDownPropagation}
            testID={testID}
        />
    );
}

export default ListCheckbox;
