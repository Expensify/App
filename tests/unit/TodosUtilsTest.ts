import createTodosReportsAndTransactions, {buildTransactionsByReportID, getTodoReportsForSearchKey} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';

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
    isPolicyExpenseChatEnabled: true,
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
    });
});
