import {render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import TextInputClearButton from '@components/TextInput/TextInputClearButton';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('TextInputClearButton', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
    });

    it('says which field it clears', async () => {
        // Given a clear button next to the Date field
        // When it renders
        render(
            <LocaleContextProvider>
                <TextInputClearButton
                    onPressButton={jest.fn()}
                    fieldLabel="Date"
                />
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdates();

        // Then a screen reader hears what gets cleared, not just "Clear"
        expect(screen.getByLabelText(translateLocal('common.clearField', 'Date'))).toBeOnTheScreen();
    });

    it('falls back to "Clear" for a field without a label', async () => {
        // Given a clear button for a field that has no label
        // When it renders
        render(
            <LocaleContextProvider>
                <TextInputClearButton onPressButton={jest.fn()} />
            </LocaleContextProvider>,
        );
        await waitForBatchedUpdates();

        // Then it still has a name
        expect(screen.getByLabelText(translateLocal('common.clear'))).toBeOnTheScreen();
    });
});
