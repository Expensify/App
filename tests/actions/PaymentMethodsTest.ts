import {makeDefaultPaymentMethod} from '@libs/actions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import createMockPaymentMethod from '../utils/collections/paymentMethods';
import createRandomPolicy from '../utils/collections/policies';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const BANK_ACCOUNT_ID = 1234;
const PAYMENTS_ON_POLICY_ID = 'paymentsOn';
const PAYMENTS_OFF_POLICY_ID = 'paymentsOff';
const MEMBER_POLICY_ID = 'member';

function buildPolicy(id: string, role: Policy['role'], reimbursementChoice: Policy['reimbursementChoice']): Policy {
    return {...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE), id, role, reimbursementChoice};
}

describe('actions/PaymentMethods', () => {
    let mockFetch: MockFetch;

    const policies = {
        [`${ONYXKEYS.COLLECTION.POLICY}${PAYMENTS_ON_POLICY_ID}`]: buildPolicy(PAYMENTS_ON_POLICY_ID, CONST.POLICY.ROLE.ADMIN, CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL),
        [`${ONYXKEYS.COLLECTION.POLICY}${PAYMENTS_OFF_POLICY_ID}`]: buildPolicy(PAYMENTS_OFF_POLICY_ID, CONST.POLICY.ROLE.ADMIN, CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO),
        [`${ONYXKEYS.COLLECTION.POLICY}${MEMBER_POLICY_ID}`]: buildPolicy(MEMBER_POLICY_ID, CONST.POLICY.ROLE.USER, CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL),
    };
    const previousBankAccount = {bankName: CONST.BANK_NAMES.CHASE, bankAccountLastFour: '1111'};
    const policyMemberBankAccounts = {
        [`${ONYXKEYS.COLLECTION.POLICY_MEMBER_BANK_ACCOUNTS}${PAYMENTS_ON_POLICY_ID}`]: {[ACCOUNT_ID]: previousBankAccount},
    };
    const newDefault = createMockPaymentMethod({
        methodID: BANK_ACCOUNT_ID,
        accountData: {bankAccountID: BANK_ACCOUNT_ID, accountNumber: 'XXXXXX5678', additionalData: {bankName: CONST.BANK_NAMES.CITIBANK}},
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockFetch = TestHelper.createGlobalFetchMock();
        global.fetch = mockFetch;
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_BANK_ACCOUNTS}${PAYMENTS_ON_POLICY_ID}`, {[ACCOUNT_ID]: previousBankAccount});
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        mockFetch?.resume?.();
    });

    describe('makeDefaultPaymentMethod', () => {
        test("shows the admin's new default bank account on the Members page of workspaces with payments on", async () => {
            // Given the request is held so the optimistic state can be observed
            mockFetch.pause?.();

            // When an admin makes a different bank account their default
            makeDefaultPaymentMethod(BANK_ACCOUNT_ID, 0, undefined, newDefault, policies, policyMemberBankAccounts, ACCOUNT_ID);
            await waitForBatchedUpdates();

            // Then the workspace they admin with payments on shows the new last four right away
            const paymentsOn = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_BANK_ACCOUNTS}${PAYMENTS_ON_POLICY_ID}`);
            expect(paymentsOn?.[ACCOUNT_ID]).toEqual({bankName: CONST.BANK_NAMES.CITIBANK, bankAccountLastFour: '5678'});

            // And workspaces where they aren't an admin, or payments are off, are left alone since they don't show the column
            expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_BANK_ACCOUNTS}${PAYMENTS_OFF_POLICY_ID}`)).toBeUndefined();
            expect(await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_BANK_ACCOUNTS}${MEMBER_POLICY_ID}`)).toBeUndefined();
        });

        test('restores the previous bank account when the request fails', async () => {
            // Given the backend rejects the change
            mockFetch.fail?.();

            // When an admin makes a different bank account their default
            makeDefaultPaymentMethod(BANK_ACCOUNT_ID, 0, undefined, newDefault, policies, policyMemberBankAccounts, ACCOUNT_ID);
            await waitForBatchedUpdates();

            // Then the Members page goes back to the account the backend still has as the default
            const paymentsOn = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY_MEMBER_BANK_ACCOUNTS}${PAYMENTS_ON_POLICY_ID}`);
            expect(paymentsOn?.[ACCOUNT_ID]).toEqual(previousBankAccount);
        });
    });
});
