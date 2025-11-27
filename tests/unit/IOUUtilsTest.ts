import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import DateUtils from '@libs/DateUtils';
import {canSubmitReport} from '@userActions/IOU';
import CONST from '@src/CONST';
import * as IOUUtils from '@src/libs/IOUUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import {hasAnyTransactionWithoutRTERViolation} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';
import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import currencyList from './currencyList.json';

const testDate = DateUtils.getDBTime();
const currentUserAccountID = 5;

function initCurrencyList() {
    Onyx.init({
        keys: ONYXKEYS,
        initialKeyStates: {
            [ONYXKEYS.CURRENCY_LIST]: currencyList,
        },
    });
    return waitForBatchedUpdates();
}

describe('IOUUtils', () => {
    describe('isIOUReportPendingCurrencyConversion', () => {
        beforeAll(() => {
            Onyx.init({
                keys: ONYXKEYS,
            });
        });

        test('Submitting an expense offline in a different currency will show the pending conversion message', () => {
            const iouReport = ReportUtils.buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
            const usdPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const aedPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'AED',
                    reportID: iouReport.reportID,
                },
            });
            const MergeQueries: TransactionCollectionDataSet = {};
            MergeQueries[`${ONYXKEYS.COLLECTION.TRANSACTION}${usdPendingTransaction.transactionID}`] = usdPendingTransaction;
            MergeQueries[`${ONYXKEYS.COLLECTION.TRANSACTION}${aedPendingTransaction.transactionID}`] = aedPendingTransaction;

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, MergeQueries).then(() => {
                // We submitted an expense offline in a different currency, we don't know the total of the iouReport until we're back online
                expect(IOUUtils.isIOUReportPendingCurrencyConversion(iouReport)).toBe(true);
            });
        });

        test('Submitting an expense online in a different currency will not show the pending conversion message', () => {
            const iouReport = ReportUtils.buildOptimisticIOUReport(2, 3, 100, '1', 'USD');
            const usdPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: iouReport.reportID,
                },
            });
            const aedPendingTransaction = TransactionUtils.buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'AED',
                    reportID: iouReport.reportID,
                },
            });

            const MergeQueries: TransactionCollectionDataSet = {};
            MergeQueries[`${ONYXKEYS.COLLECTION.TRANSACTION}${usdPendingTransaction.transactionID}`] = {
                ...usdPendingTransaction,
                pendingAction: null,
            };
            MergeQueries[`${ONYXKEYS.COLLECTION.TRANSACTION}${aedPendingTransaction.transactionID}`] = {
                ...aedPendingTransaction,
                pendingAction: null,
            };

            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, MergeQueries).then(() => {
                // We submitted an expense online in a different currency, we know the iouReport total and there's no need to show the pending conversion message
                expect(IOUUtils.isIOUReportPendingCurrencyConversion(iouReport)).toBe(false);
            });
        });
    });

    describe('calculateAmount', () => {
        beforeAll(() => initCurrencyList());

        test('103 JPY split among 3 participants including the default user should be [35, 34, 34]', () => {
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'JPY', true)).toBe(3500);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'JPY')).toBe(3400);
        });

        test('103 USD split among 3 participants including the default user should be [34.34, 34.33, 34.33]', () => {
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'USD', true)).toBe(3434);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 10300, 'USD')).toBe(3433);
        });

        test('10 AFN split among 4 participants including the default user should be [1, 3, 3, 3]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1000, 'AFN', true)).toBe(100);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1000, 'AFN')).toBe(300);
        });

        test('10.12 USD split among 4 participants including the default user should be [2.53, 2.53, 2.53, 2.53]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD', true)).toBe(253);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD')).toBe(253);
        });

        test('10.12 USD split among 3 participants including the default user should be [3.38, 3.37, 3.37]', () => {
            const participantsAccountIDs = [100, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD', true)).toBe(338);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 1012, 'USD')).toBe(337);
        });

        test('0.02 USD split among 4 participants including the default user should be [-0.01, 0.01, 0.01, 0.01]', () => {
            const participantsAccountIDs = [100, 101, 102];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, 'USD', true)).toBe(-1);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 2, 'USD')).toBe(1);
        });

        test('1 RSD split among 3 participants including the default user should be [0.34, 0.33, 0.33]', () => {
            // RSD is a special case that we forced to have 2 decimals
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'RSD', true)).toBe(34);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'RSD')).toBe(33);
        });

        test('1 BHD split among 3 participants including the default user should be [0.34, 0.33, 0.33]', () => {
            // BHD has 3 decimal places, but it still produces parts with only 2 decimal places because of a backend limitation
            const participantsAccountIDs = [100, 101];
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'BHD', true)).toBe(34);
            expect(IOUUtils.calculateAmount(participantsAccountIDs.length, 100, 'BHD')).toBe(33);
        });

        describe('calculateAmount - floorToLast rounding', () => {
            beforeAll(() => initCurrencyList());

            test('Positive total: remainder added entirely to default user', () => {
                // $10.00 among 3 -> base 3.33, remainder 0.01 -> default gets 3.34
                const numberOfSplits = 2; // total participants = 3
                expect(IOUUtils.calculateAmount(numberOfSplits, 1000, 'USD', true, true)).toBe(334);
                expect(IOUUtils.calculateAmount(numberOfSplits, 1000, 'USD', false, true)).toBe(333);
            });

            test('Negative total: use ceil to move toward zero and remainder applied to default user', () => {
                // -$10.00 among 3 -> base -3.33 (ceil to -3333 subunits), remainder -0.01 -> default -3.34
                const numberOfSplits = 2;
                expect(IOUUtils.calculateAmount(numberOfSplits, -1000, 'USD', true, true)).toBe(-334);
                expect(IOUUtils.calculateAmount(numberOfSplits, -1000, 'USD', false, true)).toBe(-333);
            });
        });
    });

    describe('insertTagIntoTransactionTagsString', () => {
        test('Inserting a tag into tag string should update the tag', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString(':NY:Texas', 'California', 2, true)).toBe(':NY:California');
        });

        test('Inserting a tag into an index with no tags should update the tag', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString('::California', 'NY', 1, true)).toBe(':NY:California');
        });

        test('Inserting a tag with colon in name into tag string should keep the colon in tag', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString('East:NY:California', 'City \\: \\:', 1, true)).toBe('East:City \\: \\::California');
        });

        test('Remove a tag from tagString', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString('East:City \\: \\::California', '', 1, true)).toBe('East::California');
        });

        test('Return single tag directly when hasMultipleTagLists is false', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString('East:NY:California', 'NewTag', 1, false)).toBe('NewTag');
        });

        test('Return multiple tags when hasMultipleTagLists is true', () => {
            expect(IOUUtils.insertTagIntoTransactionTagsString('East:NY:California', 'NewTag', 1, true)).toBe('East:NewTag:California');
        });
    });
});

