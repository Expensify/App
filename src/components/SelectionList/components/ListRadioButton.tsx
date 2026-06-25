import React from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import CONST from '@src/CONST';
import ListSelectionButton from './ListSelectionButton';
import type {ListSelectionButtonProps} from './ListSelectionButton';

/**
 * A circular radio button indicator for use in selection list rows.
 * Use in single-select lists where only one item can be active at a time.
 */
function ListRadioButton<TItem extends ListItem>({
    item,
    onSelectRow,
    accessibilityLabel,
    disabled,
    style,
    containerStyle,
    shouldStopMouseDownPropagation,
    testID,
    tabIndex,
}: ListSelectionButtonProps<TItem>) {
    return (
        <ListSelectionButton
            role={CONST.ROLE.RADIO}
            item={item}
            onSelectRow={onSelectRow}
            accessibilityLabel={accessibilityLabel}
            disabled={disabled}
            style={style}
            containerStyle={containerStyle}
            shouldStopMouseDownPropagation={shouldStopMouseDownPropagation}
            testID={testID}
            tabIndex={tabIndex ?? -1}
        />
    );
}

export default ListRadioButton;
