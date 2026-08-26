import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumberComposer, {useNumberComposerActions} from '@components/NumberComposer';
import type {NumberComposerRef, NumberComposerSymbolInputProps} from '@components/NumberComposer';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type * as NativeNavigation from '@react-navigation/native';

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

const INPUT_TEST_ID = 'number-composer-input';

type RootProps = {
    value?: string;
    allowNegative?: boolean;
    decimals?: number;
    maxLength?: number;
    errorText?: string;
    onBlur?: jest.Mock;
    onInputChange?: jest.Mock;
    ref?: React.Ref<BaseTextInputRef>;
    numberFormRef?: React.Ref<NumberComposerRef>;
};

function SignControls() {
    const {clearSign, toggleSign} = useNumberComposerActions();

    return (
        <>
            <PressableWithFeedback
                accessibilityLabel="Toggle sign"
                accessibilityRole="button"
                testID="ctx-toggleSign"
                onPress={toggleSign}
            />
            <PressableWithFeedback
                accessibilityLabel="Clear sign"
                accessibilityRole="button"
                testID="ctx-clearSign"
                onPress={clearSign}
            />
        </>
    );
}

function renderSymbolInput(inputProps: Partial<NumberComposerSymbolInputProps> = {}, rootProps: RootProps = {}, extraChildren: React.ReactNode = null) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberComposer {...rootProps}>
                <NumberComposer.SymbolInput
                    testID={INPUT_TEST_ID}
                    {...inputProps}
                />
                {extraChildren}
            </NumberComposer>
        </ComposeProviders>,
    );
}

