import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';

type SelectionButtonProps<TItem extends ListItem> = {
    /** Whether the button renders as a radio button (circular) or checkbox (square) */
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

    /** Additional styles for the container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to stop mouse down event propagation */
    shouldStopMouseDownPropagation?: boolean;

    /** Test ID */
    testID?: string;
};

function SelectionButton<TItem extends ListItem>({
    role,
    item,
    onSelectRow,
    accessibilityLabel,
    disabled,
    style,
    containerStyle,
    shouldStopMouseDownPropagation,
    testID,
}: SelectionButtonProps<TItem>) {
    return (
        <Checkbox
            shouldSelectOnPressEnter
            containerBorderRadius={role === CONST.ROLE.RADIO ? variables.componentBorderRadiusCircle : undefined}
            role={role}
            accessibilityLabel={accessibilityLabel ?? item.text ?? ''}
            isChecked={item.isSelected}
            onPress={() => onSelectRow(item)}
            disabled={disabled}
            style={style}
            containerStyle={containerStyle}
            shouldStopMouseDownPropagation={shouldStopMouseDownPropagation}
            sentryLabel={CONST.SENTRY_LABEL.USER_LIST_ITEM.CHECKBOX}
            testID={testID}
        />
    );
}

export default SelectionButton;
