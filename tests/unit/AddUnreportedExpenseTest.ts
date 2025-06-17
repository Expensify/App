import {createUnreportedExpenseSections} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

function generateTransaction(values: Partial<Transaction> = {}): Transaction {
    const baseTransaction: Transaction = {
        transactionID: `transaction_${Math.random()}`,
        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        amount: 1000,
        currency: 'USD',
        merchant: 'Test Merchant',
        category: '',
        comment: {comment: ''},
        created: '2025-06-12',
        tag: '',
        billable: false,
        receipt: {},
        filename: '',
        taxCode: '',
        taxAmount: 0,
        pendingAction: undefined,
        ...values,
    };
    return baseTransaction;
}

describe('AddUnreportedExpense', () => {
    describe('createUnreportedExpenseSections', () => {
        it('should mark transactions with DELETE pendingAction as disabled', () => {
            const normalTransaction = generateTransaction({
                transactionID: '123',
                pendingAction: undefined,
                amount: 1000,
                merchant: 'Normal Merchant',
            });

            const deletedTransaction = generateTransaction({
                transactionID: '456',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                amount: 2000,
                merchant: 'Deleted Merchant',
            });

            const transactions = [normalTransaction, deletedTransaction];
            const sections = createUnreportedExpenseSections(transactions);

            // Should create one section
            expect(sections).toHaveLength(1);
            expect(sections.at(0)?.shouldShow).toBe(true);
            expect(sections.at(0)?.data).toHaveLength(2);

            const processedNormalTransaction = sections.at(0)?.data.find((t) => t.transactionID === '123');
            expect(processedNormalTransaction?.isDisabled).toBe(false);

            const processedDeletedTransaction = sections.at(0)?.data.find((t) => t.transactionID === '456');
            expect(processedDeletedTransaction?.isDisabled).toBe(true);
        });

        it('should not mark transactions without DELETE pendingAction as disabled', () => {
            const normalTransaction = generateTransaction({
                transactionID: '123',
                pendingAction: undefined,
                amount: 1000,
                merchant: 'Normal Merchant',
            });

            const updateTransaction = generateTransaction({
                transactionID: '456',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                amount: 2000,
                merchant: 'Update Merchant',
            });

            const addTransaction = generateTransaction({
                transactionID: '789',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                amount: 3000,
                merchant: 'Add Merchant',
            });

            const transactions = [normalTransaction, updateTransaction, addTransaction];
            const sections = createUnreportedExpenseSections(transactions);

            expect(sections.at(0)?.data).toHaveLength(3);
            sections.at(0)?.data.forEach((transaction) => {
                expect(transaction.isDisabled).toBe(false);
            });
        });

        it('should handle transaction list with only deleted transactions', () => {
            const deletedTransaction1 = generateTransaction({
                transactionID: '123',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                amount: 1000,
                merchant: 'Deleted Merchant 1',
            });

            const deletedTransaction2 = generateTransaction({
                transactionID: '456',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                amount: 2000,
                merchant: 'Deleted Merchant 2',
            });

            const transactions = [deletedTransaction1, deletedTransaction2];
            const sections = createUnreportedExpenseSections(transactions);

            expect(sections.at(0)?.data).toHaveLength(2);
            sections.at(0)?.data.forEach((transaction) => {
                expect(transaction.isDisabled).toBe(true);
                expect(transaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            });
        });
    });
});
