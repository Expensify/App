import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumberForm from '@components/NumberForm';
import type {NumberFormRef} from '@components/NumberForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import * as NativeNavigation from '@react-navigation/native';
import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => ({
    ...jest.requireActual<{default: ShouldIgnoreSelectionWhenUpdatedManually}>('@libs/shouldIgnoreSelectionWhenUpdatedManually'),
    __esModule: true,
    default: true,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

const INPUT_TEST_ID = 'number-form-text-input';
const mockUseIsFocused = jest.mocked(NativeNavigation.useIsFocused);

function getInput() {
    return screen.getByTestId(INPUT_TEST_ID);
}

function renderTextInput(onInputChange: jest.Mock, numberFormRef?: React.Ref<NumberFormRef>, value = '12') {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberForm
                value={value}
                decimals={2}
                onInputChange={onInputChange}
                numberFormRef={numberFormRef}
            >
                <NumberForm.TextInput testID={INPUT_TEST_ID} />
            </NumberForm>
        </ComposeProviders>,
    );
}

// `shouldIgnoreSelectionWhenUpdatedManually` is `true` on native only, so this suite mocks it for the whole file the way
// NumberWithSymbolFormTest does. It pins the legacy `setNewNumber` lifecycle: setNumber raises the flag, the input lowers
// it again once the update commits, so only the stale selection event native emits in the same batch as the change is
// dropped - a selection change arriving later still moves the caret.
describe('NumberForm.TextInput native selection guard', () => {
    afterEach(() => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(true);
    });

    it('drops the stale selection event emitted in the same batch as the change', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with value "12"
        renderTextInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        // When onChangeText and a stale onSelectionChange arrive in the same batch (native behavior fireEvent cannot reproduce)
        const inputProps: {onChangeText?: (text: string) => void; onSelectionChange?: (event: {nativeEvent: {selection: {start: number; end: number}}}) => void} = getInput().props;
        await act(async () => {
            inputProps.onChangeText?.('123');
            inputProps.onSelectionChange?.({nativeEvent: {selection: {start: 0, end: 0}}});
        });

        // Then the value updates and the caret moves to the end instead of the stale position
        expect(onInputChange).toHaveBeenCalledWith('123');
        expect(getInput().props.selection).toEqual({start: 3, end: 3});
    });

    it('applies a selection change that arrives after the change has committed', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with value "12"
        renderTextInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        // When the value changes to "123"
        fireEvent.changeText(getInput(), '123');
        await waitForBatchedUpdatesWithAct();

        expect(getInput().props.selection).toEqual({start: 3, end: 3});

        // When a selection change arrives after the update has committed
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // Then the selection is applied
        expect(getInput().props.selection).toEqual({start: 0, end: 0});
    });

    it('does not leave the guard set when setNumber receives the current value', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with value "12"
        renderTextInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        // When setNumber is called with the same value "12"
        fireEvent.changeText(getInput(), '12');
        await waitForBatchedUpdatesWithAct();

        // When a selection change arrives afterward
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // Then the selection is applied because the guard was not left set
        expect(getInput().props.selection).toEqual({start: 0, end: 0});
    });

    it('does not leave the guard set when updateNumber receives the current value', async () => {
        const onInputChange = jest.fn();
        const numberFormRef = React.createRef<NumberFormRef>();

        // Given a TextInput with value "12" and a numberFormRef
        renderTextInput(onInputChange, numberFormRef);
        await waitForBatchedUpdatesWithAct();

        // When updateNumber is called with the same value "12"
        act(() => {
            numberFormRef.current?.updateNumber('12');
        });
        await waitForBatchedUpdatesWithAct();

        // When a selection change arrives afterward
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // Then the selection is applied and onInputChange is not called
        expect(getInput().props.selection).toEqual({start: 0, end: 0});
        expect(onInputChange).not.toHaveBeenCalled();
    });

    it('does not swallow a selection change when the value was rejected', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with value "12" and two decimal places
        renderTextInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        // When the user enters a value that exceeds decimal precision
        fireEvent.changeText(getInput(), '1.234');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).not.toHaveBeenCalled();

        // When a selection change arrives afterward
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 1}}});
        await waitForBatchedUpdatesWithAct();

        // Then the selection is still applied
        expect(getInput().props.selection).toEqual({start: 1, end: 1});
    });

    it('keeps the caret position when forward-delete removes a character', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with value "123" and the caret before the last two characters
        renderTextInput(onInputChange, undefined, '123');
        await waitForBatchedUpdatesWithAct();

        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 1}}});
        await waitForBatchedUpdatesWithAct();

        // When forward-delete is pressed and the character after the caret is removed
        fireEvent(getInput(), 'keyPress', {nativeEvent: {key: 'Delete'}});
        fireEvent.changeText(getInput(), '13');
        await waitForBatchedUpdatesWithAct();

        // Then the caret stays before the remaining character instead of moving backward
        expect(getInput().props.selection).toEqual({start: 1, end: 1});
    });
});
