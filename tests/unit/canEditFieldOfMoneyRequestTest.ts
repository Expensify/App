import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import {getSubmitToAccountID} from '@libs/PolicyUtils';
import {canEditFieldOfMoneyRequest, canEditMoneyRequest} from '@libs/ReportUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OriginalMessageIOU, Policy, ReportAction, ReportMetadata} from '@src/types/onyx';
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
                Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
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
            const EXPENSE_IOU_REPORT_ID = '33';
            const EXPENSE_IOU_TRANSACTION_ID = '44';
            const EXPENSE_AMOUNT = 50;
            const EXPENSE_NON_SUBMITTER_ACCOUNT_ID = 9999;
            const FORWARDED_APPROVER_ACCOUNT_ID = 7777;
            const FORWARDED_MANAGER_ACCOUNT_ID = 8888;
            const FORWARDED_APPROVER_EMAIL = 'forwarded.approver@expensify.test';
            const FORWARDED_APPROVER_ACCOUNT_ID_2 = 6666;
            const FORWARDED_APPROVER_EMAIL_2 = 'forwarded.approver.2@expensify.test';

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

            const reportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                ...randomReportAction,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: currentUserAccountID,
                childStateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                childStatusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
                previousMessage: [],
                originalMessage: {
                    IOUReportID,
                    IOUTransactionID,
                    type: CONST.IOU.ACTION.CREATE,
                    amount: EXPENSE_AMOUNT,
                    currency: CONST.CURRENCY.USD,
                } satisfies OriginalMessageIOU,
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
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}` as const;
            const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const;
            const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID}` as const;
            const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOUReportID}` as const;
            const reportMetadataKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${IOUReportID}` as const;

            const getCurrentMoveFixture = async () => {
                const currentPolicy = await OnyxUtils.get(policyKey);
                const currentReport = await OnyxUtils.get(reportKey);
                const currentTransaction = await OnyxUtils.get(transactionKey);
                const reportMetadata = await OnyxUtils.get(reportMetadataKey);

                return {
                    currentPolicy,
                    currentReport,
                    currentTransaction,
                    reportMetadata,
                };
            };

            const seedForwardedLikeMoveFixture = async ({
                managerID = FORWARDED_MANAGER_ACCOUNT_ID,
                approverAccountID = FORWARDED_APPROVER_ACCOUNT_ID,
                approverEmail = FORWARDED_APPROVER_EMAIL,
                pendingExpenseAction,
            }: {
                managerID?: number;
                approverAccountID?: number;
                approverEmail?: string;
                pendingExpenseAction?: ReportMetadata['pendingExpenseAction'];
            }) => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [approverAccountID]: {
                        accountID: approverAccountID,
                        login: approverEmail,
                    },
                });
                await Onyx.merge(policyKey, {
                    ...expensePolicy,
                    type: CONST.POLICY.TYPE.TEAM,
                    role: CONST.POLICY.ROLE.USER,
                    approver: approverEmail,
                    owner: approverEmail,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                });
                await Onyx.merge(reportKey, {
                    ...expenseReport,
                    managerID,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await Onyx.set(reportActionsKey, {});
                if (pendingExpenseAction) {
                    await Onyx.merge(reportMetadataKey, {pendingExpenseAction});
                } else {
                    await Onyx.merge(reportMetadataKey, {pendingExpenseAction: null});
                }
                await waitForBatchedUpdates();
            };

            beforeEach(() => {
                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [expensePolicy], (current) => current.id);
                Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                    [transactionKey]: moneyRequestTransaction,
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

            it.each([CONST.EXPENSE_PENDING_ACTION.APPROVE, CONST.EXPENSE_PENDING_ACTION.SUBMIT])(
                'should allow move for forwarded-like DEW report when pendingExpenseAction is %s',
                async (pendingExpenseAction) => {
                    await seedForwardedLikeMoveFixture({pendingExpenseAction});
                    const {currentPolicy, currentReport, currentTransaction, reportMetadata} = await getCurrentMoveFixture();
                    const submitToAccountID = getSubmitToAccountID(currentPolicy, currentReport);

                    expect(reportMetadata?.pendingExpenseAction).toBe(pendingExpenseAction);
                    expect(submitToAccountID).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                    expect(submitToAccountID).not.toBe(currentReport?.managerID);
                    expect(canEditMoneyRequest(reportAction, false, currentReport, currentPolicy, currentTransaction)).toBe(true);

                    const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                    const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);

                    expect(canEditReportField).toBe(true);
                },
            );

            it('clear metadata key hides move in a forwarded-like mismatch fixture', async () => {
                await seedForwardedLikeMoveFixture({pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE});
                const fixtureWithMetadata = await getCurrentMoveFixture();
                const submitToAccountIDWithMetadata = getSubmitToAccountID(fixtureWithMetadata.currentPolicy, fixtureWithMetadata.currentReport);

                expect(fixtureWithMetadata.reportMetadata?.pendingExpenseAction).toBe(CONST.EXPENSE_PENDING_ACTION.APPROVE);
                expect(submitToAccountIDWithMetadata).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                expect(submitToAccountIDWithMetadata).not.toBe(fixtureWithMetadata.currentReport?.managerID);
                expect(canEditMoneyRequest(reportAction, false, fixtureWithMetadata.currentReport, fixtureWithMetadata.currentPolicy, fixtureWithMetadata.currentTransaction)).toBe(true);

                const outstandingReportsWithMetadata = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditWithMetadata = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsWithMetadata);
                expect(canEditWithMetadata).toBe(true);

                await Onyx.set(reportMetadataKey, null);
                await waitForBatchedUpdates();

                const fixtureWithoutMetadata = await getCurrentMoveFixture();
                const submitToAccountIDWithoutMetadata = getSubmitToAccountID(fixtureWithoutMetadata.currentPolicy, fixtureWithoutMetadata.currentReport);

                expect(fixtureWithoutMetadata.reportMetadata).toBeNull();
                expect(submitToAccountIDWithoutMetadata).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                expect(submitToAccountIDWithoutMetadata).not.toBe(fixtureWithoutMetadata.currentReport?.managerID);
                expect(canEditMoneyRequest(reportAction, false, fixtureWithoutMetadata.currentReport, fixtureWithoutMetadata.currentPolicy, fixtureWithoutMetadata.currentTransaction)).toBe(
                    true,
                );

                const outstandingReportsWithoutMetadata = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditWithoutMetadata = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsWithoutMetadata);

                expect(canEditWithoutMetadata).toBe(false);
            });

            it('should flip move eligibility when policy approver mutation changes submitTo resolution', async () => {
                await seedForwardedLikeMoveFixture({
                    managerID: FORWARDED_APPROVER_ACCOUNT_ID,
                    approverAccountID: FORWARDED_APPROVER_ACCOUNT_ID,
                    approverEmail: FORWARDED_APPROVER_EMAIL,
                });
                const fixtureBeforeMutation = await getCurrentMoveFixture();
                const submitToBeforeMutation = getSubmitToAccountID(fixtureBeforeMutation.currentPolicy, fixtureBeforeMutation.currentReport);

                expect(fixtureBeforeMutation.reportMetadata?.pendingExpenseAction).toBeFalsy();
                expect(submitToBeforeMutation).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                expect(submitToBeforeMutation).toBe(fixtureBeforeMutation.currentReport?.managerID);
                expect(canEditMoneyRequest(reportAction, false, fixtureBeforeMutation.currentReport, fixtureBeforeMutation.currentPolicy, fixtureBeforeMutation.currentTransaction)).toBe(
                    true,
                );

                const outstandingReportsBeforeMutation = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditBeforeMutation = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsBeforeMutation);
                expect(canEditBeforeMutation).toBe(true);

                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [FORWARDED_APPROVER_ACCOUNT_ID_2]: {
                        accountID: FORWARDED_APPROVER_ACCOUNT_ID_2,
                        login: FORWARDED_APPROVER_EMAIL_2,
                    },
                });
                await Onyx.merge(policyKey, {
                    approver: FORWARDED_APPROVER_EMAIL_2,
                    owner: FORWARDED_APPROVER_EMAIL_2,
                });
                await waitForBatchedUpdates();

                const fixtureAfterMutation = await getCurrentMoveFixture();
                const submitToAfterMutation = getSubmitToAccountID(fixtureAfterMutation.currentPolicy, fixtureAfterMutation.currentReport);

                expect(fixtureAfterMutation.reportMetadata?.pendingExpenseAction).toBeFalsy();
                expect(submitToAfterMutation).toBe(FORWARDED_APPROVER_ACCOUNT_ID_2);
                expect(submitToAfterMutation).not.toBe(fixtureAfterMutation.currentReport?.managerID);
                expect(canEditMoneyRequest(reportAction, false, fixtureAfterMutation.currentReport, fixtureAfterMutation.currentPolicy, fixtureAfterMutation.currentTransaction)).toBe(true);

                const outstandingReportsAfterMutation = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditAfterMutation = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsAfterMutation);
                expect(canEditAfterMutation).toBe(false);
            });

            it('#79602 missing-signals contract: hides move when forwarded action and metadata are both missing in a forwarded-like mismatch fixture', async () => {
                const forwardedApproverAccountID = 7777;
                const forwardedManagerAccountID = 8888;
                const forwardedApproverEmail = 'forwarded.approver@expensify.test';

                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [forwardedApproverAccountID]: {
                        accountID: forwardedApproverAccountID,
                        login: forwardedApproverEmail,
                    },
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                    approver: forwardedApproverEmail,
                    owner: forwardedApproverEmail,
                    role: CONST.POLICY.ROLE.USER,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, {
                    ...expenseReport,
                    managerID: forwardedManagerAccountID,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${IOUReportID}`, {});
                await waitForBatchedUpdates();

                const currentPolicy = await OnyxUtils.get(policyKey);
                const currentReport = await OnyxUtils.get(reportKey);
                const currentTransaction = await OnyxUtils.get(transactionKey);
                const submitToAccountID = getSubmitToAccountID(currentPolicy, currentReport);
                const reportMetadata = await OnyxUtils.get(reportMetadataKey);

                expect(reportMetadata).toBeNull();
                expect(submitToAccountID).toBe(forwardedApproverAccountID);
                expect(submitToAccountID).not.toBe(currentReport?.managerID);
                expect(canEditMoneyRequest(reportAction, false, currentReport, currentPolicy, currentTransaction)).toBe(true);

                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT, undefined, undefined, outstandingReportsByPolicyID);

                expect(canEditReportField).toBe(false);
            });
        });
    });
});
