import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createExpenseReport, createInvoiceReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const currentUserAccountID = 5;
const currentUserEmail = 'bjorn@vikings.net';
const secondUserAccountID = 6;

const policy: Policy = {
    id: '1',
    name: 'Vikings Policy',
    role: 'user',
    type: CONST.POLICY.TYPE.TEAM,
    owner: '',
    outputCurrency: '',
    isPolicyExpenseChatEnabled: false,
};
describe('canEditFieldOfMoneyRequest', () => {
    describe('move expense', () => {
        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});

            const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy], (current) => current.id);
            Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                ...policyCollectionDataSet,
            });
            initOnyxDerivedValues();

            return waitForBatchedUpdates();
        });

        describe('type is invoice', () => {
            const reportActionID = 2;
            const IOUReportID = '1234';
            const IOUTransactionID = '123';
            const randomReportAction = createRandomReportAction(reportActionID);
            const policyID = '2424';
            const amount = 39;

            const policy1 = {...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM), areInvoicesEnabled: true, role: CONST.POLICY.ROLE.ADMIN};

            // Given that there is at least one outstanding expense report in a policy
            const outstandingExpenseReport = {
                ...createExpenseReport(483),
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: currentUserAccountID,
            };

            // When a user creates an invoice in the same policy

            const reportAction = {
                ...randomReportAction,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: currentUserAccountID,
                childStateNum: CONST.REPORT.STATE_NUM.OPEN,
                childStatusNum: CONST.REPORT.STATUS_NUM.OPEN,
                originalMessage: {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    ...randomReportAction.originalMessage,
                    IOUReportID,
                    IOUTransactionID,
                    type: CONST.IOU.ACTION.CREATE,
                    amount,
                    currency: CONST.CURRENCY.USD,
                },
            };

            const moneyRequestTransaction = {...createRandomTransaction(Number(IOUTransactionID)), reportID: IOUReportID, transactionID: IOUTransactionID, amount};

            const invoiceReport = {
                ...createInvoiceReport(Number(IOUReportID)),
                policyID,
                ownerAccountID: currentUserAccountID,
                state: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: 8723,
            };

            beforeEach(() => {
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID}`, moneyRequestTransaction);
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, invoiceReport);
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${483}`, outstandingExpenseReport);
                Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy1);
                return waitForBatchedUpdates();
            });

            afterEach(() => {
                Onyx.clear();
                return waitForBatchedUpdates();
            });

            it('should return false for invoice report action if it is not outstanding report', async () => {
                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

                const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);
                expect(canEditReportField).toBe(false);
            });

            it('should return true for invoice report action when there are outstanding reports', async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, outstandingExpenseReport);
                await waitForBatchedUpdates();
                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

                const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);

                expect(canEditReportField).toBe(true);
            });
        });

        describe('type is expense', () => {
            // Test constants for expense report scenarios
            const EXPENSE_OUTSTANDING_REPORT_1_ID = 11;
            const EXPENSE_OUTSTANDING_REPORT_2_ID = 22;
            const EXPENSE_IOU_REPORT_ID = 33;
            const EXPENSE_IOU_TRANSACTION_ID = 44;
            const EXPENSE_AMOUNT = 50;
            const EXPENSE_NON_SUBMITTER_ACCOUNT_ID = 9999;

            const reportActionID = 11;
            const IOUReportID = EXPENSE_IOU_REPORT_ID;
            const IOUTransactionID = EXPENSE_IOU_TRANSACTION_ID;
            const randomReportAction = createRandomReportAction(reportActionID);
            const policyID = '11';

            const expensePolicy = {...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM), role: CONST.POLICY.ROLE.USER};

            // Create outstanding expense reports in the same policy (different IDs than our main expense report)
            const outstandingExpenseReport1 = {
                ...createExpenseReport(EXPENSE_OUTSTANDING_REPORT_1_ID),
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: currentUserAccountID,
            };

            const outstandingExpenseReport2 = {
                ...createExpenseReport(EXPENSE_OUTSTANDING_REPORT_2_ID),
                policyID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: currentUserAccountID,
            };

            const reportAction = {
                ...randomReportAction,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: currentUserAccountID,
                childStateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                childStatusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                originalMessage: {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    ...randomReportAction.originalMessage,
                    IOUReportID,
                    IOUTransactionID,
                    type: CONST.IOU.ACTION.CREATE,
                    amount: EXPENSE_AMOUNT,
                    currency: CONST.CURRENCY.USD,
                },
            };

            const moneyRequestTransaction = {
                ...createRandomTransaction(Number(IOUTransactionID)),
                reportID: IOUReportID,
                managedCard: false,
                transactionID: IOUTransactionID,
                amount: EXPENSE_AMOUNT,
            };

            const expenseReport = {
                ...createExpenseReport(Number(IOUReportID)),
                policyID,
                ownerAccountID: currentUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            beforeEach(() => {
                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [expensePolicy], (current) => current.id);
                Onyx.multiSet({
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID}`]: moneyRequestTransaction,
                    ...policyCollectionDataSet,
                });
                return waitForBatchedUpdates();
            });

            afterEach(() => {
                Onyx.clear();
                return waitForBatchedUpdates();
            });

            it('should return true for submitter of a distance request for amount and currency fields', async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${moneyRequestTransaction.transactionID}`, {iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE});
                await waitForBatchedUpdates();

                // If it is the submitter of a distance request
                const canEditReportFieldAmount = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT, undefined, undefined);
                const canEditReportFieldCurrency = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.CURRENCY, undefined, undefined);

                // Then we should allow editing amount and currency fields.
                expect(canEditReportFieldAmount).toBe(true);
                expect(canEditReportFieldCurrency).toBe(true);
            });

            it('should return true for submitter when there are multiple outstanding reports', async () => {
                // Given that there are multiple outstanding expense reports in the same policy
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await waitForBatchedUpdates();
                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

                // When the submitter tries to move an expense between reports
                const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);

                // Then they should be able to move the expense since there are multiple outstanding expense reports
                expect(canEditReportField).toBe(true);
            });

            it('should return false when the current user is not the submitter or admin and the report is open', async () => {
                // Given that there are outstanding expense reports but the current user is not the submitter
                const nonSubmitterExpenseReport = {
                    ...expenseReport,
                    ownerAccountID: EXPENSE_NON_SUBMITTER_ACCOUNT_ID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, nonSubmitterExpenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await waitForBatchedUpdates();
                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

                // When a user tries to move an expense between reports
                const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);

                // Then they should not be able to move the expense since only the submitter or admin can edit the report when the report is open
                expect(canEditReportField).toBe(false);
            });

            it('should return false when there is only one outstanding report and the current user is not the submitter', async () => {
                // Given that other reports in the policy are not outstanding (approved and reimbursed)
                const approvedReport1 = {
                    ...outstandingExpenseReport1,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                };
                const reimbursedReport2 = {
                    ...outstandingExpenseReport2,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, {
                    ...expenseReport,
                    ownerAccountID: secondUserAccountID,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, approvedReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, reimbursedReport2);
                await waitForBatchedUpdates();
                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

                // When trying to move an expense between reports
                const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);

                // Then they should not be able to move the expense since there's only one outstanding report
                expect(canEditReportField).toBe(false);
            });

            it('should return false when the expense report is not outstanding report', async () => {
                // Given that there are multiple outstanding expense reports in the same policy
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, {...expenseReport, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await waitForBatchedUpdates();
                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

                // When the submitter tries to move an expense between reports
                const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);

                // Then they should be able to move the expense since there are multiple outstanding expense reports
                expect(canEditReportField).toBe(false);
            });
        });
    });
});
