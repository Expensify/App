import type {OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {clearMoneyRequest, startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

async function getOnyxValue<T>(key: string): Promise<T | null> {
    return new Promise<T | null>((resolve) => {
        const connection = Onyx.connect({
            key: key as OnyxKey,
            callback: (val) => {
                Onyx.disconnect(connection);
                resolve((val ?? null) as T | null);
            },
        });
    });
}

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

jest.mock('@libs/Performance', () => ({
    markStart: jest.fn(),
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: jest.fn(),
}));

describe('startMoneyRequest', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('clearMoneyRequest with draftTransactions', () => {
        it('should clear all draft transactions when draftTransactions is provided with data', async () => {
            // Given: Multiple draft transactions exist in Onyx
            const draftTransaction1 = createRandomTransaction(1);
            const draftTransaction2 = createRandomTransaction(2);
            const draftTransaction3 = createRandomTransaction(3);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`, draftTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`, draftTransaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction3.transactionID}`, draftTransaction3);
            await waitForBatchedUpdates();

            // Verify drafts exist
            const draftTransactionsBeforeClear = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`]: draftTransaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`]: draftTransaction2,
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction3.transactionID}`]: draftTransaction3,
            };

            // When: clearMoneyRequest is called with draftTransactions
            clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, false, draftTransactionsBeforeClear);
            await waitForBatchedUpdates();

            // Then: All draft transactions should be cleared
            const draft1AfterClear = await getOnyxValue<Transaction>(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`);
            const draft2AfterClear = await getOnyxValue<Transaction>(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`);
            const draft3AfterClear = await getOnyxValue<Transaction>(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction3.transactionID}`);

            expect(draft1AfterClear).toBeNull();
            expect(draft2AfterClear).toBeNull();
            expect(draft3AfterClear).toBeNull();
        });

        it('should set skipConfirmation correctly when draftTransactions is provided', async () => {
            // Given: A draft transaction exists
            const draftTransaction = createRandomTransaction(1);
            const draftTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction.transactionID}`]: draftTransaction,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction.transactionID}`, draftTransaction);
            await waitForBatchedUpdates();

            // When: clearMoneyRequest is called with skipConfirmation = true
            clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, true, draftTransactions);
            await waitForBatchedUpdates();

            // Then: skipConfirmation should be set to true
            const skipConfirmation = await getOnyxValue<boolean>(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);

            expect(skipConfirmation).toBe(true);
        });

        it('should handle empty draftTransactions gracefully', async () => {
            // Given: No draft transactions exist
            const emptyDraftTransactions = {};

            // When: clearMoneyRequest is called with empty draftTransactions
            clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, false, emptyDraftTransactions);
            await waitForBatchedUpdates();

            // Then: Should complete without errors and set skipConfirmation
            const skipConfirmation = await getOnyxValue<boolean>(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);

            expect(skipConfirmation).toBe(false);
        });

        it('should handle undefined draftTransactions gracefully', async () => {
            // When: clearMoneyRequest is called with undefined draftTransactions
            clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, false, undefined);
            await waitForBatchedUpdates();

            // Then: Should complete without errors and set skipConfirmation
            const skipConfirmation = await getOnyxValue<boolean>(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);

            expect(skipConfirmation).toBe(false);
        });
    });

    describe('startMoneyRequest with draftTransactions', () => {
        it('should clear draft transactions when starting a new money request', async () => {
            // Given: Draft transactions exist in Onyx
            const draftTransaction1 = createRandomTransaction(1);
            const draftTransaction2 = createRandomTransaction(2);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`, draftTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`, draftTransaction2);
            await waitForBatchedUpdates();

            const draftTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`]: draftTransaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`]: draftTransaction2,
            };

            // When: startMoneyRequest is called with draftTransactions
            startMoneyRequest(CONST.IOU.TYPE.SUBMIT, 'reportID123', CONST.IOU.REQUEST_TYPE.MANUAL, false, undefined, draftTransactions);
            await waitForBatchedUpdates();

            // Then: All draft transactions should be cleared
            const draft1AfterStart = await getOnyxValue<Transaction>(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`);
            const draft2AfterStart = await getOnyxValue<Transaction>(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`);

            expect(draft1AfterStart).toBeNull();
            expect(draft2AfterStart).toBeNull();
        });
    });

    describe('startDistanceRequest with draftTransactions', () => {
        it('should clear draft transactions when starting a distance request', async () => {
            // Given: Draft transactions exist in Onyx
            const draftTransaction1 = createRandomTransaction(1);
            const draftTransaction2 = createRandomTransaction(2);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`, draftTransaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`, draftTransaction2);
            await waitForBatchedUpdates();

            const draftTransactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`]: draftTransaction1,
                [`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`]: draftTransaction2,
            };

            // When: startDistanceRequest is called with draftTransactions
            startDistanceRequest(CONST.IOU.TYPE.SUBMIT, 'reportID123', CONST.IOU.REQUEST_TYPE.DISTANCE_MAP, false, undefined, draftTransactions);
            await waitForBatchedUpdates();

            // Then: All draft transactions should be cleared
            const draft1AfterStart = await getOnyxValue<Transaction>(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction1.transactionID}`);
            const draft2AfterStart = await getOnyxValue<Transaction>(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${draftTransaction2.transactionID}`);

            expect(draft1AfterStart).toBeNull();
            expect(draft2AfterStart).toBeNull();
        });
    });
});
