import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canApproveIOU, canSubmitReport} from '@userActions/IOU';
import CONST from '@src/CONST';
import * as IOUUtils from '@src/libs/IOUUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import {hasAnyTransactionWithoutRTERViolation} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportMetadata, Transaction, TransactionViolations} from '@src/types/onyx';
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

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

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

    describe('calculateSplitAmountFromPercentage', () => {
        test('Basic percentage calculation and rounding', () => {
            expect(IOUUtils.calculateSplitAmountFromPercentage(20000, 25)).toBe(5000);
            expect(IOUUtils.calculateSplitAmountFromPercentage(199, 50)).toBe(100);
        });

        test('Handles decimal percentages', () => {
            expect(IOUUtils.calculateSplitAmountFromPercentage(10000, 7.7)).toBe(770);
            expect(IOUUtils.calculateSplitAmountFromPercentage(10000, 33.3)).toBe(3330);
            expect(IOUUtils.calculateSplitAmountFromPercentage(8900, 7.7)).toBe(685);
        });

        test('Clamps percentage between 0 and 100', () => {
            expect(IOUUtils.calculateSplitAmountFromPercentage(20000, -10)).toBe(0);
            expect(IOUUtils.calculateSplitAmountFromPercentage(20000, 150)).toBe(20000);
        });

        test('Preserves negative sign for negative amounts (negative expense splits)', () => {
            // When the original transaction is negative, split amounts should also be negative
            expect(IOUUtils.calculateSplitAmountFromPercentage(-20000, 25)).toBe(-5000);
            expect(IOUUtils.calculateSplitAmountFromPercentage(-20000, 50)).toBe(-10000);
            expect(IOUUtils.calculateSplitAmountFromPercentage(-10000, 33.3)).toBe(-3330);
            // Edge case: 0% results in 0 amount (not -0)
            expect(IOUUtils.calculateSplitAmountFromPercentage(-20000, 0)).toBe(0);
            // Full amount should also be negative
            expect(IOUUtils.calculateSplitAmountFromPercentage(-20000, 100)).toBe(-20000);
        });
    });

    describe('calculateSplitPercentagesFromAmounts', () => {
        test('Equal amounts always have equal percentages', () => {
            // All equal amounts should get equal floored percentages
            const amounts = [33, 33, 35];
            const percentages = IOUUtils.calculateSplitPercentagesFromAmounts(amounts, 101);

            // First two (equal amounts) should have equal percentages
            expect(percentages.at(0)).toBe(percentages.at(1));
            // Last one (larger) should have the remainder
            expect(percentages.at(2)).toBeGreaterThan(percentages.at(0) ?? 0);
            // Sum should be 100
            expect(Math.round(percentages.reduce((sum, p) => sum + p, 0) * 10) / 10).toBe(100);
        });

        test('Zero-amount splits stay at 0 percent', () => {
            // Splits with 0 amount should have 0% even when there is a remainder
            const amounts = [33, 33, 35, 0, 0];
            const percentages = IOUUtils.calculateSplitPercentagesFromAmounts(amounts, 101);

            // Zero amounts should be 0%
            expect(percentages.at(3)).toBe(0);
            expect(percentages.at(4)).toBe(0);
            // First two (equal amounts) should have equal percentages
            expect(percentages.at(0)).toBe(percentages.at(1));
            // Sum should be 100
            expect(Math.round(percentages.reduce((sum, p) => sum + p, 0) * 10) / 10).toBe(100);
        });

        test('Returns percentages with one decimal place', () => {
            const totalInCents = 2300;
            const amounts = [766, 766, 768];
            const percentages = IOUUtils.calculateSplitPercentagesFromAmounts(amounts, totalInCents);

            // First two equal amounts should have equal percentages
            expect(percentages.at(0)).toBe(percentages.at(1));
            // Percentages should have at most one decimal place
            for (const p of percentages) {
                expect(Math.round(p * 10) / 10).toBe(p);
            }
            // Sum should be 100
            expect(Math.round(percentages.reduce((sum, p) => sum + p, 0) * 10) / 10).toBe(100);
        });

        test('Handles zero or empty totals by returning zeros', () => {
            expect(IOUUtils.calculateSplitPercentagesFromAmounts([], 0)).toEqual([]);
            expect(IOUUtils.calculateSplitPercentagesFromAmounts([0, 0], 0)).toEqual([0, 0]);
        });

        test('Uses absolute values of amounts and total', () => {
            const totalInCents = -2300;
            const amounts = [-766, -766, -768];
            const percentages = IOUUtils.calculateSplitPercentagesFromAmounts(amounts, totalInCents);

            // Equal amounts should have equal percentages
            expect(percentages.at(0)).toBe(percentages.at(1));
            // Sum should be 100
            expect(Math.round(percentages.reduce((sum, p) => sum + p, 0) * 10) / 10).toBe(100);
        });

        test('Returns floored percentages when split totals differ from original total', () => {
            const originalTotalInCents = 20000;
            const amounts = [10000, 10000, 5000]; // totals 25000, larger than original total
            const percentages = IOUUtils.calculateSplitPercentagesFromAmounts(amounts, originalTotalInCents);

            // Each amount is expressed as floored percentage of the original total
            expect(percentages.at(0)).toBe(percentages.at(1)); // Equal amounts have equal percentages
            // The sum can exceed 100 when splits are over the original total
            expect(percentages.reduce((sum, current) => sum + current, 0)).toBe(125);
        });

        test('Produces normalized percentages for 13-way split of $89', () => {
            const totalInCents = 8900;
            const amounts = [684, 684, 684, 684, 684, 685, 685, 685, 685, 685, 685, 685, 685];
            const percentages = IOUUtils.calculateSplitPercentagesFromAmounts(amounts, totalInCents);

            // All 684s (first 5) should have equal percentages
            const first5 = percentages.slice(0, 5);
            expect(new Set(first5).size).toBe(1);

            // All 685s except the last should have equal percentages
            const middle7 = percentages.slice(5, 12);
            expect(new Set(middle7).size).toBe(1);

            // Base percentage should be 7.6 (floored from 7.68-7.69)
            expect(first5.at(0)).toBe(7.6);

            // Sum should be 100
            expect(Math.round(percentages.reduce((sum, p) => sum + p, 0) * 10) / 10).toBe(100);
        });

        test('Produces normalized percentages for 12-way split of $22', () => {
            const totalInCents = 2200;
            const amounts = [183, 183, 183, 183, 183, 183, 183, 183, 184, 184, 184, 184];
            const percentages = IOUUtils.calculateSplitPercentagesFromAmounts(amounts, totalInCents);

            // All 183s (first 8) should have equal percentages
            const first8 = percentages.slice(0, 8);
            expect(new Set(first8).size).toBe(1);

            // All 184s except the last should have equal percentages
            const middle3 = percentages.slice(8, 11);
            expect(new Set(middle3).size).toBe(1);

            // Base percentage should be 8.3 (floored from 8.31-8.36)
            expect(first8.at(0)).toBe(8.3);

            // Sum should be 100
            expect(Math.round(percentages.reduce((sum, p) => sum + p, 0) * 10) / 10).toBe(100);
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
        expect(hasAnyTransactionWithoutRTERViolation([transactionWithoutViolation, transactionWithViolation], violations, '', CONST.DEFAULT_NUMBER_ID, undefined, undefined)).toBe(true);
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
        expect(hasAnyTransactionWithoutRTERViolation([transactionWithViolation], violations, '', CONST.DEFAULT_NUMBER_ID, undefined, undefined)).toBe(false);
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
        expect(canSubmitReport(expenseReport, fakePolicy, [transactionWithViolation, transactionWithoutViolation], violations, false, '', currentUserAccountID)).toBe(true);
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
        expect(canSubmitReport(expenseReport, fakePolicy, [transactionWithViolation, transactionWithoutViolation], violations, false, '', currentUserAccountID)).toBe(true);
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

        expect(canSubmitReport(expenseReport, fakePolicy, [], undefined, false, '', currentUserAccountID)).toBe(false);
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
        expect(canSubmitReport(report, policy, [], undefined, isReportArchived.current, '', currentUserAccountID)).toBe(false);
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

describe('navigateToConfirmationPage', () => {
    const transactionID = '123';
    const reportID = '444';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should navigate to confirmation step with SUBMIT iouType when iouType is REQUEST', () => {
        IOUUtils.navigateToConfirmationPage(CONST.IOU.TYPE.REQUEST, transactionID, reportID, undefined);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, undefined));
    });

    it('should navigate to confirmation step with SEND iouType when iouType is SEND and from ManualDistanceRequest', () => {
        const backToReport = '111';
        IOUUtils.navigateToConfirmationPage(CONST.IOU.TYPE.SEND, transactionID, reportID, backToReport, false, undefined, true);

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SEND, transactionID, reportID, backToReport),
        );
    });

    it('should navigate to confirmation step with PAY iouType when iouType is SEND and not from ManualDistanceRequest', () => {
        IOUUtils.navigateToConfirmationPage(CONST.IOU.TYPE.SEND, transactionID, reportID, undefined, false, undefined, false);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, transactionID, reportID));
    });

    it('should navigate to confirmation step with reportIDParam if provided in default case', () => {
        const reportIDParam = '555';
        IOUUtils.navigateToConfirmationPage(CONST.IOU.TYPE.TRACK, transactionID, reportID, undefined, false, reportIDParam);

        expect(Navigation.navigate).toHaveBeenCalledWith(
            ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, transactionID, reportIDParam, undefined),
        );
    });

    it('should navigate to confirmation step with SUBMIT iouType when shouldNavigateToSubmit = true in default case', () => {
        IOUUtils.navigateToConfirmationPage(CONST.IOU.TYPE.CREATE, transactionID, reportID, undefined, true);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, undefined));
    });

    it('should navigate to confirmation step with provided iouType directly when shouldNavigateToSubmit = false in default case', () => {
        IOUUtils.navigateToConfirmationPage(CONST.IOU.TYPE.TRACK, transactionID, reportID, undefined, false);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, transactionID, reportID, undefined));
    });
});

