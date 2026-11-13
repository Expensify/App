import {dismissSuccessfulTransferBalancePage, makeDefaultPaymentMethod, resetWalletTransferData, transferWalletBalance} from '@libs/actions/PaymentMethods';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, UserWallet} from '@src/types/onyx';

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
        jest.restoreAllMocks();
    });

    describe('transferWalletBalance', () => {
        const wallet: UserWallet = {
            currentBalance: 5000,
            availableBalance: 4000,
            tierName: CONST.WALLET.TIER_NAME.GOLD,
            currentStep: CONST.WALLET.STEP.ACTIVATE,
            walletLinkedAccountID: BANK_ACCOUNT_ID,
            walletLinkedAccountType: 'bankAccount',
        };
        const bankAccount = createMockPaymentMethod({methodID: BANK_ACCOUNT_ID, accountType: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT});

        test('reserves the balance while a transfer is pending, including after reopening the page', async () => {
            // Given a positive wallet balance and a slow transfer response
            await Onyx.merge(ONYXKEYS.USER_WALLET, wallet);
            mockFetch.pause?.();

            // When the user submits a transfer and reopens the page before it finishes
            transferWalletBalance(bankAccount, wallet);
            await waitForBatchedUpdates();
            resetWalletTransferData();
            await waitForBatchedUpdates();

            // Then neither the stale balance nor resetting the page can enable another transfer
            expect(await getOnyxValue(ONYXKEYS.USER_WALLET)).toMatchObject({...wallet, currentBalance: 0, availableBalance: 0});
            expect(await getOnyxValue(ONYXKEYS.WALLET_TRANSFER)).toMatchObject({loading: true, shouldShowSuccess: false});
        });

        test('keeps the transferred balance at zero after a successful response', async () => {
            // Given a successful response that still contains the pre-transfer balance
            await Onyx.merge(ONYXKEYS.USER_WALLET, wallet);
            mockFetch.mockAPICommand?.(WRITE_COMMANDS.TRANSFER_WALLET_BALANCE, () => ({
                onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.USER_WALLET, value: wallet}],
            }));

            // When the server confirms the transfer
            transferWalletBalance(bankAccount, wallet);
            await waitForBatchedUpdates();

            // Then a second visit cannot offer the same funds again
            expect(await getOnyxValue(ONYXKEYS.USER_WALLET)).toMatchObject({...wallet, currentBalance: 0, availableBalance: 0});
            expect(await getOnyxValue(ONYXKEYS.WALLET_TRANSFER)).toMatchObject({loading: false, shouldShowSuccess: true});
        });

        test('restores both previous balances when a transfer fails', async () => {
            // Given unequal current and available balances so rollback must preserve each value
            await Onyx.merge(ONYXKEYS.USER_WALLET, wallet);
            mockFetch.fail?.();

            // When the backend rejects the transfer
            transferWalletBalance(bankAccount, wallet);
            await waitForBatchedUpdates();

            // Then the funds remain available for retry and no success screen is shown
            expect(await getOnyxValue(ONYXKEYS.USER_WALLET)).toMatchObject(wallet);
            expect(await getOnyxValue(ONYXKEYS.WALLET_TRANSFER)).toMatchObject({loading: false, shouldShowSuccess: false});
        });

        test('refreshes the authoritative wallet balance when dismissing success', async () => {
            // Given a completed transfer whose wallet should be refreshed on return
            await Onyx.merge(ONYXKEYS.WALLET_TRANSFER, {loading: false, shouldShowSuccess: true});
            const goBack = jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});
            const refresh = jest.fn(() => ({jsonCode: 200}));
            mockFetch.mockAPICommand?.(READ_COMMANDS.OPEN_PAYMENTS_PAGE, refresh);

            // When the user dismisses the confirmation
            dismissSuccessfulTransferBalancePage();
            await waitForBatchedUpdates();

            // Then returning to Wallet also requests fresh payment data
            expect(refresh).toHaveBeenCalledTimes(1);
            expect(goBack).toHaveBeenCalledTimes(1);
            expect(await getOnyxValue(ONYXKEYS.WALLET_TRANSFER)).toMatchObject({shouldShowSuccess: false});
        });
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
