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

                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: moneyRequestTransaction,
                });
                expect(canEditReportField).toBe(false);
            });

            it('should return true for invoice report action when there are outstanding reports', async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, outstandingExpenseReport);
                await waitForBatchedUpdates();
                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: moneyRequestTransaction,
                });

                expect(canEditReportField).toBe(true);
            });

            it('should return false for invoice report action when billable field is edited on an approved invoice report', async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, {
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                });
                await waitForBatchedUpdates();

                const canEditBillable = canEditFieldOfMoneyRequest({reportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.BILLABLE, transaction: moneyRequestTransaction});
                expect(canEditBillable).toBe(false);
            });

            it('should return true for invoice report action when billable field is edited on an unapproved invoice report', () => {
                const canEditBillable = canEditFieldOfMoneyRequest({reportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.BILLABLE, transaction: moneyRequestTransaction});
                expect(canEditBillable).toBe(true);
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
            const FORWARDED_MANAGER_EMAIL = 'forwarded.manager@expensify.test';
            const FORWARDED_APPROVER_ACCOUNT_ID_2 = 6666;
            const FORWARDED_APPROVER_EMAIL_2 = 'forwarded.approver.2@expensify.test';

            const reportActionID = 11;
            const IOUReportID = EXPENSE_IOU_REPORT_ID;
            const IOUTransactionID = EXPENSE_IOU_TRANSACTION_ID;
            const randomReportAction = createRandomReportAction(reportActionID);
            const policyID = '11';

            const expensePolicy = {
                ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                role: CONST.POLICY.ROLE.USER,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                approver: currentUserEmail,
            };

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
                managerID: currentUserAccountID,
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
                    ...(randomReportAction.originalMessage as Partial<OriginalMessageIOU>),
                    IOUReportID,
                    IOUTransactionID,
                    type: CONST.IOU.ACTION.CREATE,
                    amount: EXPENSE_AMOUNT,
                    currency: CONST.CURRENCY.USD,
                } satisfies OriginalMessageIOU,
            };

            const moneyRequestTransaction = {
                ...createRandomTransaction(Number(IOUTransactionID)),
                reportID: String(IOUReportID),
                managedCard: false,
                transactionID: String(IOUTransactionID),
                amount: EXPENSE_AMOUNT,
            };

            const expenseReport = {
                ...createExpenseReport(Number(IOUReportID)),
                policyID,
                ownerAccountID: currentUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: currentUserAccountID,
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

            const createMoveWorkflowAction = (id: number, actionName: ReportAction['actionName'], created: string): ReportAction => ({
                ...createRandomReportAction(id),
                reportActionID: String(id),
                actionName,
                created,
                pendingAction: null,
            });

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
            } = {}) => {
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

            const seedForwardingRelationshipMoveFixture = async ({
                submitToEmployee = {
                    email: FORWARDED_APPROVER_EMAIL,
                    forwardsTo: FORWARDED_MANAGER_EMAIL,
                    role: CONST.POLICY.ROLE.ADMIN,
                },
            }: {
                submitToEmployee?: NonNullable<Policy['employeeList']>[string];
            } = {}) => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [currentUserAccountID]: {
                        accountID: currentUserAccountID,
                        login: currentUserEmail,
                    },
                    [FORWARDED_APPROVER_ACCOUNT_ID]: {
                        accountID: FORWARDED_APPROVER_ACCOUNT_ID,
                        login: FORWARDED_APPROVER_EMAIL,
                    },
                    [FORWARDED_MANAGER_ACCOUNT_ID]: {
                        accountID: FORWARDED_MANAGER_ACCOUNT_ID,
                        login: FORWARDED_MANAGER_EMAIL,
                    },
                });
                await Onyx.merge(policyKey, {
                    ...expensePolicy,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    role: CONST.POLICY.ROLE.ADMIN,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    employeeList: {
                        [currentUserEmail]: {
                            email: currentUserEmail,
                            submitsTo: FORWARDED_APPROVER_EMAIL,
                            role: CONST.POLICY.ROLE.USER,
                        },
                        [FORWARDED_APPROVER_EMAIL]: submitToEmployee,
                        [FORWARDED_MANAGER_EMAIL]: {
                            email: FORWARDED_MANAGER_EMAIL,
                            role: CONST.POLICY.ROLE.ADMIN,
                        },
                    },
                });
                await Onyx.merge(reportKey, {
                    ...expenseReport,
                    managerID: FORWARDED_MANAGER_ACCOUNT_ID,
                    submitted: '2026-04-03 10:00:00',
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await Onyx.set(reportActionsKey, {});
                await Onyx.set(reportMetadataKey, null);
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
                const distanceTransaction = {...moneyRequestTransaction, iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE};
                const canEditReportFieldAmount = canEditFieldOfMoneyRequest({reportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.AMOUNT, transaction: distanceTransaction});
                const canEditReportFieldCurrency = canEditFieldOfMoneyRequest({reportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.CURRENCY, transaction: distanceTransaction});

                // Then we should allow editing amount and currency fields.
                expect(canEditReportFieldAmount).toBe(true);
                expect(canEditReportFieldCurrency).toBe(true);
            });

            it('should return true for submitter when there are multiple outstanding reports', async () => {
                // Given that there are multiple outstanding expense reports in the same policy
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, expenseReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, expensePolicy);
                await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [currentUserAccountID]: {
                        accountID: currentUserAccountID,
                        login: currentUserEmail,
                    },
                });
                await waitForBatchedUpdates();
                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);

                // When the submitter tries to move an expense between reports
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: moneyRequestTransaction,
                });

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
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: moneyRequestTransaction,
                });

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
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: moneyRequestTransaction,
                });

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
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: moneyRequestTransaction,
                });

                // Then they should be able to move the expense since there are multiple outstanding expense reports
                expect(canEditReportField).toBe(false);
            });

            it('should hide move when the submit-to approver forwards to the current manager', async () => {
                await seedForwardingRelationshipMoveFixture();
                const {currentPolicy, currentReport, currentTransaction} = await getCurrentMoveFixture();
                const submitToAccountID = getSubmitToAccountID(currentPolicy, currentReport);

                expect(submitToAccountID).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                expect(currentReport?.managerID).toBe(FORWARDED_MANAGER_ACCOUNT_ID);

                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: currentTransaction,
                    report: currentReport,
                    policy: currentPolicy,
                    reportActions: {},
                });

                expect(canEditReportField).toBe(false);
            });

            it('should hide move when the submit-to approver has overLimitForwardsTo pointing to the current manager', async () => {
                await seedForwardingRelationshipMoveFixture({
                    submitToEmployee: {
                        email: FORWARDED_APPROVER_EMAIL,
                        overLimitForwardsTo: FORWARDED_MANAGER_EMAIL,
                        role: CONST.POLICY.ROLE.ADMIN,
                    },
                });
                const {currentPolicy, currentReport, currentTransaction} = await getCurrentMoveFixture();

                expect(getSubmitToAccountID(currentPolicy, currentReport)).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                expect(currentReport?.managerID).toBe(FORWARDED_MANAGER_ACCOUNT_ID);

                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: currentTransaction,
                    report: currentReport,
                    policy: currentPolicy,
                    reportActions: {},
                });

                expect(canEditReportField).toBe(false);
            });

            it('should use the caller-provided policy for the forwarding relationship fallback when global policy data is stale', async () => {
                await seedForwardingRelationshipMoveFixture();
                const {currentPolicy, currentReport, currentTransaction} = await getCurrentMoveFixture();
                if (!currentPolicy) {
                    throw new Error('Expected policy fixture');
                }

                await Onyx.set(policyKey, {
                    ...currentPolicy,
                    employeeList: {
                        ...currentPolicy.employeeList,
                        [FORWARDED_APPROVER_EMAIL]: {
                            email: FORWARDED_APPROVER_EMAIL,
                            role: CONST.POLICY.ROLE.ADMIN,
                        },
                    },
                });
                await waitForBatchedUpdates();

                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: currentTransaction,
                    report: currentReport,
                    policy: currentPolicy,
                    reportActions: {},
                });

                expect(canEditReportField).toBe(false);
            });

            it('should hide move when submit-to differs from manager even if the policy does not explicitly forward to that manager', async () => {
                await seedForwardingRelationshipMoveFixture({
                    submitToEmployee: {
                        email: FORWARDED_APPROVER_EMAIL,
                        role: CONST.POLICY.ROLE.ADMIN,
                    },
                });
                const {currentPolicy, currentReport, currentTransaction} = await getCurrentMoveFixture();

                expect(getSubmitToAccountID(currentPolicy, currentReport)).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                expect(currentReport?.managerID).toBe(FORWARDED_MANAGER_ACCOUNT_ID);

                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: currentTransaction,
                    report: currentReport,
                    policy: currentPolicy,
                    reportActions: {},
                });

                expect(canEditReportField).toBe(false);
            });

            it('should hide move when passed report actions contain FORWARDED even if the global report action cache is empty', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [FORWARDED_APPROVER_ACCOUNT_ID]: {
                        accountID: FORWARDED_APPROVER_ACCOUNT_ID,
                        login: FORWARDED_APPROVER_EMAIL,
                    },
                });
                await Onyx.merge(policyKey, {
                    ...expensePolicy,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    role: CONST.POLICY.ROLE.ADMIN,
                    approver: FORWARDED_APPROVER_EMAIL,
                    owner: FORWARDED_APPROVER_EMAIL,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                });
                await Onyx.merge(reportKey, {
                    ...expenseReport,
                    managerID: FORWARDED_APPROVER_ACCOUNT_ID,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await Onyx.set(reportActionsKey, {});
                await waitForBatchedUpdates();

                const {currentPolicy, currentReport, currentTransaction} = await getCurrentMoveFixture();
                const forwardedAction = createMoveWorkflowAction(601, CONST.REPORT.ACTIONS.TYPE.FORWARDED, '2026-03-01 09:00:00.000');

                expect(getSubmitToAccountID(currentPolicy, currentReport)).toBe(currentReport?.managerID);

                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: currentTransaction,
                    report: currentReport,
                    policy: currentPolicy,
                    reportActions: {
                        [forwardedAction.reportActionID]: forwardedAction,
                    },
                });

                expect(canEditReportField).toBe(false);
            });

            it.each([CONST.EXPENSE_PENDING_ACTION.APPROVE, CONST.EXPENSE_PENDING_ACTION.SUBMIT])(
                'should hide move for forwarded-like DEW report when pendingExpenseAction is %s',
                async (pendingExpenseAction) => {
                    await seedForwardedLikeMoveFixture({pendingExpenseAction});
                    const {currentPolicy, currentReport, currentTransaction, reportMetadata} = await getCurrentMoveFixture();
                    const submitToAccountID = getSubmitToAccountID(currentPolicy, currentReport);

                    expect(reportMetadata?.pendingExpenseAction).toBe(pendingExpenseAction);
                    expect(submitToAccountID).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                    expect(submitToAccountID).not.toBe(currentReport?.managerID);

                    const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                    const canEditReportField = canEditFieldOfMoneyRequest({
                        reportAction,
                        fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                        outstandingReportsByPolicyID,
                        transaction: currentTransaction,
                        report: currentReport,
                        policy: currentPolicy,
                    });

                    expect(canEditReportField).toBe(false);
                },
            );

            it('should hide move when an explicit FORWARDED action exists', async () => {
                await seedForwardedLikeMoveFixture();
                await Onyx.set(reportActionsKey, {
                    [String(601)]: createMoveWorkflowAction(601, CONST.REPORT.ACTIONS.TYPE.FORWARDED, '2026-03-01 09:00:00.000'),
                });
                await Onyx.set(reportMetadataKey, null);
                await waitForBatchedUpdates();

                const {currentPolicy, currentReport, currentTransaction, reportMetadata} = await getCurrentMoveFixture();
                const submitToAccountID = getSubmitToAccountID(currentPolicy, currentReport);

                expect(reportMetadata).toBeNull();
                expect(submitToAccountID).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                expect(submitToAccountID).not.toBe(currentReport?.managerID);
                expect(canEditMoneyRequest(reportAction, currentTransaction, false, currentReport, currentPolicy)).toBe(false);

                const outstandingReportsByPolicyID = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditReportField = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID,
                    transaction: currentTransaction,
                    report: currentReport,
                    policy: currentPolicy,
                });

                expect(canEditReportField).toBe(false);
            });

            it('should hide move when policy approver mutation changes submit-to resolution for a historical first-level report', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [FORWARDED_APPROVER_ACCOUNT_ID]: {
                        accountID: FORWARDED_APPROVER_ACCOUNT_ID,
                        login: FORWARDED_APPROVER_EMAIL,
                    },
                });
                await Onyx.merge(policyKey, {
                    ...expensePolicy,
                    approver: FORWARDED_APPROVER_EMAIL,
                    owner: FORWARDED_APPROVER_EMAIL,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                });
                await Onyx.merge(reportKey, {
                    ...expenseReport,
                    managerID: FORWARDED_APPROVER_ACCOUNT_ID,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_1_ID}`, outstandingExpenseReport1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_OUTSTANDING_REPORT_2_ID}`, outstandingExpenseReport2);
                await Onyx.set(reportActionsKey, {});
                await waitForBatchedUpdates();

                const fixtureBeforeMutation = await getCurrentMoveFixture();
                const submitToBeforeMutation = getSubmitToAccountID(fixtureBeforeMutation.currentPolicy, fixtureBeforeMutation.currentReport);

                expect(fixtureBeforeMutation.reportMetadata).toBeNull();
                expect(submitToBeforeMutation).toBe(FORWARDED_APPROVER_ACCOUNT_ID);
                expect(submitToBeforeMutation).toBe(fixtureBeforeMutation.currentReport?.managerID);
                expect(canEditMoneyRequest(reportAction, fixtureBeforeMutation.currentTransaction, false, fixtureBeforeMutation.currentReport, fixtureBeforeMutation.currentPolicy)).toBe(
                    true,
                );

                const outstandingReportsBeforeMutation = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditBeforeMutation = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID: outstandingReportsBeforeMutation,
                    transaction: fixtureBeforeMutation.currentTransaction,
                    report: fixtureBeforeMutation.currentReport,
                    policy: fixtureBeforeMutation.currentPolicy,
                });
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

                expect(fixtureAfterMutation.reportMetadata).toBeNull();
                expect(submitToAfterMutation).toBe(FORWARDED_APPROVER_ACCOUNT_ID_2);
                expect(submitToAfterMutation).not.toBe(fixtureAfterMutation.currentReport?.managerID);
                expect(canEditMoneyRequest(reportAction, fixtureAfterMutation.currentTransaction, false, fixtureAfterMutation.currentReport, fixtureAfterMutation.currentPolicy)).toBe(true);

                const outstandingReportsAfterMutation = await OnyxUtils.get(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
                const canEditAfterMutation = canEditFieldOfMoneyRequest({
                    reportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                    outstandingReportsByPolicyID: outstandingReportsAfterMutation,
                    transaction: fixtureAfterMutation.currentTransaction,
                    report: fixtureAfterMutation.currentReport,
                    policy: fixtureAfterMutation.currentPolicy,
                });
                expect(canEditAfterMutation).toBe(false);
            });
        });

        describe('Policy has Dynamic External Workflow', () => {
            const DEW_POLICY_ID = '77';
            const IOU_REPORT_ID = '88';
            const IOU_TRANSACTION_ID = '99';
            const EXPENSE_AMOUNT = 345;

            const dewReportAction = {
                ...createRandomReportAction(7),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: currentUserAccountID,
                originalMessage: {
                    IOUReportID: IOU_REPORT_ID,
                    IOUTransactionID: IOU_TRANSACTION_ID,
                    type: CONST.IOU.ACTION.CREATE,
                    amount: EXPENSE_AMOUNT,
                    currency: CONST.CURRENCY.USD,
                },
            };

            const dewTransaction = {
                ...createRandomTransaction(Number(IOU_TRANSACTION_ID)),
                transactionID: IOU_TRANSACTION_ID,
                reportID: IOU_REPORT_ID,
                amount: EXPENSE_AMOUNT,
            };

            const dewPolicy: Policy = {
                ...createRandomPolicy(Number(DEW_POLICY_ID), CONST.POLICY.TYPE.CORPORATE),
                id: DEW_POLICY_ID,
                role: CONST.POLICY.ROLE.USER,
                approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
            };

            afterEach(() => {
                Onyx.clear();
                return waitForBatchedUpdates();
            });

            it('should return false for non-admin requestor editing receipt on a processing report', async () => {
                const processingReport = {
                    ...createExpenseReport(Number(IOU_REPORT_ID)),
                    policyID: DEW_POLICY_ID,
                    ownerAccountID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };

                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [dewPolicy], (p) => p.id);
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${IOU_TRANSACTION_ID}`]: dewTransaction,
                    [`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`]: processingReport,
                    ...policyCollectionDataSet,
                });
                await waitForBatchedUpdates();

                const canEditReceipt = canEditFieldOfMoneyRequest({reportAction: dewReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction: dewTransaction});

                expect(canEditReceipt).toBe(false);
            });

            it('should return true for non-admin requestor editing receipt on an open report', async () => {
                const openReport = {
                    ...createExpenseReport(Number(IOU_REPORT_ID)),
                    policyID: DEW_POLICY_ID,
                    ownerAccountID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };

                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [dewPolicy], (p) => p.id);
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${IOU_TRANSACTION_ID}`]: dewTransaction,
                    [`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`]: openReport,
                    ...policyCollectionDataSet,
                });
                await waitForBatchedUpdates();

                const canEditReceipt = canEditFieldOfMoneyRequest({reportAction: dewReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction: dewTransaction});

                expect(canEditReceipt).toBe(true);
            });

            it('should return true for admin editing receipt on a processing report', async () => {
                const adminPolicy: Policy = {
                    ...dewPolicy,
                    role: CONST.POLICY.ROLE.ADMIN,
                };
                const processingReport = {
                    ...createExpenseReport(Number(IOU_REPORT_ID)),
                    policyID: DEW_POLICY_ID,
                    ownerAccountID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };

                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [adminPolicy], (p) => p.id);
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${IOU_TRANSACTION_ID}`]: dewTransaction,
                    [`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`]: processingReport,
                    ...policyCollectionDataSet,
                });
                await waitForBatchedUpdates();

                const canEditReceipt = canEditFieldOfMoneyRequest({reportAction: dewReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction: dewTransaction});

                expect(canEditReceipt).toBe(true);
            });

            it('should return true for isDeleteAction when user is the requestor on an open report', async () => {
                const openReport = {
                    ...createExpenseReport(Number(IOU_REPORT_ID)),
                    policyID: DEW_POLICY_ID,
                    ownerAccountID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };

                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [dewPolicy], (p) => p.id);
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${IOU_TRANSACTION_ID}`]: dewTransaction,
                    [`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`]: openReport,
                    ...policyCollectionDataSet,
                });
                await waitForBatchedUpdates();

                const canDeleteReceipt = canEditFieldOfMoneyRequest({
                    reportAction: dewReportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT,
                    isDeleteAction: true,
                    transaction: dewTransaction,
                });

                expect(canDeleteReceipt).toBe(true);
            });

            it('should return false for isDeleteAction when user is admin but not the requestor', async () => {
                const adminPolicy: Policy = {
                    ...dewPolicy,
                    role: CONST.POLICY.ROLE.ADMIN,
                };

                const nonRequestorReportAction = {
                    ...dewReportAction,
                    actorAccountID: secondUserAccountID,
                };

                const openReport = {
                    ...createExpenseReport(Number(IOU_REPORT_ID)),
                    policyID: DEW_POLICY_ID,
                    ownerAccountID: currentUserAccountID,
                    managerID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };

                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [adminPolicy], (p) => p.id);
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${IOU_TRANSACTION_ID}`]: dewTransaction,
                    [`${ONYXKEYS.COLLECTION.REPORT}${IOU_REPORT_ID}`]: openReport,
                    ...policyCollectionDataSet,
                });
                await waitForBatchedUpdates();

                const canDeleteReceipt = canEditFieldOfMoneyRequest({
                    reportAction: nonRequestorReportAction,
                    fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT,
                    isDeleteAction: true,
                    transaction: dewTransaction,
                });

                expect(canDeleteReceipt).toBe(false);
            });
        });

        describe('unreported per diem expense', () => {
            const PER_DIEM_IOU_TRANSACTION_ID = '99';
            const PER_DIEM_CUSTOM_UNIT_ID = 'perDiemUnit1';
            const PER_DIEM_POLICY_ID = '55';

            const perDiemReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: currentUserAccountID,
                originalMessage: {
                    IOUTransactionID: PER_DIEM_IOU_TRANSACTION_ID,
                    IOUReportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    type: CONST.IOU.ACTION.CREATE,
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                },
            };

            const perDiemTransaction = {
                ...createRandomTransaction(Number(PER_DIEM_IOU_TRANSACTION_ID)),
                transactionID: PER_DIEM_IOU_TRANSACTION_ID,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                amount: 100,
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        customUnitID: PER_DIEM_CUSTOM_UNIT_ID,
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    },
                },
            };

            const policyWithPerDiemRates: Policy = {
                ...createRandomPolicy(Number(PER_DIEM_POLICY_ID), CONST.POLICY.TYPE.TEAM),
                id: PER_DIEM_POLICY_ID,
                role: CONST.POLICY.ROLE.ADMIN,
                arePerDiemRatesEnabled: true,
                isPolicyExpenseChatEnabled: true,
                customUnits: {
                    [PER_DIEM_CUSTOM_UNIT_ID]: {
                        customUnitID: PER_DIEM_CUSTOM_UNIT_ID,
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        rates: {
                            rate1: {customUnitRateID: 'rate1', name: 'Overnight', rate: 100, enabled: true},
                        },
                        enabled: true,
                    },
                },
            };

            const policyWithoutPerDiemRates: Policy = {
                ...policyWithPerDiemRates,
                customUnits: {
                    [PER_DIEM_CUSTOM_UNIT_ID]: {
                        customUnitID: PER_DIEM_CUSTOM_UNIT_ID,
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                        rates: {},
                        enabled: true,
                    },
                },
            };

            beforeEach(() => {
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${PER_DIEM_IOU_TRANSACTION_ID}`, perDiemTransaction);
                return waitForBatchedUpdates();
            });

            afterEach(() => {
                Onyx.clear();
                return waitForBatchedUpdates();
            });

            it('should return true for unreported per diem expense when policy has per diem rates', async () => {
                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policyWithPerDiemRates], (p) => p.id);
                Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                    ...policyCollectionDataSet,
                });
                await waitForBatchedUpdates();

                const canEditReportField = canEditFieldOfMoneyRequest({reportAction: perDiemReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT, transaction: perDiemTransaction});

                expect(canEditReportField).toBe(true);
            });

            it('should return false for unreported per diem expense when policy has no per diem rates', async () => {
                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policyWithoutPerDiemRates], (p) => p.id);
                Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                    ...policyCollectionDataSet,
                });
                await waitForBatchedUpdates();

                const canEditReportField = canEditFieldOfMoneyRequest({reportAction: perDiemReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT, transaction: perDiemTransaction});

                expect(canEditReportField).toBe(false);
            });
        });
    });

    describe('receipt field', () => {
        const RECEIPT_IOU_REPORT_ID = '5001';
        const RECEIPT_IOU_TRANSACTION_ID = '5002';
        const RECEIPT_AMOUNT = 100;
        const receiptPolicyID = '5003';

        const randomReportAction = createRandomReportAction(501);
        const adminPolicy = {...createRandomPolicy(Number(receiptPolicyID), CONST.POLICY.TYPE.TEAM), role: CONST.POLICY.ROLE.ADMIN};

        const reportAction = {
            ...randomReportAction,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            childStateNum: CONST.REPORT.STATE_NUM.OPEN,
            childStatusNum: CONST.REPORT.STATUS_NUM.OPEN,
            originalMessage: {
                ...randomReportAction.originalMessage,
                IOUReportID: RECEIPT_IOU_REPORT_ID,
                IOUTransactionID: RECEIPT_IOU_TRANSACTION_ID,
                type: CONST.IOU.ACTION.CREATE,
                amount: RECEIPT_AMOUNT,
                currency: CONST.CURRENCY.USD,
            },
        };

        const moneyRequestTransaction = {
            ...createRandomTransaction(Number(RECEIPT_IOU_TRANSACTION_ID)),
            reportID: RECEIPT_IOU_REPORT_ID,
            transactionID: RECEIPT_IOU_TRANSACTION_ID,
            amount: RECEIPT_AMOUNT,
            managedCard: false,
            status: CONST.TRANSACTION.STATUS.POSTED,
        };

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});

            Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
            });
            initOnyxDerivedValues();

            return waitForBatchedUpdates();
        });

        beforeEach(() => {
            const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [adminPolicy], (current) => current.id);
            Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${RECEIPT_IOU_TRANSACTION_ID}`]: moneyRequestTransaction,
                ...policyCollectionDataSet,
            });
            return waitForBatchedUpdates();
        });

        afterEach(() => {
            Onyx.clear();
            return waitForBatchedUpdates();
        });

        it('should return false for receipt field when the expense report is closed', async () => {
            // Given a closed expense report where the current user is an admin
            const closedExpenseReport = {
                ...createExpenseReport(Number(RECEIPT_IOU_REPORT_ID)),
                policyID: receiptPolicyID,
                ownerAccountID: currentUserAccountID,
                managerID: secondUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${RECEIPT_IOU_REPORT_ID}`, closedExpenseReport);
            await waitForBatchedUpdates();

            // When the admin tries to edit the receipt field
            const canEditReceipt = canEditFieldOfMoneyRequest({reportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction: moneyRequestTransaction});

            // Then they should not be able to edit the receipt on a closed report
            expect(canEditReceipt).toBe(false);
        });

        it('should return true for receipt field when the expense report is open', async () => {
            // Given an open expense report where the current user is an admin
            const openExpenseReport = {
                ...createExpenseReport(Number(RECEIPT_IOU_REPORT_ID)),
                policyID: receiptPolicyID,
                ownerAccountID: currentUserAccountID,
                managerID: secondUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${RECEIPT_IOU_REPORT_ID}`, openExpenseReport);
            await waitForBatchedUpdates();

            // When the admin tries to edit the receipt field
            const canEditReceipt = canEditFieldOfMoneyRequest({reportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction: moneyRequestTransaction});

            // Then they should be able to edit the receipt on an open report
            expect(canEditReceipt).toBe(true);
        });
    });
});
