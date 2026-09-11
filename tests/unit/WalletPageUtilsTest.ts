import {
    getNextDefaultBankAccountID,
    isSelectedPaymentMethodDefault,
    shouldOpenBankAccountByPolicy,
    shouldShowShareBankAccountButton,
    shouldShowUnshareBankAccountButton,
} from '@pages/settings/Wallet/WalletPage/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountData, Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import createMockPaymentMethod from '../utils/collections/paymentMethods';
import createRandomPolicy from '../utils/collections/policies';

const policyID = '1';
const currentUserLogin = 'payments-admin@example.com';
const accountData: AccountData = {
    bankAccountID: 1,
    additionalData: {policyID},
};

describe('shouldOpenBankAccountByPolicy', () => {
    it('returns true when the user can manage payments for the linked workspace', () => {
        const policies: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                role: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.PAYMENTS_ADMIN},
                },
            },
        };

        expect(shouldOpenBankAccountByPolicy(accountData, policies, currentUserLogin)).toBe(true);
    });

    it('returns false when the shared account belongs to a workspace unavailable to the user', () => {
        expect(shouldOpenBankAccountByPolicy(accountData, {}, currentUserLogin)).toBe(false);
    });

    it('returns false when the user cannot manage payments for the linked workspace', () => {
        const policies: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                role: CONST.POLICY.ROLE.USER,
                employeeList: {
                    [currentUserLogin]: {email: currentUserLogin, role: CONST.POLICY.ROLE.USER},
                },
            },
        };

        expect(shouldOpenBankAccountByPolicy(accountData, policies, currentUserLogin)).toBe(false);
    });
});

function createPersonalBankAccountMethod(methodID: number, created: string, overrides: Partial<AccountData> = {}) {
    return createMockPaymentMethod({
        methodID,
        accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        accountData: {bankAccountID: methodID, type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.OPEN, created, ...overrides},
    });
}

describe('getNextDefaultBankAccountID', () => {
    it('should pick the most recently created open personal bank account other than the deleted one', () => {
        const paymentMethods = [
            createPersonalBankAccountMethod(1, '2024-01-01 10:00:00'),
            createPersonalBankAccountMethod(2, '2024-03-01 10:00:00'),
            createPersonalBankAccountMethod(3, '2024-02-01 10:00:00'),
        ];

        expect(getNextDefaultBankAccountID(paymentMethods, 2)).toBe(3);
    });

    it('should skip business accounts, non-open accounts and accounts pending deletion', () => {
        const paymentMethods = [
            createPersonalBankAccountMethod(1, '2024-05-01 10:00:00', {type: CONST.BANK_ACCOUNT.TYPE.BUSINESS}),
            createPersonalBankAccountMethod(2, '2024-04-01 10:00:00', {state: CONST.BANK_ACCOUNT.STATE.PENDING}),
            {...createPersonalBankAccountMethod(3, '2024-03-01 10:00:00'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            createPersonalBankAccountMethod(4, '2024-01-01 10:00:00'),
        ];

        expect(getNextDefaultBankAccountID(paymentMethods, 99)).toBe(4);
    });

    it('should return undefined when no other personal bank account remains', () => {
        expect(getNextDefaultBankAccountID([createPersonalBankAccountMethod(1, '2024-01-01 10:00:00')], 1)).toBeUndefined();
    });
});

describe('shouldShowShareBankAccountButton', () => {
    it('should only allow sharing open business accounts that allow debit', () => {
        expect(shouldShowShareBankAccountButton({type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, allowDebit: true})).toBe(true);
        expect(shouldShowShareBankAccountButton({type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, allowDebit: false})).toBe(false);
        expect(shouldShowShareBankAccountButton({type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.OPEN, allowDebit: true})).toBe(false);
        expect(shouldShowShareBankAccountButton(undefined)).toBe(false);
    });
});

describe('shouldShowUnshareBankAccountButton', () => {
    const email = 'me@example.com';

    it('should allow unsharing when the account is shared with someone other than the current user', () => {
        expect(shouldShowUnshareBankAccountButton({type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, sharees: [email, 'other@example.com']}, email)).toBe(true);
    });

    it('should not allow unsharing when the current user is the only sharee', () => {
        expect(shouldShowUnshareBankAccountButton({type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, sharees: [email]}, email)).toBe(false);
    });

    it('should not allow unsharing personal accounts or accounts without sharees', () => {
        expect(shouldShowUnshareBankAccountButton({type: CONST.BANK_ACCOUNT.TYPE.PERSONAL, state: CONST.BANK_ACCOUNT.STATE.OPEN, sharees: ['other@example.com']}, email)).toBe(false);
        expect(shouldShowUnshareBankAccountButton({type: CONST.BANK_ACCOUNT.TYPE.BUSINESS, state: CONST.BANK_ACCOUNT.STATE.OPEN, sharees: []}, email)).toBe(false);
    });
});

describe('isSelectedPaymentMethodDefault', () => {
    const selectedType = CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT;
    const selectedBankAccount: AccountData = {bankAccountID: 2};
    const paymentMethods = [createPersonalBankAccountMethod(1, '2024-01-01 10:00:00'), createPersonalBankAccountMethod(2, '2024-02-01 10:00:00')];

    it('should treat the only payment method as the default', () => {
        expect(isSelectedPaymentMethodDefault([createPersonalBankAccountMethod(2, '2024-02-01 10:00:00')], selectedType, selectedBankAccount, 1)).toBe(true);
    });

    it('should compare the selected bank account with the wallet linked account', () => {
        expect(isSelectedPaymentMethodDefault(paymentMethods, selectedType, selectedBankAccount, 2)).toBe(true);
        expect(isSelectedPaymentMethodDefault(paymentMethods, selectedType, selectedBankAccount, 1)).toBe(false);
    });
});
