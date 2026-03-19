import Onyx from 'react-native-onyx';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import {createBackupTransaction, removeDraftTransactionsByIDs, restoreOriginalTransactionFromBackup} from '@libs/actions/TransactionEdit';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import * as SequentialQueue from '@src/libs/Network/SequentialQueue';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomTransaction from '../utils/collections/transaction';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/TransactionEdit', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        SequentialQueue.resetQueue();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('Transaction backup', () => {
        describe('createBackupTransaction', () => {
            const transactionOriginal = createRandomTransaction(1);

            it('should create a backup transaction when none exists', async () => {
                const transaction = {...transactionOriginal, amount: 100};
                const isDraft = false;

                createBackupTransaction(transaction, isDraft);

                await waitForBatchedUpdates();

                const backup = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transaction.transactionID}`);

                expect(backup).toEqual(transaction);
            });

            it('should restore the transaction from backup if one exists', async () => {
                const transaction = {...transactionOriginal, amount: 100};
                const transactionBackup = {...transactionOriginal, amount: 200};
                const isDraft = true;

                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transaction.transactionID}`, transactionBackup);
                await waitForBatchedUpdates();

                createBackupTransaction(transaction, isDraft);
                await waitForBatchedUpdates();

                const transactionDraft = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`);

                expect(transactionDraft).not.toBeUndefined();
                expect(transactionDraft?.amount).toBe(transactionBackup.amount);
            });

            it('should handle null transaction gracefully', async () => {
                createBackupTransaction(undefined, false);
                await waitForBatchedUpdates();

                const backups = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}`);

                expect(backups).toBeUndefined();
            });
        });

        describe('restoreOriginalTransactionFromBackup', () => {
            const transactionOriginal = createRandomTransaction(1);

            it('should restore the original transaction from backup', async () => {
                const transactionBackup = {...transactionOriginal, amount: 200};
                const isDraft = false;

                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionOriginal.transactionID}`, transactionBackup);
                await waitForBatchedUpdates();

                restoreOriginalTransactionFromBackup(transactionOriginal.transactionID, isDraft);
                await waitForBatchedUpdates();

                const restoredTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionOriginal.transactionID}`);
                const backupTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionOriginal.transactionID}`);

                expect(restoredTransaction).not.toBeUndefined();
                expect(restoredTransaction?.amount).toBe(transactionBackup.amount);
                expect(backupTransaction).toBeUndefined();
            });

            it('should restore the draft transaction from backup', async () => {
                const transactionBackup = {...transactionOriginal, amount: 300};
                const isDraft = true;

                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionOriginal.transactionID}`, transactionBackup);
                await waitForBatchedUpdates();

                restoreOriginalTransactionFromBackup(transactionOriginal.transactionID, isDraft);
                await waitForBatchedUpdates();

                const restoredDraftTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionOriginal.transactionID}`);
                const backupTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_BACKUP}${transactionOriginal.transactionID}`);

                expect(restoredDraftTransaction).not.toBeUndefined();
                expect(restoredDraftTransaction?.amount).toBe(transactionBackup.amount);
                expect(backupTransaction).toBeUndefined();
            });

            it('should handle missing backup gracefully', async () => {
                const isDraft = false;

                restoreOriginalTransactionFromBackup(transactionOriginal.transactionID, isDraft);
                await waitForBatchedUpdates();

                const restoredTransaction = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionOriginal.transactionID}`);

                expect(restoredTransaction).toBeUndefined();
            });

            it('should handle null transactionID gracefully', async () => {
                restoreOriginalTransactionFromBackup(undefined, false);
                await waitForBatchedUpdates();

                const transactions = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}`);

                expect(transactions).toBeUndefined();
            });
        });
    });

    describe('removeDraftTransactionsByIDs', () => {
        it('should remove draft transactions for the given IDs', async () => {
            const transaction1 = createRandomTransaction(1);
            const transaction2 = createRandomTransaction(2);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`, transaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`, transaction2);
            await waitForBatchedUpdates();

            removeDraftTransactionsByIDs([transaction1.transactionID, transaction2.transactionID]);
            await waitForBatchedUpdates();

            const draft1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`);
            const draft2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`);

            expect(draft1).toBeUndefined();
            expect(draft2).toBeUndefined();
        });

        it('should only remove specified draft transactions and leave others intact', async () => {
            const transaction1 = createRandomTransaction(1);
            const transaction2 = createRandomTransaction(2);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`, transaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`, transaction2);
            await waitForBatchedUpdates();

            removeDraftTransactionsByIDs([transaction1.transactionID]);
            await waitForBatchedUpdates();

            const draft1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`);
            const draft2 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`);

            expect(draft1).toBeUndefined();
            expect(draft2).toBeDefined();
        });

        it('should do nothing when given an empty array', async () => {
            const transaction1 = createRandomTransaction(1);

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`, transaction1);
            await waitForBatchedUpdates();

            removeDraftTransactionsByIDs([]);
            await waitForBatchedUpdates();

            const draft1 = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`);
            expect(draft1).toBeDefined();
        });
    });
});
