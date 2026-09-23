import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useMoneyRequestReportSortedTransactions, {EMPTY_VIOLATIONS} from '@components/MoneyRequestReportView/useMoneyRequestReportSortedTransactions';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {StableReport} from '@src/selectors/Report';
import type {Card, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

import type {ReactNode} from 'react';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import {getFakeReportAction} from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type Params = Parameters<typeof useMoneyRequestReportSortedTransactions>[0];

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'test@test.com';

const REPORT: StableReport = {
    reportID: 'report1',
    type: CONST.REPORT.TYPE.IOU,
    currency: CONST.CURRENCY.USD,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
};

const MISSING_CATEGORY_VIOLATIONS: TransactionViolations = [
    {
        name: CONST.VIOLATIONS.MISSING_CATEGORY,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
    },
];

const wrapper = ({children}: {children: ReactNode}) => (
    <LocaleContextProvider>
        <OnyxListItemProvider>{children}</OnyxListItemProvider>
    </LocaleContextProvider>
);

/** A deterministic transaction with none of the random fields that could trip an RBR on their own. */
function buildTransaction(transactionID: string, overrides: Partial<Transaction> = {}): Transaction {
    return {
        ...createRandomTransaction(Number(transactionID)),
        transactionID,
        reportID: REPORT.reportID,
        amount: -100,
        currency: CONST.CURRENCY.USD,
        merchant: `Merchant ${transactionID}`,
        modifiedMerchant: '',
        modifiedCreated: '',
        category: '',
        tag: '',
        comment: {},
        receipt: undefined,
        cardID: undefined,
        cardName: undefined,
        status: CONST.TRANSACTION.STATUS.POSTED,
        hasEReceipt: false,
        errors: undefined,
        pendingAction: null,
        ...overrides,
    };
}

function buildIOUAction(reportActionID: string, IOUTransactionID: string, childReportID?: string): ReportAction {
    return getFakeReportAction(Number(reportActionID), {
        reportActionID,
        reportID: REPORT.reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        childReportID,
        originalMessage: {
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            IOUTransactionID,
            IOUReportID: REPORT.reportID,
            amount: 100,
            currency: CONST.CURRENCY.USD,
        },
    });
}

function buildParams(overrides: Partial<Params> = {}): Params {
    return {
        report: REPORT,
        policy: undefined,
        transactions: [],
        reportActions: [],
        newTransactions: [],
        policyCategories: undefined,
        policyTagLists: undefined,
        ...overrides,
    };
}

async function renderSortedTransactions(params: Params) {
    const rendered = renderHook(() => useMoneyRequestReportSortedTransactions(params), {wrapper});
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return rendered;
}

function getIDs(transactions: Transaction[]) {
    return transactions.map((transaction) => transaction.transactionID);
}

describe('useMoneyRequestReportSortedTransactions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL);
        await waitForBatchedUpdates();
    });

    it('should sort by date ascending by default', async () => {
        // Given transactions created on different days, passed in out of order
        const transactions = [buildTransaction('1', {created: '2024-01-03'}), buildTransaction('2', {created: '2024-01-01'}), buildTransaction('3', {created: '2024-01-02'})];

        // When the hook renders without any sort interaction
        const {result} = await renderSortedTransactions(buildParams({transactions}));

        // Then the default Date/ASC sort is applied
        expect(result.current.sortBy).toBe(CONST.SEARCH.TABLE_COLUMNS.DATE);
        expect(result.current.sortOrder).toBe(CONST.SEARCH.SORT_ORDER.ASC);
        expect(getIDs(result.current.sortedTransactions)).toEqual(['2', '3', '1']);
    });

    it('should not mutate the transactions array it receives', async () => {
        // Given transactions passed in reverse date order
        const transactions = [buildTransaction('1', {created: '2024-01-02'}), buildTransaction('2', {created: '2024-01-01'})];

        // When the hook sorts them
        await renderSortedTransactions(buildParams({transactions}));

        // Then the caller's array keeps its original order, since it is shared with other consumers
        expect(getIDs(transactions)).toEqual(['1', '2']);
    });

    it('should re-sort when a sortable column header is pressed', async () => {
        // Given transactions with different merchants
        const transactions = [
            buildTransaction('1', {created: '2024-01-01', merchant: 'Bravo'}),
            buildTransaction('2', {created: '2024-01-02', merchant: 'Charlie'}),
            buildTransaction('3', {created: '2024-01-03', merchant: 'Alpha'}),
        ];
        const {result} = await renderSortedTransactions(buildParams({transactions}));

        // When the user sorts by merchant descending
        act(() => {
            result.current.onSortPress(CONST.SEARCH.TABLE_COLUMNS.MERCHANT, CONST.SEARCH.SORT_ORDER.DESC);
        });

        // Then the sort state and the sorted array both follow the new column and direction
        expect(result.current.sortBy).toBe(CONST.SEARCH.TABLE_COLUMNS.MERCHANT);
        expect(result.current.sortOrder).toBe(CONST.SEARCH.SORT_ORDER.DESC);
        expect(getIDs(result.current.sortedTransactions)).toEqual(['2', '1', '3']);
    });

    it('should ignore presses on non-sortable columns', async () => {
        // Given the hook on its default sort
        const transactions = [buildTransaction('1', {created: '2024-01-02'}), buildTransaction('2', {created: '2024-01-01'})];
        const {result} = await renderSortedTransactions(buildParams({transactions}));

        // When a column that the report table cannot sort by is pressed
        act(() => {
            result.current.onSortPress(CONST.SEARCH.TABLE_COLUMNS.RECEIPT, CONST.SEARCH.SORT_ORDER.DESC);
        });

        // Then the sort state is unchanged
        expect(result.current.sortBy).toBe(CONST.SEARCH.TABLE_COLUMNS.DATE);
        expect(result.current.sortOrder).toBe(CONST.SEARCH.SORT_ORDER.ASC);
        expect(getIDs(result.current.sortedTransactions)).toEqual(['2', '1']);
    });

    it('should float RBR-flagged transactions to the top on the default sort', async () => {
        // Given the newest transaction has a visible violation
        const transactions = [buildTransaction('1', {created: '2024-01-01'}), buildTransaction('2', {created: '2024-01-02'}), buildTransaction('3', {created: '2024-01-03'})];
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}3`, MISSING_CATEGORY_VIOLATIONS);

        // When the hook sorts on the default Date/ASC sort
        const {result} = await renderSortedTransactions(buildParams({transactions}));

        // Then the flagged transaction comes first so the user sees what needs attention
        expect(getIDs(result.current.sortedTransactions)).toEqual(['3', '1', '2']);
    });

    it('should not float RBR-flagged transactions once the user picks another sort', async () => {
        // Given the newest transaction has a visible violation
        const transactions = [buildTransaction('1', {created: '2024-01-01'}), buildTransaction('2', {created: '2024-01-02'}), buildTransaction('3', {created: '2024-01-03'})];
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}3`, MISSING_CATEGORY_VIOLATIONS);
        const {result} = await renderSortedTransactions(buildParams({transactions}));

        // When the user explicitly sorts by date descending
        act(() => {
            result.current.onSortPress(CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.SORT_ORDER.DESC);
        });

        // Then the chosen sort is respected as-is
        expect(getIDs(result.current.sortedTransactions)).toEqual(['3', '2', '1']);

        // When the user switches back to date ascending
        act(() => {
            result.current.onSortPress(CONST.SEARCH.TABLE_COLUMNS.DATE, CONST.SEARCH.SORT_ORDER.ASC);
        });

        // Then the default sort floats the flagged transaction again
        expect(getIDs(result.current.sortedTransactions)).toEqual(['3', '1', '2']);
    });

    it('should expose the IDs of newly added transactions for highlighting', async () => {
        // Given one of the transactions arrived while the report was open
        const transactions = [buildTransaction('1'), buildTransaction('2')];

        // When the hook renders
        const {result} = await renderSortedTransactions(buildParams({transactions, newTransactions: transactions.slice(1)}));

        // Then only that transaction is highlighted
        expect([...result.current.highlightedTransactionIDs]).toEqual(['2']);
    });

    it('should map each transaction to its thread report ID, keeping the first matching action', async () => {
        // Given newest-first report actions, including a stale duplicate IOU action and one without a thread
        const reportActions = [buildIOUAction('30', '1', 'thread1-newest'), buildIOUAction('20', '1', 'thread1-older'), buildIOUAction('10', '2'), buildIOUAction('5', '3', 'thread3')];

        // When the hook renders
        const {result} = await renderSortedTransactions(
            buildParams({
                transactions: [buildTransaction('1'), buildTransaction('2'), buildTransaction('3')],
                reportActions,
            }),
        );

        // Then the newest action wins and actions without a child report are skipped
        expect(result.current.transactionThreadReportIDByTransactionID).toEqual(
            new Map([
                ['1', 'thread1-newest'],
                ['3', 'thread3'],
            ]),
        );
    });

    it('should map each transaction to its visible violations with a stable empty reference', async () => {
        // Given one transaction with a violation and one without
        const transactions = [buildTransaction('1', {created: '2024-01-01'}), buildTransaction('2', {created: '2024-01-02'})];
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`, MISSING_CATEGORY_VIOLATIONS);

        // When the hook renders
        const {result} = await renderSortedTransactions(buildParams({transactions}));

        // Then the clean transaction gets the shared empty array so its row props stay referentially stable
        expect(result.current.violationsByTransactionID.get('1')).toEqual(MISSING_CATEGORY_VIOLATIONS);
        expect(result.current.violationsByTransactionID.get('2')).toBe(EMPTY_VIOLATIONS);
    });

    it('should use the stable empty reference when no violations are loaded', async () => {
        // Given no violations exist in Onyx at all
        const transactions = [buildTransaction('1')];

        // When the hook renders
        const {result} = await renderSortedTransactions(buildParams({transactions}));

        // Then the transaction still gets the shared empty array
        expect(result.current.violationsByTransactionID.get('1')).toBe(EMPTY_VIOLATIONS);
    });

    it('should resolve card names from the card list', async () => {
        // Given a card transaction whose card is in the card list and a cash transaction
        const card: Card = {
            cardID: 99,
            bank: CONST.EXPENSIFY_CARD.BANK,
            lastFourPAN: '1234',
            state: CONST.EXPENSIFY_CARD.STATE.OPEN,
            fundID: '1',
            domainName: 'expensify.com',
            availableSpend: 0,
            fraud: CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE,
            lastUpdated: '',
        };
        await Onyx.merge(ONYXKEYS.CARD_LIST, {[card.cardID]: card});
        const cardTransaction = buildTransaction('1', {
            created: '2024-01-01',
            cardID: 99,
            cardName: 'Stale name',
        });
        const cashTransaction = buildTransaction('2', {created: '2024-01-02'});

        // When the hook renders
        const {result} = await renderSortedTransactions(buildParams({transactions: [cardTransaction, cashTransaction]}));

        // Then the card transaction carries the resolved name and the cash transaction is passed through untouched
        expect(result.current.resolvedTransactions.at(0)?.cardName).toBe(`${CONST.EXPENSIFY_CARD.BANK} ${CONST.DOT_SEPARATOR} 1234`);
        expect(result.current.resolvedTransactions.at(1)).toBe(result.current.sortedTransactions.at(1));
    });
});
