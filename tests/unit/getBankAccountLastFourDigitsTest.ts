import getBankAccountLastFourDigits from '@libs/getBankAccountLastFourDigits';

import type {BankAccount} from '@src/types/onyx';

function createBankAccountList(bankAccountID: number, accountNumber?: string): Record<string, BankAccount> {
    return {
        [bankAccountID]: {
            bankCurrency: 'USD',
            bankCountry: 'US',
            accountData: accountNumber ? {accountNumber} : undefined,
        },
    };
}

describe('libs/getBankAccountLastFourDigits', () => {
    it('returns the last four digits of the account the payment names', () => {
        const bankAccountList = createBankAccountList(123, '1234567890');

        expect(getBankAccountLastFourDigits(123, bankAccountList, '9999999999')).toBe('7890');
    });

    it('returns an empty string when the named account is missing from the list, so a multi-VBBA payment never shows the policy account digits', () => {
        const bankAccountList = createBankAccountList(456, '1234567890');

        expect(getBankAccountLastFourDigits(123, bankAccountList, '9999999999')).toBe('');
    });

    it('returns an empty string when the named account carries no account number', () => {
        const bankAccountList = createBankAccountList(123);

        expect(getBankAccountLastFourDigits(123, bankAccountList, '9999999999')).toBe('');
    });

    it('returns an empty string when the payment names an account but the list has not loaded', () => {
        expect(getBankAccountLastFourDigits(123, undefined, '9999999999')).toBe('');
    });

    it("falls back to the workspace's reimbursement account when the payment names no account", () => {
        const bankAccountList = createBankAccountList(123, '1234567890');

        expect(getBankAccountLastFourDigits(undefined, bankAccountList, '9999999999')).toBe('9999');
    });

    it('returns an empty string when the payment names no account and the workspace has none either', () => {
        expect(getBankAccountLastFourDigits(undefined, undefined, undefined)).toBe('');
    });
});
