import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericField from '@components/NumericField';
import type {NumericFieldRef, NumericTextInputProps} from '@components/NumericField';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import * as NativeNavigation from '@react-navigation/native';
import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

const mockUseIsFocused = jest.mocked(NativeNavigation.useIsFocused);

type RootProps = {
    value?: string;
    allowNegative?: boolean;
    decimals?: number;
    maxLength?: number;
    errorText?: string;
    onInputChange?: jest.Mock;
    ref?: React.Ref<NumericFieldRef>;
};

function renderTextInput(inputProps: Partial<NumericTextInputProps> = {}, rootProps: RootProps = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumericField {...rootProps}>
                <NumericField.TextInput {...inputProps} />
            </NumericField>
        </ComposeProviders>,
    );
}

const INPUT_TEST_ID = 'number-form-input';

// Only an empty external value resets editing state; clearing selection keeps the caret within the cleared text.
describe('NumericField external reset handling', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('clears the value and collapses the selection when the root value resets externally', async () => {
        // Given a TextInput with value "1234" and the caret at the end
        const {rerender} = renderTextInput({testID: INPUT_TEST_ID}, {value: '1234', decimals: 2});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);

        fireEvent(input, 'selectionChange', {
            nativeEvent: {selection: {start: 4, end: 4}},
        });
        await waitForBatchedUpdatesWithAct();

        expect(input.props.selection).toEqual({start: 4, end: 4});

        // When the root value resets externally to an empty string
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumericField
                    value=""
                    decimals={2}
                >
                    <NumericField.TextInput testID={INPUT_TEST_ID} />
                </NumericField>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the value clears and the selection collapses to the start
        expect(screen.getByDisplayValue('')).toBeOnTheScreen();
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 0, end: 0});
    });

    it('keeps the displayed value when the root value changes externally to another non-empty value', async () => {
        // Given a TextInput with value "1234"
        const {rerender} = renderTextInput({testID: INPUT_TEST_ID}, {value: '1234', decimals: 2});
        await waitForBatchedUpdatesWithAct();

        // When the root value changes externally to "12"
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumericField
                    value="12"
                    decimals={2}
                >
                    <NumericField.TextInput testID={INPUT_TEST_ID} />
                </NumericField>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the editing state is preserved, matching NumberWithSymbolForm; external pushes must use updateNumber
        expect(screen.getByDisplayValue('1234')).toBeOnTheScreen();
    });
});

describe('NumericField navigation focus selection handling', () => {
    afterEach(() => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(true);
    });

    it('collapses the selection onto the end when focus is regained', async () => {
        // Given an input with a partial text selection
        const {rerender} = renderTextInput({testID: INPUT_TEST_ID}, {value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {
            nativeEvent: {selection: {start: 1, end: 3}},
        });
        await waitForBatchedUpdatesWithAct();

        expect(input.props.selection).toEqual({start: 1, end: 3});

        // When the screen loses focus and then regains it
        mockUseIsFocused.mockReturnValue(false);
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumericField value="1234">
                    <NumericField.TextInput testID={INPUT_TEST_ID} />
                </NumericField>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        mockUseIsFocused.mockReturnValue(true);
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumericField value="1234">
                    <NumericField.TextInput testID={INPUT_TEST_ID} />
                </NumericField>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the selection collapses to the end of the value
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 3, end: 3});
    });
});

