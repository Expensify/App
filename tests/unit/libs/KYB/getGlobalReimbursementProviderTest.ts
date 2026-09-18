import getGlobalReimbursementProvider from '@libs/KYB/getGlobalReimbursementProvider';

import CONST from '@src/CONST';

describe('getGlobalReimbursementProvider', () => {
    const openUSDBusiness = {
        currency: CONST.CURRENCY.USD,
        accountType: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
        state: CONST.BANK_ACCOUNT.STATE.OPEN,
        hasCorpay: false,
        hasWise: false,
        isWiseUSEnabled: false,
    };

    test('returns CORPAY for an open USD business account that is not yet on Corpay', () => {
        // Given a verified USD business bank account with Global Reimbursements still off
        // When choosing a provider with Wise US KYB disabled
        const provider = getGlobalReimbursementProvider(openUSDBusiness);

        // Then Corpay keeps the existing Enable Global Reimbursements screens
        expect(provider).toBe('CORPAY');
    });

    test('returns WISE when Wise US KYB is enabled and the account is not yet onboarded to Wise', () => {
        // Given the same USD account, but Wise US KYB is turned on
        // When choosing a provider
        const provider = getGlobalReimbursementProvider({
            ...openUSDBusiness,
            isWiseUSEnabled: true,
        });

        // Then Wise is chosen so form 1 can collect bootstrap facts
        expect(provider).toBe('WISE');
    });

    test('hides the entry once Corpay is already onboarded and Wise is off', () => {
        // Given an account that already has Corpay verifications
        // When Wise is not enabled
        const provider = getGlobalReimbursementProvider({
            ...openUSDBusiness,
            hasCorpay: true,
        });

        // Then the wallet menu item must not appear
        expect(provider).toBeNull();
    });

    test('returns null for a non-USD account', () => {
        // Given an open CAD business account
        // When choosing a provider
        const provider = getGlobalReimbursementProvider({
            ...openUSDBusiness,
            currency: CONST.CURRENCY.CAD,
            isWiseUSEnabled: true,
        });

        // Then this helper does not steal Corpay's non-USD VBBA flow
        expect(provider).toBeNull();
    });
});
