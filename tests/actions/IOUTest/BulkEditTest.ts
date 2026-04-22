/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Onyx from 'react-native-onyx';
import type {OnyxKey} from 'react-native-onyx';
import {clearBulkEditDraftTransaction, initBulkEditDraftTransaction, updateBulkEditDraftTransaction, updateMultipleMoneyRequests} from '@libs/actions/IOU/BulkEdit';
import CONST from '@src/CONST';
import * as API from '@src/libs/API';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../../utils/collections/policies';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('actions/IOU/BulkEdit', () => {
    describe('updateMultipleMoneyRequests', () => {
        it('applies expense report sign to amount updates', () => {
            const transactionID = 'transaction-1';
            const transactionThreadReportID = 'thread-1';
            const iouReportID = 'iou-1';
            const policy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);

            const transactionThread: Report = {
                ...createRandomReport(1, undefined),
                reportID: transactionThreadReportID,
                parentReportID: iouReportID,
                policyID: policy.id,
            };
            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            const buildOptimisticSpy = jest.spyOn(require('@libs/ReportUtils'), 'buildOptimisticModifiedExpenseReportAction');
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: 1000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });

            const params = writeSpy.mock.calls.at(0)?.[1] as {updates: string};
            const updates = JSON.parse(params.updates) as {amount: number};
            expect(updates.amount).toBe(1000);
            expect(buildOptimisticSpy).toHaveBeenCalledWith(
                transactionThread,
                transaction,
                expect.objectContaining({amount: 1000, currency: CONST.CURRENCY.USD}),
                true,
                policy,
                expect.anything(),
            );

            writeSpy.mockRestore();
            buildOptimisticSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });

        it('skips updates when bulk edit value matches the current transaction field', () => {
            const transactionID = 'transaction-1';
            const transactionThreadReportID = 'thread-1';
            const iouReportID = 'iou-1';
            const policy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);

            const transactionThread: Report = {
                ...createRandomReport(1, undefined),
                reportID: transactionThreadReportID,
                parentReportID: iouReportID,
                policyID: policy.id,
            };
            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: -1000,
                currency: CONST.CURRENCY.USD,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: 1000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });

            expect(writeSpy).not.toHaveBeenCalled();

            writeSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });

        it('updates report totals across multiple transactions in the same report', () => {
            const firstTransactionID = 'transaction-4';
            const secondTransactionID = 'transaction-5';
            const iouReportID = 'iou-4';
            const policy = createRandomPolicy(4, CONST.POLICY.TYPE.TEAM);

            const iouReport: Report = {
                ...createRandomReport(4, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                total: -2600,
                currency: CONST.CURRENCY.USD,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${firstTransactionID}`]: {
                    ...createRandomTransaction(4),
                    transactionID: firstTransactionID,
                    reportID: iouReportID,
                    amount: -1300,
                    currency: CONST.CURRENCY.USD,
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${secondTransactionID}`]: {
                    ...createRandomTransaction(5),
                    transactionID: secondTransactionID,
                    reportID: iouReportID,
                    amount: -1300,
                    currency: CONST.CURRENCY.USD,
                },
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            updateMultipleMoneyRequests({
                transactionIDs: [firstTransactionID, secondTransactionID],
                changes: {amount: 1000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });

            const getOptimisticTotal = (callIndex: number) => {
                const onyxData = writeSpy.mock.calls.at(callIndex)?.[2] as {optimisticData: Array<{key: string; value?: {total?: number}}>};
                const reportUpdate = onyxData.optimisticData.find((update) => update.key === `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`);
                return reportUpdate?.value?.total;
            };

            expect(getOptimisticTotal(0)).toBe(-2300);
            expect(getOptimisticTotal(1)).toBe(-2000);

            writeSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });

        it('supports negative amount updates for expense reports', () => {
            const transactionID = 'transaction-3';
            const transactionThreadReportID = 'thread-3';
            const iouReportID = 'iou-3';
            const policy = createRandomPolicy(3, CONST.POLICY.TYPE.TEAM);

            const transactionThread: Report = {
                ...createRandomReport(3, undefined),
                reportID: transactionThreadReportID,
                parentReportID: iouReportID,
                policyID: policy.id,
            };
            const iouReport: Report = {
                ...createRandomReport(4, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(3),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                // Expense reports store amounts with the opposite sign of what the UI displays.
                amount: -1000,
                currency: CONST.CURRENCY.USD,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            const buildOptimisticSpy = jest.spyOn(require('@libs/ReportUtils'), 'buildOptimisticModifiedExpenseReportAction');
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: -1000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });

            const params = writeSpy.mock.calls.at(0)?.[1] as {updates: string};
            const updates = JSON.parse(params.updates) as {amount: number};
            expect(updates.amount).toBe(-1000);
            expect(buildOptimisticSpy).toHaveBeenCalledWith(
                transactionThread,
                transaction,
                expect.objectContaining({amount: -1000, currency: CONST.CURRENCY.USD}),
                true,
                policy,
                expect.anything(),
            );

            writeSpy.mockRestore();
            buildOptimisticSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });

        it('sends billable and reimbursable updates for bulk edit', () => {
            const transactionID = 'transaction-7';
            const transactionThreadReportID = 'thread-7';
            const iouReportID = 'iou-7';
            const policy = createRandomPolicy(7, CONST.POLICY.TYPE.TEAM);

            const transactionThread: Report = {
                ...createRandomReport(7, undefined),
                reportID: transactionThreadReportID,
                parentReportID: iouReportID,
                policyID: policy.id,
            };
            const iouReport: Report = {
                ...createRandomReport(8, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(7),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: 1000,
                billable: false,
                reimbursable: true,
                currency: CONST.CURRENCY.USD,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {billable: true, reimbursable: false},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });

            const params = writeSpy.mock.calls.at(0)?.[1] as {updates: string};
            const updates = JSON.parse(params.updates) as {billable: boolean; reimbursable: boolean};
            expect(updates.billable).toBe(true);
            expect(updates.reimbursable).toBe(false);

            writeSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });

        it('keeps invoice amount updates positive', () => {
            const transactionID = 'transaction-2';
            const transactionThreadReportID = 'thread-2';
            const iouReportID = 'iou-2';
            const policy = createRandomPolicy(2, CONST.POLICY.TYPE.TEAM);

            const transactionThread: Report = {
                ...createRandomReport(3, undefined),
                reportID: transactionThreadReportID,
                parentReportID: iouReportID,
                policyID: policy.id,
            };
            const iouReport: Report = {
                ...createRandomReport(4, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.INVOICE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(2),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            const buildOptimisticSpy = jest.spyOn(require('@libs/ReportUtils'), 'buildOptimisticModifiedExpenseReportAction');
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: 1000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });

            const params = writeSpy.mock.calls.at(0)?.[1] as {updates: string};
            const updates = JSON.parse(params.updates) as {amount: number};
            expect(updates.amount).toBe(1000);
            expect(buildOptimisticSpy).toHaveBeenCalledWith(
                transactionThread,
                transaction,
                expect.objectContaining({amount: 1000, currency: CONST.CURRENCY.USD}),
                false,
                policy,
                expect.anything(),
            );

            writeSpy.mockRestore();
            buildOptimisticSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });

        it('saves changes for unreported (track) expenses without a reportAction', () => {
            const transactionID = 'transaction-unreported';
            const transactionThreadReportID = 'thread-unreported';
            const policy = createRandomPolicy(10, CONST.POLICY.TYPE.TEAM);

            const transactionThread: Report = {
                ...createRandomReport(10, undefined),
                reportID: transactionThreadReportID,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`]: transactionThread,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(10),
                transactionID,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                transactionThreadReportID,
                amount: 500,
                currency: CONST.CURRENCY.USD,
                merchant: 'Old merchant',
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            // No canEditFieldOfMoneyRequest mock — unreported expenses must bypass that check
            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {merchant: 'New merchant'},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });

            expect(writeSpy).toHaveBeenCalled();
            const params = writeSpy.mock.calls.at(0)?.[1] as {updates: string};
            const updates = JSON.parse(params.updates) as {merchant: string};
            expect(updates.merchant).toBe('New merchant');

            writeSpy.mockRestore();
        });

        it('does not add violations for unreported expenses during bulk edit', async () => {
            const transactionID = 'transaction-unreported-viol';
            const transactionThreadReportID = 'thread-unreported-viol';
            const policy = {...createRandomPolicy(10, CONST.POLICY.TYPE.TEAM), requiresCategory: true, requiresTag: true};

            const transactionThread: Report = {
                ...createRandomReport(10, undefined),
                reportID: transactionThreadReportID,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`]: transactionThread,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(10),
                transactionID,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                transactionThreadReportID,
                amount: 500,
                currency: CONST.CURRENCY.USD,
                category: undefined,
                tag: undefined,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);
            await waitForBatchedUpdates();

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: 1000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: {
                    [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Food: {name: 'Food', enabled: true, 'GL Code': '', unencodedName: 'Food', externalID: '', areCommentsRequired: false, origin: ''},
                    },
                },
                policyTags: {
                    [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`]: {
                        Department: {
                            name: 'Department',
                            required: true,
                            orderWeight: 0,
                            tags: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                Engineering: {name: 'Engineering', enabled: true},
                            },
                        },
                    },
                },
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });
            await waitForBatchedUpdates();

            // Unreported expenses should not get any violations (missingCategory, missingTag, etc.)
            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            expect(updatedViolations ?? []).toHaveLength(0);
        });

        it('removes DUPLICATED_TRANSACTION violation optimistically when amount is changed', async () => {
            const transactionID = 'transaction-1';
            const transactionThreadReportID = 'thread-1';
            const iouReportID = 'iou-1';
            const policy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);

            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [{name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.VIOLATION}]);
            await waitForBatchedUpdates();

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: 2000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            const violationNames = updatedViolations?.map((v) => v.name) ?? [];
            expect(violationNames).not.toContain(CONST.VIOLATIONS.DUPLICATED_TRANSACTION);

            canEditFieldSpy.mockRestore();
        });

        it('removes CATEGORY_OUT_OF_POLICY violation optimistically when category is cleared', async () => {
            const transactionID = 'transaction-1';
            const transactionThreadReportID = 'thread-1';
            const iouReportID = 'iou-1';
            const policy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);

            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                category: 'OldCategory',
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [{name: CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY, type: CONST.VIOLATION_TYPES.VIOLATION}]);
            await waitForBatchedUpdates();

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {category: ''},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            const violationNames = updatedViolations?.map((v) => v.name) ?? [];
            expect(violationNames).not.toContain(CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY);

            canEditFieldSpy.mockRestore();
        });

        it('clears category-out-of-policy violation when the new category is valid', async () => {
            const transactionID = 'transaction-1';
            const transactionThreadReportID = 'thread-1';
            const iouReportID = 'iou-1';
            const policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), requiresCategory: true};

            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                category: 'InvalidCategory',
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const policyCategories = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Food: {name: 'Food', enabled: true, 'GL Code': '', unencodedName: 'Food', externalID: '', areCommentsRequired: false, origin: ''},
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [{name: CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY, type: CONST.VIOLATION_TYPES.VIOLATION}]);
            await waitForBatchedUpdates();

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {category: 'Food'},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: {
                    [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`]: policyCategories,
                },
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });
            await waitForBatchedUpdates();

            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            const violationNames = updatedViolations?.map((v) => v.name) ?? [];
            expect(violationNames).not.toContain(CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY);

            canEditFieldSpy.mockRestore();
        });

        it('uses the transaction own policy for violation checks in cross-policy bulk edits', async () => {
            const transactionID = 'transaction-1';
            const transactionThreadReportID = 'thread-1';
            const bulkEditPolicyID = '1';
            const transactionPolicyID = '2';

            // bulkEditPolicy requires categories — would add missingCategory if used for the transaction
            const bulkEditPolicy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: bulkEditPolicyID, requiresCategory: true};
            // transactionPolicy does NOT require categories — correct policy for this transaction
            const transactionPolicy = {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), id: transactionPolicyID, requiresCategory: false};

            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: 'iou-1',
                policyID: transactionPolicyID,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}iou-1`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: 'iou-1',
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                category: undefined,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);
            await waitForBatchedUpdates();

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {merchant: 'New Merchant'},
                policy: bulkEditPolicy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                allPolicies: {
                    [`${ONYXKEYS.COLLECTION.POLICY}${transactionPolicyID}`]: transactionPolicy,
                },
                introSelected: undefined,
                betas: undefined,
            });
            await waitForBatchedUpdates();

            // transactionPolicy does not require categories, so no missingCategory violation should be added
            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            const violationNames = updatedViolations?.map((v) => v.name) ?? [];
            expect(violationNames).not.toContain(CONST.VIOLATIONS.MISSING_CATEGORY);

            canEditFieldSpy.mockRestore();
        });

        it('does not add false categoryOutOfPolicy violation in cross-policy bulk edit when category exists in transaction policy', async () => {
            const transactionID = 'transaction-cross-cat-1';
            const transactionThreadReportID = 'thread-cross-cat-1';
            const bulkEditPolicyID = 'bulk-policy';
            const transactionPolicyID = 'tx-policy';

            // bulkEditPolicy does NOT have "Engineering" category
            const bulkEditPolicy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: bulkEditPolicyID, requiresCategory: true};
            // transactionPolicy DOES have "Engineering" category — the transaction's category is valid here
            const txPolicy = {...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM), id: transactionPolicyID, requiresCategory: true};

            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: 'iou-cross-cat-1',
                policyID: transactionPolicyID,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}iou-cross-cat-1`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: 'iou-cross-cat-1',
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                category: 'Engineering',
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);
            await waitForBatchedUpdates();

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);

            // Pass categories for BOTH policies — "Engineering" only exists in the transaction's policy
            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: 2000},
                policy: bulkEditPolicy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: {
                    [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${bulkEditPolicyID}`]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Marketing: {name: 'Marketing', enabled: true, 'GL Code': '', unencodedName: 'Marketing', externalID: '', areCommentsRequired: false, origin: ''},
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${transactionPolicyID}`]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Engineering: {name: 'Engineering', enabled: true, 'GL Code': '', unencodedName: 'Engineering', externalID: '', areCommentsRequired: false, origin: ''},
                    },
                },
                policyTags: {},
                hash: undefined,
                allPolicies: {
                    [`${ONYXKEYS.COLLECTION.POLICY}${transactionPolicyID}`]: txPolicy,
                },
                introSelected: undefined,
                betas: undefined,
            });
            await waitForBatchedUpdates();

            // "Engineering" exists in the transaction's own policy, so no categoryOutOfPolicy violation
            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            const violationNames = updatedViolations?.map((v) => v.name) ?? [];
            expect(violationNames).not.toContain(CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY);

            canEditFieldSpy.mockRestore();
        });

        it('adds categoryOutOfPolicy violation when category does not exist in transaction own policy', async () => {
            const transactionID = 'transaction-bad-cat-1';
            const transactionThreadReportID = 'thread-bad-cat-1';
            const policyID = 'cat-policy';

            const policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), id: policyID, requiresCategory: true};

            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: 'iou-bad-cat-1',
                policyID,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}iou-bad-cat-1`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: 'iou-bad-cat-1',
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                category: 'NonExistentCategory',
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);
            await waitForBatchedUpdates();

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: 2000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: {
                    [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`]: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Food: {name: 'Food', enabled: true, 'GL Code': '', unencodedName: 'Food', externalID: '', areCommentsRequired: false, origin: ''},
                    },
                },
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });
            await waitForBatchedUpdates();

            // "NonExistentCategory" is not in the policy categories, so categoryOutOfPolicy should be added
            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            const violationNames = updatedViolations?.map((v) => v.name) ?? [];
            expect(violationNames).toContain(CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY);

            canEditFieldSpy.mockRestore();
        });

        it('uses passed policyTags to detect tagOutOfPolicy violation during bulk edit', async () => {
            const transactionID = 'transaction-tag-1';
            const transactionThreadReportID = 'thread-tag-1';
            const iouReportID = 'iou-tag-1';
            const policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                requiresTag: true,
                areTagsEnabled: true,
            };

            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                tag: 'InvalidTag',
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            // Policy tags that do NOT contain "InvalidTag" — only "ValidTag" is enabled
            const policyTagsForPolicy = {
                Department: {
                    name: 'Department',
                    required: true,
                    orderWeight: 0,
                    tags: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        ValidTag: {name: 'ValidTag', enabled: true},
                    },
                },
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, []);
            await waitForBatchedUpdates();

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {amount: 2000},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {
                    [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`]: policyTagsForPolicy,
                },
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });
            await waitForBatchedUpdates();

            // "InvalidTag" is not in the policy tag list, so tagOutOfPolicy should be added
            const updatedViolations = await getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
            const violationNames = updatedViolations?.map((v) => v.name) ?? [];
            expect(violationNames).toContain(CONST.VIOLATIONS.TAG_OUT_OF_POLICY);

            canEditFieldSpy.mockRestore();
        });

        it('skips category, tag, tax, and billable changes for plain IOU transactions', async () => {
            const transactionID = 'transaction-iou-1';
            const transactionThreadReportID = 'thread-iou-1';
            const iouReportID = 'iou-report-1';
            const policy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM);

            // IOU report — NOT an expense report (type is not EXPENSE)
            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: policy.id,
                type: CONST.REPORT.TYPE.IOU,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {category: 'Food', billable: true},
                policy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                introSelected: undefined,
                betas: undefined,
            });

            // category/billable changes must be silently dropped for IOUs —
            // no API call should be made since there are no valid updates
            expect(writeSpy).not.toHaveBeenCalled();

            writeSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });

        it('uses per-transaction policy for category tax mapping in cross-policy bulk edit', () => {
            // Given: two different policies – transactionPolicy has expense rules mapping "Advertising" → "id_TAX_RATE_1",
            // while the shared bulk-edit policy has no expense rules at all.
            const transactionID = 'transaction-cross-policy-1';
            const transactionThreadReportID = 'thread-cross-policy-1';
            const iouReportID = 'iou-cross-policy-1';

            const category = 'Advertising';
            const expectedTaxCode = 'id_TAX_RATE_1';

            // Transaction's own policy – has tax expense rules
            const transactionPolicy: Policy = {
                ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
                taxRates: CONST.DEFAULT_TAX,
                rules: {expenseRules: createCategoryTaxExpenseRules(category, expectedTaxCode)},
            };

            // Shared bulk-edit policy – no expense rules, different ID
            const sharedBulkEditPolicy: Policy = {
                ...createRandomPolicy(2, CONST.POLICY.TYPE.TEAM),
                taxRates: CONST.DEFAULT_TAX,
                // No expense rules — category should NOT resolve to a tax code via this policy
            };

            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: transactionPolicy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: -1000,
                currency: CONST.CURRENCY.USD,
                category: '',
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            // Make the transaction's own policy resolvable via allPolicies
            const allPolicies = {
                [`${ONYXKEYS.COLLECTION.POLICY}${transactionPolicy.id}`]: transactionPolicy,
                [`${ONYXKEYS.COLLECTION.POLICY}${sharedBulkEditPolicy.id}`]: sharedBulkEditPolicy,
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            // When: bulk-editing with the shared policy (different from transaction's policy)
            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {category},
                policy: sharedBulkEditPolicy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                allPolicies,
                introSelected: undefined,
                betas: undefined,
            });

            // Then: the optimistic transaction update should use the transaction's own policy for tax resolution.
            // Check the optimistic Onyx data passed to API.write (3rd argument) for the TRANSACTION merge.
            const writeCall = writeSpy.mock.calls.at(0);
            expect(writeCall).toBeDefined();

            const onyxData = writeCall?.[2] as {optimisticData: Array<{key: string; value: Partial<Transaction>}>} | undefined;
            const transactionOnyxUpdate = onyxData?.optimisticData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
            expect(transactionOnyxUpdate).toBeDefined();

            // The tax code should resolve from the transaction's policy (which has the expense rule),
            // NOT from the shared bulk-edit policy (which has no expense rules)
            expect(transactionOnyxUpdate?.value?.taxCode).toBe(expectedTaxCode);

            writeSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });

        it('passes per-transaction policy to buildOptimisticModifiedExpenseReportAction in cross-policy bulk edit', () => {
            // Given: two different policies — the transaction belongs to transactionPolicy,
            // but the shared bulk-edit policy is a different workspace.
            const transactionID = 'transaction-report-action-policy-1';
            const transactionThreadReportID = 'thread-report-action-policy-1';
            const iouReportID = 'iou-report-action-policy-1';

            const transactionPolicy: Policy = {
                ...createRandomPolicy(10, CONST.POLICY.TYPE.TEAM),
            };

            const sharedBulkEditPolicy: Policy = {
                ...createRandomPolicy(20, CONST.POLICY.TYPE.TEAM),
            };

            const transactionThread: Report = {
                ...createRandomReport(1, undefined),
                reportID: transactionThreadReportID,
                parentReportID: iouReportID,
                policyID: transactionPolicy.id,
            };
            const iouReport: Report = {
                ...createRandomReport(2, undefined),
                reportID: iouReportID,
                policyID: transactionPolicy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 1000,
            };

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`]: transactionThread,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]: iouReport,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: iouReportID,
                transactionThreadReportID,
                amount: -1000,
                currency: CONST.CURRENCY.USD,
                reimbursable: true,
            };
            const transactions = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const allPolicies = {
                [`${ONYXKEYS.COLLECTION.POLICY}${transactionPolicy.id}`]: transactionPolicy,
                [`${ONYXKEYS.COLLECTION.POLICY}${sharedBulkEditPolicy.id}`]: sharedBulkEditPolicy,
            };

            const canEditFieldSpy = jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
            const buildOptimisticSpy = jest.spyOn(require('@libs/ReportUtils'), 'buildOptimisticModifiedExpenseReportAction');
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            const writeSpy = jest.spyOn(API, 'write').mockImplementation(jest.fn());

            // When: bulk-editing reimbursable with the shared policy (different from transaction's policy)
            updateMultipleMoneyRequests({
                transactionIDs: [transactionID],
                changes: {reimbursable: false},
                policy: sharedBulkEditPolicy,
                reports,
                transactions,
                reportActions: {},
                policyCategories: undefined,
                policyTags: {},
                hash: undefined,
                allPolicies,
                introSelected: undefined,
                betas: undefined,
            });

            // Then: buildOptimisticModifiedExpenseReportAction should receive the transaction's own policy,
            // not the shared bulk-edit policy. This matters because getUpdatedMoneyRequestReportData
            // (called after) uses the same policy for maybeUpdateReportNameForFormulaTitle.
            expect(buildOptimisticSpy).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.objectContaining({id: transactionPolicy.id}),
                expect.anything(),
            );

            writeSpy.mockRestore();
            buildOptimisticSpy.mockRestore();
            canEditFieldSpy.mockRestore();
        });
    });

    describe('bulk edit draft transaction', () => {
        const draftKey = `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}` as OnyxKey;

        it('initializes the bulk edit draft transaction', async () => {
            await Onyx.set(draftKey, {amount: 1000});
            await waitForBatchedUpdates();

            const testTransactionIDs = ['transaction1', 'transaction2', 'transaction3'];
            initBulkEditDraftTransaction(testTransactionIDs);
            await waitForBatchedUpdates();

            const draftTransaction = await getOnyxValue(draftKey);
            expect(draftTransaction).toMatchObject({
                transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID,
                selectedTransactionIDs: testTransactionIDs,
            });
        });

        it('updates the bulk edit draft transaction', async () => {
            await Onyx.set(draftKey, {transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID, merchant: 'Gym'});
            await waitForBatchedUpdates();

            updateBulkEditDraftTransaction({amount: 1000});
            await waitForBatchedUpdates();

            const draftTransaction = await getOnyxValue(draftKey);
            expect(draftTransaction).toMatchObject({
                transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID,
                merchant: 'Gym',
                amount: 1000,
            });
        });

        it('clears the bulk edit draft transaction', async () => {
            await Onyx.set(draftKey, {transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID, amount: 1000});
            await waitForBatchedUpdates();

            clearBulkEditDraftTransaction();
            await waitForBatchedUpdates();

            const draftTransaction = await getOnyxValue(draftKey);
            expect(draftTransaction).toBeUndefined();
        });
    });
});
