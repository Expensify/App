import {render} from '@testing-library/react-native';

import PercentageForm from '@components/PercentageForm';
import TextInput from '@components/TextInput';

import React from 'react';

jest.mock('@components/TextInput', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        toLocaleDigit: (digit: string) => digit,
        numberFormat: (number: number) => String(number),
    })),
);
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

describe('PercentageForm', () => {
    const mockedTextInput = jest.mocked(TextInput);

    it('shows the error the form gives it under the input', () => {
        // Given a validation error from the form, as FormProvider passes it
        const errorText = 'Enter a value between 1 and 100';

        // When the percentage input renders
        render(
            <PercentageForm
                value="0"
                errorText={errorText}
            />,
        );

        // Then the text input draws that error, so the user sees why the form cannot be submitted
        expect(mockedTextInput.mock.lastCall?.[0]?.errorText).toBe(errorText);
    });
});
