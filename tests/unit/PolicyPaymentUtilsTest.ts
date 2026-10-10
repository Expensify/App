import {canAccessPolicyBankAccount, getAccessiblePolicyBankAccount, wasPaidWithPolicyBankAccount} from '@libs/PolicyPaymentUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

describe('canAccessPolicyBankAccount', () => {
    const PAYER_EMAIL = 'payer@test.com';
    const NON_PAYER_ADMIN_EMAIL = 'admin@test.com';
    const POLICY_BANK_ACCOUNT_ID = 1111;

    const policyWithBankAccount: Policy = {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
        role: CONST.POLICY.ROLE.ADMIN,
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        reimburser: PAYER_EMAIL,
        achAccount: {
            bankAccountID: POLICY_BANK_ACCOUNT_ID,
            accountNumber: 'XXXXXX1111',
            routingNumber: '123456789',
            addressName: 'Test bank account',
            bankName: 'Test bank',
            reimburser: PAYER_EMAIL,
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
        },
        employeeList: {
            [PAYER_EMAIL]: {email: PAYER_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            [NON_PAYER_ADMIN_EMAIL]: {email: NON_PAYER_ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
        },
    };

    const bankAccountListWithPolicyAccount = {
        [POLICY_BANK_ACCOUNT_ID]: {methodID: POLICY_BANK_ACCOUNT_ID, bankCurrency: CONST.CURRENCY.USD, bankCountry: CONST.COUNTRY.US},
    };

    // The designated payer is the case that produced the original bug: the workspace account was advertised on their Pay
    // button but never shared with them, so the backend debited a different account.
    it('returns false for the designated payer when the workspace account is missing from their bank account list', () => {
        // Given a designated payer whose bank account list is empty.
        // When access to the workspace account is checked.
        // Then payer designation alone does not grant access.
        expect(canAccessPolicyBankAccount(policyWithBankAccount, {})).toBe(false);
    });

    it('returns true for the designated payer when the workspace account is in their bank account list', () => {
        // Given the workspace account shared in the payer’s bank account list.
        // When access to that account is checked.
        // Then the shared account is available for payment.
        expect(canAccessPolicyBankAccount(policyWithBankAccount, bankAccountListWithPolicyAccount)).toBe(true);
    });

    it('returns false when the bank account list only holds other accounts', () => {
        // Given a bank account list containing only a different account.
        // When workspace funding access is checked.
        // Then an unrelated account does not grant access to the workspace account.
        const otherAccountID = POLICY_BANK_ACCOUNT_ID + 1;
        expect(
            canAccessPolicyBankAccount(policyWithBankAccount, {
                [otherAccountID]: {methodID: otherAccountID, bankCurrency: CONST.CURRENCY.USD, bankCountry: CONST.COUNTRY.US},
            }),
        ).toBe(false);
    });

    it('returns false when the workspace has no connected bank account', () => {
        // Given a workspace without a connected account.
        // When bank account access is checked.
        // Then an accessible account cannot be assumed.
        expect(canAccessPolicyBankAccount({...policyWithBankAccount, achAccount: undefined}, bankAccountListWithPolicyAccount)).toBe(false);
    });

    it('returns false when there is no policy', () => {
        // Given no policy and an otherwise accessible bank account.
        // When workspace funding access is checked.
        // Then there is no workspace account to pay from.
        expect(canAccessPolicyBankAccount(undefined, bankAccountListWithPolicyAccount)).toBe(false);
    });
});

describe('getAccessiblePolicyBankAccount', () => {
    const POLICY_BANK_ACCOUNT_ID = 1111;

    // `achAccount.accountNumber` is deliberately a different account's number than the one `bankAccountID` resolves to.
    // The two really do fall out of sync, and reading the number off `achAccount` is what makes a Pay button name an
    // account other than the one the payment debits.
    const policyWithStaleAccountNumber: Policy = {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
        achAccount: {
            bankAccountID: POLICY_BANK_ACCOUNT_ID,
            accountNumber: 'XXXXXX9999',
            routingNumber: '123456789',
            addressName: 'Test bank account',
            bankName: 'Test bank',
            reimburser: 'payer@test.com',
            state: CONST.BANK_ACCOUNT.STATE.OPEN,
        },
    };

    const bankAccountList = {
        [POLICY_BANK_ACCOUNT_ID]: {
            methodID: POLICY_BANK_ACCOUNT_ID,
            bankCurrency: CONST.CURRENCY.USD,
            bankCountry: CONST.COUNTRY.US,
            accountData: {accountNumber: 'XXXXXX1234'},
        },
    };

    it('resolves the account number through the bank account list rather than the stale one on achAccount', () => {
        // Given an outdated account number on the policy and current details in the bank account list.
        // When the connected account is resolved by ID.
        // Then its current account number replaces the stale policy number.
        expect(getAccessiblePolicyBankAccount(policyWithStaleAccountNumber, bankAccountList)?.accountData?.accountNumber).toBe('XXXXXX1234');
    });

    it('returns undefined when the workspace account is not shared with the user', () => {
        // Given a workspace account missing from the viewer’s bank account list.
        // When the connected account is resolved.
        // Then no inaccessible account is returned.
        expect(getAccessiblePolicyBankAccount(policyWithStaleAccountNumber, {})).toBeUndefined();
    });

    it('returns undefined when the workspace has no connected bank account', () => {
        // Given a workspace with no connected bank account.
        // When the connected account is resolved.
        // Then no account is returned even though the viewer owns one.
        expect(getAccessiblePolicyBankAccount({...policyWithStaleAccountNumber, achAccount: undefined}, bankAccountList)).toBeUndefined();
    });
});

describe('wasPaidWithPolicyBankAccount', () => {
    const PAYER_EMAIL = 'payer@test.com';
    const PAYER_ACCOUNT_ID = 101;
    const NON_PAYER_ADMIN_ACCOUNT_ID = 102;

    const policyWithDesignatedPayer: Policy = {
        ...createRandomPolicy(2, CONST.POLICY.TYPE.CORPORATE),
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        reimburser: PAYER_EMAIL,
    };

    const personalDetails = {
        [PAYER_ACCOUNT_ID]: {accountID: PAYER_ACCOUNT_ID, login: PAYER_EMAIL},
        [NON_PAYER_ADMIN_ACCOUNT_ID]: {accountID: NON_PAYER_ADMIN_ACCOUNT_ID, login: 'wsadmin@test.com'},
    };

    it('returns true when the designated payer made the payment', () => {
        // Given a workspace with a designated payer.
        // When the payment is attributed to that payer.
        // Then the workspace account remains a valid fallback.
        expect(wasPaidWithPolicyBankAccount(policyWithDesignatedPayer, PAYER_ACCOUNT_ID, personalDetails)).toBe(true);
    });

    it('returns false when an admin who is not the designated payer made the payment', () => {
        // Given an admin payment made by someone other than the designated payer.
        // When the funding account is inferred without an account ID on the action.
        // Then the workspace account is rejected to avoid attributing another admin’s payment to it.
        expect(wasPaidWithPolicyBankAccount(policyWithDesignatedPayer, NON_PAYER_ADMIN_ACCOUNT_ID, personalDetails)).toBe(false);
    });

    it('falls back to the reimburser stored on the bank account when the workspace has no reimburser', () => {
        // Given a workspace whose payer is recorded only on its ACH account.
        // When both the designated payer and another admin are checked.
        // Then the ACH payer identifies which payment may use the workspace account fallback.
        const policy: Policy = {
            ...policyWithDesignatedPayer,
            reimburser: undefined,
            achAccount: {
                bankAccountID: 1111,
                accountNumber: 'XXXXXX1111',
                routingNumber: '123456789',
                addressName: 'Test bank account',
                bankName: 'Test bank',
                reimburser: PAYER_EMAIL,
            },
        };

        expect(wasPaidWithPolicyBankAccount(policy, PAYER_ACCOUNT_ID, personalDetails)).toBe(true);
        expect(wasPaidWithPolicyBankAccount(policy, NON_PAYER_ADMIN_ACCOUNT_ID, personalDetails)).toBe(false);
    });

    it('returns true for any payer when the workspace has no designated payer', () => {
        // Given a workspace without a designated payer.
        // When another admin’s payment is attributed.
        // Then the workspace account remains the default fallback.
        expect(wasPaidWithPolicyBankAccount({...policyWithDesignatedPayer, reimburser: undefined}, NON_PAYER_ADMIN_ACCOUNT_ID, personalDetails)).toBe(true);
    });
    it('updates attribution when the caller supplies newly loaded payer details', () => {
        // Given the payer’s details have not loaded and a different admin made the payment.
        const policy = policyWithDesignatedPayer;
        expect(wasPaidWithPolicyBankAccount(policy, NON_PAYER_ADMIN_ACCOUNT_ID, undefined)).toBe(true);

        // When the subscribed details arrive, the same payment can be compared with the designated payer.
        const result = wasPaidWithPolicyBankAccount(policy, NON_PAYER_ADMIN_ACCOUNT_ID, personalDetails);

        // Then the workspace account is no longer used as a fallback for this admin’s payment.
        expect(result).toBe(false);
    });
});
