import {renderHook} from '@testing-library/react-native';

import useFrozenSplitTransactionIDs from '@hooks/useFrozenSplitTransactionIDs';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';

const CURRENT_USER_LOGIN = 'current-user@example.com';
const CURRENT_USER_ACCOUNT_ID = 1;

function makeSplit(transactionID: string): SplitExpense {
    return {transactionID, amount: 100, created: '2024-01-01'};
}

// SelfDM short-circuits `isSplitAction` to `true`, so these fixtures isolate the report-status (frozen) check
// from the permission (editable) check added alongside it.
function makeReportsCollection(reports: Array<[reportID: string, overrides: Partial<Report>]>): OnyxCollection<Report> {
    const collection: OnyxCollection<Report> = {};
    for (const [reportID, overrides] of reports) {
        collection[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {reportID, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM, ...overrides};
    }
    return collection;
}

function makeTransactionsCollection(transactions: Array<[transactionID: string, reportID: string]>): OnyxCollection<Transaction> {
    const collection: OnyxCollection<Transaction> = {};
    for (const [transactionID, reportID] of transactions) {
        // Pin status - createRandomTransaction randomizes it, and isSplitAction treats PENDING as non-editable.
        collection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = {...createRandomTransaction(0), transactionID, reportID, status: CONST.TRANSACTION.STATUS.POSTED};
    }
    return collection;
}

function renderFrozenIDs(
    splitExpenses: SplitExpense[],
    allTransactions: OnyxCollection<Transaction>,
    allReports: OnyxCollection<Report>,
    fallbackReport: Report | undefined,
    searchResultsData?: SearchResultDataType,
    allPolicies: OnyxCollection<Policy> = {},
) {
    return renderHook(() =>
        useFrozenSplitTransactionIDs(
            splitExpenses,
            allTransactions,
            allReports,
            fallbackReport,
            searchResultsData,
            undefined,
            CURRENT_USER_LOGIN,
            CURRENT_USER_ACCOUNT_ID,
            allPolicies,
            undefined,
        ),
    );
}

describe('useFrozenSplitTransactionIDs', () => {
    it('returns an empty set when there are no splits', () => {
        const {result} = renderFrozenIDs([], {}, {}, undefined);
        expect(result.current.size).toBe(0);
    });

    it('excludes a split whose own report is still open', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports = makeReportsCollection([['report1', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN}]]);

        const {result} = renderFrozenIDs([split], transactions, reports, undefined);

        expect(result.current.has('tx1')).toBe(false);
    });

    it('includes a split whose own report is approved', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports = makeReportsCollection([['report1', {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}]]);

        const {result} = renderFrozenIDs([split], transactions, reports, undefined);

        expect(result.current.has('tx1')).toBe(true);
    });

    it('includes a split whose own report is paid (reimbursed)', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports = makeReportsCollection([['report1', {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}]]);

        const {result} = renderFrozenIDs([split], transactions, reports, undefined);

        expect(result.current.has('tx1')).toBe(true);
    });

    it('includes a split whose own report is marked as done (closed)', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports = makeReportsCollection([['report1', {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.CLOSED}]]);

        const {result} = renderFrozenIDs([split], transactions, reports, undefined);

        expect(result.current.has('tx1')).toBe(true);
    });

    it('falls back to the given report when the split transaction has no report of its own', () => {
        const split = makeSplit('tx1');
        const fallbackReport: Report = {
            reportID: 'fallback',
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };

        const {result} = renderFrozenIDs([split], {}, {}, fallbackReport);

        expect(result.current.has('tx1')).toBe(true);
    });

    it('only marks the actually frozen splits among a mix of several', () => {
        const draftSplit = makeSplit('draft');
        const frozenSplit = makeSplit('frozen');
        const transactions = makeTransactionsCollection([
            ['draft', 'reportOpen'],
            ['frozen', 'reportApproved'],
        ]);
        const reports = makeReportsCollection([
            ['reportOpen', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN}],
            ['reportApproved', {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}],
        ]);

        const {result} = renderFrozenIDs([draftSplit, frozenSplit], transactions, reports, undefined);

        expect(result.current.has('draft')).toBe(false);
        expect(result.current.has('frozen')).toBe(true);
        expect(result.current.size).toBe(1);
    });

    it('includes a split whose transaction and report exist only in search results data, not in Onyx', () => {
        const split = makeSplit('tx1');
        const searchResultsData: SearchResultDataType = {};
        searchResultsData[`${ONYXKEYS.COLLECTION.TRANSACTION}tx1`] = {...createRandomTransaction(0), transactionID: 'tx1', reportID: 'report1'};
        searchResultsData[`${ONYXKEYS.COLLECTION.REPORT}report1`] = {
            reportID: 'report1',
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };

        const {result} = renderFrozenIDs([split], {}, {}, undefined, searchResultsData);

        expect(result.current.has('tx1')).toBe(true);
    });

    it('finds the report in search results data when the transaction itself is in Onyx', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const searchResultsData: SearchResultDataType = {};
        searchResultsData[`${ONYXKEYS.COLLECTION.REPORT}report1`] = {
            reportID: 'report1',
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };

        const {result} = renderFrozenIDs([split], transactions, {}, undefined, searchResultsData);

        expect(result.current.has('tx1')).toBe(true);
    });

    it('includes a split that is not frozen by status but the current user can no longer split-action on', () => {
        // An open, non-selfDM expense report with no matching policy - isSplitAction requires policy
        // membership, so this is neither approved/paid/done nor split-actionable by the current user.
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports: OnyxCollection<Report> = {
            [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {
                reportID: 'report1',
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            },
        };

        const {result} = renderFrozenIDs([split], transactions, reports, undefined, undefined, {});

        expect(result.current.has('tx1')).toBe(true);
    });

    it('excludes a split on an expense report the current user is the admin of', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports: OnyxCollection<Report> = {
            [`${ONYXKEYS.COLLECTION.REPORT}report1`]: {
                reportID: 'report1',
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: 'policy1',
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            },
        };
        const allPolicies: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}policy1`]: {
                id: 'policy1',
                name: 'Test Policy',
                role: CONST.POLICY.ROLE.ADMIN,
                type: CONST.POLICY.TYPE.TEAM,
                owner: CURRENT_USER_LOGIN,
                outputCurrency: CONST.CURRENCY.USD,
                employeeList: {[CURRENT_USER_LOGIN]: {email: CURRENT_USER_LOGIN, role: CONST.POLICY.ROLE.ADMIN}},
            },
        };

        const {result} = renderFrozenIDs([split], transactions, reports, undefined, undefined, allPolicies);

        expect(result.current.has('tx1')).toBe(false);
    });
});
