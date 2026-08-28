import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericField from '@components/NumericField';
import type {NumericFieldRef} from '@components/NumericField';
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

function renderTextInput(onInputChange: jest.Mock, numericEditingRef?: React.Ref<NumericFieldRef>, value = '12') {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumericField
                value={value}
                decimals={2}
                onInputChange={onInputChange}
                numericEditingRef={numericEditingRef}
            >
                <NumericField.TextInput testID={INPUT_TEST_ID} />
            </NumericField>
        </ComposeProviders>,
    );
}

// Native sets this flag only on native platforms. Mock it here to cover the manual-update guard and late native echoes.
describe('NumericField.TextInput native selection guard', () => {
    afterEach(() => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(true);
    });

    // The same-batch variant of this scenario is covered by the useNumericSelection unit tests.
    it('drops the stale selection event even when it arrives after the change has committed', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with value "12"
        renderTextInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        // When the value changes to "123"
        fireEvent.changeText(getInput(), '123');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).toHaveBeenCalledWith('123');
        expect(getInput().props.selection).toEqual({start: 3, end: 3});

        // When the stale selection event arrives only after the update has committed (async native delivery)
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // Then it is still dropped and the caret stays at the manual position
        expect(getInput().props.selection).toEqual({start: 3, end: 3});

        // When the next selection event arrives (the native echo of the applied update, or a user tap)
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 1}}});
        await waitForBatchedUpdatesWithAct();

        // Then it is applied
        expect(getInput().props.selection).toEqual({start: 1, end: 1});
    });

    it('consumes the guard with the first selection event when setNumber receives the current value', async () => {
        const onInputChange = jest.fn();

        // Given a TextInput with value "12"
        renderTextInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        // When setNumber is called with the same value "12"
        fireEvent.changeText(getInput(), '12');
        await waitForBatchedUpdatesWithAct();

        // Then the first selection event afterward is dropped as the stale one for that update
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();
        expect(getInput().props.selection).toEqual({start: 2, end: 2});

        // And the next selection event is applied because the guard was consumed
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();
        expect(getInput().props.selection).toEqual({start: 0, end: 0});
    });

    it('consumes the guard with the first selection event when updateNumber receives the current value', async () => {
        const onInputChange = jest.fn();
        const numericEditingRef = React.createRef<NumericFieldRef>();

        // Given a TextInput with value "12" and a numericEditingRef
        renderTextInput(onInputChange, numericEditingRef);
        await waitForBatchedUpdatesWithAct();

        // When updateNumber is called with the same value "12"
        act(() => {
            numericEditingRef.current?.updateNumber('12');
        });
        await waitForBatchedUpdatesWithAct();

        // Then the first selection event afterward is dropped as the stale one for that update
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();
        expect(getInput().props.selection).toEqual({start: 2, end: 2});

        // And the next selection event is applied without onInputChange being called
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();
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
