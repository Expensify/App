import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSuggestedSearchesVisibility} from '@libs/SearchUIUtils';
import createTodosReportsAndTransactions, {buildTransactionsByReportID, getTodoReportsForSearchKey} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';
const OTHER_USER_ACCOUNT_ID = 2;

const POLICY_ID = 'policy123';
const POLICY_WITH_CONNECTION_ID = 'policy_with_connection';

const createMockReport = (reportID: string, overrides: Partial<Report> = {}): Report => ({
    reportID,
    chatReportID: `chat_${reportID}`,
    policyID: POLICY_ID,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    managerID: OTHER_USER_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    type: CONST.REPORT.TYPE.EXPENSE,
    parentReportID: '123',
    parentReportActionID: '456',
    reportName: 'Test Report',
    currency: 'USD',
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    ...overrides,
});

const createMockPolicy = (policyID: string, overrides: Partial<Policy> = {}): Policy => ({
    id: policyID,
    name: 'Test Policy',
    role: CONST.POLICY.ROLE.USER,
    type: CONST.POLICY.TYPE.TEAM,
    owner: CURRENT_USER_EMAIL,
    outputCurrency: 'USD',
    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
    ...overrides,
});

// Admin policy with a QBO connection whose auto-sync is disabled, so a report on it is manually exportable.
// The literal sets only the QBO config fields this test needs; `createMock` deep-partials the rest.
const createPolicyWithQBOConnection = (policyID: string, {policyExporter, connectionExporter}: {policyExporter: string; connectionExporter: string}): Policy =>
    createMock<Policy>({
        ...createMockPolicy(policyID, {role: CONST.POLICY.ROLE.ADMIN, exporter: policyExporter}),
        connections: {
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                lastSync: {
                    isConnected: true,
                    isSuccessful: true,
                    isAuthenticationError: false,
                    source: 'DIRECT',
                },
                config: {
                    autoSync: {
                        jobID: 'job123',
                        enabled: false, // Auto-sync disabled so manual export is available
                    },
                    export: {
                        exporter: connectionExporter,
                    },
                },
            },
        },
    });

const createMockTransaction = (transactionID: string, reportID: string, overrides: Partial<Transaction> = {}): Transaction =>
    ({
        transactionID,
        reportID,
        amount: 100,
        modifiedAmount: 0,
        reimbursable: true,
        status: CONST.TRANSACTION.STATUS.POSTED,
        currency: 'USD',
        merchant: 'Test Merchant',
        created: '2024-01-01',
        ...overrides,
    }) as Transaction;

const HOLD_ACTION_ID = 'HOLD_ACTION_ID';

// A money-request (IOU) action whose child report is the transaction thread that carries the HOLD action.
const createMoneyRequestAction = (reportActionID: string, transactionID: string, transactionThreadReportID: string): ReportAction => ({
    reportActionID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2024-01-01 00:00:00.000',
    actorAccountID: OTHER_USER_ACCOUNT_ID,
    childReportID: transactionThreadReportID,
    originalMessage: {
        IOUTransactionID: transactionID,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: 100,
        currency: 'USD',
    },
});

// The HOLD action lives on the transaction thread; its actor is whoever placed the hold.
const createHoldAction = (holderAccountID: number): ReportAction => ({
    reportActionID: HOLD_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.HOLD,
    created: '2024-01-01 00:00:00.000',
    actorAccountID: holderAccountID,
});

// The utils take Onyx collections (keyed by full Onyx key) directly as arguments, so the tests build those keyed
// maps in-memory and call the utils without going through a hook or the live Onyx store.
const toReportsCollection = (reports: Report[]) => Object.fromEntries(reports.map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report]));
const toTransactionsCollection = (transactions: Transaction[]) =>
    Object.fromEntries(transactions.map((transaction) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction]));
const toPoliciesCollection = (policies: Policy[]) => Object.fromEntries(policies.map((policy) => [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy]));

const baseParams = {
    allReportNameValuePairs: undefined,
    allReportActions: undefined,
    allReportMetadata: undefined,
    personalDetailsList: undefined,
    bankAccountList: undefined,
    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
    login: CURRENT_USER_EMAIL,
    areTransactionsLoaded: true,
    rules: undefined,
};

