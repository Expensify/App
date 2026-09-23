import {act, renderHook} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import useMoneyRequestReportGroupedTransactions from '@components/MoneyRequestReportView/useMoneyRequestReportGroupedTransactions';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/useMoneyRequestReportSortedTransactions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {StableReport} from '@src/selectors/Report';

import type {ReactNode} from 'react';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type Params = Parameters<typeof useMoneyRequestReportGroupedTransactions>[0];

const REPORT: StableReport = {
    reportID: 'report1',
    type: CONST.REPORT.TYPE.EXPENSE,
    currency: CONST.CURRENCY.USD,
};

const wrapper = ({children}: {children: ReactNode}) => <LocaleContextProvider>{children}</LocaleContextProvider>;

function buildTransaction(transactionID: string, overrides: Partial<TransactionWithOptionalHighlight> = {}): TransactionWithOptionalHighlight {
    return {
        ...createRandomTransaction(Number(transactionID)),
        transactionID,
        reportID: REPORT.reportID,
        pendingAction: null,
        pendingFields: undefined,
        ...overrides,
    };
}

function buildParams(overrides: Partial<Params> = {}): Params {
    const transactions = overrides.sortedTransactions ?? [];
    return {
        report: REPORT,
        sortedTransactions: transactions,
        resolvedTransactions: transactions,
        currentGroupBy: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
        shouldGroupTransactions: false,
        isOffline: false,
        ...overrides,
    };
}

async function renderGroupedTransactions(params: Params) {
    const rendered = renderHook(() => useMoneyRequestReportGroupedTransactions(params), {wrapper});
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return rendered;
}

function getListItemKeys(listItems: ReturnType<typeof useMoneyRequestReportGroupedTransactions>['listItems']) {
    return listItems.map((item) => (item.type === 'section-header' ? `header:${item.groupKey}` : item.transaction.transactionID));
}

