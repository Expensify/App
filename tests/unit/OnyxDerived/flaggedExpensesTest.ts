import type {OnyxCollection} from 'react-native-onyx';
import flaggedExpensesConfig from '@libs/actions/OnyxDerived/configs/flaggedExpenses';
import type {DerivedValueContext} from '@libs/actions/OnyxDerived/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Session, Transaction, TransactionViolations} from '@src/types/onyx';
import {createMockReport} from '../../utils/ReportTestUtils';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@example.com';
const OTHER_USER_ACCOUNT_ID = 2;
const POLICY_ID_1 = 'policy1';
const POLICY_ID_2 = 'policy2';

function createExpenseReport(reportID: string, overrides: Partial<Report> = {}): Report {
    return createMockReport({
        reportID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        policyID: POLICY_ID_1,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        ...overrides,
    });
}

function createTransaction(transactionID: string, reportID: string, overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID,
        reportID,
        amount: 100,
        currency: 'USD',
        created: '2024-01-01',
        merchant: 'Test Merchant',
        ...overrides,
    } as Transaction;
}

function buildReports(...reports: Report[]): OnyxCollection<Report> {
    const result: OnyxCollection<Report> = {};
    for (const report of reports) {
        result[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
    }
    return result;
}

function buildTransactions(...transactions: Transaction[]): OnyxCollection<Transaction> {
    const result: OnyxCollection<Transaction> = {};
    for (const transaction of transactions) {
        result[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }
    return result;
}

function buildViolations(violationsByTransactionID: Record<string, TransactionViolations>): OnyxCollection<TransactionViolations> {
    const result: OnyxCollection<TransactionViolations> = {};
    for (const [transactionID, violations] of Object.entries(violationsByTransactionID)) {
        result[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] = violations;
    }
    return result;
}

function createSession(accountID: number = CURRENT_USER_ACCOUNT_ID, email: string = CURRENT_USER_EMAIL): Session {
    return {accountID, email} as Session;
}

const {compute} = flaggedExpensesConfig;
const emptyContext = {} as DerivedValueContext<
    typeof ONYXKEYS.DERIVED.FLAGGED_EXPENSES,
    [typeof ONYXKEYS.COLLECTION.REPORT, typeof ONYXKEYS.COLLECTION.TRANSACTION, typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, typeof ONYXKEYS.COLLECTION.POLICY, typeof ONYXKEYS.SESSION]
>;

describe('flaggedExpenses derived value', () => {
    describe('presence and count', () => {
        it('reports zero flagged expenses and an empty list when no transactions have violations', () => {
            const report = createExpenseReport('r1');
            const transaction = createTransaction('t1', 'r1');
            const result = compute([buildReports(report), buildTransactions(transaction), {}, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toEqual([]);
        });

        it('counts two flagged transactions on OPEN/OPEN expense reports across two workspaces', () => {
            const report1 = createExpenseReport('r1', {policyID: POLICY_ID_1});
            const report2 = createExpenseReport('r2', {policyID: POLICY_ID_2});
            const transaction1 = createTransaction('t1', 'r1');
            const transaction2 = createTransaction('t2', 'r2');
            const violations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
                t2: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
            });

            const result = compute([buildReports(report1, report2), buildTransactions(transaction1, transaction2), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toHaveLength(2);
            const ids = result.flaggedExpenses.map((entry) => entry.transactionID).sort();
            expect(ids).toEqual(['t1', 't2']);
            const reportIDs = result.flaggedExpenses.map((entry) => entry.reportID).sort();
            expect(reportIDs).toEqual(['r1', 'r2']);
        });

        it('counts a single transaction with multiple violations as 1 expense', () => {
            const report = createExpenseReport('r1');
            const transaction = createTransaction('t1', 'r1');
            const violations = buildViolations({
                t1: [
                    {type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY},
                    {type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_TAG},
                ],
            });

            const result = compute([buildReports(report), buildTransactions(transaction), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toHaveLength(1);
            expect(result.flaggedExpenses.at(0)).toEqual({transactionID: 't1', reportID: 'r1'});
        });

        it('counts every non-report-field violation type that OpenApp returns', () => {
            const report = createExpenseReport('r1');
            const transactions = [createTransaction('tA', 'r1'), createTransaction('tB', 'r1'), createTransaction('tC', 'r1')];
            const violations = buildViolations({
                tA: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.OVER_CATEGORY_LIMIT}],
                tB: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_TAG}],
                tC: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_COMMENT}],
            });

            const result = compute([buildReports(report), buildTransactions(...transactions), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toHaveLength(3);
            expect(result.flaggedExpenses.map((entry) => entry.transactionID).sort()).toEqual(['tA', 'tB', 'tC']);
        });

        it('excludes violations with showInReview === false', () => {
            const report = createExpenseReport('r1');
            const transaction = createTransaction('t1', 'r1');
            const violations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY, showInReview: false}],
            });

            const result = compute([buildReports(report), buildTransactions(transaction), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toEqual([]);
        });

        it('excludes warning/notice violations unless showInReview is explicitly true', () => {
            const report = createExpenseReport('r1');
            const transactions = [createTransaction('tWarn', 'r1'), createTransaction('tNotice', 'r1'), createTransaction('tShown', 'r1')];
            const violations = buildViolations({
                tWarn: [{type: CONST.VIOLATION_TYPES.WARNING, name: CONST.VIOLATIONS.RTER}],
                tNotice: [{type: CONST.VIOLATION_TYPES.NOTICE, name: CONST.VIOLATIONS.RECEIPT_REQUIRED}],
                tShown: [{type: CONST.VIOLATION_TYPES.NOTICE, name: CONST.VIOLATIONS.RECEIPT_REQUIRED, showInReview: true}],
            });

            const result = compute([buildReports(report), buildTransactions(...transactions), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toEqual([{transactionID: 'tShown', reportID: 'r1'}]);
        });
    });

    describe('Draft-report scope and resolution', () => {
        it('excludes flagged transactions on submitted expense reports', () => {
            const draftReport = createExpenseReport('r1');
            const submittedReport = createExpenseReport('r2', {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            });
            const draftTransaction = createTransaction('t1', 'r1');
            const submittedTransaction = createTransaction('t2', 'r2');
            const violations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
                t2: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
            });

            const result = compute([buildReports(draftReport, submittedReport), buildTransactions(draftTransaction, submittedTransaction), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toHaveLength(1);
            expect(result.flaggedExpenses.at(0)).toEqual({transactionID: 't1', reportID: 'r1'});
        });

        it('excludes flagged transactions whose parent report is not an expense report', () => {
            const expenseReport = createExpenseReport('r1');
            const chatReport = createMockReport({
                reportID: 'r2',
                type: CONST.REPORT.TYPE.CHAT,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            });
            const t1 = createTransaction('t1', 'r1');
            const t2 = createTransaction('t2', 'r2');
            const violations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
                t2: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
            });

            const result = compute([buildReports(expenseReport, chatReport), buildTransactions(t1, t2), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toHaveLength(1);
            expect(result.flaggedExpenses.at(0)).toEqual({transactionID: 't1', reportID: 'r1'});
        });

        it('does not count report-field violations as flagged expenses', () => {
            const report = createExpenseReport('r1');
            const transaction = createTransaction('t1', 'r1');
            const violations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.REPORT_VIOLATIONS.FIELD_REQUIRED} as TransactionViolations[number]],
            });

            const result = compute([buildReports(report), buildTransactions(transaction), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toEqual([]);
        });

        it('drops a transaction from the list when its last violation is cleared', () => {
            const report = createExpenseReport('r1');
            const transaction = createTransaction('t1', 'r1');
            const flaggedViolations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
            });

            const flaggedResult = compute([buildReports(report), buildTransactions(transaction), flaggedViolations, {}, createSession()], emptyContext);
            expect(flaggedResult.flaggedExpenses).toHaveLength(1);

            const clearedViolations = buildViolations({t1: []});
            const clearedResult = compute([buildReports(report), buildTransactions(transaction), clearedViolations, {}, createSession()], emptyContext);
            expect(clearedResult.flaggedExpenses).toEqual([]);
        });

        it('restores a previously cleaned transaction once it is re-flagged', () => {
            const report = createExpenseReport('r1');
            const transaction = createTransaction('t1', 'r1');

            const clearedResult = compute([buildReports(report), buildTransactions(transaction), buildViolations({t1: []}), {}, createSession()], emptyContext);
            expect(clearedResult.flaggedExpenses).toEqual([]);

            const reFlaggedResult = compute(
                [
                    buildReports(report),
                    buildTransactions(transaction),
                    buildViolations({
                        t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
                    }),
                    {},
                    createSession(),
                ],
                emptyContext,
            );
            expect(reFlaggedResult.flaggedExpenses).toHaveLength(1);
            expect(reFlaggedResult.flaggedExpenses.at(0)?.transactionID).toBe('t1');
        });

        it('excludes flagged transactions on expense reports the current user does not own', () => {
            const ownReport = createExpenseReport('r1');
            const foreignReport = createExpenseReport('r2', {ownerAccountID: OTHER_USER_ACCOUNT_ID});
            const ownTransaction = createTransaction('t1', 'r1');
            const foreignTransaction = createTransaction('t2', 'r2');
            const violations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
                t2: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
            });

            const result = compute([buildReports(ownReport, foreignReport), buildTransactions(ownTransaction, foreignTransaction), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toHaveLength(1);
            expect(result.flaggedExpenses.at(0)).toEqual({transactionID: 't1', reportID: 'r1'});
        });

        it('excludes all flagged transactions when the session has no accountID', () => {
            const report = createExpenseReport('r1', {ownerAccountID: OTHER_USER_ACCOUNT_ID});
            const transaction = createTransaction('t1', 'r1');
            const violations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
            });

            const result = compute([buildReports(report), buildTransactions(transaction), violations, {}, {} as Session], emptyContext);

            expect(result.flaggedExpenses).toEqual([]);
        });

        it('excludes transactions when the current user dismissed the only reviewable violation', () => {
            const report = createExpenseReport('r1');
            const transaction = createTransaction('t1', 'r1', {
                comment: {
                    dismissedViolations: {
                        [CONST.VIOLATIONS.MISSING_CATEGORY]: {
                            [CURRENT_USER_EMAIL]: '2024-01-01',
                        },
                    },
                },
            });
            const violations = buildViolations({
                t1: [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}],
            });

            const result = compute([buildReports(report), buildTransactions(transaction), violations, {}, createSession()], emptyContext);

            expect(result.flaggedExpenses).toEqual([]);
        });
    });
});
