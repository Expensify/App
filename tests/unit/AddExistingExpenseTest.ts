import {createUnreportedExpenses, getEligibleTransactionsToAdd} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, Policy, Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomCard from '../utils/collections/card';
import createRandomPolicy from '../utils/collections/policies';

const TARGET_REPORT_ID = 'targetReportID';
const CURRENT_USER_ACCOUNT_ID = 1;

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
        taxCode: '',
        taxAmount: 0,
        pendingAction: undefined,
        ...values,
    };
    return baseTransaction;
}

function getEligibleTransactionIDs(
    transactions: Transaction[],
    {
        report = {reportID: TARGET_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE} as Report,
        policy,
        cardList,
        currentUserAccountID = CURRENT_USER_ACCOUNT_ID,
        reportID = TARGET_REPORT_ID,
        allOpenReports,
        openReportDrafts,
    }: {
        report?: Report;
        policy?: Policy;
        cardList?: CardList;
        currentUserAccountID?: number;
        reportID?: string;
        allOpenReports?: Record<string, true>;
        openReportDrafts?: Record<string, true>;
    } = {},
): string[] {
    const transactionCollection: OnyxCollection<Transaction> = Object.fromEntries(
        transactions.map((transaction) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction]),
    );

    return getEligibleTransactionsToAdd({
        transactions: transactionCollection,
        report,
        policy,
        cardList,
        currentUserAccountID,
        reportID,
        allOpenReports,
        openReportDrafts,
    }).map((transaction) => transaction.transactionID);
}

