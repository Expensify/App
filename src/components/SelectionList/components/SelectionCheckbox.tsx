import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import CONST from '@src/CONST';

type SelectionCheckboxProps<TItem extends ListItem> = {
    /** The item to render the checkbox for */
    item: TItem;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Custom accessibility label for the checkbox */
    accessibilityLabel?: string;

    /** Whether the checkbox should have circular border radius (for single-select style) */
    isCircular?: boolean;

    /** Whether the checkbox is disabled */
    disabled?: boolean;

    /** Additional styles for the checkbox */
    style?: StyleProp<ViewStyle>;

    /** Additional styles for the checkbox container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to stop mouse down event propagation */
    shouldStopMouseDownPropagation?: boolean;

    /** Test ID for the checkbox */
    testID?: string;

    /** Optional tab index override for web focus management */
    tabIndex?: 0 | -1;
};

function SelectionCheckbox<TItem extends ListItem>({
    item,
    onSelectRow,
    accessibilityLabel,
    isCircular = false,
    disabled,
    style,
    containerStyle,
    shouldStopMouseDownPropagation,
    testID,
    tabIndex,
}: SelectionCheckboxProps<TItem>) {
    return (
        <Checkbox
            shouldSelectOnPressEnter
            containerBorderRadius={isCircular ? 999 : undefined}
            accessibilityLabel={accessibilityLabel ?? item.text ?? ''}
            isChecked={item.isSelected}
            onPress={() => onSelectRow(item)}
            disabled={disabled}
            style={style}
            containerStyle={containerStyle}
            shouldStopMouseDownPropagation={shouldStopMouseDownPropagation}
            sentryLabel={CONST.SENTRY_LABEL.USER_LIST_ITEM.CHECKBOX}
            testID={testID}
            tabIndex={tabIndex}
        />
    );
}

export default SelectionCheckbox;