describe('TodosUtils', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        // Some role checks read the current session, so keep it set for every test.
        await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await waitForBatchedUpdates();
    });

    describe('buildTransactionsByReportID', () => {
        it('returns an empty map when there are no transactions', () => {
            expect(buildTransactionsByReportID(undefined)).toEqual({});
            expect(buildTransactionsByReportID({})).toEqual({});
        });

        it('groups transactions by their report ID', () => {
            const transactions = [createMockTransaction('t1', 'r1'), createMockTransaction('t2', 'r1'), createMockTransaction('t3', 'r2')];

            const result = buildTransactionsByReportID(toTransactionsCollection(transactions));

            expect(Object.keys(result)).toEqual(['r1', 'r2']);
            expect(result.r1).toHaveLength(2);
            expect(result.r2).toHaveLength(1);
            expect(result.r1.map((transaction) => transaction.transactionID)).toEqual(['t1', 't2']);
        });

        it('skips transactions that have no report ID', () => {
            const transactions = [createMockTransaction('t1', 'r1'), createMockTransaction('t2', '')];

            const result = buildTransactionsByReportID(toTransactionsCollection(transactions));

            expect(Object.keys(result)).toEqual(['r1']);
        });
    });

    describe('createTodosReportsAndTransactions', () => {
        it('returns empty buckets when there are no reports', () => {
            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReports: undefined,
                allTransactions: undefined,
                allPolicies: undefined,
            });

            expect(result.reportsToSubmit).toEqual([]);
            expect(result.reportsToApprove).toEqual([]);
            expect(result.reportsToPay).toEqual([]);
            expect(result.reportsToExport).toEqual([]);
            expect(result.transactionsByReportID).toEqual({});
        });

        describe('with a mix of reports across every bucket', () => {
            const SUBMIT_REPORT_IDS = ['submit_1', 'submit_2', 'submit_3', 'submit_4'];
            const APPROVE_REPORT_IDS = ['approve_1', 'approve_2', 'approve_3'];
            const PAY_REPORT_IDS = ['pay_1', 'pay_2'];
            const EXPORT_REPORT_ID = 'export_1';

            const buildScenario = () => {
                const reportsToSubmit = SUBMIT_REPORT_IDS.map((id) =>
                    createMockReport(id, {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ACCOUNT_ID}),
                );
                const reportsToApprove = APPROVE_REPORT_IDS.map((id) =>
                    createMockReport(id, {
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        ownerAccountID: OTHER_USER_ACCOUNT_ID,
                        managerID: CURRENT_USER_ACCOUNT_ID,
                    }),
                );
                const reportsToPay = PAY_REPORT_IDS.map((id) =>
                    createMockReport(id, {
                        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                        ownerAccountID: OTHER_USER_ACCOUNT_ID,
                        managerID: CURRENT_USER_ACCOUNT_ID,
                        total: -100,
                    }),
                );
                const reportToExport = createMockReport(EXPORT_REPORT_ID, {
                    policyID: POLICY_WITH_CONNECTION_ID,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                });
                // A chat report and an unrelated open report that belong in no bucket.
                const excludedReports = [
                    createMockReport('excluded_chat', {type: CONST.REPORT.TYPE.CHAT}),
                    createMockReport('excluded_other', {ownerAccountID: OTHER_USER_ACCOUNT_ID, managerID: OTHER_USER_ACCOUNT_ID}),
                ];

                const policy = createMockPolicy(POLICY_ID, {
                    role: CONST.POLICY.ROLE.ADMIN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                });
                const policyWithConnection = createPolicyWithQBOConnection(POLICY_WITH_CONNECTION_ID, {policyExporter: CURRENT_USER_EMAIL, connectionExporter: CURRENT_USER_EMAIL});

                const transactions = [
                    ...SUBMIT_REPORT_IDS.map((reportID) => createMockTransaction(`trans_${reportID}`, reportID)),
                    ...APPROVE_REPORT_IDS.map((reportID) => createMockTransaction(`trans_${reportID}`, reportID)),
                    ...PAY_REPORT_IDS.map((reportID) => createMockTransaction(`trans_${reportID}`, reportID)),
                ];

                return {
                    ...baseParams,
                    allReports: toReportsCollection([...reportsToSubmit, ...reportsToApprove, ...reportsToPay, reportToExport, ...excludedReports]),
                    allTransactions: toTransactionsCollection(transactions),
                    allPolicies: toPoliciesCollection([policy, policyWithConnection]),
                };
            };

            it('classifies every report into its matching bucket', () => {
                const result = createTodosReportsAndTransactions(buildScenario());

                expect(result.reportsToSubmit.map((report) => report.reportID)).toEqual(SUBMIT_REPORT_IDS);
                expect(result.reportsToApprove.map((report) => report.reportID)).toEqual(APPROVE_REPORT_IDS);
                expect(result.reportsToPay.map((report) => report.reportID)).toEqual(PAY_REPORT_IDS);
                expect(result.reportsToExport.map((report) => report.reportID)).toEqual([EXPORT_REPORT_ID]);
            });

            it('indexes transactions by report ID', () => {
                const result = createTodosReportsAndTransactions(buildScenario());

                expect(result.transactionsByReportID[SUBMIT_REPORT_IDS.at(0) ?? '']).toHaveLength(1);
                expect(result.transactionsByReportID[APPROVE_REPORT_IDS.at(0) ?? '']).toHaveLength(1);
            });
        });

        it('excludes a report the current user approves for but does not own from the submit bucket', async () => {
            const OTHER_USER_EMAIL = 'owner@mail.com';
            const personalDetailsList = {
                [CURRENT_USER_ACCOUNT_ID]: {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL},
                [OTHER_USER_ACCOUNT_ID]: {accountID: OTHER_USER_ACCOUNT_ID, login: OTHER_USER_EMAIL},
            };
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsList);
            await waitForBatchedUpdates();

            const approverSubmitReport = createMockReport('approver_submit', {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
            });
            const policy = createMockPolicy(POLICY_ID, {approver: CURRENT_USER_EMAIL});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                personalDetailsList,
                allReports: toReportsCollection([approverSubmitReport]),
                allTransactions: toTransactionsCollection([createMockTransaction('trans_approver_submit', 'approver_submit')]),
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit).toEqual([]);
        });

        it('excludes a report whose expenses are all on hold', () => {
            const heldOverride: Partial<Transaction> = {comment: {hold: 'HOLD_ACTION_ID'}};
            const submitReport = createMockReport('held_submit', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReports: toReportsCollection([submitReport]),
                allTransactions: toTransactionsCollection([createMockTransaction('trans_held', 'held_submit', heldOverride)]),
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit).toEqual([]);
        });

        describe('an all-held report where a specific user placed the hold', () => {
            // Builds params for a single all-held report, wiring its money-request action to a transaction thread so
            // didCurrentUserPlaceHoldOnReportExpense can resolve who placed the hold.
            const buildParams = (report: Report) => {
                const transactionID = `trans_${report.reportID}`;
                const transactionThreadReportID = `thread_${report.reportID}`;
                const moneyRequestActionID = `mr_${report.reportID}`;
                const policy = createMockPolicy(POLICY_ID, {
                    role: CONST.POLICY.ROLE.ADMIN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                });
                return {
                    transactionThreadReportID,
                    params: {
                        ...baseParams,
                        allReports: toReportsCollection([report]),
                        allTransactions: toTransactionsCollection([createMockTransaction(transactionID, report.reportID, {comment: {hold: HOLD_ACTION_ID}})]),
                        allPolicies: toPoliciesCollection([policy]),
                        allReportActions: {
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {
                                [moneyRequestActionID]: createMoneyRequestAction(moneyRequestActionID, transactionID, transactionThreadReportID),
                            },
                        },
                    },
                };
            };

            // getReportAction/isHoldCreator read the module cache, so the thread's HOLD action must live in Onyx.
            const seedHoldAction = async (transactionThreadReportID: string, holderAccountID: number) => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {[HOLD_ACTION_ID]: createHoldAction(holderAccountID)});
                await waitForBatchedUpdates();
            };

            const approveReport = () =>
                createMockReport('held_approve', {
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                });

            const payReport = () =>
                createMockReport('held_pay', {
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                    total: -100,
                });

            it('keeps the approve report when the current user placed the hold', async () => {
                const {params, transactionThreadReportID} = buildParams(approveReport());
                await seedHoldAction(transactionThreadReportID, CURRENT_USER_ACCOUNT_ID);

                const result = createTodosReportsAndTransactions(params);

                expect(result.reportsToApprove.map((report) => report.reportID)).toEqual(['held_approve']);
            });

            it('excludes the approve report when another user placed the hold', async () => {
                const {params, transactionThreadReportID} = buildParams(approveReport());
                await seedHoldAction(transactionThreadReportID, OTHER_USER_ACCOUNT_ID);

                const result = createTodosReportsAndTransactions(params);

                expect(result.reportsToApprove).toEqual([]);
            });

            it('keeps the pay report when the current user placed the hold', async () => {
                const {params, transactionThreadReportID} = buildParams(payReport());
                await seedHoldAction(transactionThreadReportID, CURRENT_USER_ACCOUNT_ID);

                const result = createTodosReportsAndTransactions(params);

                expect(result.reportsToPay.map((report) => report.reportID)).toEqual(['held_pay']);
            });

            it('excludes the pay report when another user placed the hold', async () => {
                const {params, transactionThreadReportID} = buildParams(payReport());
                await seedHoldAction(transactionThreadReportID, OTHER_USER_ACCOUNT_ID);

                const result = createTodosReportsAndTransactions(params);

                expect(result.reportsToPay).toEqual([]);
            });

            it('still excludes an all-held submit report even when the current user placed the hold', async () => {
                const submitReport = createMockReport('held_submit_holder', {
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                });
                const {params, transactionThreadReportID} = buildParams(submitReport);
                await seedHoldAction(transactionThreadReportID, CURRENT_USER_ACCOUNT_ID);

                const result = createTodosReportsAndTransactions(params);

                expect(result.reportsToSubmit).toEqual([]);
            });
        });

        it('keeps a payable report in the pay bucket when its export failed', () => {
            // A failed export only demotes Pay to a secondary action on the report page. The report stays payable,
            // and the server's action:pay search still returns it.
            const payReport = createMockReport('pay_export_failed', {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
                total: -100,
                hasExportError: true,
            });
            const policy = createMockPolicy(POLICY_ID, {
                role: CONST.POLICY.ROLE.ADMIN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            });

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReports: toReportsCollection([payReport]),
                allTransactions: toTransactionsCollection([createMockTransaction('trans_pay_export_failed', 'pay_export_failed')]),
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToPay.map((report) => report.reportID)).toEqual(['pay_export_failed']);
        });

        it('excludes a report whose expenses are all pending card transactions', () => {
            const pendingOverride: Partial<Transaction> = {status: CONST.TRANSACTION.STATUS.PENDING, bank: CONST.EXPENSIFY_CARD.BANK};
            const submitReport = createMockReport('pending_submit', {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReports: toReportsCollection([submitReport]),
                allTransactions: toTransactionsCollection([createMockTransaction('trans_pending', 'pending_submit', pendingOverride)]),
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit).toEqual([]);
        });

        it('includes an empty open report owned by the current user in the submit bucket', () => {
            const emptyReport = createMockReport('empty_draft', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReports: toReportsCollection([emptyReport]),
                allTransactions: undefined,
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit.map((report) => report.reportID)).toEqual(['empty_draft']);
        });

        it('excludes a report from the submit bucket while the transaction collection has not finished loading', () => {
            // Unloaded transactions look identical to zero transactions, so this must not be misclassified as an empty draft.
            const reportWithUnloadedTransactions = createMockReport('unloaded_transactions', {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                areTransactionsLoaded: false,
                allReports: toReportsCollection([reportWithUnloadedTransactions]),
                allTransactions: undefined,
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit).toEqual([]);
        });

        it('excludes an empty open report owned by another user from the submit bucket', () => {
            const emptyReport = createMockReport('empty_other_owner', {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
            });
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReports: toReportsCollection([emptyReport]),
                allTransactions: undefined,
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit).toEqual([]);
        });

        it('excludes an empty open report on a personal policy from the submit bucket', () => {
            const emptyReport = createMockReport('empty_personal', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});
            const policy = createMockPolicy(POLICY_ID, {type: CONST.POLICY.TYPE.PERSONAL});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReports: toReportsCollection([emptyReport]),
                allTransactions: undefined,
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit).toEqual([]);
        });

        it('excludes an empty archived report from the submit bucket', () => {
            const emptyReport = createMockReport('empty_archived', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReportNameValuePairs: {
                    [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${emptyReport.chatReportID}`]: {private_isArchived: '2024-01-01 00:00:00'},
                },
                allReports: toReportsCollection([emptyReport]),
                allTransactions: undefined,
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit).toEqual([]);
        });

        it('ignores non-expense reports', () => {
            const chatReport = createMockReport('chat_report', {type: CONST.REPORT.TYPE.CHAT, ownerAccountID: CURRENT_USER_ACCOUNT_ID});
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = createTodosReportsAndTransactions({
                ...baseParams,
                allReports: toReportsCollection([chatReport]),
                allTransactions: toTransactionsCollection([createMockTransaction('trans_chat', 'chat_report')]),
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reportsToSubmit).toEqual([]);
            expect(result.reportsToApprove).toEqual([]);
            expect(result.reportsToPay).toEqual([]);
            expect(result.reportsToExport).toEqual([]);
        });
    });

    describe('getTodoReportsForSearchKey', () => {
        const buildParams = () => {
            const submitReport = createMockReport('submit_only', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});
            const approveReport = createMockReport('approve_only', {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
            });
            const policy = createMockPolicy(POLICY_ID, {
                role: CONST.POLICY.ROLE.ADMIN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            });

            return {
                ...baseParams,
                allReports: toReportsCollection([submitReport, approveReport]),
                allTransactions: toTransactionsCollection([createMockTransaction('trans_submit', 'submit_only'), createMockTransaction('trans_approve', 'approve_only')]),
                allPolicies: toPoliciesCollection([policy]),
            };
        };

        it('returns only the reports for the requested bucket', () => {
            const params = buildParams();

            const submitResult = getTodoReportsForSearchKey(CONST.SEARCH.SEARCH_KEYS.SUBMIT, params);
            expect(submitResult.reports.map((report) => report.reportID)).toEqual(['submit_only']);

            const approveResult = getTodoReportsForSearchKey(CONST.SEARCH.SEARCH_KEYS.APPROVE, params);
            expect(approveResult.reports.map((report) => report.reportID)).toEqual(['approve_only']);
        });

        it('still indexes every transaction by report ID regardless of the requested bucket', () => {
            const result = getTodoReportsForSearchKey(CONST.SEARCH.SEARCH_KEYS.SUBMIT, buildParams());

            expect(Object.keys(result.transactionsByReportID).sort()).toEqual(['approve_only', 'submit_only']);
        });

        it('excludes a report whose expenses are all on hold from its bucket', () => {
            const heldOverride: Partial<Transaction> = {comment: {hold: 'HOLD_ACTION_ID'}};
            const submitReport = createMockReport('held_submit', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = getTodoReportsForSearchKey(CONST.SEARCH.SEARCH_KEYS.SUBMIT, {
                ...baseParams,
                allReports: toReportsCollection([submitReport]),
                allTransactions: toTransactionsCollection([createMockTransaction('trans_held', 'held_submit', heldOverride)]),
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reports).toEqual([]);
        });

        it('excludes a report whose expenses are all pending card transactions from its bucket', () => {
            const pendingOverride: Partial<Transaction> = {status: CONST.TRANSACTION.STATUS.PENDING, bank: CONST.EXPENSIFY_CARD.BANK};
            const submitReport = createMockReport('pending_submit', {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = getTodoReportsForSearchKey(CONST.SEARCH.SEARCH_KEYS.SUBMIT, {
                ...baseParams,
                allReports: toReportsCollection([submitReport]),
                allTransactions: toTransactionsCollection([createMockTransaction('trans_pending', 'pending_submit', pendingOverride)]),
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reports).toEqual([]);
        });

        it('includes an empty open report owned by the current user in the submit bucket', () => {
            const emptyReport = createMockReport('empty_draft', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = getTodoReportsForSearchKey(CONST.SEARCH.SEARCH_KEYS.SUBMIT, {
                ...baseParams,
                allReports: toReportsCollection([emptyReport]),
                allTransactions: undefined,
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reports.map((report) => report.reportID)).toEqual(['empty_draft']);
        });

        it('excludes a report from the submit bucket while the transaction collection has not finished loading', () => {
            const reportWithUnloadedTransactions = createMockReport('unloaded_transactions', {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            const policy = createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID});

            const result = getTodoReportsForSearchKey(CONST.SEARCH.SEARCH_KEYS.SUBMIT, {
                ...baseParams,
                areTransactionsLoaded: false,
                allReports: toReportsCollection([reportWithUnloadedTransactions]),
                allTransactions: undefined,
                allPolicies: toPoliciesCollection([policy]),
            });

            expect(result.reports).toEqual([]);
        });
    });
});

describe('TodosUtils export bucket', () => {
    const EXPORT_POLICY_ID = 'policy_export';
    const EXPORT_REPORT_ID = 'report_export';
    const OTHER_USER_EMAIL = 'other@mail.com';

    // Every connection but NetSuite counts as verified only once it has a lastSync
    const LAST_SYNC = {isConnected: true, isSuccessful: true, isAuthenticationError: false, source: 'DIRECT'} as const;

    // Each integration keeps its exporter in a different place, so the rule has to read all of them.
    const EXPORTER_BUILDERS: Array<[string, (exporter: string) => Policy['connections']]> = [
        [CONST.POLICY.CONNECTIONS.NAME.QBO, (exporter) => createMock<Connections>({quickbooksOnline: {lastSync: LAST_SYNC, config: {export: {exporter}}}})],
        [CONST.POLICY.CONNECTIONS.NAME.NETSUITE, (exporter) => createMock<Connections>({netsuite: {options: {config: {exporter}}}})],
        [CONST.POLICY.CONNECTIONS.NAME.XERO, (exporter) => createMock<Connections>({xero: {lastSync: LAST_SYNC, config: {export: {exporter}}}})],
        [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, (exporter) => createMock<Connections>({intacct: {lastSync: LAST_SYNC, config: {export: {exporter}}}})],
        [CONST.POLICY.CONNECTIONS.NAME.QBD, (exporter) => createMock<Connections>({quickbooksDesktop: {lastSync: LAST_SYNC, config: {export: {exporter}}}})],
        [CONST.POLICY.CONNECTIONS.NAME.RILLET, (exporter) => createMock<Connections>({rillet: {lastSync: LAST_SYNC, config: {export: {exporter}}}})],
        [CONST.POLICY.CONNECTIONS.NAME.DUALENTRY, (exporter) => createMock<Connections>({dualEntry: {lastSync: LAST_SYNC, config: {export: {exporter}}}})],
        [CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE, (exporter) => createMock<Connections>({campfire: {lastSync: LAST_SYNC, config: {export: {exporter}}}})],
        [
            CONST.POLICY.CONNECTIONS.NAME.CERTINIA,
            (exporter) => createMock<Connections>({financialforce: {lastSync: LAST_SYNC, config: {credentials: {enterpriseUrl: 'https://example.my.salesforce.com'}, export: {exporter}}}}),
        ],
    ];

    type ExportPolicyOptions = {
        policyExporter?: string;
        connectionExporter?: string;
        isAutoSyncEnabled?: boolean;
        role?: Policy['role'];
    };

    const createExportPolicy = ({
        policyExporter = '',
        connectionExporter = CURRENT_USER_EMAIL,
        isAutoSyncEnabled = false,
        role = CONST.POLICY.ROLE.ADMIN,
    }: ExportPolicyOptions = {}): Policy =>
        createMock<Policy>({
            ...createMockPolicy(EXPORT_POLICY_ID, {role, exporter: policyExporter}),
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    lastSync: {isConnected: true, isSuccessful: true, isAuthenticationError: false, source: 'DIRECT'},
                    config: {
                        autoSync: {jobID: 'job123', enabled: isAutoSyncEnabled},
                        export: {exporter: connectionExporter},
                    },
                },
            },
        });

    const createApprovedReport = () =>
        createMockReport(EXPORT_REPORT_ID, {
            policyID: EXPORT_POLICY_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            ownerAccountID: OTHER_USER_ACCOUNT_ID,
        });

    const buildParams = (
        policy: Policy,
        report = createApprovedReport(),
        allReportActions?: Record<string, Record<string, ReportAction>>,
        allReportNameValuePairs?: Record<string, {private_isArchived?: string}>,
    ) => ({
        ...baseParams,
        allReports: toReportsCollection([report]),
        allTransactions: toTransactionsCollection([createMockTransaction(`trans_${report.reportID}`, report.reportID)]),
        allPolicies: toPoliciesCollection([policy]),
        allReportActions,
        allReportNameValuePairs,
    });

    const getExportedReportIDs = (
        policy: Policy,
        report = createApprovedReport(),
        allReportActions?: Record<string, Record<string, ReportAction>>,
        allReportNameValuePairs?: Record<string, {private_isArchived?: string}>,
    ) => createTodosReportsAndTransactions(buildParams(policy, report, allReportActions, allReportNameValuePairs)).reportsToExport.map((exportedReport) => exportedReport.reportID);

    describe('exporter', () => {
        it('includes the report when policy.exporter is the current user', () => {
            expect(getExportedReportIDs(createExportPolicy({policyExporter: CURRENT_USER_EMAIL}))).toEqual([EXPORT_REPORT_ID]);
        });

        it('excludes the report when both the policy and connection exporters are someone else', () => {
            expect(getExportedReportIDs(createExportPolicy({policyExporter: OTHER_USER_EMAIL, connectionExporter: OTHER_USER_EMAIL}))).toEqual([]);
        });

        it('includes the report when policy.exporter is empty and the connection exporter is the current user', () => {
            expect(getExportedReportIDs(createExportPolicy({policyExporter: ''}))).toEqual([EXPORT_REPORT_ID]);
        });

        it.each(EXPORTER_BUILDERS)('reads the connection exporter for %s while policy.exporter is empty', (_connectionName, buildConnections) => {
            const policy = createMock<Policy>({
                ...createMockPolicy(EXPORT_POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, exporter: ''}),
                connections: buildConnections(CURRENT_USER_EMAIL),
            });

            expect(getExportedReportIDs(policy)).toEqual([EXPORT_REPORT_ID]);
        });

        it('excludes the report for an admin who is not an exporter', () => {
            expect(getExportedReportIDs(createExportPolicy({connectionExporter: OTHER_USER_EMAIL, role: CONST.POLICY.ROLE.ADMIN}))).toEqual([]);
        });

        it('includes the report for a non-admin who is the exporter', () => {
            expect(getExportedReportIDs(createExportPolicy({role: CONST.POLICY.ROLE.USER}))).toEqual([EXPORT_REPORT_ID]);
        });
    });

    describe('auto-sync', () => {
        it('excludes the report when auto-sync is on, since auto-sync exports it', () => {
            expect(getExportedReportIDs(createExportPolicy({isAutoSyncEnabled: true}))).toEqual([]);
        });

        it('includes the report when auto-sync is on but the export failed', () => {
            const report = {...createApprovedReport(), hasExportError: true};

            expect(getExportedReportIDs(createExportPolicy({isAutoSyncEnabled: true}), report)).toEqual([EXPORT_REPORT_ID]);
        });

        it('ignores a failure message that predates the last approval reset', () => {
            const actionsFor = (actions: Record<string, ReportAction>) => ({[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPORT_REPORT_ID}`]: actions});
            const failureMessage = createMock<ReportAction>({
                reportActionID: 'failureMessage',
                actionName: CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE,
                created: '2024-06-01 00:00:00.000',
            });
            const unapproved = createMock<ReportAction>({
                reportActionID: 'unapproved',
                actionName: CONST.REPORT.ACTIONS.TYPE.UNAPPROVED,
                created: '2024-06-02 00:00:00.000',
            });

            // The failure keeps the report actionable while it is the report's latest word on the export
            expect(getExportedReportIDs(createExportPolicy({isAutoSyncEnabled: true}), createApprovedReport(), actionsFor({failureMessage}))).toEqual([EXPORT_REPORT_ID]);

            // Unapproving and approving again moves the report past that failure, so auto-sync owns it once more
            expect(getExportedReportIDs(createExportPolicy({isAutoSyncEnabled: true}), createApprovedReport(), actionsFor({failureMessage, unapproved}))).toEqual([]);
        });

        it('includes the report when auto-sync is off', () => {
            expect(getExportedReportIDs(createExportPolicy({isAutoSyncEnabled: false}))).toEqual([EXPORT_REPORT_ID]);
        });
    });

    describe('report state', () => {
        it('excludes a report that was already exported', () => {
            const report = {...createApprovedReport(), isExportedToIntegration: true};

            expect(getExportedReportIDs(createExportPolicy(), report)).toEqual([]);
        });

        it('excludes a report whose export is already queued', () => {
            const queuedAction = createMock<ReportAction>({
                reportActionID: 'queued_action',
                actionName: CONST.REPORT.ACTIONS.TYPE.QUEUED_FOR_EXPORT,
                created: '2024-06-01 00:00:00.000',
            });

            expect(getExportedReportIDs(createExportPolicy(), createApprovedReport(), {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPORT_REPORT_ID}`]: {queuedAction}})).toEqual([]);
        });

        it('excludes an archived report', () => {
            // The server reads the archive flag from the expense report itself, not from its chat
            const archivedNVPs = {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${EXPORT_REPORT_ID}`]: {private_isArchived: '2024-01-01 00:00:00'}};

            expect(getExportedReportIDs(createExportPolicy(), createApprovedReport(), undefined, archivedNVPs)).toEqual([]);
        });

        it('excludes a report waiting on a bank account', () => {
            const waitingReport = {...createApprovedReport(), isWaitingOnBankAccount: true};

            expect(getExportedReportIDs(createExportPolicy(), waitingReport)).toEqual([]);
        });

        // App requires a verified connection while the backend does not, so this is a known and accepted difference
        it('excludes a report whose only connection is unverified', () => {
            const policy = createMock<Policy>({
                ...createMockPolicy(EXPORT_POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, exporter: ''}),
                connections: createMock<Connections>({
                    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {verified: false, options: {config: {exporter: CURRENT_USER_EMAIL}}},
                }),
            });

            expect(getExportedReportIDs(policy)).toEqual([]);
        });

        it('excludes an approved report on a cash-basis connection until it is paid', () => {
            const policy = createExportPolicy();
            const cashPolicy = createMock<Policy>({
                ...policy,
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        ...policy.connections?.quickbooksOnline,
                        config: {...policy.connections?.quickbooksOnline?.config, accountingMethod: COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH},
                    },
                },
            });

            expect(getExportedReportIDs(cashPolicy)).toEqual([]);

            const paidReport = {...createApprovedReport(), statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED};
            expect(getExportedReportIDs(cashPolicy, paidReport)).toEqual([EXPORT_REPORT_ID]);
        });
    });
});

