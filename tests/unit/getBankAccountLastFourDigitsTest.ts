import getBankAccountLastFourDigits from '@libs/getBankAccountLastFourDigits';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccount, Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
    const POLICY_BANK_ACCOUNT_ID = 1111;
    const PAYER_EMAIL = 'payer@test.com';
    const PAYER_ACCOUNT_ID = 101;
    const NON_PAYER_ADMIN_ACCOUNT_ID = 102;

    const policy: Policy = {
        ...createRandomPolicy(3, CONST.POLICY.TYPE.CORPORATE),
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        reimburser: PAYER_EMAIL,
        achAccount: {
            bankAccountID: POLICY_BANK_ACCOUNT_ID,
            accountNumber: 'XXXXXX1111',
            routingNumber: '123456789',
            addressName: 'Test bank account',
            bankName: 'Test bank',
            reimburser: PAYER_EMAIL,
        },
    };

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [PAYER_ACCOUNT_ID]: {accountID: PAYER_ACCOUNT_ID, login: PAYER_EMAIL},
            [NON_PAYER_ADMIN_ACCOUNT_ID]: {accountID: NON_PAYER_ADMIN_ACCOUNT_ID, login: 'wsadmin@test.com'},
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('uses the account stored on the payment action over anything resolved locally', () => {
        // Given a payment action that carries its own masked account number
        // When the digits are resolved for a non-payer admin's payment
        // Then the action's number wins, since it is the only viewer-independent source
        expect(getBankAccountLastFourDigits({bankAccountID: undefined, bankAccountList: {}, policy, accountNumber: 'XXXXXX0000', payerAccountID: NON_PAYER_ADMIN_ACCOUNT_ID})).toBe('0000');
    });

    it('returns the last four digits of the account the payment names', () => {
        // Given the named account is in the viewer's bank account list
        const bankAccountList = createBankAccountList(123, '1234567890');

        // Then its account number is used
        expect(getBankAccountLastFourDigits({bankAccountID: 123, bankAccountList, policy, payerAccountID: PAYER_ACCOUNT_ID})).toBe('7890');
    });

    it('returns an empty string when the named account is missing from the list, so a multi-VBBA payment never shows the policy account digits', () => {
        // Given the payment names an account the viewer doesn't have
        const bankAccountList = createBankAccountList(456, '1234567890');

        // Then nothing is shown rather than the workspace account
        expect(getBankAccountLastFourDigits({bankAccountID: 123, bankAccountList, policy, payerAccountID: PAYER_ACCOUNT_ID})).toBe('');
    });

    it('returns an empty string when the named account carries no account number', () => {
        // Given the named account has no account data
        const bankAccountList = createBankAccountList(123);

        // Then nothing is shown
        expect(getBankAccountLastFourDigits({bankAccountID: 123, bankAccountList, policy, payerAccountID: PAYER_ACCOUNT_ID})).toBe('');
    });

    it('returns an empty string when the payment names an account but the list has not loaded', () => {
        // Given no bank account list at all
        // Then nothing is shown, since the named account can't be resolved
        expect(getBankAccountLastFourDigits({bankAccountID: 123, bankAccountList: undefined, policy, payerAccountID: PAYER_ACCOUNT_ID})).toBe('');
    });

    it('falls back to the workspace account for a payment made by the designated payer', () => {
        // Given a payment by the designated payer that names no account
        // Then the workspace account is assumed
        expect(getBankAccountLastFourDigits({bankAccountID: undefined, bankAccountList: {}, policy, payerAccountID: PAYER_ACCOUNT_ID})).toBe('1111');
    });

    it('prefers the workspace account number from the bank account list over the stale one on the policy', () => {
        // Given the viewer has the workspace account, whose number differs from the one cached on the policy
        const bankAccountList = createBankAccountList(POLICY_BANK_ACCOUNT_ID, '9999999999');

        // Then the number of the account that is actually debited is shown
        expect(getBankAccountLastFourDigits({bankAccountID: undefined, bankAccountList, policy, payerAccountID: PAYER_ACCOUNT_ID})).toBe('9999');
    });

    it('does not attribute the workspace account to a payment made by a non-payer admin', () => {
        // Given a payment by an admin who isn't the designated payer and names no account
        // Then no digits are shown, since that admin paid from an account of their own
        expect(getBankAccountLastFourDigits({bankAccountID: undefined, bankAccountList: {}, policy, payerAccountID: NON_PAYER_ADMIN_ACCOUNT_ID})).toBe('');
    });

    it('does not attribute the workspace account to a payment that names another bank account', () => {
        // Given a payment by the designated payer that names an account other than the workspace one
        // Then the workspace account is not assumed
        expect(getBankAccountLastFourDigits({bankAccountID: 2222, bankAccountList: {}, policy, payerAccountID: PAYER_ACCOUNT_ID})).toBe('');
    });

    it('keeps the workspace account when the reimburser cannot be resolved from personal details', async () => {
        // Given a viewer who has never interacted with the designated payer, so their personal details aren't loaded
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[NON_PAYER_ADMIN_ACCOUNT_ID]: {accountID: NON_PAYER_ADMIN_ACCOUNT_ID, login: 'wsadmin@test.com'}});
        await waitForBatchedUpdates();

        // Then the payer can't be ruled out, so the pre-existing workspace account fallback is kept
        expect(getBankAccountLastFourDigits({bankAccountID: undefined, bankAccountList: {}, policy, payerAccountID: PAYER_ACCOUNT_ID})).toBe('1111');
    });

    it('returns an empty string when the payment names no account and the workspace has none either', () => {
        // Given no bank account anywhere
        // Then nothing is shown
        expect(getBankAccountLastFourDigits({bankAccountID: undefined, bankAccountList: undefined, policy: undefined})).toBe('');
    });
});
