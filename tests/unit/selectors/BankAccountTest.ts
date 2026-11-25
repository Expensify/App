import CONST from '@src/CONST';
import type {BankAccount, BankAccountList} from '@src/types/onyx';

import {connectedBankAccountIDSelector} from '@selectors/BankAccount';

function createBankAccount(methodID: number): BankAccount {
    return {
        methodID,
        bankCurrency: 'USD',
        bankCountry: CONST.COUNTRY.US,
        accountData: {
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
            type: CONST.BANK_ACCOUNT.TYPE.BUSINESS,
        },
    };
}

describe('connectedBankAccountIDSelector', () => {
    const POLICY_ID = 'policy1';

    function createConnectedBankAccount(methodID: number, policyID: string | undefined): BankAccount {
        return {...createBankAccount(methodID), accountData: {additionalData: {policyID}}};
    }

    it('returns undefined when the bank account list is undefined or empty', () => {
        // Given no bank accounts have loaded yet
        // When the selector runs on an undefined or empty list
        // Then it does not throw and returns undefined
        expect(connectedBankAccountIDSelector(POLICY_ID)(undefined)).toBeUndefined();
        expect(connectedBankAccountIDSelector(POLICY_ID)({})).toBeUndefined();
    });

    it('returns the methodID of the bank account connected to the workspace', () => {
        // Given a list where only the second account is connected to the workspace
        const bankAccountList: BankAccountList = {
            a1: createConnectedBankAccount(1, 'otherPolicy'),
            a2: createConnectedBankAccount(2, POLICY_ID),
        };

        // When the selector runs for that workspace
        // Then it returns the connected account's methodID
        expect(connectedBankAccountIDSelector(POLICY_ID)(bankAccountList)).toBe(2);
    });

    it('returns undefined when no bank account is connected to the workspace', () => {
        // Given accounts connected to other workspaces or to none
        const bankAccountList: BankAccountList = {
            a1: createConnectedBankAccount(1, 'otherPolicy'),
            a2: createConnectedBankAccount(2, undefined),
            a3: createBankAccount(3),
        };

        // When the selector runs
        // Then nothing matches
        expect(connectedBankAccountIDSelector(POLICY_ID)(bankAccountList)).toBeUndefined();
    });
});
