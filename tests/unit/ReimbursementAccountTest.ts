import {hasCreditBankAccount} from '@src/libs/actions/ReimbursementAccount/store';
import type {BankAccountList} from '@src/types/onyx';

describe('ReimbursementAccountTest', () => {
    describe('hasCreditBankAccount', () => {
        it('should return true if there is a credit bank account', () => {
            const BANK_ACCOUNT_LIST: BankAccountList = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {accountData: {defaultCredit: true}, bankCurrency: 'USD', bankCountry: 'US'},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '2': {accountData: {defaultCredit: false}, bankCurrency: 'USD', bankCountry: 'US'},
            };

            const result = hasCreditBankAccount(BANK_ACCOUNT_LIST);
            expect(result).toBe(true);
        });

        it('should return false if there is no credit bank account', () => {
            const BANK_ACCOUNT_LIST: BankAccountList = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {accountData: {defaultCredit: false}, bankCurrency: 'USD', bankCountry: 'US'},
            };

            const result = hasCreditBankAccount(BANK_ACCOUNT_LIST);
            expect(result).toBe(false);
        });

        it('should return false if there is no bank account list', () => {
            const result = hasCreditBankAccount(undefined);
            expect(result).toBe(false);
        });
    });
});
