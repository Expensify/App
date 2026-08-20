import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumberForm from '@components/NumberForm';
import type {NumberFormRef, NumberFormSymbolInputProps, NumberFormTextInputProps} from '@components/NumberForm';
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
    errorText?: string;
    onBlur?: jest.Mock;
    onInputChange?: jest.Mock;
    ref?: React.Ref<BaseTextInputRef>;
    numberFormRef?: React.Ref<NumberFormRef>;
};

function renderSymbolInput(inputProps: Partial<NumberFormSymbolInputProps> = {}, rootProps: RootProps = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberForm {...rootProps}>
                <NumberForm.SymbolInput {...inputProps} />
            </NumberForm>
        </ComposeProviders>,
    );
}

function renderTextInput(inputProps: Partial<NumberFormTextInputProps> = {}, rootProps: RootProps = {}) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberForm {...rootProps}>
                <NumberForm.TextInput {...inputProps} />
            </NumberForm>
        </ComposeProviders>,
    );
}

const INPUT_TEST_ID = 'number-form-input';

type FocusInputType = 'symbol' | 'text';

function FocusInput({inputType}: {inputType: FocusInputType}) {
    if (inputType === 'symbol') {
        return <NumberForm.SymbolInput testID={INPUT_TEST_ID} />;
    }

    return <NumberForm.TextInput testID={INPUT_TEST_ID} />;
}

function FocusInputForm({inputType}: {inputType: FocusInputType}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberForm value="1234">
                <FocusInput inputType={inputType} />
            </NumberForm>
        </ComposeProviders>
    );
}

// selectionForRender is new NumberForm logic: it clamps the selection passed to the input at render time.
// NumberWithSymbolForm only clamped selection inside handleSelectionChange and passed raw `selection` to the input.
describe('NumberForm selection handling', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('clamps the rendered selection when the root value shrinks externally (SymbolInput)', async () => {
        // Given a SymbolInput with value "1234" and the caret at the end
        const {rerender} = renderSymbolInput({testID: INPUT_TEST_ID, decimals: 2}, {value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);

        fireEvent(input, 'selectionChange', {
            nativeEvent: {selection: {start: 4, end: 4}},
        });
        await waitForBatchedUpdatesWithAct();

        expect(input.props.selection).toEqual({start: 4, end: 4});

        // When the root value shrinks externally to "12"
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumberForm value="12">
                    <NumberForm.SymbolInput
                        testID={INPUT_TEST_ID}
                        decimals={2}
                    />
                </NumberForm>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the rendered selection is clamped to the new value length
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 2, end: 2});
    });

    it('clamps the rendered selection when the root value shrinks externally (TextInput)', async () => {
        // Given a TextInput with value "1234" and the caret at the end
        const {rerender} = renderTextInput({testID: INPUT_TEST_ID, decimals: 2}, {value: '1234'});
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);

        fireEvent(input, 'selectionChange', {
            nativeEvent: {selection: {start: 4, end: 4}},
        });
        await waitForBatchedUpdatesWithAct();

        // When the root value shrinks externally to "12"
        rerender(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <NumberForm value="12">
                    <NumberForm.TextInput
                        testID={INPUT_TEST_ID}
                        decimals={2}
                    />
                </NumberForm>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the rendered selection is clamped to the new value length
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 2, end: 2});
    });
});

describe('NumberForm navigation focus selection handling', () => {
    afterEach(() => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(true);
    });

    it.each<FocusInputType>(['symbol', 'text'])('clears the selection when focus is regained (%s)', async (inputType) => {
        // Given an input with a partial text selection
        const {rerender} = render(<FocusInputForm inputType={inputType} />);
        await waitForBatchedUpdatesWithAct();

        const input = screen.getByTestId(INPUT_TEST_ID);
        fireEvent(input, 'selectionChange', {
            nativeEvent: {selection: {start: 1, end: 3}},
        });
        await waitForBatchedUpdatesWithAct();

        expect(input.props.selection).toEqual({start: 1, end: 3});

        // When the screen loses focus and then regains it
        mockUseIsFocused.mockReturnValue(false);
        rerender(<FocusInputForm inputType={inputType} />);
        await waitForBatchedUpdatesWithAct();

        mockUseIsFocused.mockReturnValue(true);
        rerender(<FocusInputForm inputType={inputType} />);
        await waitForBatchedUpdatesWithAct();

        // Then the selection collapses to the end of the value
        expect(screen.getByTestId(INPUT_TEST_ID).props.selection).toEqual({start: 3, end: 3});
    });
});

