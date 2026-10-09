import CONST from '@src/CONST';
import {clearSettlementAccountError, updateSettlementAccount} from '@src/libs/actions/Card';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {WRITE_COMMANDS} from '@src/libs/API/types';
import {getLatestErrorField} from '@src/libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const workspaceAccountID = 22588762;
const programKey = CONST.EXPENSIFY_CARD.CARD_PROGRAM.CURRENT;
const settingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}` as const;
const domainName = 'expensify-policy1234.exfy';
const currentSettlementBankAccountID = 111;
const brokenPlaidBankAccountID = 222;

// A real microsecond timestamp, the way the backend keys its errors
const backendErrorKey = 1785286226370099;
const backendErrorMessage = "We couldn't verify the balance for this account because its Plaid connection is broken. Reconnect it in Account > Wallet, then try again.";

function selectBrokenPlaidAccount() {
    updateSettlementAccount(domainName, workspaceAccountID, 'policyID', programKey, brokenPlaidBankAccountID, currentSettlementBankAccountID);
}

OnyxUpdateManager();
describe('actions/Card', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        mockFetch.succeed();
        mockFetch.mockAPICommand(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_ACCOUNT, () => ({}));
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateSettlementAccount', () => {
        it('shows the backend error instead of the generic one when the account cannot be verified', async () => {
            // Given the backend rejects the account and sends its actionable error in the settlement account field
            mockFetch.mockAPICommand(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_ACCOUNT, () => ({
                jsonCode: 402,
                onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: settingsKey, value: {errorFields: {paymentBankAccountID: {[backendErrorKey]: backendErrorMessage}}}}],
            }));

            // When the admin selects that account
            selectBrokenPlaidAccount();
            await waitForBatchedUpdates();

            // Then the backend error is the one the settings page shows, since the generic fallback merged into the same field sorts below it
            const settings = await getOnyxValue(settingsKey);
            expect(getLatestErrorField(settings, 'paymentBankAccountID')).toEqual({[backendErrorKey]: backendErrorMessage});

            // And the error stays off root `errors`, which the cashback toggle owns
            expect(settings?.errors).toBeUndefined();

            // And the previous settlement account is restored
            expect(settings?.[programKey]?.paymentBankAccountID).toBe(currentSettlementBankAccountID);
        });

        it('falls back to the generic error when the backend sends none', async () => {
            // Given a failure with no error from the backend
            mockFetch.fail();

            // When the admin selects an account
            selectBrokenPlaidAccount();
            await waitForBatchedUpdates();

            // Then the admin still sees why nothing changed
            const settings = await getOnyxValue(settingsKey);
            expect(Object.values(getLatestErrorField(settings, 'paymentBankAccountID'))).toEqual([TestHelper.translateLocal('common.genericErrorMessage')]);
        });

        it('clears the previous error when the admin tries again', async () => {
            // Given a previous attempt that failed
            await Onyx.merge(settingsKey, {errorFields: {paymentBankAccountID: {[backendErrorKey]: backendErrorMessage}}});

            // When the admin selects an account again and it succeeds
            selectBrokenPlaidAccount();
            await waitForBatchedUpdates();

            // Then the old error no longer shows next to the new account
            const settings = await getOnyxValue(settingsKey);
            expect(getLatestErrorField(settings, 'paymentBankAccountID')).toEqual({});
            expect(settings?.[programKey]?.paymentBankAccountID).toBe(brokenPlaidBankAccountID);
        });
    });

    describe('clearSettlementAccountError', () => {
        it('removes the settlement account error when the admin dismisses it', async () => {
            // Given a settlement account error on the settings page
            await Onyx.merge(settingsKey, {errorFields: {paymentBankAccountID: {[backendErrorKey]: backendErrorMessage}}});

            // When the admin dismisses it
            clearSettlementAccountError(workspaceAccountID);
            await waitForBatchedUpdates();

            // Then it is gone
            const settings = await getOnyxValue(settingsKey);
            expect(getLatestErrorField(settings, 'paymentBankAccountID')).toEqual({});
        });
    });
});
