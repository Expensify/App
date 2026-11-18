import {fireEvent, render, screen} from '@testing-library/react-native';

import type * as PressableWithoutFeedbackModule from '@components/Pressable/PressableWithoutFeedback';
import type * as TextModule from '@components/Text';
import type {ValuePickerItem, ValuePickerListItem} from '@components/ValuePicker/types';
import ValueFieldDropdown from '@components/ValuePicker/ValueFieldDropdown';

import CONST from '@src/CONST';

import type {View as NativeView} from 'react-native';

import React from 'react';

const mockSentryLabel = CONST.SENTRY_LABEL.IOU_REQUEST_STEP.PER_DIEM_SUBRATE_FIELD;

type MockSelectorModalProps = {
    isVisible: boolean;
    items: ValuePickerItem[];
    onItemSelected: (item: ValuePickerListItem) => void;
};

type MockFieldDropdownProps = {
    onPress: () => void;
    onOpen?: () => void;
};

// The full page list stands in for both ways the field opens: it renders one button per item, so picking an item
// doesn't depend on how the real selection list lays its rows out.
jest.mock('@components/ValuePicker/ValueSelectorModal', () => {
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    const PressableWithoutFeedback = jest.requireActual<typeof PressableWithoutFeedbackModule>('@components/Pressable/PressableWithoutFeedback').default;
    const Text = jest.requireActual<typeof TextModule>('@components/Text').default;
    return ({isVisible, items, onItemSelected}: MockSelectorModalProps) => {
        if (!isVisible) {
            return null;
        }
        return (
            <View>
                {items.map((item) => (
                    <PressableWithoutFeedback
                        key={item.value}
                        sentryLabel={mockSentryLabel}
                        accessibilityLabel={`pick-${item.value}`}
                        onPress={() => onItemSelected({...item, keyForList: item.value ?? '', text: item.label ?? ''})}
                    >
                        <Text>{item.label}</Text>
                    </PressableWithoutFeedback>
                ))}
            </View>
        );
    };
});

// Pressing the row opens the full page list, the way the field falls back when there is no room for the container.
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    const PressableWithoutFeedback = jest.requireActual<typeof PressableWithoutFeedbackModule>('@components/Pressable/PressableWithoutFeedback').default;
    return ({onPress, onOpen}: MockFieldDropdownProps) => (
        <PressableWithoutFeedback
            sentryLabel={mockSentryLabel}
            accessibilityLabel="field"
            onPress={() => {
                onOpen?.();
                onPress();
            }}
        />
    );
});

const ITEMS: ValuePickerItem[] = [
    {value: 'breakfast', label: 'Breakfast'},
    {value: 'lunch', label: 'Lunch'},
];

describe('ValueFieldDropdown', () => {
    it('does not call onInputChange when the user picks the item already chosen', () => {
        // Given a field that already holds an item
        const onInputChange = jest.fn();
        render(
            <ValueFieldDropdown
                label="Subrate"
                sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.PER_DIEM_SUBRATE_FIELD}
                value="breakfast"
                items={ITEMS}
                onInputChange={onInputChange}
            />,
        );

        // When the user opens the list and picks that same item
        fireEvent.press(screen.getByLabelText('field'));
        fireEvent.press(screen.getByLabelText('pick-breakfast'));

        // Then the form isn't told about a change, so it doesn't revalidate or mark the field dirty for nothing
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('calls onInputChange with the value of a newly picked item', () => {
        // Given a field that already holds an item
        const onInputChange = jest.fn();
        render(
            <ValueFieldDropdown
                label="Subrate"
                sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.PER_DIEM_SUBRATE_FIELD}
                value="breakfast"
                items={ITEMS}
                onInputChange={onInputChange}
            />,
        );

        // When the user picks a different item
        fireEvent.press(screen.getByLabelText('field'));
        fireEvent.press(screen.getByLabelText('pick-lunch'));

        // Then the form gets the new value
        expect(onInputChange).toHaveBeenCalledWith('lunch');
    });

    it('calls onOpen when the list opens', () => {
        // Given a field whose page wants to dismiss the keyboard before a list opens over it
        const onOpen = jest.fn();
        render(
            <ValueFieldDropdown
                label="Subrate"
                sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.PER_DIEM_SUBRATE_FIELD}
                items={ITEMS}
                onOpen={onOpen}
            />,
        );

        // When the user presses the field
        fireEvent.press(screen.getByLabelText('field'));

        // Then the page is told, so it can blur its other input before the list covers it
        expect(onOpen).toHaveBeenCalledTimes(1);
    });
});
