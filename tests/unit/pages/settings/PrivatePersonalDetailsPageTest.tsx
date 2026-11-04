import {act, render} from '@testing-library/react-native';

import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';

import useOnyx from '@hooks/useOnyx';

import {setDraftValues} from '@libs/actions/FormActions';

import PrivatePersonalDetailsPage from '@pages/settings/Profile/PersonalDetails/PrivatePersonalDetailsPage';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

import React from 'react';

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@react-navigation/native', () => ({useRoute: () => ({params: {}})}));
jest.mock('@libs/actions/FormActions', () => ({setDraftValues: jest.fn(), clearDraftValues: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@components/Form/FormProvider', () => jest.fn(({children}: React.PropsWithChildren) => children));
jest.mock('@components/Form/InputWrapper', () => jest.fn(() => null));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/DelegateNoAccessWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/AddressSearch', () => () => null);
jest.mock('@components/CountrySelector', () => () => null);
jest.mock('@components/DatePicker', () => () => null);
jest.mock('@components/StateSelector', () => () => null);
jest.mock('@components/TextInput', () => () => null);
jest.mock('@components/Text', () => () => null);
jest.mock('@components/FullscreenLoadingIndicator', () => () => null);

function getInputProps(inputID: string) {
    return jest.mocked(InputWrapper).mock.calls.findLast(([props]) => props.inputID === inputID)?.[0];
}

describe('PrivatePersonalDetailsPage state validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useOnyx).mockImplementation((key) => {
            if (key === ONYXKEYS.IS_LOADING_APP) {
                return [false, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM_DRAFT) {
                return [{country: 'US', state: 'CA'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('clears a foreign state from the selector and draft when switching back to the US', () => {
        // Given a US address that the user changes to a UK address with a free-text state
        render(<PrivatePersonalDetailsPage />);
        act(() => getInputProps(INPUT_IDS.COUNTRY)?.onValueChange?.('GB', INPUT_IDS.COUNTRY));
        act(() => getInputProps(INPUT_IDS.STATE)?.onValueChange?.('London', INPUT_IDS.STATE));
        expect(getInputProps(INPUT_IDS.STATE)?.value).toBe('London');

        // When the country changes back to US without selecting a US state
        act(() => getInputProps(INPUT_IDS.COUNTRY)?.onValueChange?.('US', INPUT_IDS.COUNTRY));

        // Then neither the selector nor the submission draft retains the hidden UK value
        expect(getInputProps(INPUT_IDS.STATE)?.value).toBe('');
        expect(setDraftValues).toHaveBeenLastCalledWith(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM, {[INPUT_IDS.STATE]: ''});
        const validate = jest.mocked(FormProvider).mock.lastCall?.[0].validate;
        expect(validate?.({country: 'US', state: ''}, jest.fn())).toHaveProperty(INPUT_IDS.STATE, 'common.error.fieldRequired');
    });

    it.each(['CA', 'California'])('preserves %s as a valid US code in the selector and draft', (state) => {
        // Given a non-US address whose state can resolve to a US state
        render(<PrivatePersonalDetailsPage />);
        act(() => getInputProps(INPUT_IDS.COUNTRY)?.onValueChange?.('GB', INPUT_IDS.COUNTRY));
        act(() => getInputProps(INPUT_IDS.STATE)?.onValueChange?.(state, INPUT_IDS.STATE));

        // When the user selects US
        act(() => getInputProps(INPUT_IDS.COUNTRY)?.onValueChange?.('US', INPUT_IDS.COUNTRY));

        // Then the visible selection and submission draft agree on the valid code
        expect(getInputProps(INPUT_IDS.STATE)?.value).toBe('CA');
        expect(setDraftValues).toHaveBeenLastCalledWith(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM, {[INPUT_IDS.STATE]: 'CA'});
    });

    it('still clears the US state when switching to a non-US country', () => {
        // Given a selected US state
        render(<PrivatePersonalDetailsPage />);

        // When the user changes the country to UK
        act(() => getInputProps(INPUT_IDS.COUNTRY)?.onValueChange?.('GB', INPUT_IDS.COUNTRY));

        // Then the previous US selection cannot leak into the UK address
        expect(getInputProps(INPUT_IDS.STATE)?.value).toBe('');
        expect(setDraftValues).toHaveBeenLastCalledWith(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM, {[INPUT_IDS.STATE]: ''});
    });

    it.each(['', 'London', 'California', 'toString'])('rejects the invalid US state "%s" before submission', (state) => {
        // Given a form whose state may contain an invalid persisted or draft value
        render(<PrivatePersonalDetailsPage />);
        const validate = jest.mocked(FormProvider).mock.lastCall?.[0].validate;

        // When validating it as a US address
        const errors = validate?.({country: 'US', state}, jest.fn());

        // Then validation flags the state instead of allowing the verification-code flow
        expect(errors).toHaveProperty(INPUT_IDS.STATE, 'common.error.fieldRequired');
    });

    it.each([
        ['US', 'CA'],
        ['GB', 'London'],
    ])('accepts state %s / %s', (country, state) => {
        // Given a valid state for the selected country
        render(<PrivatePersonalDetailsPage />);
        const validate = jest.mocked(FormProvider).mock.lastCall?.[0].validate;

        // When validating the address
        const errors = validate?.({country, state}, jest.fn());

        // Then US codes and non-US free text remain supported
        expect(errors).not.toHaveProperty(INPUT_IDS.STATE);
    });
});