describe('NumericField.TextInput', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('adds a leading zero when the value begins with a decimal separator', async () => {
        const onInputChange = jest.fn();

        // Given an empty TextInput
        renderTextInput({}, {decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value starting with a decimal separator
        fireEvent.changeText(screen.getByDisplayValue(''), '.5');
        await waitForBatchedUpdatesWithAct();

        // Then a leading zero is added
        expect(onInputChange).toHaveBeenLastCalledWith('0.5');
        expect(screen.getByDisplayValue('0.5')).toBeOnTheScreen();
    });

    it('normalizes spaces and comma separators before notifying the root', async () => {
        const onInputChange = jest.fn();

        // Given an empty TextInput
        renderTextInput({}, {decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value with spaces and comma separators
        fireEvent.changeText(screen.getByDisplayValue(''), '1 2,5');
        await waitForBatchedUpdatesWithAct();

        // Then the value is normalized before notifying the root
        expect(onInputChange).toHaveBeenLastCalledWith('12.5');
        expect(screen.getByDisplayValue('12.5')).toBeOnTheScreen();
    });

    it('accepts a pasted value with thousands separators when a period is present', async () => {
        const onInputChange = jest.fn();

        // Given an empty TextInput with two decimal places
        renderTextInput({testID: INPUT_TEST_ID}, {value: '', decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When a value with thousands separators and a period is pasted
        fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '1,234.56');
        await waitForBatchedUpdatesWithAct();

        // Then the commas are stripped as thousands separators
        expect(onInputChange).toHaveBeenLastCalledWith('1234.56');
        expect(screen.getByDisplayValue('1234.56')).toBeOnTheScreen();
    });

    it('rejects values that exceed the configured decimal precision', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with zero decimal places and value "12"
        renderTextInput({}, {value: '12', decimals: 0, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value with decimal places
        fireEvent.changeText(screen.getByDisplayValue('12'), '12.5');
        await waitForBatchedUpdatesWithAct();

        // Then the change is rejected and the value stays "12"
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
    });

    it('rejects negative values when negative input is disabled', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with negative input disabled and value "12"
        renderTextInput({}, {value: '12', decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a negative value
        fireEvent.changeText(screen.getByDisplayValue('12'), '-12');
        await waitForBatchedUpdatesWithAct();

        // Then the change is rejected and the value stays "12"
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
    });

    it('accepts a signed value when negative input is enabled', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with negative input enabled and value "12"
        renderTextInput({}, {value: '12', allowNegative: true, decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a signed value
        fireEvent.changeText(screen.getByDisplayValue('12'), '-12');
        await waitForBatchedUpdatesWithAct();

        // Then the canonical signed value is committed inline
        expect(onInputChange).toHaveBeenLastCalledWith('-12');
        expect(screen.getByDisplayValue('-12')).toBeOnTheScreen();
    });

    it('does not forward maxLength to the native input', async () => {
        // Given maxLength set for integer validation on the root
        renderTextInput({}, {value: '12345678.99', decimals: 2, maxLength: 8});
        await waitForBatchedUpdatesWithAct();

        // Then maxLength is not forwarded to the native input
        expect(screen.getByDisplayValue('12345678.99').props.maxLength).toBeUndefined();
    });

    it('rejects a value with more integer digits than maxLength allows', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with maxLength set to 2 and value "12"
        renderTextInput({testID: INPUT_TEST_ID}, {value: '12', decimals: 2, maxLength: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value longer than maxLength
        fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '123');
        await waitForBatchedUpdatesWithAct();

        // Then the change is rejected and the value stays "12"
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
    });

    it('accepts a value that fits within maxLength', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with maxLength set to 2 and value "1"
        renderTextInput({testID: INPUT_TEST_ID}, {value: '1', decimals: 2, maxLength: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value within maxLength
        fireEvent.changeText(screen.getByTestId(INPUT_TEST_ID), '12');
        await waitForBatchedUpdatesWithAct();

        // Then the change is accepted
        expect(onInputChange).toHaveBeenLastCalledWith('12');
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
    });

    it('strips decimals from the value when the decimals prop changes to a lower precision', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with two decimal places and value "1.25"
        const {rerender} = renderTextInput({testID: INPUT_TEST_ID}, {value: '1.25', decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByDisplayValue('1.25')).toBeOnTheScreen();

        // When the decimals prop changes to zero
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumericField
                    value="1.25"
                    decimals={0}
                    onInputChange={onInputChange}
                >
                    <NumericField.TextInput testID={INPUT_TEST_ID} />
                </NumericField>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the decimals are stripped and the parent is notified
        expect(screen.getByDisplayValue('1')).toBeOnTheScreen();
        expect(onInputChange).toHaveBeenLastCalledWith('1');
    });

    it('strips decimals at mount when the value is invalid for the decimals prop', async () => {
        const onInputChange = jest.fn();

        // Given a value mounted with more decimal places than the root allows
        renderTextInput({testID: INPUT_TEST_ID}, {value: '1.25', decimals: 0, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // Then the decimals are stripped at mount and the parent is notified, matching NumberWithSymbolForm
        expect(screen.getByDisplayValue('1')).toBeOnTheScreen();
        expect(onInputChange).toHaveBeenLastCalledWith('1');
    });

    it('renders the inline TextInput error and forwards blur and the text-input ref', async () => {
        const inputRef = React.createRef<BaseTextInputRef>();
        const onBlur = jest.fn();

        // Given a TextInput with an error message, onBlur, and a ref
        renderTextInput({prefixCharacter: '$', label: 'Amount', onBlur, ref: inputRef}, {value: '10', errorText: 'Invalid text number'});
        await waitForBatchedUpdatesWithAct();

        expect(inputRef.current).toBeTruthy();
        expect(screen.getByText('Invalid text number')).toBeOnTheScreen();

        // When the input blurs
        fireEvent(screen.getByDisplayValue('10'), 'blur');

        // Then onBlur is forwarded from the primitive
        expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('exposes the imperative number API without notifying the root on updateNumber', async () => {
        const ref = React.createRef<NumericFieldRef>();
        const onInputChange = jest.fn();

        // Given a TextInput with value "10", zero decimal places, and a ref
        renderTextInput({testID: INPUT_TEST_ID}, {value: '10', decimals: 0, ref, onInputChange});
        await waitForBatchedUpdatesWithAct();

        expect(ref.current?.getNumber()).toBe('10');

        // When updateNumber is called imperatively with a value that is invalid for decimals: 0
        act(() => {
            ref.current?.updateNumber('1.5');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the value is stored without validation or notifying onInputChange, matching NumberWithSymbolForm
        expect(ref.current?.getNumber()).toBe('1.5');
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('1.5')).toBeOnTheScreen();

        // And the caret moves to the end of the new value
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 3, end: 3});
    });

    it('forwards onSubmitEditing and onKeyPress from the primitive props', async () => {
        const inputOnSubmitEditing = jest.fn();
        const inputOnKeyPress = jest.fn();

        // Given a TextInput with submit and key-press callbacks on the primitive
        renderTextInput({testID: INPUT_TEST_ID, onSubmitEditing: inputOnSubmitEditing, onKeyPress: inputOnKeyPress}, {value: '10'});
        await waitForBatchedUpdatesWithAct();

        // When the user submits and presses a key
        fireEvent(screen.getByTestId(INPUT_TEST_ID), 'submitEditing', {nativeEvent: {text: '10'}});
        fireEvent(screen.getByTestId(INPUT_TEST_ID), 'keyPress', {nativeEvent: {key: '5'}});
        await waitForBatchedUpdatesWithAct();

        // Then both primitive callbacks are invoked
        expect(inputOnSubmitEditing).toHaveBeenCalledTimes(1);
        expect(inputOnKeyPress).toHaveBeenCalledTimes(1);
    });

    it('uses submit behavior by default and preserves an explicit override', async () => {
        // Given a NumericField.TextInput without an explicit submit behavior
        const {unmount} = renderTextInput({testID: INPUT_TEST_ID}, {value: '10'});
        await waitForBatchedUpdatesWithAct();

        // Then Enter submits without blurring by default
        expect(screen.getByTestId(INPUT_TEST_ID).props.submitBehavior).toBe('submit');

        // When an explicit blur behavior is provided
        unmount();
        renderTextInput({testID: INPUT_TEST_ID, submitBehavior: 'blurAndSubmit'}, {value: '10'});
        await waitForBatchedUpdatesWithAct();

        // Then the caller's override is preserved
        expect(screen.getByTestId(INPUT_TEST_ID).props.submitBehavior).toBe('blurAndSubmit');
    });

    it('collapses the selection onto its end when clearSelection is called', async () => {
        const ref = React.createRef<NumericFieldRef>();

        // Given a TextInput with a range selection
        renderTextInput({testID: INPUT_TEST_ID}, {value: '1234', decimals: 2, ref});
        await waitForBatchedUpdatesWithAct();

        fireEvent(screen.getByTestId(INPUT_TEST_ID), 'selectionChange', {
            nativeEvent: {selection: {start: 1, end: 3}},
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 1, end: 3});

        // When clearSelection is called imperatively
        act(() => {
            ref.current?.clearSelection();
        });
        await waitForBatchedUpdatesWithAct();

        // Then the selection collapses onto its end
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 3, end: 3});
    });
});