describe('isValidMoneyRequestType', () => {
    test('Return true for valid iou type', () => {
        for (const iouType of Object.values(CONST.IOU.TYPE)) {
            expect(IOUUtils.isValidMoneyRequestType(iouType)).toBe(true);
        }
    });

    test('Return false for invalid iou type', () => {
        expect(IOUUtils.isValidMoneyRequestType('money')).toBe(false);
    });
});

describe('hasRTERWithoutViolation', () => {
    test('Return true if there is at least one rter without violation in transactionViolations with given transactionIDs.', async () => {
        const transactionIDWithViolation = 1;
        const transactionIDWithoutViolation = 2;
        const currentReportId = '';
        const transactionWithViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: currentReportId,
        };
        const transactionWithoutViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithoutViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: currentReportId,
        };
        const transactionViolations = `transactionViolations_${transactionIDWithViolation}`;
        const violations: OnyxCollection<TransactionViolations> = {
            [transactionViolations]: [
                {
                    type: 'warning',
                    name: 'rter',
                    data: {
                        tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                        rterType: 'brokenCardConnection',
                    },
                    showInReview: true,
                },
            ],
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithViolation}`, transactionWithViolation);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithoutViolation}`, transactionWithoutViolation);
        expect(hasAnyTransactionWithoutRTERViolation([transactionWithoutViolation, transactionWithViolation], violations, '', undefined, undefined)).toBe(true);
    });

    test('Return false if there is no rter without violation in all transactionViolations with given transactionIDs.', async () => {
        const transactionIDWithViolation = 1;
        const currentReportId = '';
        const transactionWithViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: currentReportId,
        };
        const transactionViolations = `transactionViolations_${transactionIDWithViolation}`;
        const violations: OnyxCollection<TransactionViolations> = {
            [transactionViolations]: [
                {
                    type: 'warning',
                    name: 'rter',
                    data: {
                        tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                        rterType: 'brokenCardConnection',
                    },
                    showInReview: true,
                },
            ],
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithViolation}`, transactionWithViolation);
        expect(hasAnyTransactionWithoutRTERViolation([transactionWithViolation], violations, '', undefined, undefined)).toBe(false);
    });
});

describe('canSubmitReport', () => {
    test('Return true if report can be submitted', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        const fakePolicy: Policy = {
            ...createRandomPolicy(6),
            ownerAccountID: currentUserAccountID,
            areRulesEnabled: true,
            preventSelfApproval: false,
            autoReportingFrequency: 'immediate',
            harvesting: {
                enabled: false,
            },
        };
        const expenseReport: Report = {
            ...createRandomReport(6, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
            ownerAccountID: currentUserAccountID,
            policyID: fakePolicy.id,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        const transactionIDWithViolation = 1;
        const transactionIDWithoutViolation = 2;
        const transactionWithViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: expenseReport?.reportID,
        };
        const transactionWithoutViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithoutViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: expenseReport?.reportID,
        };
        const transactionViolations = `transactionViolations_${transactionIDWithViolation}`;
        const violations: OnyxCollection<TransactionViolations> = {
            [transactionViolations]: [
                {
                    type: 'warning',
                    name: 'rter',
                    data: {
                        tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                        rterType: 'brokenCardConnection',
                    },
                    showInReview: true,
                },
            ],
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithViolation}`, transactionWithViolation);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithoutViolation}`, transactionWithoutViolation);
        expect(canSubmitReport(expenseReport, fakePolicy, [transactionWithViolation, transactionWithoutViolation], violations, false, '')).toBe(true);
    });

    test('Return true if report can be submitted after being reopened', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        const fakePolicy: Policy = {
            ...createRandomPolicy(6),
            ownerAccountID: currentUserAccountID,
            areRulesEnabled: true,
            preventSelfApproval: false,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: false,
            },
        };
        const expenseReport: Report = {
            ...createRandomReport(6, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
            ownerAccountID: currentUserAccountID,
            policyID: fakePolicy.id,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
            [expenseReport.reportID]: {
                actionName: CONST.REPORT.ACTIONS.TYPE.REOPENED,
            },
        });

        const transactionIDWithViolation = 1;
        const transactionIDWithoutViolation = 2;
        const transactionWithViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: expenseReport?.reportID,
        };
        const transactionWithoutViolation: Transaction = {
            ...createRandomTransaction(transactionIDWithoutViolation),
            category: '',
            tag: '',
            created: testDate,
            reportID: expenseReport?.reportID,
        };
        const transactionViolations = `transactionViolations_${transactionIDWithViolation}`;
        const violations: OnyxCollection<TransactionViolations> = {
            [transactionViolations]: [
                {
                    type: 'warning',
                    name: 'rter',
                    data: {
                        tooltip: "Personal Cards: Fix your card from Account Settings. Corporate Cards: ask your Expensify admin to fix your company's card connection.",
                        rterType: 'brokenCardConnection',
                    },
                    showInReview: true,
                },
            ],
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithViolation}`, transactionWithViolation);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDWithoutViolation}`, transactionWithoutViolation);
        expect(canSubmitReport(expenseReport, fakePolicy, [transactionWithViolation, transactionWithoutViolation], violations, false, '')).toBe(true);
    });

    test('Return false if report can not be submitted', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID});
        const fakePolicy: Policy = {
            ...createRandomPolicy(6),
            ownerAccountID: currentUserAccountID,
            areRulesEnabled: true,
            preventSelfApproval: false,
        };
        const expenseReport: Report = {
            ...createRandomReport(6, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
            ownerAccountID: currentUserAccountID,
            policyID: fakePolicy.id,
        };

        expect(canSubmitReport(expenseReport, fakePolicy, [], undefined, false, '')).toBe(false);
    });

    it('returns false if the report is archived', async () => {
        const policy: Policy = {
            ...createRandomPolicy(7),
            ownerAccountID: currentUserAccountID,
            areRulesEnabled: true,
            preventSelfApproval: false,
        };
        const report: Report = {
            ...createRandomReport(7, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            managerID: currentUserAccountID,
            ownerAccountID: currentUserAccountID,
            policyID: policy.id,
        };

        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {
            private_isArchived: new Date().toString(),
        });

        // Simulate how components call canModifyTask() by using the hook useReportIsArchived() to see if the report is archived
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
        expect(canSubmitReport(report, policy, [], undefined, isReportArchived.current, '')).toBe(false);
    });
});

describe('Check valid amount for IOU/Expense request', () => {
    test('IOU amount should be positive', () => {
        const iouReport = ReportUtils.buildOptimisticIOUReport(1, 2, 100, '1', 'USD');
        const iouTransaction = TransactionUtils.buildOptimisticTransaction({
            transactionParams: {
                amount: 100,
                currency: 'USD',
                reportID: iouReport.reportID,
            },
        });
        const iouAmount = TransactionUtils.getAmount(iouTransaction, false, false);
        expect(iouAmount).toBeGreaterThan(0);
    });

    test('Expense amount should be negative', () => {
        const expenseReport = ReportUtils.buildOptimisticExpenseReport('212', '123', 100, 122, 'USD');
        const expenseTransaction = TransactionUtils.buildOptimisticTransaction({
            transactionParams: {
                amount: 100,
                currency: 'USD',
                reportID: expenseReport.reportID,
            },
        });
        const expenseAmount = TransactionUtils.getAmount(expenseTransaction, true, false);
        expect(expenseAmount).toBeLessThan(0);
    });

    test('Unreported expense amount should retain negative sign', () => {
        const unreportedTransaction = TransactionUtils.buildOptimisticTransaction({
            transactionParams: {
                amount: 100,
                currency: 'USD',
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            },
        });
        const unreportedAmount = TransactionUtils.getAmount(unreportedTransaction, true, false);
        expect(unreportedAmount).toBeLessThan(0);
    });
});
