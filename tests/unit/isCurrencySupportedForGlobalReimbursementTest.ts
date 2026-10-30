import {isCurrencySupportedForGlobalReimbursement} from '@libs/actions/Policy/Policy';

import CONST from '@src/CONST';

describe('isCurrencySupportedForGlobalReimbursement', () => {
    it.each(CONST.DIRECT_REIMBURSEMENT_CURRENCIES)('accepts configured currency %s', (currency) => {
        // Given a currency configured for global reimbursement.
        // When the production membership helper checks it.
        // Then it is accepted without changing the supported set.
        expect(isCurrencySupportedForGlobalReimbursement(currency)).toBe(true);
    });

    it.each([undefined, '', 'JPY', 'usd', 'USD,AUD'])('rejects unconfigured currency %s', (currency) => {
        // Given a missing, empty, unsupported, case-changed, or combined currency.
        // When the production membership helper checks it.
        // Then only an exact configured member can pass.
        expect(isCurrencySupportedForGlobalReimbursement(currency)).toBe(false);
    });
});