describe('export rule across surfaces', () => {
    const SURFACE_POLICY_ID = 'policy_surface';
    const SURFACE_REPORT_ID = 'report_surface';

    const createSurfacePolicy = (
        isAutoSyncEnabled: boolean,
        {connectionExporter = CURRENT_USER_EMAIL, role = CONST.POLICY.ROLE.ADMIN}: {connectionExporter?: string; role?: Policy['role']} = {},
    ): Policy =>
        createMock<Policy>({
            ...createMockPolicy(SURFACE_POLICY_ID, {role, exporter: ''}),
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    lastSync: {isConnected: true, isSuccessful: true, isAuthenticationError: false, source: 'DIRECT'},
                    config: {
                        autoSync: {jobID: 'job123', enabled: isAutoSyncEnabled},
                        export: {exporter: connectionExporter},
                    },
                },
            },
        });

    const createSurfaceReport = () =>
        createMockReport(SURFACE_REPORT_ID, {
            policyID: SURFACE_POLICY_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            ownerAccountID: OTHER_USER_ACCOUNT_ID,
        });

    const getSurfaceResults = (policy: Policy) => {
        const report = createSurfaceReport();
        const transaction = createMockTransaction(`trans_${SURFACE_REPORT_ID}`, SURFACE_REPORT_ID);

        const isInTodoBucket = createTodosReportsAndTransactions({
            ...baseParams,
            allReports: toReportsCollection([report]),
            allTransactions: toTransactionsCollection([transaction]),
            allPolicies: toPoliciesCollection([policy]),
        }).reportsToExport.some((exportedReport) => exportedReport.reportID === SURFACE_REPORT_ID);

        const isSidebarItemVisible = getSuggestedSearchesVisibility(CURRENT_USER_EMAIL, {}, toPoliciesCollection([policy]), undefined).visibility[CONST.SEARCH.SEARCH_KEYS.EXPORT];

        const primaryAction = getReportPrimaryAction({
            rules: undefined,
            currentUserLogin: CURRENT_USER_EMAIL,
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            report,
            ownerLogin: '',
            chatReport: createMockReport(`chat_${SURFACE_REPORT_ID}`, {type: CONST.REPORT.TYPE.CHAT}),
            reportTransactions: [transaction],
            violations: {},
            bankAccountList: {},
            policy,
            isChatReportArchived: false,
        });

        return {isInTodoBucket, isSidebarItemVisible, isPrimaryExportAction: primaryAction === CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING};
    };

    it('keeps the report page action for an admin who is not the exporter, but not the to-do', () => {
        const results = getSurfaceResults(createSurfacePolicy(false, {connectionExporter: 'someoneelse@mail.com'}));

        // The to-do and the sidebar belong to the exporter, while the report page lets any admin export
        expect(results.isInTodoBucket).toBe(false);
        expect(results.isSidebarItemVisible).toBe(false);
        expect(results.isPrimaryExportAction).toBe(true);
    });

    it('offers the report nowhere for a member who is neither the exporter nor an admin', () => {
        const results = getSurfaceResults(createSurfacePolicy(false, {connectionExporter: 'someoneelse@mail.com', role: CONST.POLICY.ROLE.USER}));

        expect(results).toEqual({isInTodoBucket: false, isSidebarItemVisible: false, isPrimaryExportAction: false});
    });

    it('shows the report in the to-do, the sidebar and the report page when it needs a manual export', () => {
        expect(getSurfaceResults(createSurfacePolicy(false))).toEqual({isInTodoBucket: true, isSidebarItemVisible: true, isPrimaryExportAction: true});
    });

    it('drops the report from the to-do and the report page when auto-sync exports it', () => {
        const results = getSurfaceResults(createSurfacePolicy(true));

        expect(results.isInTodoBucket).toBe(false);
        expect(results.isPrimaryExportAction).toBe(false);

        // The sidebar item stays, since the user is still an exporter and can open an empty list
        expect(results.isSidebarItemVisible).toBe(true);
    });
});