describe('canApproveIOU', () => {
    const REPORT_ID = '1';
    const CURRENT_USER_EMAIL = 'test@email.com';

    beforeEach(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: CURRENT_USER_EMAIL});
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('should return true for DEW policy report without pending approval', async () => {
        // Given a submitted expense report on a DEW policy without any pending approval action
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: currentUserAccountID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: currentUserAccountID,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const policy = {
            type: CONST.POLICY.TYPE.TEAM,
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
        } as unknown as Policy;

        const reportMetadata: ReportMetadata = {};

        const transaction = {
            reportID: `${REPORT_ID}`,
            transactionID: '123',
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        } as unknown as Transaction;

        // When checking if approve action is available
        // Then it should return true because DEW approval is not in progress
        expect(canApproveIOU(report, policy, reportMetadata, [transaction])).toBe(true);
    });

    it('should return false for DEW policy report with pending approval', async () => {
        // Given a submitted expense report on a DEW policy with a pending approval action
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: currentUserAccountID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: currentUserAccountID,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const policy = {
            type: CONST.POLICY.TYPE.TEAM,
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
        } as unknown as Policy;

        const reportMetadata: ReportMetadata = {
            pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE,
        };

        const transaction = {
            reportID: `${REPORT_ID}`,
            transactionID: '123',
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        } as unknown as Transaction;

        // When checking if approve action is available while DEW approval is pending
        // Then it should return false because DEW is already processing an approval
        expect(canApproveIOU(report, policy, reportMetadata, [transaction])).toBe(false);
    });

    it('should return false for non-expense report', async () => {
        // Given a non-expense report
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            ownerAccountID: currentUserAccountID,
        } as unknown as Report;

        const policy = {
            type: CONST.POLICY.TYPE.TEAM,
            approver: CURRENT_USER_EMAIL,
        } as unknown as Policy;

        const reportMetadata: ReportMetadata = {};

        // Then canApproveIOU should return false
        expect(canApproveIOU(report, policy, reportMetadata)).toBe(false);
    });
});