describe('AddExistingExpense', () => {
    describe('getEligibleTransactionsToAdd', () => {
        // Expense amounts use the opposite stored sign, so 1000 represents -$10.00 and -1000 represents $10.00.
        test.each([
            {amountType: 'negative', storedAmount: 1000, reportType: CONST.REPORT.TYPE.EXPENSE, expected: true},
            {amountType: 'zero', storedAmount: 0, reportType: CONST.REPORT.TYPE.EXPENSE, expected: true},
            {amountType: 'positive', storedAmount: -1000, reportType: CONST.REPORT.TYPE.EXPENSE, expected: true},
            {amountType: 'negative', storedAmount: 1000, reportType: CONST.REPORT.TYPE.IOU, expected: false},
            {amountType: 'zero', storedAmount: 0, reportType: CONST.REPORT.TYPE.IOU, expected: false},
            {amountType: 'positive', storedAmount: -1000, reportType: CONST.REPORT.TYPE.IOU, expected: true},
        ])('should handle a $amountType unreported expense on a $reportType report', ({storedAmount, reportType, expected}) => {
            const transaction = generateTransaction({transactionID: 'amountTransaction', amount: storedAmount});
            const report = {reportID: TARGET_REPORT_ID, type: reportType} as Report;

            expect(getEligibleTransactionIDs([transaction], {report}).includes(transaction.transactionID)).toBe(expected);
        });

        it('should include only unreported transactions and transactions on open expense reports', () => {
            const unreportedTransaction = generateTransaction({transactionID: 'unreported'});
            const unreportedTransactionWithEmptyReportID = generateTransaction({transactionID: 'unreportedWithEmptyReportID', reportID: ''});
            const openTransaction = generateTransaction({transactionID: 'open', reportID: 'openReport'});
            const draftTransaction = generateTransaction({transactionID: 'draft', reportID: 'draftReport'});
            const closedTransaction = generateTransaction({transactionID: 'closed', reportID: 'closedReport'});
            const currentReportTransaction = generateTransaction({transactionID: 'current', reportID: TARGET_REPORT_ID});

            expect(
                getEligibleTransactionIDs([unreportedTransaction, unreportedTransactionWithEmptyReportID, openTransaction, draftTransaction, closedTransaction, currentReportTransaction], {
                    allOpenReports: {openReport: true, [TARGET_REPORT_ID]: true},
                    openReportDrafts: {draftReport: true},
                }),
            ).toEqual(['unreported', 'unreportedWithEmptyReportID', 'open', 'draft']);
        });

        it('should exclude reported and split expenses from IOU reports', () => {
            const originalTransaction = generateTransaction({transactionID: 'original', reportID: CONST.REPORT.SPLIT_REPORT_ID});
            const splitTransaction = generateTransaction({
                transactionID: 'split',
                comment: {comment: '', originalTransactionID: originalTransaction.transactionID, source: CONST.IOU.TYPE.SPLIT},
            });
            const reportedTransaction = generateTransaction({transactionID: 'reported', reportID: 'openReport'});
            const regularTransaction = generateTransaction({transactionID: 'regular', amount: -1000});
            const report = {reportID: TARGET_REPORT_ID, type: CONST.REPORT.TYPE.IOU} as Report;

            expect(getEligibleTransactionIDs([originalTransaction, splitTransaction, reportedTransaction, regularTransaction], {report, allOpenReports: {openReport: true}})).toEqual([
                'regular',
            ]);
        });

        it('should include card expenses only when the card belongs to the current user', () => {
            const ownCardTransaction = generateTransaction({transactionID: 'ownCard', cardID: 1});
            const otherUserCardTransaction = generateTransaction({transactionID: 'otherUserCard', cardID: 2});
            const unknownCardTransaction = generateTransaction({transactionID: 'unknownCard', cardID: 3});
            const cardList: CardList = {
                [ownCardTransaction.cardID ?? 1]: createRandomCard(1, {accountID: CURRENT_USER_ACCOUNT_ID}),
                [otherUserCardTransaction.cardID ?? 2]: createRandomCard(2, {accountID: CURRENT_USER_ACCOUNT_ID + 1}),
            };

            expect(getEligibleTransactionIDs([ownCardTransaction, otherUserCardTransaction, unknownCardTransaction], {cardList})).toEqual(['ownCard']);
        });

        it('should include per diem expenses only when the target workspace has a matching enabled unit', () => {
            const customUnitID = 'perDiemUnit';
            const matchingTransaction = generateTransaction({
                transactionID: 'matchingPerDiem',
                iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                comment: {comment: '', customUnit: {customUnitID, name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL}},
            });
            const differentWorkspaceTransaction = generateTransaction({
                transactionID: 'differentPerDiem',
                iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
                comment: {comment: '', customUnit: {customUnitID: 'differentUnit', name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL}},
            });
            const policy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
                customUnits: {
                    [customUnitID]: {
                        customUnitID,
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        enabled: true,
                        rates: {},
                    },
                },
            };

            expect(getEligibleTransactionIDs([matchingTransaction, differentWorkspaceTransaction], {policy})).toEqual(['matchingPerDiem']);
        });
    });

    describe('createUnreportedExpenses', () => {
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
            const unreportedExpenses = createUnreportedExpenses(transactions);

            expect(unreportedExpenses).toHaveLength(2);

            const processedNormalTransaction = unreportedExpenses.find((t) => t.transactionID === '123');
            expect(processedNormalTransaction?.isDisabled).toBe(false);
            expect(processedNormalTransaction?.keyForList).toBe('123');

            const processedDeletedTransaction = unreportedExpenses.find((t) => t.transactionID === '456');
            expect(processedDeletedTransaction?.isDisabled).toBe(true);
            expect(processedDeletedTransaction?.keyForList).toBe('456');
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
            const unreportedExpenses = createUnreportedExpenses(transactions);

            expect(unreportedExpenses).toHaveLength(3);
            for (const transaction of unreportedExpenses ?? []) {
                expect(transaction.isDisabled).toBe(false);
            }
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
            const unreportedExpenses = createUnreportedExpenses(transactions);

            expect(unreportedExpenses).toHaveLength(2);
            for (const transaction of unreportedExpenses ?? []) {
                expect(transaction.isDisabled).toBe(true);
                expect(transaction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            }
        });

        it('should filter out undefined transactions', () => {
            const normalTransaction = generateTransaction({
                transactionID: '123',
            });

            const transactions = [normalTransaction, undefined];
            const unreportedExpenses = createUnreportedExpenses(transactions);

            expect(unreportedExpenses).toHaveLength(1);
            expect(unreportedExpenses.at(0)?.transactionID).toBe('123');
        });
    });
});