describe('NumberForm.SymbolInput', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders a symbol and the canonical value', async () => {
        // Given a SymbolInput with a prefix symbol and a formatted value
        renderSymbolInput({symbol: '$', position: 'prefix', decimals: 2}, {value: '12.50'});
        await waitForBatchedUpdatesWithAct();

        // Then the symbol and canonical value are displayed
        expect(screen.getByText('$')).toBeOnTheScreen();
        expect(screen.getByDisplayValue('12.50')).toBeOnTheScreen();
    });

    it('renders a signed value without its minus in the native input and preserves the sign on edits', async () => {
        const onInputChange = jest.fn();

        // Given a signed value and negative input enabled
        renderSymbolInput({symbol: '$', position: 'prefix', decimals: 2}, {value: '-12.50', allowNegative: true, onInputChange});
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

    it('uses maxLength for integer validation without forwarding it to the native input', async () => {
        // Given a SymbolInput with maxLength set for integer validation
        renderSymbolInput({symbol: '$', decimals: 2, maxLength: 8}, {value: '12345678.99'});
        await waitForBatchedUpdatesWithAct();

        // Then maxLength is not forwarded to the native input
        expect(screen.getByDisplayValue('12345678.99').props.maxLength).toBeUndefined();
    });

    it('normalizes spaces and comma separators before notifying the root', async () => {
        const onInputChange = jest.fn();

        // Given an empty SymbolInput
        renderSymbolInput({symbol: '$', decimals: 2}, {onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value with spaces and comma separators
        fireEvent.changeText(screen.getByDisplayValue(''), '1 2,5');
        await waitForBatchedUpdatesWithAct();

        // Then the value is normalized before notifying the root
        expect(onInputChange).toHaveBeenLastCalledWith('12.5');
        expect(screen.getByDisplayValue('12.5')).toBeOnTheScreen();
    });

    it('rejects values that exceed the configured decimal precision', async () => {
        const onInputChange = jest.fn();

        // Given a SymbolInput with zero decimal places and value "12"
        renderSymbolInput({decimals: 0}, {value: '12', onInputChange});
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
        renderSymbolInput({decimals: 2}, {value: '12', onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a negative value
        fireEvent.changeText(screen.getByDisplayValue('12'), '-12');
        await waitForBatchedUpdatesWithAct();

        // Then the change is rejected and the value stays "12"
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('12')).toBeOnTheScreen();
    });

    it('exposes the imperative number API without notifying the root on updateNumber', async () => {
        const numberFormRef = React.createRef<NumberFormRef>();
        const onInputChange = jest.fn();

        // Given a SymbolInput with value "10" and a numberFormRef
        renderSymbolInput({symbol: '$'}, {value: '10', numberFormRef, onInputChange});
        await waitForBatchedUpdatesWithAct();

        expect(numberFormRef.current?.getNumber()).toBe('10');

        // When updateNumber is called imperatively
        act(() => {
            numberFormRef.current?.updateNumber('25');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the value updates without notifying onInputChange
        expect(numberFormRef.current?.getNumber()).toBe('25');
        expect(onInputChange).not.toHaveBeenCalled();
        expect(screen.getByDisplayValue('25')).toBeOnTheScreen();
    });

    it('renders a separate FormHelpMessage and forwards blur and the text-input ref', async () => {
        const inputRef = React.createRef<BaseTextInputRef>();
        const onBlur = jest.fn();

        // Given a SymbolInput with an error message, onBlur, and a ref
        renderSymbolInput({symbol: '$'}, {value: '10', errorText: 'Invalid symbol number', onBlur, ref: inputRef});
        await waitForBatchedUpdatesWithAct();

        expect(inputRef.current).toBeTruthy();
        expect(screen.getByText('Invalid symbol number')).toBeOnTheScreen();

        // When the input blurs
        fireEvent(screen.getByDisplayValue('10'), 'blur');

        // Then onBlur is forwarded to the root
        expect(onBlur).toHaveBeenCalledTimes(1);
    });
});

describe('NumberForm.TextInput', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('adds a leading zero when the value begins with a decimal separator', async () => {
        const onInputChange = jest.fn();

        // Given an empty TextInput
        renderTextInput({decimals: 2}, {onInputChange});
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value starting with a decimal separator
        fireEvent.changeText(screen.getByDisplayValue(''), '.5');
        await waitForBatchedUpdatesWithAct();

        // Then a leading zero is added
        expect(onInputChange).toHaveBeenLastCalledWith('0.5');
        expect(screen.getByDisplayValue('0.5')).toBeOnTheScreen();
    });

    it('uses maxLength for integer validation without forwarding it to the native input', async () => {
        // Given a TextInput with maxLength set for integer validation
        renderTextInput({decimals: 2, maxLength: 8}, {value: '12345678.99'});
        await waitForBatchedUpdatesWithAct();

        // Then maxLength is not forwarded to the native input
        expect(screen.getByDisplayValue('12345678.99').props.maxLength).toBeUndefined();
    });

    it('renders the inline TextInput error and forwards blur and the text-input ref', async () => {
        const inputRef = React.createRef<BaseTextInputRef>();
        const onBlur = jest.fn();

        // Given a TextInput with an error message, onBlur, and a ref
        renderTextInput({symbol: '$', label: 'Amount'}, {value: '10', errorText: 'Invalid text number', onBlur, ref: inputRef});
        await waitForBatchedUpdatesWithAct();

        expect(inputRef.current).toBeTruthy();
        expect(screen.getByText('Invalid text number')).toBeOnTheScreen();

        // When the input blurs
        fireEvent(screen.getByDisplayValue('10'), 'blur');

        // Then onBlur is forwarded to the root
        expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('exposes the imperative number API', async () => {
        const numberFormRef = React.createRef<NumberFormRef>();

        // Given a TextInput with value "10" and a numberFormRef
        renderTextInput({}, {value: '10', numberFormRef});
        await waitForBatchedUpdatesWithAct();

        expect(numberFormRef.current?.getNumber()).toBe('10');

        // When updateNumber is called imperatively
        act(() => {
            numberFormRef.current?.updateNumber('25');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the value updates in both the ref and the input
        expect(numberFormRef.current?.getNumber()).toBe('25');
        expect(screen.getByDisplayValue('25')).toBeOnTheScreen();
    });
});
