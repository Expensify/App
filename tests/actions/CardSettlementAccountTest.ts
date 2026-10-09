import CONST from '@src/CONST';
import {clearSettlementAccountError, updateSettlementAccount} from '@src/libs/actions/Card';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {WRITE_COMMANDS} from '@src/libs/API/types';
import {getSettlementAccountErrors} from '@src/libs/CardUtils';
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
const newSettlementBankAccountID = 222;

// Real microsecond timestamps, the way the backend keys its errors
const travelErrorKey = 1785286226000000;
const travelErrorMessage = 'Travel Billing settlement account could not be updated.';
const backendErrorKey = 1785286226370099;
const backendErrorMessage = "We couldn't verify the balance for this account because its Plaid connection is broken. Reconnect it in Account > Wallet, then try again.";

function selectNewSettlementAccount(shouldClearSettlementAccountError?: boolean) {
    updateSettlementAccount(domainName, workspaceAccountID, 'policyID', programKey, newSettlementBankAccountID, currentSettlementBankAccountID, shouldClearSettlementAccountError);
}

// What a failed Travel Billing settlement change leaves behind until the admin dismisses it
function mergePendingTravelBillingError() {
    return Onyx.merge(settingsKey, {
        pendingFields: {paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
        errorFields: {paymentBankAccountID: {[travelErrorKey]: travelErrorMessage}},
    });
}

OnyxUpdateManager();
describe('actions/Card', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    // The backend rejects the account and writes its actionable error to the root field Travel Billing also uses
    function failWithBackendError() {
        mockFetch.mockAPICommand(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_ACCOUNT, () => ({
            jsonCode: 402,
            onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: settingsKey, value: {errorFields: {paymentBankAccountID: {[backendErrorKey]: backendErrorMessage}}}}],
        }));
    }

    beforeEach(() => {
        mockFetch.succeed();
        mockFetch.mockAPICommand(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_ACCOUNT, () => ({}));
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('updateSettlementAccount', () => {
        it('shows the backend error instead of the generic one when the account cannot be verified', async () => {
            // Given the backend rejects the account with its actionable error
            failWithBackendError();

            // When the admin selects that account
            selectNewSettlementAccount();
            await waitForBatchedUpdates();

            // Then the settings page shows the backend error, since the generic fallback sorts below it
            const settings = await getOnyxValue(settingsKey);
            expect(getSettlementAccountErrors(settings, programKey)).toEqual({[backendErrorKey]: backendErrorMessage});

            // And the error stays off root `errors`, which the cashback toggle owns
            expect(settings?.errors).toBeUndefined();

            // And the previous settlement account is restored
            expect(settings?.[programKey]?.paymentBankAccountID).toBe(currentSettlementBankAccountID);
        });

        it('falls back to the generic error when the backend sends none', async () => {
            // Given a failure with no error from the backend
            mockFetch.fail();

            // When the admin selects an account
            selectNewSettlementAccount();
            await waitForBatchedUpdates();

            // Then the admin still sees why nothing changed
            const settings = await getOnyxValue(settingsKey);
            expect(Object.values(getSettlementAccountErrors(settings, programKey) ?? {})).toEqual([TestHelper.translateLocal('common.genericErrorMessage')]);

            // And the fallback stays off the root field, which Travel Billing reads
            expect(settings?.errorFields?.paymentBankAccountID).toBeUndefined();
        });

        it('clears the previous error when the admin tries again', async () => {
            // Given a previous attempt that failed
            failWithBackendError();
            selectNewSettlementAccount();
            await waitForBatchedUpdates();

            // When the admin selects an account again and it succeeds
            mockFetch.mockAPICommand(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_ACCOUNT, () => ({}));
            selectNewSettlementAccount();
            await waitForBatchedUpdates();

            // Then the old error no longer shows next to the new account
            const settings = await getOnyxValue(settingsKey);
            expect(getSettlementAccountErrors(settings, programKey)).toBeUndefined();
            expect(settings?.[programKey]?.paymentBankAccountID).toBe(newSettlementBankAccountID);
        });

        it('keeps a pending Travel Billing error when the card settlement account changes', async () => {
            // Given a Travel Billing settlement failure the admin has not dismissed yet
            await mergePendingTravelBillingError();

            // When the admin changes the card settlement account, which the page does without clearing the shared field while Travel is pending
            selectNewSettlementAccount(false);
            await waitForBatchedUpdates();

            // Then the Travel Billing error and its pending state survive, so the admin can still dismiss it and roll the Travel account back
            const settings = await getOnyxValue(settingsKey);
            expect(settings?.errorFields?.paymentBankAccountID).toEqual({[travelErrorKey]: travelErrorMessage});
            expect(settings?.pendingFields?.paymentBankAccountID).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('shows the card error even while a Travel Billing error is pending', async () => {
            // Given a Travel Billing settlement failure the admin has not dismissed yet
            await mergePendingTravelBillingError();

            // When a card settlement change then fails with the backend error
            failWithBackendError();
            selectNewSettlementAccount(false);
            await waitForBatchedUpdates();

            // Then the card settings page still shows the card error instead of hiding it behind the Travel pending state
            const settings = await getOnyxValue(settingsKey);
            expect(getSettlementAccountErrors(settings, programKey)).toEqual({[backendErrorKey]: backendErrorMessage});
        });
    });

    describe('getSettlementAccountErrors', () => {
        it('shows nothing on the card settings page for a Travel Billing failure alone', async () => {
            // Given only a Travel Billing settlement failure
            await mergePendingTravelBillingError();

            // When the card settings page reads the settlement account error
            const settings = await getOnyxValue(settingsKey);

            // Then nothing shows, because no card settlement change failed
            expect(getSettlementAccountErrors(settings, programKey)).toBeUndefined();
        });
    });

    describe('clearSettlementAccountError', () => {
        it('removes the card error without touching a pending Travel Billing error', async () => {
            // Given a card settlement failure while a Travel Billing error is pending
            await mergePendingTravelBillingError();
            failWithBackendError();
            selectNewSettlementAccount(false);
            await waitForBatchedUpdates();

            // When the admin dismisses the card error
            clearSettlementAccountError(workspaceAccountID, programKey);
            await waitForBatchedUpdates();

            // Then it is gone from the card settings page
            const settings = await getOnyxValue(settingsKey);
            expect(getSettlementAccountErrors(settings, programKey)).toBeUndefined();

            // And Travel Billing keeps its pending error to dismiss and roll back
            expect(settings?.errorFields?.paymentBankAccountID).toHaveProperty(String(travelErrorKey), travelErrorMessage);
            expect(settings?.pendingFields?.paymentBankAccountID).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });
    });
});
