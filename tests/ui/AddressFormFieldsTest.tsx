import {act, render} from '@testing-library/react-native';

import InputWrapper from '@components/Form/InputWrapper';

import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';

import CONST from '@src/CONST';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';

jest.mock('@components/Form/InputWrapper', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({mt3: {}, mt6: {}, mhn5: {}})));

describe('AddressFormFields', () => {
    const wrapper = jest.mocked(InputWrapper);
    const inputs = {street: 'street', state: 'state', country: 'country'};
    const optionsForState = () => {
        const props = wrapper.mock.calls.findLast(([item]) => item.inputID === 'state')?.[0];
        return props && 'optionsList' in props && typeof props.optionsList === 'object' ? props.optionsList : undefined;
    };

    beforeEach(() => wrapper.mockClear());

    it('preserves all US and CA options and switches after a country change', () => {
        // Given the default US address, with the country selector available.
        render(
            <AddressFormFields
                streetTranslationKey="common.city"
                inputKeys={inputs}
                shouldDisplayCountrySelector
                defaultValues={{street: '', city: '', state: '', zipCode: '', country: ''}}
            />,
        );
        const states = Object.values(COMMON_CONST.STATES);
        expect(Object.entries(optionsForState() ?? {})).toEqual(states.map(({stateISO, stateName}) => [stateISO, stateName]));
        const zip = wrapper.mock.calls.findLast(([props]) => props.inputID === 'zipCodeInput')?.[0];
        expect(zip && 'inputMode' in zip ? zip.inputMode : undefined).toBe(CONST.INPUT_MODE.NUMERIC);

        // When the country changes, PushRowWithModal keeps its state-reset contract.
        const country = wrapper.mock.calls.findLast(([props]) => props.inputID === 'country')?.[0];
        expect(country && 'stateInputIDToReset' in country ? country.stateInputIDToReset : undefined).toBe('state');
        act(() => country?.onValueChange?.(CONST.COUNTRY.CA, 'country'));

        // Then the ordered province options and postal-code mode replace the US choices.
        const provinces = Object.values(COMMON_CONST.PROVINCES);
        expect(Object.entries(optionsForState() ?? {})).toEqual(provinces.map(({provinceISO, provinceName}) => [provinceISO, provinceName]));
        const canadianZip = wrapper.mock.calls.findLast(([props]) => props.inputID === 'zipCodeInput')?.[0];
        expect(canadianZip && 'inputMode' in canadianZip ? canadianZip.inputMode : undefined).toBeUndefined();
    });
});
