import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {connectBankAccountManually, connectBankAccountWithPlaid} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';

jest.mock('@libs/API');

const mockWrite = jest.mocked(write);

const policyID = 'policy123';

const selectedPlaidBankAccount: PlaidBankAccount = {
    accountNumber: '123456789',
    plaidAccountID: 'plaid-account-id',
    routingNumber: '021000021',
    mask: '6789',
    plaidAccessToken: 'plaid-access-token',
    bankName: 'Test Bank',
    isSavings: false,
};

describe('BankAccounts', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('connectBankAccountWithPlaid', () => {
        test('sends DEFAULT_NUMBER_ID when bankAccountID is NaN', () => {
            // Given NaN for bankAccountID from the VBBA flow (e.g. undefined achData.bankAccountID)
            // When connecting with Plaid
            connectBankAccountWithPlaid(Number.NaN, selectedPlaidBankAccount, policyID);

            // Then the API payload must not contain NaN
            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, expect.objectContaining({bankAccountID: CONST.DEFAULT_NUMBER_ID}), expect.anything());
        });

        test('passes through finite bankAccountID unchanged', () => {
            const existingID = 4242;
            connectBankAccountWithPlaid(existingID, selectedPlaidBankAccount, policyID);

            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID, expect.objectContaining({bankAccountID: existingID}), expect.anything());
        });
    });

    describe('connectBankAccountManually', () => {
        test('sends DEFAULT_NUMBER_ID when bankAccountID is NaN', () => {
            connectBankAccountManually(Number.NaN, selectedPlaidBankAccount, policyID);

            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY, expect.objectContaining({bankAccountID: CONST.DEFAULT_NUMBER_ID}), expect.anything());
        });

        test('passes through finite bankAccountID unchanged', () => {
            const existingID = 99;
            connectBankAccountManually(existingID, selectedPlaidBankAccount, policyID);

            expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY, expect.objectContaining({bankAccountID: existingID}), expect.anything());
        });
    });
});
