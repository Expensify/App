import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import NumericInput from '@components/NumericInput';
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
    useIsFocused: jest.fn(() => true),
    useNavigation: jest.fn(() => ({
        navigate: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
    })),
}));

const INPUT_TEST_ID = 'number-composer-input';

function getInput() {
    return screen.getByTestId(INPUT_TEST_ID);
}

function renderSymbolInput(onInputChange: jest.Mock, value = '-12') {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <NumericInput
                value={value}
                allowNegative
                decimals={2}
                onInputChange={onInputChange}
            >
                <NumericInput.SymbolInput testID={INPUT_TEST_ID} />
            </NumericInput>
        </ComposeProviders>,
    );
}

// The Composer instantiates the same shared controller as NumericField but edits the displayed magnitude of a signed
// canonical value. This suite pins the native selection-guard lifecycle under that projection: the stale selection
// event emitted in the same batch as a change is dropped, and a selection change arriving after the commit still
// moves the caret (see the guard lifecycle comment in useNumericInputController).
describe('NumericInput.SymbolInput native selection guard', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('drops the stale selection event emitted in the same batch as a magnitude change', async () => {
        const onInputChange = jest.fn();

        // Given a signed value whose magnitude "12" is displayed
        renderSymbolInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        // When onChangeText and a stale onSelectionChange arrive in the same batch (native behavior fireEvent cannot reproduce)
        const inputProps: {onChangeText?: (text: string) => void; onSelectionChange?: (event: {nativeEvent: {selection: {start: number; end: number}}}) => void} = getInput().props;
        await act(async () => {
            inputProps.onChangeText?.('123');
            inputProps.onSelectionChange?.({nativeEvent: {selection: {start: 0, end: 0}}});
        });

        // Then the signed value updates and the caret moves to the end of the magnitude instead of the stale position
        expect(onInputChange).toHaveBeenCalledWith('-123');
        expect(getInput().props.selection).toEqual({start: 3, end: 3});
    });

    it('applies a selection change that arrives after the change has committed', async () => {
        const onInputChange = jest.fn();

        // Given a signed value whose magnitude "12" is displayed
        renderSymbolInput(onInputChange);
        await waitForBatchedUpdatesWithAct();

        // When the magnitude changes to "123"
        fireEvent.changeText(getInput(), '123');
        await waitForBatchedUpdatesWithAct();

        expect(getInput().props.selection).toEqual({start: 3, end: 3});

        // When a selection change arrives after the update has committed
        fireEvent(getInput(), 'selectionChange', {nativeEvent: {selection: {start: 1, end: 1}}});
        await waitForBatchedUpdatesWithAct();

        // Then the selection is applied
        expect(getInput().props.selection).toEqual({start: 1, end: 1});
    });
});
