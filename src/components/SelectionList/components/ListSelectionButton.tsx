import SelectionButton from '@components/SelectionButton';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';

type ListSelectionButtonProps<TItem extends ListItem> = {
    /** Whether the button renders as a checkbox (multi-select) or a radio button (single-select) */
    role: typeof CONST.ROLE.CHECKBOX | typeof CONST.ROLE.RADIO;

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

    /** Paint the checkmark on press before the parent's selection update lands. Opt-in for pages that defer that update. */
    shouldUseOptimisticSelection?: boolean;

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
    shouldUseOptimisticSelection = false,
    testID,
    tabIndex,
}: ListSelectionButtonProps<TItem>) {
    const label = accessibilityLabel ?? item.text ?? '';

    const isCheckedProp = item.isSelected ?? false;
    // Optimistic checkmark, only when opted in. Drop it once item.isSelected catches up, and reset on keyForList change
    // so a recycled FlashList row doesn't keep the previous row's checkmark. Off by default, so other lists are unchanged.
    const [prevItem, setPrevItem] = useState({key: item.keyForList, checked: isCheckedProp});
    const [optimisticChecked, setOptimisticChecked] = useState<boolean | null>(null);
    if (shouldUseOptimisticSelection && (prevItem.key !== item.keyForList || prevItem.checked !== isCheckedProp)) {
        setPrevItem({key: item.keyForList, checked: isCheckedProp});
        setOptimisticChecked(null);
    }
    const isChecked = shouldUseOptimisticSelection ? (optimisticChecked ?? isCheckedProp) : isCheckedProp;

    return (
        <SelectionButton
            shouldSelectOnPressEnter
            role={role}
            accessibilityLabel={label}
            isChecked={isChecked}
            onPress={() => {
                // A radio only ever selects (paint checked, never flip off); a checkbox toggles.
                if (shouldUseOptimisticSelection) {
                    setOptimisticChecked(role === CONST.ROLE.RADIO ? true : !isChecked);
                }
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