describe('NumberComposer.SymbolInput', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders a symbol and the value', async () => {
        // Given a SymbolInput with a prefix symbol and a formatted value
        renderSymbolInput({symbol: '$', position: 'prefix'}, {value: '12.50', decimals: 2});
        await waitForBatchedUpdatesWithAct();

        // Then the symbol and value are displayed
        expect(screen.getByText('$')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('12.50')).toBeOnTheScreen();
    });

    it('renders a signed value as a magnitude with a separate minus and preserves the sign on edits', async () => {
        const onInputChange = jest.fn();

        // Given a signed canonical value
        renderSymbolInput({symbol: '$'}, {value: '-12.50', allowNegative: true, decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // Then the minus is rendered separately from the native input value
        expect(screen.getByText('-')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('12.50')).toBeOnTheScreen();

        // When the magnitude changes, the canonical signed value is notified
        fireEvent.changeText(screen.getByDisplayValue('12.50'), '13.50');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).toHaveBeenLastCalledWith('-13.50');
        expect(screen.getByDisplayValue('13.50')).toBeOnTheScreen();
    });

    it('normalizes spaces and comma separators before notifying the root', async () => {
        const onInputChange = jest.fn();

        // Given an empty SymbolInput
        renderSymbolInput({symbol: '$'}, {decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value with spaces and comma separators
        fireEvent.changeText(screen.getByDisplayValue(''), '1 2,5');
        await waitForBatchedUpdatesWithAct();

        // Then the value is normalized before notifying the root
        expect(onInputChange).toHaveBeenLastCalledWith('12.5');
        expect(screen.getByDisplayValue('12.5')).toBeOnTheScreen();
    });

    it('pads a leading comma to "0." like a leading period', async () => {
        const onInputChange = jest.fn();

        // Given an empty SymbolInput with two decimal places
        renderSymbolInput({symbol: '$'}, {decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When a lone comma decimal separator is entered
        fireEvent.changeText(screen.getByDisplayValue(''), ',');
        await waitForBatchedUpdatesWithAct();

        // Then it is normalized to a leading zero and period (unified controller pipeline; the legacy symbol path rejected it)
        expect(onInputChange).toHaveBeenLastCalledWith('0.');
        expect(screen.getByDisplayValue('0.')).toBeOnTheScreen();
    });

    it('rejects values that exceed the configured decimal precision', async () => {
        const onInputChange = jest.fn();

        // Given a SymbolInput with zero decimal places and value "12"
        renderSymbolInput({}, {value: '12', decimals: 0, onInputChange});
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

        // Given a SymbolInput with negative input disabled and value "12"
        renderSymbolInput({}, {value: '12', decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a negative value
        fireEvent.changeText(screen.getByDisplayValue('12'), '-12');
        await waitForBatchedUpdatesWithAct();

        // Then the change is rejected and the value stays "12"
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
    });

    it('rejects "-." when negative input is enabled', async () => {
        const onInputChange = jest.fn();

        // Given an empty SymbolInput that allows negative input
        renderSymbolInput({}, {allowNegative: true, decimals: 2, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When an incomplete negative decimal is entered
        fireEvent.changeText(screen.getByDisplayValue(''), '-.');
        await waitForBatchedUpdatesWithAct();

        // Then the invalid value is rejected
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('')).toBeOnTheScreen();
    });

    it('uses maxLength for integer validation without forwarding it to the native input', async () => {
        // Given maxLength set for integer validation on the root
        renderSymbolInput({symbol: '$'}, {value: '12345678.99', decimals: 2, maxLength: 8});
        await waitForBatchedUpdatesWithAct();

        // Then maxLength is not forwarded to the native input
        expect(screen.getByDisplayValue('12345678.99').props.maxLength).toBeUndefined();
    });

    it('strips decimals at mount when a signed value is invalid for the decimals prop', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();
        const onInputChange = jest.fn();

        // Given a signed value mounted with more decimal places than the root allows
        renderSymbolInput({}, {value: '-1.25', allowNegative: true, decimals: 0, numberFormRef, onInputChange});
        await waitForBatchedUpdatesWithAct();

        // Then the decimals are stripped at mount, the sign is preserved, and the parent is notified
        expect(screen.getByDisplayValue('1')).toBeOnTheScreen();
        expect(screen.getByText('-')).toBeOnTheScreen();
        expect(numberFormRef.current?.getNumber()).toBe('-1');
        expect(onInputChange).toHaveBeenLastCalledWith('-1');
    });

    it('forwards blur and the text-input ref', async () => {
        const inputRef = React.createRef<BaseTextInputRef>();
        const onBlur = jest.fn();

        // Given a SymbolInput with onBlur and a ref on the root
        renderSymbolInput({symbol: '$'}, {value: '10', onBlur, ref: inputRef});
        await waitForBatchedUpdatesWithAct();

        expect(inputRef.current).toBeTruthy();

        // When the input blurs
        fireEvent(screen.getByDisplayValue('10'), 'blur');

        // Then onBlur is forwarded to the root
        expect(onBlur).toHaveBeenCalledTimes(1);
    });
});

describe('NumberComposer imperative API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('getNumber returns the canonical signed value and updateNumber stores it without notifying', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();
        const onInputChange = jest.fn();

        // Given a SymbolInput with a signed value
        renderSymbolInput({}, {value: '-10', allowNegative: true, decimals: 2, numberFormRef, onInputChange});
        await waitForBatchedUpdatesWithAct();

        expect(numberFormRef.current?.getNumber()).toBe('-10');

        // When updateNumber pushes a signed value
        act(() => {
            numberFormRef.current?.updateNumber('-25');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the canonical value keeps its sign, the input renders the magnitude with the caret after it,
        // and onInputChange is not called
        expect(numberFormRef.current?.getNumber()).toBe('-25');
        expect(screen.getByText('-')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('25')).toBeOnTheScreen();
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 2, end: 2});
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('updateNumber bypasses validation', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();

        // Given a SymbolInput with zero decimal places
        renderSymbolInput({}, {value: '10', decimals: 0, numberFormRef});
        await waitForBatchedUpdatesWithAct();

        // When updateNumber pushes a value that user input validation would reject
        act(() => {
            numberFormRef.current?.updateNumber('12.345');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the value is stored as-is
        expect(numberFormRef.current?.getNumber()).toBe('12.345');
        expect(screen.getByDisplayValue('12.345')).toBeOnTheScreen();
    });

    it('does not preserve a sign installed by updateNumber through edits when negative input is disabled', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();
        const onInputChange = jest.fn();

        // Given negative input disabled and a signed value pushed through the updateNumber validation bypass
        renderSymbolInput({}, {value: '5', decimals: 2, numberFormRef, onInputChange});
        await waitForBatchedUpdatesWithAct();

        act(() => {
            numberFormRef.current?.updateNumber('-5');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the bypassed value is stored as-is per the updateNumber contract
        expect(numberFormRef.current?.getNumber()).toBe('-5');
        expect(screen.getByText('-')).toBeOnTheScreen();

        // When the user edits the magnitude
        fireEvent.changeText(screen.getByDisplayValue('5'), '56');
        await waitForBatchedUpdatesWithAct();

        // Then the sign is not re-attached because negative values are not allowed
        expect(numberFormRef.current?.getNumber()).toBe('56');
        expect(onInputChange).toHaveBeenLastCalledWith('56');
        expect(screen.queryByText('-')).not.toBeOnTheScreen();
    });

    it('clearSelection collapses the selection onto its end', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();

        // Given a SymbolInput with a range selection
        renderSymbolInput({}, {value: '1234', decimals: 2, numberFormRef});
        await waitForBatchedUpdatesWithAct();

        fireEvent(screen.getByTestId(INPUT_TEST_ID), 'selectionChange', {
            nativeEvent: {selection: {start: 1, end: 3}},
        });
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 1, end: 3});

        // When clearSelection is called imperatively
        act(() => {
            numberFormRef.current?.clearSelection();
        });
        await waitForBatchedUpdatesWithAct();

        // Then the selection collapses onto its end
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 3, end: 3});
    });
});

describe('NumberComposer sign ownership', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('clears the sign when backspace is pressed on an empty negative magnitude', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();
        const onInputChange = jest.fn();

        // Given a lone negative sign (empty magnitude)
        renderSymbolInput({}, {value: '-', allowNegative: true, decimals: 2, numberFormRef, onInputChange});
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('-')).toBeOnTheScreen();

        // When backspace is pressed on the empty magnitude
        fireEvent(screen.getByTestId(INPUT_TEST_ID), 'keyPress', {nativeEvent: {key: 'Backspace'}});
        await waitForBatchedUpdatesWithAct();

        // Then the sign is cleared and the parent is notified
        expect(numberFormRef.current?.getNumber()).toBe('');
        expect(onInputChange).toHaveBeenLastCalledWith('');
        expect(screen.queryByText('-')).not.toBeOnTheScreen();
    });

    it('does not clear the value when backspace is pressed and the value is not negative', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();

        // Given a non-negative value
        renderSymbolInput({}, {value: '5', decimals: 2, numberFormRef});
        await waitForBatchedUpdatesWithAct();

        // When backspace is pressed
        fireEvent(screen.getByTestId(INPUT_TEST_ID), 'keyPress', {nativeEvent: {key: 'Backspace'}});
        await waitForBatchedUpdatesWithAct();

        // Then the value is unchanged
        expect(numberFormRef.current?.getNumber()).toBe('5');
    });

    it('toggleSign flips the sign of a non-empty value and notifies the parent', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();
        const onInputChange = jest.fn();

        // Given a positive value and the sign controls
        renderSymbolInput({}, {value: '5', allowNegative: true, decimals: 2, numberFormRef, onInputChange}, <SignControls />);
        await waitForBatchedUpdatesWithAct();

        // When the sign is toggled
        fireEvent.press(screen.getByTestId('ctx-toggleSign'));
        await waitForBatchedUpdatesWithAct();

        // Then the canonical value flips negative, the magnitude stays, and the parent is notified
        expect(numberFormRef.current?.getNumber()).toBe('-5');
        expect(onInputChange).toHaveBeenLastCalledWith('-5');
        expect(screen.getByText('-')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('5')).toBeOnTheScreen();

        // When the sign is toggled again
        fireEvent.press(screen.getByTestId('ctx-toggleSign'));
        await waitForBatchedUpdatesWithAct();

        // Then the canonical value flips back
        expect(numberFormRef.current?.getNumber()).toBe('5');
        expect(onInputChange).toHaveBeenLastCalledWith('5');
        expect(screen.queryByText('-')).not.toBeOnTheScreen();
    });

    it('clearSign removes only the sign, keeping the magnitude, and notifies the parent', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();
        const onInputChange = jest.fn();

        // Given a negative value and the sign controls
        renderSymbolInput({}, {value: '-5', allowNegative: true, decimals: 2, numberFormRef, onInputChange}, <SignControls />);
        await waitForBatchedUpdatesWithAct();

        // When the sign is cleared
        fireEvent.press(screen.getByTestId('ctx-clearSign'));
        await waitForBatchedUpdatesWithAct();

        // Then only the sign is removed and the parent is notified
        expect(numberFormRef.current?.getNumber()).toBe('5');
        expect(onInputChange).toHaveBeenLastCalledWith('5');
        expect(screen.queryByText('-')).not.toBeOnTheScreen();
        expect(screen.getByDisplayValue('5')).toBeOnTheScreen();

        // When the sign is cleared again on a non-negative value
        fireEvent.press(screen.getByTestId('ctx-clearSign'));
        await waitForBatchedUpdatesWithAct();

        // Then nothing changes and the parent is not notified again
        expect(numberFormRef.current?.getNumber()).toBe('5');
        expect(onInputChange).toHaveBeenCalledTimes(1);
    });

    it('toggleSign on an empty value places the caret after the minus so the next digit becomes negative', async () => {
        const numberFormRef = React.createRef<NumberComposerRef>();
        const onInputChange = jest.fn();

        // Given an empty value and the sign controls
        renderSymbolInput({}, {allowNegative: true, decimals: 2, numberFormRef, onInputChange}, <SignControls />);
        await waitForBatchedUpdatesWithAct();

        // When the sign is toggled
        fireEvent.press(screen.getByTestId('ctx-toggleSign'));
        await waitForBatchedUpdatesWithAct();

        // Then the canonical value is a lone minus, rendered separately, with the caret on the empty magnitude
        expect(numberFormRef.current?.getNumber()).toBe('-');
        expect(screen.getByText('-')).toBeOnTheScreen();
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 0, end: 0});

        // When the user types the next digit
        fireEvent.changeText(screen.getByDisplayValue(''), '5');
        await waitForBatchedUpdatesWithAct();

        // Then the digit becomes a negative amount and the caret follows it
        expect(onInputChange).toHaveBeenLastCalledWith('-5');
        expect(numberFormRef.current?.getNumber()).toBe('-5');
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 1, end: 1});
    });
});

