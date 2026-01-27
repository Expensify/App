import Onyx from 'react-native-onyx';
import {shouldReuseInitialTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('IOURequestStepScan', () => {
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

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    describe('Receipt and Draft State Management', () => {
        it('should preserve multiple draft transactions when processing new receipts', async () => {
            const transaction1 = createRandomTransaction(1);
            transaction1.receipt = {source: 'file://receipt1.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

            const transaction2 = createRandomTransaction(2);
            transaction2.receipt = {source: 'file://receipt2.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`, transaction2);
            await waitForBatchedUpdates();

            const tx1Data = await new Promise<Transaction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            const tx2Data = await new Promise<Transaction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            expect(tx1Data?.transactionID).toBe(transaction1.transactionID);
            expect(tx1Data?.receipt?.source).toBe('file://receipt1.png');
            expect(tx2Data?.transactionID).toBe(transaction2.transactionID);
            expect(tx2Data?.receipt?.source).toBe('file://receipt2.png');
        });

        it('should not lose draft transactions when updating one receipt', async () => {
            const transaction1 = createRandomTransaction(1);
            transaction1.receipt = {source: 'file://receipt1.png'};

            const transaction2 = createRandomTransaction(2);
            transaction2.receipt = {source: 'file://receipt2.png'};

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`, transaction2);
            await waitForBatchedUpdates();

            const updatedTransaction1 = {...transaction1, receipt: {source: 'file://receipt1-updated.png'}};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`, updatedTransaction1);
            await waitForBatchedUpdates();

            const tx1Data = await new Promise<Transaction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            const tx2Data = await new Promise<Transaction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            expect(tx2Data?.transactionID).toBe(transaction2.transactionID);
            expect(tx2Data?.receipt?.source).toBe('file://receipt2.png');
            expect(tx1Data?.transactionID).toBe(transaction1.transactionID);
            expect(tx1Data?.receipt?.source).toBe('file://receipt1-updated.png');
        });

        it('replacing receipt in multi-scan does not clear other drafts', async () => {
            const transaction1 = createRandomTransaction(1);
            transaction1.receipt = {source: 'file://receipt1.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

            const transaction2 = createRandomTransaction(2);
            transaction2.receipt = {source: 'file://receipt2.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction1.transactionID}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`, transaction2);
            await waitForBatchedUpdates();

            const transactions = [transaction1, transaction2];
            const shouldReuse = shouldReuseInitialTransaction(transaction1, true, 0, true, transactions);

            expect(shouldReuse).toBe(false);

            const tx2Data = await new Promise<Transaction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction2.transactionID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            expect(tx2Data?.transactionID).toBe(transaction2.transactionID);
            expect(tx2Data?.receipt?.source).toBe('file://receipt2.png');
        });

        it('multi-scan mode preserves receipts when adding new ones', async () => {
            const initialTx = createRandomTransaction(0);
            initialTx.receipt = {source: 'file://initial-receipt.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${initialTx.transactionID}`, initialTx);
            await waitForBatchedUpdates();

            const secondTx = createRandomTransaction(1);
            secondTx.receipt = {source: 'file://second-receipt.png', state: CONST.IOU.RECEIPT_STATE.OPEN};

            const transactions = [initialTx];
            const shouldReuseForSecondFile = shouldReuseInitialTransaction(initialTx, true, 1, true, transactions);

            expect(shouldReuseForSecondFile).toBe(false);

            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${secondTx.transactionID}`, secondTx);
            await waitForBatchedUpdates();

            const tx1Data = await new Promise<Transaction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${initialTx.transactionID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            const tx2Data = await new Promise<Transaction | undefined>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${secondTx.transactionID}`,
                    callback: (val) => {
                        resolve(val);
                        Onyx.disconnect(connection);
                    },
                });
            });

            expect(tx1Data?.receipt?.source).toBe('file://initial-receipt.png');
            expect(tx2Data?.receipt?.source).toBe('file://second-receipt.png');
        });
    });
});
