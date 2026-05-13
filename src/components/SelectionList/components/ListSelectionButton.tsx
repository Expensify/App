import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import SelectionButton from '@components/SelectionButton';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import CONST from '@src/CONST';

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

    return (
        <SelectionButton
            shouldSelectOnPressEnter
            role={role}
            accessibilityLabel={label}
            isChecked={item.isSelected ?? false}
            onPress={() => onSelectRow(item)}
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
