import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumberForm from '@components/NumberForm';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type ShouldIgnoreSelectionWhenUpdatedManually from '@libs/shouldIgnoreSelectionWhenUpdatedManually/types';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/shouldIgnoreSelectionWhenUpdatedManually', () => ({
    ...jest.requireActual<{default: ShouldIgnoreSelectionWhenUpdatedManually}>('@libs/shouldIgnoreSelectionWhenUpdatedManually'),
    __esModule: true,
    default: true,
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

const INPUT_TEST_ID = 'number-form-text-input';

function getInput() {
    return screen.getByTestId(INPUT_TEST_ID);
}

function renderTextInput(onInputChange: jest.Mock) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumberForm
                value="12"
                onInputChange={onInputChange}
            >
                <NumberForm.TextInput
                    decimals={2}
                    testID={INPUT_TEST_ID}
                />
            </NumberForm>
        </ComposeProviders>,
    );
}

// `shouldIgnoreSelectionWhenUpdatedManually` is `true` on native only, so this suite mocks it for the whole file the way
// NumberWithSymbolFormTest does. It mirrors that suite's "ignores the selection change once after a validated changeText
// update" case, which is the contract the legacy `setFormattedNumber` had: setNumber raises the flag and only
// handleSelectionChange clears it, so exactly one stale native selection event is dropped.
describe('NumberForm.TextInput native selection guard', () => {
    it('ignores the selection change once after a validated change, then applies the next one', async () => {
        const onInputChange = jest.fn();
        renderTextInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(getInput(), '123');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).toHaveBeenCalledWith('123');
        expect(getInput().props.selection).toEqual({start: 3, end: 3});

        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // Swallowed
        expect(getInput().props.selection).toEqual({start: 3, end: 3});

        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 0, end: 0}}});
        await waitForBatchedUpdatesWithAct();

        // Applied
        expect(getInput().props.selection).toEqual({start: 0, end: 0});
    });

    it('does not swallow a selection change when the value was rejected', async () => {
        const onInputChange = jest.fn();
        renderTextInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(getInput(), '1.234');
        await waitForBatchedUpdatesWithAct();

        expect(onInputChange).not.toHaveBeenCalled();

        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 1}}});
        await waitForBatchedUpdatesWithAct();

        expect(getInput().props.selection).toEqual({start: 1, end: 1});
    });
});
