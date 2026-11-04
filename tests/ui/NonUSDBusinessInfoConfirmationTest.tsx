import {render} from '@testing-library/react-native';

import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import Confirmation from '@pages/ReimbursementAccount/NonUSD/BusinessInfo/subSteps/Confirmation';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import React from 'react';

let mockValues: Record<string, string> = {};

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@pages/ReimbursementAccount/utils/getSubStepValues', () => () => mockValues);
jest.mock('@components/SubStepForms/ConfirmationStep', () => jest.fn(() => null));

const COUNTRY = INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_COUNTRY_CODE;
const STATE = INPUT_IDS.ADDITIONAL_DATA.CORPAY.FORMATION_INCORPORATION_STATE;
const COMPANY_COUNTRY = INPUT_IDS.ADDITIONAL_DATA.CORPAY.COMPANY_COUNTRY_CODE;

describe('NonUSD business information confirmation', () => {
    beforeEach(() => {
        jest.mocked(ConfirmationStep).mockClear();
        mockValues = {[COMPANY_COUNTRY]: CONST.COUNTRY.US};
    });

    it.each([
        [CONST.COUNTRY.US, 'CA', 'California, United States'],
        [CONST.COUNTRY.CA, 'ON', 'Ontario, Canada'],
        [CONST.COUNTRY.GB, '', 'United Kingdom'],
        [CONST.COUNTRY.US, 'unknown', 'undefined, United States'],
        ['', '', 'undefined'],
    ])('formats incorporation location for country %s and state %s', (country, state, expected) => {
        // Given strings from the reimbursement form, including blank and unknown dictionary keys.
        mockValues = {...mockValues, [COUNTRY]: country, [STATE]: state};

        // When the real Confirmation component prepares its summary.
        render(
            <Confirmation
                onNext={jest.fn()}
                onMove={jest.fn()}
                isEditing={false}
            />,
        );

        // Then its incorporation item retains the state-first and country fallback formatting.
        const summaryItems = jest.mocked(ConfirmationStep).mock.lastCall?.[0].summaryItems;
        expect(summaryItems).toBeDefined();
        expect(summaryItems?.find((item) => item.id === 'incorporation-location')?.title).toBe(expected);
    });
});
