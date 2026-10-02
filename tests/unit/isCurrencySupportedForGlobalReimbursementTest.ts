/** Verifies global reimbursement eligibility for currency values received from reports and policies. */
import {isCurrencySupportedForGlobalReimbursement} from '@libs/actions/Policy/Policy';

import CONST from '@src/CONST';

jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: () => false}}));

describe('isCurrencySupportedForGlobalReimbursement', () => {
    it.each(CONST.DIRECT_REIMBURSEMENT_CURRENCIES)('supports reimbursement currency %s', (currency) => {
        // Given a configured reimbursement currency, every caller should be able to check it as a string.
        const currencyValue: string = currency;

        // When the shared helper checks eligibility for that currency.
        const isSupported = isCurrencySupportedForGlobalReimbursement(currencyValue);

        // Then the currency is eligible for global reimbursement.
        expect(isSupported).toBe(true);
    });

    it.each(['JPY', undefined, '', 'usd', 'US', 'USD, EUR'])('rejects unsupported reimbursement currency %s', (currency) => {
        // Given a missing, unsupported, or partial currency value, eligibility requires an exact match.
        // When the shared helper checks that value.
        const isSupported = isCurrencySupportedForGlobalReimbursement(currency);

        // Then unsupported values cannot enable reimbursement options.
        expect(isSupported).toBe(false);
    });
});
