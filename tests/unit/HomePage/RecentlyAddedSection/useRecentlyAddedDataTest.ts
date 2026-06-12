/**
 * Behavior asserted for the Recently added data hook:
 *   - returns the current user's expenses, most recent first
 *   - sorts strictly by the `inserted` (creation/insertion) timestamp, never by `created` (expense date);
 *     falls back to `created` only when `inserted` is missing
 *   - caps the list at CONST.HOME.SECTION_VISIBLE_LIMIT (5) rows
 *   - includes expenses regardless of report status (no recency-window / draft-only filter)
 *   - scopes to the signed-in user's own expenses (excludes expenses owned by other accounts)
 */
import {renderHook} from '@testing-library/react-native';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useRecentlyAddedData} from '@pages/home/RecentlyAddedSection/useRecentlyAddedData';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

const ACCOUNT_ID = 12345;
const OTHER_ACCOUNT_ID = 67890;

// Module mocks

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`})),
}));

// useOnyx mock — applies the provided selector to seeded Onyx data, mirroring useYourSpendDataTest.

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string, options?: {selector?: (v: unknown) => unknown}) => {
    const value = onyxData[key];
    const selected = options?.selector ? options.selector(value) : value;
    return [selected];
});

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (v: unknown) => unknown}) => mockUseOnyx(key, options),
}));

const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

// Helpers

function makeTransaction(overrides: Partial<Transaction> & {transactionID: string}): Transaction {
    return {
        reportID: 'report_owned',
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        merchant: 'Merchant',
        created: '2026-06-01',
        ...overrides,
    } as Transaction;
}

function makeReport(reportID: string, ownerAccountID: number, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        ownerAccountID,
        ...overrides,
    } as Report;
}

function setupTransactions(transactions: Transaction[]) {
    onyxData[ONYXKEYS.COLLECTION.TRANSACTION] = Object.fromEntries(transactions.map((t) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${t.transactionID}`, t]));
}

function setupReports(reports: Report[]) {
    onyxData[ONYXKEYS.COLLECTION.REPORT] = Object.fromEntries(reports.map((r) => [`${ONYXKEYS.COLLECTION.REPORT}${r.reportID}`, r]));
}

function resultTransactionIDs(transactions: Transaction[]): string[] {
    return transactions.map((t) => t.transactionID);
}

beforeEach(() => {
    for (const k of Object.keys(onyxData)) {
        delete onyxData[k];
    }
    mockUseOnyx.mockClear();
    mockedUseCurrentUserPersonalDetails.mockReturnValue({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`} as CurrentUserPersonalDetails);
    // Default: a single report owned by the current user that owned transactions can attach to.
    setupReports([makeReport('report_owned', ACCOUNT_ID)]);
});

describe('useRecentlyAddedData — ordering', () => {
    it('returns the current user expenses sorted by inserted timestamp, most recent first', () => {
        setupTransactions([
            makeTransaction({transactionID: 't1', inserted: '2026-06-01 10:00:00'}),
            makeTransaction({transactionID: 't3', inserted: '2026-06-03 10:00:00'}),
            makeTransaction({transactionID: 't2', inserted: '2026-06-02 10:00:00'}),
        ]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t3', 't2', 't1']);
    });

    it('falls back to the created (expense) date when inserted is missing', () => {
        setupTransactions([
            makeTransaction({transactionID: 'withCreatedOnly', created: '2026-06-05', inserted: undefined}),
            makeTransaction({transactionID: 'withInserted', created: '2026-01-01', inserted: '2026-06-04 10:00:00'}),
        ]);

        const {result} = renderHook(() => useRecentlyAddedData());

        // withCreatedOnly's created (Jun 5) outranks withInserted's inserted (Jun 4).
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['withCreatedOnly', 'withInserted']);
    });

    it('ranks an old-dated expense first when it was inserted most recently', () => {
        setupTransactions([
            makeTransaction({transactionID: 'oldDateRecentInsert', created: '2026-03-01', inserted: '2026-06-09 09:00:00'}),
            makeTransaction({transactionID: 'recentDateOldInsert', created: '2026-06-08', inserted: '2026-06-08 09:00:00'}),
        ]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['oldDateRecentInsert', 'recentDateOldInsert']);
    });
});

describe('useRecentlyAddedData — row cap', () => {
    it('returns at most CONST.HOME.SECTION_VISIBLE_LIMIT rows', () => {
        const sevenTransactions = Array.from({length: 7}, (_, i) =>
            makeTransaction({
                transactionID: `t${i}`,
                inserted: `2026-06-${String(i + 1).padStart(2, '0')} 10:00:00`,
            }),
        );
        setupTransactions(sevenTransactions);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions).toHaveLength(CONST.HOME.SECTION_VISIBLE_LIMIT);
        // Keeps the five most recently inserted.
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t6', 't5', 't4', 't3', 't2']);
    });
});

describe('useRecentlyAddedData — current-user scope', () => {
    it('excludes expenses owned by another account', () => {
        setupReports([makeReport('report_owned', ACCOUNT_ID), makeReport('report_other', OTHER_ACCOUNT_ID)]);
        setupTransactions([
            makeTransaction({transactionID: 'mine', reportID: 'report_owned', inserted: '2026-06-02 10:00:00'}),
            makeTransaction({transactionID: 'theirs', reportID: 'report_other', inserted: '2026-06-03 10:00:00'}),
        ]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['mine']);
    });
});

describe('useRecentlyAddedData — status agnostic', () => {
    it('includes the current user expenses regardless of their report status', () => {
        setupReports([
            makeReport('report_open', ACCOUNT_ID, {statusNum: CONST.REPORT.STATUS_NUM.OPEN, stateNum: CONST.REPORT.STATE_NUM.OPEN}),
            makeReport('report_submitted', ACCOUNT_ID, {statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED, stateNum: CONST.REPORT.STATE_NUM.SUBMITTED}),
            makeReport('report_approved', ACCOUNT_ID, {statusNum: CONST.REPORT.STATUS_NUM.APPROVED, stateNum: CONST.REPORT.STATE_NUM.APPROVED}),
            makeReport('report_reimbursed', ACCOUNT_ID, {statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED, stateNum: CONST.REPORT.STATE_NUM.APPROVED}),
        ]);
        setupTransactions([
            makeTransaction({transactionID: 'open', reportID: 'report_open', inserted: '2026-06-01 10:00:00'}),
            makeTransaction({transactionID: 'submitted', reportID: 'report_submitted', inserted: '2026-06-02 10:00:00'}),
            makeTransaction({transactionID: 'approved', reportID: 'report_approved', inserted: '2026-06-03 10:00:00'}),
            makeTransaction({transactionID: 'reimbursed', reportID: 'report_reimbursed', inserted: '2026-06-04 10:00:00'}),
        ]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['reimbursed', 'approved', 'submitted', 'open']);
    });
});
