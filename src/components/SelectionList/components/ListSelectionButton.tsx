import SelectionButton from '@components/SelectionButton';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';

type ListSelectionButtonProps<TItem extends ListItem> = {
    /** The item to render the selection button for */
    item: TItem;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Custom accessibility label */
    accessibilityLabel?: string;

    /** Whether the button is disabled */
    disabled?: boolean;

    /** Additional styles */
    style?: StyleProp<ViewStyle>;

    /** Additional styles for the checkbox/radio indicator */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to stop mouse down event propagation */
    shouldStopMouseDownPropagation?: boolean;

    /** Test ID */
    testID?: string;

    /** Tab index for the button, pass -1 to remove it from the tab order */
    tabIndex?: -1 | 0;
};

function ListSelectionButton<TItem extends ListItem>({
    role,
    item,
    onSelectRow,
    accessibilityLabel,
    disabled,
    style,
    containerStyle,
    shouldStopMouseDownPropagation = true,
    testID,
    tabIndex,
}: ListSelectionButtonProps<TItem> & {role: typeof CONST.ROLE.CHECKBOX | typeof CONST.ROLE.RADIO}) {
    const label = accessibilityLabel ?? item.text ?? '';

    // Show the checkmark right away on press instead of waiting for the parent's deferred selection update.
    // We drop this optimistic value once the item prop catches up (adjusting state during render, see React docs).
    // We also track keyForList because FlashList recycles rows, so one instance can receive a different item with
    // the same isSelected value - resetting on identity change avoids showing a stale checkmark on a recycled row.
    const isCheckedProp = item.isSelected ?? false;
    const [prevItem, setPrevItem] = useState({key: item.keyForList, checked: isCheckedProp});
    const [optimisticChecked, setOptimisticChecked] = useState<boolean | null>(null);
    if (prevItem.key !== item.keyForList || prevItem.checked !== isCheckedProp) {
        setPrevItem({key: item.keyForList, checked: isCheckedProp});
        setOptimisticChecked(null);
    }
    const isChecked = optimisticChecked ?? isCheckedProp;

    return (
        <SelectionButton
            shouldSelectOnPressEnter
            role={role}
            accessibilityLabel={label}
            isChecked={isChecked}
            onPress={() => {
                // A checkbox flips; a radio only ever selects. Flipping an already-checked radio would leave it
                // stuck unchecked since its isSelected prop never changes to reset the optimistic value.
                setOptimisticChecked(role === CONST.ROLE.RADIO ? true : !isChecked);
                onSelectRow(item);
            }}
            disabled={disabled}
            style={style}
            containerStyle={containerStyle}
            shouldStopMouseDownPropagation={shouldStopMouseDownPropagation}
            sentryLabel={CONST.SENTRY_LABEL.USER_LIST_ITEM.CHECKBOX}
            testID={testID ?? `${CONST.SELECTION_BUTTON_TEST_ID}${label}`}
            tabIndex={tabIndex}
            accessible={false}
        />
    );
}

export default ListSelectionButton;
export type {ListSelectionButtonProps};