describe('NumberComposer external value synchronization', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('clears the value and collapses the selection when the root value resets externally', async () => {
        // Given a SymbolInput with a signed value and the caret at the end
        const {rerender} = renderSymbolInput({}, {value: '-1234', allowNegative: true, decimals: 2});
        await waitForBatchedUpdatesWithAct();

        fireEvent(screen.getByTestId(INPUT_TEST_ID), 'selectionChange', {
            nativeEvent: {selection: {start: 4, end: 4}},
        });
        await waitForBatchedUpdatesWithAct();

        // When the root value resets externally to an empty string
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumberComposer
                    value=""
                    allowNegative
                    decimals={2}
                >
                    <NumberComposer.SymbolInput testID={INPUT_TEST_ID} />
                </NumberComposer>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the value and sign clear and the selection collapses to the start
        expect(screen.getByDisplayValue('')).toBeOnTheScreen();
        expect(screen.queryByText('-')).not.toBeOnTheScreen();
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 0, end: 0});
    });

    it('keeps the displayed value when the root value changes externally to another non-empty value', async () => {
        // Given a SymbolInput with value "1234"
        const {rerender} = renderSymbolInput({}, {value: '1234', decimals: 2});
        await waitForBatchedUpdatesWithAct();

        // When the root value changes externally to "12"
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumberComposer
                    value="12"
                    decimals={2}
                >
                    <NumberComposer.SymbolInput testID={INPUT_TEST_ID} />
                </NumberComposer>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the editing state is preserved; external pushes must use updateNumber
        expect(screen.getByDisplayValue('1234')).toBeOnTheScreen();
    });
});
