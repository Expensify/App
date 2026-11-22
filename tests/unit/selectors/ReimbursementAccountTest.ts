import CONST from '@src/CONST';
import type {BankAccount, BankAccountList} from '@src/types/onyx';

import {hasOtherEligibleBusinessBankAccountsSelector} from '@selectors/ReimbursementAccount';

const CURRENCY = 'USD';

function createBankAccount(methodID: number, overrides?: {currency?: string; state?: string; type?: string; country?: string; provider?: 'CORPAY' | 'WISE'}): BankAccount {
    return {
        methodID,
        bankCurrency: overrides?.currency ?? CURRENCY,
        bankCountry: overrides?.country ?? CONST.COUNTRY.US,
        accountData: {
            state: overrides?.state ?? CONST.BANK_ACCOUNT.STATE.OPEN,
            type: overrides?.type ?? CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            additionalData: overrides?.provider ? {globalReimbursementProvider: overrides.provider} : undefined,
        },
    };
}

describe('hasOtherEligibleBusinessBankAccountsSelector', () => {
    it('returns false when the bank account list is undefined or empty', () => {
        expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, undefined)(undefined)).toBe(false);
        expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, undefined)({})).toBe(false);
    });

    it('returns false when the currency is undefined', () => {
        const bankAccountList: BankAccountList = {a1: createBankAccount(1)};
        expect(hasOtherEligibleBusinessBankAccountsSelector(undefined, undefined)(bankAccountList)).toBe(false);
    });

    it('returns true when there is an open business bank account in the matching currency', () => {
        const bankAccountList: BankAccountList = {a1: createBankAccount(1)};
        expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, undefined)(bankAccountList)).toBe(true);
    });

    it('returns true for partially set up business bank accounts (SETUP, VERIFYING, PENDING)', () => {
        for (const state of [CONST.BANK_ACCOUNT.STATE.SETUP, CONST.BANK_ACCOUNT.STATE.VERIFYING, CONST.BANK_ACCOUNT.STATE.PENDING]) {
            const bankAccountList: BankAccountList = {a1: createBankAccount(1, {state})};
            expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, undefined)(bankAccountList)).toBe(true);
        }
    });

    it('ignores accounts in a non-eligible state (e.g. DELETED)', () => {
        const bankAccountList: BankAccountList = {a1: createBankAccount(1, {state: CONST.BANK_ACCOUNT.STATE.DELETED})};
        expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, undefined)(bankAccountList)).toBe(false);
    });

    it('ignores accounts with a mismatched currency', () => {
        const bankAccountList: BankAccountList = {a1: createBankAccount(1, {currency: 'EUR'})};
        expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, undefined)(bankAccountList)).toBe(false);
    });

    it('ignores personal (non-business) bank accounts', () => {
        const bankAccountList: BankAccountList = {a1: createBankAccount(1, {type: CONST.BANK_ACCOUNT.TYPE.PERSONAL})};
        expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, undefined)(bankAccountList)).toBe(false);
    });

    it('excludes the current bank account by methodID', () => {
        const bankAccountList: BankAccountList = {a1: createBankAccount(1)};
        expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, 1)(bankAccountList)).toBe(false);
    });

    it('returns true when another eligible account exists besides the excluded one', () => {
        const bankAccountList: BankAccountList = {
            a1: createBankAccount(1),
            a2: createBankAccount(2),
        };
        expect(hasOtherEligibleBusinessBankAccountsSelector(CURRENCY, 1)(bankAccountList)).toBe(true);
    });

    it('returns true for an open non-US Corpay account in another currency when the beta is on', () => {
        // Given an open EUR Corpay account outside the US and a NOK workspace
        const bankAccountList: BankAccountList = {a1: createBankAccount(1, {currency: 'EUR', country: 'DE', provider: CONST.GLOBAL_REIMBURSEMENT_PROVIDER.CORPAY})};

        // When the beta is on
        const result = hasOtherEligibleBusinessBankAccountsSelector('NOK', undefined, true)(bankAccountList);

        // Then the account counts as eligible
        expect(result).toBe(true);
    });

    it('returns false for an account in another currency when the beta is off', () => {
        // Given an open EUR Corpay account outside the US and a NOK workspace
        const bankAccountList: BankAccountList = {a1: createBankAccount(1, {currency: 'EUR', country: 'DE', provider: CONST.GLOBAL_REIMBURSEMENT_PROVIDER.CORPAY})};

        // When the beta is off
        const result = hasOtherEligibleBusinessBankAccountsSelector('NOK', undefined)(bankAccountList);

        // Then the currency check rejects the account as before
        expect(result).toBe(false);
    });
});
