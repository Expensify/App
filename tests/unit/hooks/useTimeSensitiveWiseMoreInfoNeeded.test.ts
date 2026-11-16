/* eslint-disable @typescript-eslint/naming-convention -- BankAccountList is keyed by numeric bank account IDs */
import {wiseMoreInfoNeededBankAccountsSelector} from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveWiseMoreInfoNeeded';

import CONST from '@src/CONST';
import type {BankAccount, BankAccountList} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import createMock from '../../utils/createMock';

function makeBankAccount(bankAccountID: number, accountNumber: string, status?: ValueOf<typeof CONST.WISE.ONBOARDING_STATUS>): BankAccount {
    return createMock<BankAccount>({
        bankCurrency: CONST.CURRENCY.USD,
        accountData: {
            bankAccountID,
            accountNumber,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            additionalData: {currency: CONST.CURRENCY.USD, wise: {status}},
        },
    });
}

describe('wiseMoreInfoNeededBankAccountsSelector', () => {
    it('returns only the accounts Wise asked for more info on, with their last four digits', () => {
        // Given one account Wise asked for more info on, one in review and one that never started the onboarding
        const bankAccountList = createMock<BankAccountList>({
            1: makeBankAccount(1, 'XXXXXX1234', CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED),
            2: makeBankAccount(2, 'XXXXXX5678', CONST.WISE.ONBOARDING_STATUS.IN_REVIEW),
            3: makeBankAccount(3, 'XXXXXX9012'),
        });

        // When Home picks the accounts for the "Verify bank account" task
        const bankAccounts = wiseMoreInfoNeededBankAccountsSelector(bankAccountList);

        // Then only the first account gets a task, named by its last four digits like in the design
        expect(bankAccounts).toEqual([{bankAccountID: 1, bankAccountLastFour: '1234'}]);
    });

    it('returns nothing when there is no bank account list', () => {
        // Given a user whose bank accounts are not loaded
        // When Home picks the accounts for the "Verify bank account" task
        // Then there are none, so the Time sensitive section shows no task
        expect(wiseMoreInfoNeededBankAccountsSelector(undefined)).toEqual([]);
    });
});