describe('useMoneyRequestReportGroupedTransactions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('should render a flat list of the resolved transactions when grouping is off', async () => {
        // Given three transactions and grouping turned off
        const transactions = [buildTransaction('1'), buildTransaction('2'), buildTransaction('3')];

        // When the hook derives the list
        const {result} = await renderGroupedTransactions(buildParams({sortedTransactions: transactions}));

        // Then there are no groups and every transaction is a row in sorted order
        expect(result.current.groupedTransactions).toEqual([]);
        expect(getListItemKeys(result.current.listItems)).toEqual(['1', '2', '3']);
        expect(result.current.visualOrderTransactionIDs).toEqual(['1', '2', '3']);
        expect(result.current.lastTransactionID).toBe('3');
    });

    it('should render the resolved transactions as rows rather than the sorted ones', async () => {
        // Given the resolved array holds card-resolved copies of the sorted transactions
        const sortedTransactions = [buildTransaction('1'), buildTransaction('2')];
        const resolvedTransactions = sortedTransactions.map((transaction) => ({
            ...transaction,
            cardName: 'Resolved card',
        }));

        // When the hook derives the list
        const {result} = await renderGroupedTransactions(buildParams({sortedTransactions, resolvedTransactions}));

        // Then rows point at the resolved copies, since those are what the view renders
        const rowTransactions = result.current.listItems.map((item) => (item.type === 'transaction' ? item.transaction : undefined));
        expect(rowTransactions).toEqual(resolvedTransactions);
        expect(rowTransactions.at(0)).toBe(resolvedTransactions.at(0));
    });

    it('should exclude pending-delete transactions from the visual order and the last row while online', async () => {
        // Given the last transaction is pending delete and the user is online
        const transactions = [
            buildTransaction('1'),
            buildTransaction('2'),
            buildTransaction('3', {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            }),
        ];

        // When the hook derives the list
        const {result} = await renderGroupedTransactions(buildParams({sortedTransactions: transactions}));

        // Then the pending-delete row is still listed but is skipped by the carousel and the last-row border logic
        expect(getListItemKeys(result.current.listItems)).toEqual(['1', '2', '3']);
        expect(result.current.visualOrderTransactionIDs).toEqual(['1', '2']);
        expect(result.current.lastTransactionID).toBe('2');
    });

    it('should keep pending-delete transactions as the last row while offline', async () => {
        // Given the last transaction is pending delete and the user is offline, where such rows stay visible
        const transactions = [
            buildTransaction('1'),
            buildTransaction('2', {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            }),
        ];

        // When the hook derives the list
        const {result} = await renderGroupedTransactions(buildParams({sortedTransactions: transactions, isOffline: true}));

        // Then the visible last row is the pending-delete one, but the carousel still skips it
        expect(result.current.lastTransactionID).toBe('2');
        expect(result.current.visualOrderTransactionIDs).toEqual(['1']);
    });

    it('should group by category with a header before each group and the uncategorized group last', async () => {
        // Given transactions spread across two categories plus one without a category
        const transactions = [
            buildTransaction('1', {category: 'Travel'}),
            buildTransaction('2', {category: ''}),
            buildTransaction('3', {category: 'Food'}),
            buildTransaction('4', {category: 'Travel'}),
        ];

        // When the hook groups by category
        const {result} = await renderGroupedTransactions(
            buildParams({
                sortedTransactions: transactions,
                shouldGroupTransactions: true,
            }),
        );

        // Then groups are alphabetical with the empty group last, and the visual order follows the groups
        expect(result.current.groupedTransactions.map((group) => group.groupKey)).toEqual(['Food', 'Travel', '']);
        expect(getListItemKeys(result.current.listItems)).toEqual(['header:Food', '3', 'header:Travel', '1', '4', 'header:', '2']);
        expect(result.current.visualOrderTransactionIDs).toEqual(['3', '1', '4', '2']);
        expect(result.current.lastTransactionID).toBe('2');
    });

    it('should group by tag when the group-by mode is tag', async () => {
        // Given transactions with different tags
        const transactions = [buildTransaction('1', {tag: 'Beta'}), buildTransaction('2', {tag: 'Alpha'})];

        // When the hook groups by tag
        const {result} = await renderGroupedTransactions(
            buildParams({
                sortedTransactions: transactions,
                shouldGroupTransactions: true,
                currentGroupBy: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
            }),
        );

        // Then the groups are keyed by tag
        expect(result.current.groupedTransactions.map((group) => group.groupKey)).toEqual(['Alpha', 'Beta']);
        expect(getListItemKeys(result.current.listItems)).toEqual(['header:Alpha', '2', 'header:Beta', '1']);
        expect(result.current.visualOrderTransactionIDs).toEqual(['2', '1']);
    });

    it('should exclude pending-delete transactions from the grouped visual order', async () => {
        // Given a grouped list where one transaction is pending delete
        const transactions = [
            buildTransaction('1', {category: 'Food'}),
            buildTransaction('2', {
                category: 'Food',
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            }),
        ];

        // When the hook groups by category while online
        const {result} = await renderGroupedTransactions(
            buildParams({
                sortedTransactions: transactions,
                shouldGroupTransactions: true,
            }),
        );

        // Then the pending-delete row stays in the list but not in the carousel order or the last-row logic
        expect(getListItemKeys(result.current.listItems)).toEqual(['header:Food', '1', '2']);
        expect(result.current.visualOrderTransactionIDs).toEqual(['1']);
        expect(result.current.lastTransactionID).toBe('1');
    });

    it('should fall back to the sorted order when grouping is on but yields no groups', async () => {
        // Given grouping is on but there are no resolved transactions to group yet
        const sortedTransactions = [buildTransaction('1'), buildTransaction('2')];

        // When the hook derives the list
        const {result} = await renderGroupedTransactions(
            buildParams({
                sortedTransactions,
                resolvedTransactions: [],
                shouldGroupTransactions: true,
            }),
        );

        // Then the carousel order falls back to the sorted transactions and nothing is listed
        expect(result.current.groupedTransactions).toEqual([]);
        expect(result.current.listItems).toEqual([]);
        expect(result.current.visualOrderTransactionIDs).toEqual(['1', '2']);
        expect(result.current.lastTransactionID).toBeUndefined();
    });
});
