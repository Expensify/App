import Onyx from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {Transaction} from '../../src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

function generateTransaction(values: Partial<Transaction> = {}): Transaction {
    const reportID = '1';
    const amount = 100;
    const currency = 'USD';
    const comment = '';
    const attendees: Attendee[] = [];
    const created = '2023-10-01';
    const baseValues = TransactionUtils.buildOptimisticTransaction(amount, currency, reportID, comment, attendees, created);

    return {...baseValues, ...values};
}

Onyx.init({keys: ONYXKEYS});

describe('TransactionUtils', () => {
    describe('getCreated', () => {
        describe('when the transaction property "modifiedCreated" has value', () => {
            const transaction = generateTransaction({
                created: '2023-10-01',
                modifiedCreated: '2023-10-25',
            });

            it('returns the "modifiedCreated" date with the correct format', () => {
                const expectedResult = '2023-10-25';

                const result = TransactionUtils.getFormattedCreated(transaction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the transaction property "modifiedCreated" does not have value', () => {
            describe('and the transaction property "created" has value', () => {
                const transaction = generateTransaction({
                    created: '2023-10-01',
                    modifiedCreated: undefined,
                });

                it('returns the "created" date with the correct format', () => {
                    const expectedResult = '2023-10-01';

                    const result = TransactionUtils.getFormattedCreated(transaction);

                    expect(result).toEqual(expectedResult);
                });
            });

            describe('and the transaction property "created" does not have value', () => {
                const transaction = generateTransaction({
                    created: undefined,
                    modifiedCreated: undefined,
                });

                it('returns an empty string', () => {
                    const expectedResult = '';

                    const result = TransactionUtils.getFormattedCreated(transaction);

                    expect(result).toEqual(expectedResult);
                });
            });
        });
    });
    describe('getPostedDate', () => {
        describe('when posted date is undefined', () => {
            const transaction = generateTransaction({
                posted: undefined,
            });

            it('returns an empty string', () => {
                const expectedResult = '';

                const result = TransactionUtils.getFormattedPostedDate(transaction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when posted date has value with format YYYYMMdd', () => {
            const transaction = generateTransaction({
                posted: '20241125',
            });

            it('returns the posted date with the correct format YYYY-MM-dd', () => {
                const expectedResult = '2024-11-25';

                const result = TransactionUtils.getFormattedPostedDate(transaction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('shouldShowViolations', () => {
            it('returns true if there are violations and only if the user can edit the request', async () => {
                // Given violations exist for a transaction
                await Onyx.merge(ONYXKEYS.SESSION, {
                    accountID: 1234,
                });
                const expenseReport = ReportUtils.buildOptimisticExpenseReport('212', '123', 100, 122, 'USD');
                const expenseTransaction = TransactionUtils.buildOptimisticTransaction(100, 'USD', expenseReport.reportID);
                const transactionViolations = {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${expenseTransaction.transactionID}`]: [
                        {type: CONST.VIOLATION_TYPES.NOTICE, name: CONST.VIOLATIONS.TAX_REQUIRED},
                        {type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.TAX_REQUIRED},
                        {type: CONST.VIOLATION_TYPES.WARNING, name: CONST.VIOLATIONS.TAX_REQUIRED},
                    ],
                };

                const parentIOUAction = ReportUtils.buildOptimisticIOUReportAction(
                    'create',
                    100,
                    'USD',
                    '',
                    [],
                    expenseTransaction.transactionID,
                    undefined,
                    expenseReport.reportID,
                    undefined,
                    false,
                    false,
                    undefined,
                    undefined,
                );
                const transactionThreadReport = ReportUtils.buildTransactionThread(parentIOUAction, expenseReport);
                parentIOUAction.childReportID = transactionThreadReport.reportID;

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`, transactionThreadReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${expenseTransaction.transactionID}`, expenseTransaction);
                // When the current user can edit the request then we should show violations
                expect(TransactionUtils.shouldShowViolation({transactionID: expenseTransaction.transactionID, transactionViolations, parentReportAction: parentIOUAction})).toBe(true);
                expect(TransactionUtils.shouldShowNoticeTypeViolation({transactionID: expenseTransaction.transactionID, transactionViolations, parentReportAction: parentIOUAction})).toBe(
                    true,
                );
                expect(TransactionUtils.shouldShowWarningTypeViolation({transactionID: expenseTransaction.transactionID, transactionViolations, parentReportAction: parentIOUAction})).toBe(
                    true,
                );
                expect(TransactionUtils.shouldShowMissingSmartscanFieldsError({...expenseTransaction, amount: 0}, parentIOUAction)).toBe(true);

                // When the current user can't edit the request
                parentIOUAction.actorAccountID = 4321;

                // We should not show violations
                expect(TransactionUtils.shouldShowViolation({transactionID: expenseTransaction.transactionID, transactionViolations, parentReportAction: parentIOUAction})).toBe(false);
                expect(TransactionUtils.shouldShowNoticeTypeViolation({transactionID: expenseTransaction.transactionID, transactionViolations, parentReportAction: parentIOUAction})).toBe(
                    false,
                );
                expect(TransactionUtils.shouldShowWarningTypeViolation({transactionID: expenseTransaction.transactionID, transactionViolations, parentReportAction: parentIOUAction})).toBe(
                    false,
                );
                expect(TransactionUtils.shouldShowMissingSmartscanFieldsError({...expenseTransaction, amount: 0}, parentIOUAction)).toBe(false);
            });
        });
    });
});
