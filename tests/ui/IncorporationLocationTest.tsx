import {act, render} from '@testing-library/react-native';

import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';

import type {SubPageProps} from '@hooks/useSubPage/types';

import IncorporationLocation from '@pages/ReimbursementAccount/NonUSD/BusinessInfo/subSteps/IncorporationLocation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';

import createMock from '../utils/createMock';

const {
    FORMATION_INCORPORATION_COUNTRY_CODE: countryID,
    FORMATION_INCORPORATION_STATE: stateID,
    COMPANY_COUNTRY_CODE: companyCountryID,
    COMPANY_STATE: companyStateID,
} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const mockDraftKey = ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT;
let mockDraft: Partial<ReimbursementAccountForm> = {};

jest.mock('@components/Form/FormProvider', () => jest.fn(({children}: React.PropsWithChildren) => children));
jest.mock('@components/Form/InputWrapper', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({flexGrow1: {}, mh5: {}, mb3: {}, textHeadlineLineHeightXXL: {}})));
jest.mock('@hooks/useReimbursementAccountStepFormSubmit', () => jest.fn(() => jest.fn()));
jest.mock('@hooks/useOnyx', () => jest.fn((key: string) => [key === mockDraftKey ? mockDraft : undefined]));

describe('IncorporationLocation', () => {
    const input = jest.mocked(InputWrapper);
    const form = jest.mocked(FormProvider);
    const props = createMock<SubPageProps>({isEditing: false, onNext: jest.fn(), onMove: jest.fn()});
    const stateInput = () => input.mock.calls.findLast(([item]) => item.inputID === stateID)?.[0];
    const countryInput = () => input.mock.calls.findLast(([item]) => item.inputID === countryID)?.[0];

    beforeEach(() => {
        input.mockClear();
        form.mockClear();
        mockDraft = {};
    });

    it.each([
        {country: CONST.COUNTRY.US, state: 'NY', expected: Object.values(COMMON_CONST.STATES).map(({stateISO, stateName}) => [stateISO, stateName])},
        {country: CONST.COUNTRY.CA, state: 'ON', expected: Object.values(COMMON_CONST.PROVINCES).map(({provinceISO, provinceName}) => [provinceISO, provinceName])},
    ])('uses the $country company location as the incorporation default', ({country, state, expected}) => {
        // Given a company location with no incorporation override.
        mockDraft = {[companyCountryID]: country, [companyStateID]: state};

        // When the page resolves its incorporation defaults, it must use the company location for either country.
        render(<IncorporationLocation {...props} />);

        // Then the real fallback and option construction select the matching state or province.
        expect(countryInput()?.defaultValue).toBe(country);
        expect(stateInput()?.value).toBe(state);
        const stateProps = stateInput();
        expect(Object.entries(stateProps && 'optionsList' in stateProps && typeof stateProps.optionsList === 'object' ? stateProps.optionsList : {})).toEqual(expected);
    });

    it('resets state on country change and omits it for other countries', () => {
        // Given a Canadian company and selected province.
        mockDraft = {[companyCountryID]: CONST.COUNTRY.CA, [companyStateID]: 'ON'};
        render(<IncorporationLocation {...props} />);
        expect(stateInput()?.value).toBe('ON');

        // When the incorporation country changes, the local selection resets.
        act(() => countryInput()?.onValueChange?.(CONST.COUNTRY.US, countryID));
        expect(stateInput()?.value).toBe('');
        expect(Object.keys(form.mock.lastCall?.[0].validate?.(createMock<ReimbursementAccountForm>({[countryID]: CONST.COUNTRY.US, [stateID]: ''}), jest.fn()) ?? {})).toContain(stateID);

        const chooseCountry = countryInput()?.onValueChange;
        input.mockClear();
        act(() => chooseCountry?.(CONST.COUNTRY.GB, countryID));
        // Then the page omits the state selector and no longer requires the state field.
        expect(stateInput()).toBeUndefined();
        expect(Object.keys(form.mock.lastCall?.[0].validate?.(createMock<ReimbursementAccountForm>({[countryID]: CONST.COUNTRY.GB, [stateID]: ''}), jest.fn()) ?? {})).not.toContain(stateID);
    });
});
