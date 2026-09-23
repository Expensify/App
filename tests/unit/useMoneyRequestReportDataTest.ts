import {act, renderHook} from '@testing-library/react-native';

import useMoneyRequestReportData from '@components/MoneyRequestReportView/useMoneyRequestReportData';

import {setForceOffline} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, Transaction} from '@src/types/onyx';
import type {ReportTransactionsAndViolationsDerivedValue} from '@src/types/onyx/DerivedValues';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../utils/collections/transaction';
import {getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = 'report1';

/**
 * `REPORT_TRANSACTIONS_AND_VIOLATIONS` is a derived value, so writing it directly is normally wrong. It works here
 * because `initOnyxDerivedValues` is not called, leaving the seeded collection as the one the hook reads — the same
 * seeding `useReportTransactionsCollectionTest` uses.
 */
async function seedTransactions(transactions: Transaction[]) {
    const byID = Object.fromEntries(transactions.map((transaction) => [transaction.transactionID, transaction]));
    const derived: ReportTransactionsAndViolationsDerivedValue = {[REPORT_ID]: {transactions: byID, violations: {}}};
    await Onyx.merge(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, derived);
    await waitForBatchedUpdates();
}

async function renderData(reportActions: ReportAction[]) {
    const {result, rerender} = renderHook((props: {reportActions: ReportAction[]}) => useMoneyRequestReportData(REPORT_ID, props.reportActions), {
        initialProps: {reportActions},
    });
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return {result, rerender};
}

function buildComment(reportActionID: string, overrides: Partial<ReportAction> = {}): ReportAction {
    // `getFakeReportAction` seeds `pendingAction: null`, which the view's `=== undefined` visibility check reads as
    // "has a pending action". Real Onyx data leaves the key absent.
    return getFakeReportAction(Number(reportActionID), {
        reportActionID,
        reportID: REPORT_ID,
        pendingAction: undefined,
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        ...overrides,
    });
}

function buildHiddenReportPreview(reportActionID: string): ReportAction {
    return buildComment(reportActionID, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, shouldShow: false});
}

// `isDeletedParentAction` needs a reply attached as well as the message flag, hence `childVisibleActionCount`.
function buildDeletedMoneyRequestAction(reportActionID: string, transactionID: string): ReportAction {
    return getFakeReportAction(Number(reportActionID), {
        reportActionID,
        reportID: REPORT_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        childVisibleActionCount: 1,
        message: [{html: 'hey', text: 'test', type: 'COMMENT', isDeletedParentAction: true}],
        originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: transactionID, IOUReportID: REPORT_ID, amount: 100, currency: CONST.CURRENCY.USD},
    });
}

function buildTransaction(transactionID: string, overrides: Partial<Transaction> = {}): Transaction {
    // `createRandomTransaction` randomizes `bank` and `status`, which the Expensify Card pending/posted dedup inside
    // `getAllNonDeletedTransactions` keys on. Pin both so no row can drop out at random.
    return {...createRandomTransaction(Number(transactionID)), transactionID, bank: 'SomeOtherBank', status: undefined, ...overrides};
}

function getIDs(actions: ReportAction[]): string[] {
    return actions.map((action) => action.reportActionID);
}

function getTransactionIDs(transactions: Transaction[]): string[] {
    return transactions.map((transaction) => transaction.transactionID);
}

describe('useMoneyRequestReportData', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        setForceOffline(false);
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        // Offline state is module-level in `NetworkState`, so it leaks into every later suite otherwise.
        setForceOffline(false);
    });

    describe('reportActions', () => {
        it('should keep the newest-first order of the paginated chain', async () => {
            // Given three comments fed in newest-first
            const actions = [buildComment('3'), buildComment('2'), buildComment('1')];

            const {result} = await renderData(actions);

            // Then the chain is neither sorted nor reversed
            expect(getIDs(result.current.reportActions)).toEqual(['3', '2', '1']);
            expect(result.current.reportActionIDs).toEqual(['3', '2', '1']);
        });

        it('should drop the actions the report view hides', async () => {
            // Given a hidden report preview and a deleted money-request parent action alongside a comment
            const actions = [buildComment('3'), buildHiddenReportPreview('2'), buildDeletedMoneyRequestAction('1', '1')];

            const {result} = await renderData(actions);

            // Then only the comment survives, and the ID list tracks what survived
            expect(getIDs(result.current.reportActions)).toEqual(['3']);
            expect(result.current.reportActionIDs).toEqual(['3']);
        });

        it('should return a copy rather than an alias of the input chain', async () => {
            // Given a chain with nothing to filter out, where `filter` hands back the same array
            const actions = [buildComment('2'), buildComment('1')];

            const {result} = await renderData(actions);

            // Then the copy is made, so the derivation downstream never looks like a mutation of frozen Onyx data
            expect(result.current.reportActions).not.toBe(actions);
            expect(result.current.reportActions).toEqual(actions);
        });

        it('should not mutate the caller chain', async () => {
            // Given a chain with an action the filter removes
            const actions = [buildComment('2'), buildHiddenReportPreview('1')];
            const before = [...actions];

            const {result} = await renderData(actions);

            // Then the input is untouched
            expect(actions).toEqual(before);
            expect(result.current.reportActions).toHaveLength(1);
        });
    });

    describe('transactions', () => {
        it('should expose every non-deleted transaction when none is pending deletion', async () => {
            // Given two settled expenses
            await seedTransactions([buildTransaction('1'), buildTransaction('2')]);

            const {result} = await renderData([buildComment('1')]);

            // Then both working sets agree and the ID list mirrors them
            expect(getTransactionIDs(result.current.reportTransactions)).toEqual(['1', '2']);
            expect(getTransactionIDs(result.current.transactions)).toEqual(['1', '2']);
            expect(result.current.reportTransactionIDs).toEqual(['1', '2']);
            expect(result.current.hasPendingDeletionTransaction).toBe(false);
        });

        it('should keep a transaction pending deletion out of the working set while online', async () => {
            // Given one expense the user deleted and the delete request has been sent
            await seedTransactions([buildTransaction('1'), buildTransaction('2', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})]);

            const {result} = await renderData([buildComment('1')]);

            // Then `reportTransactions` still holds it while the rendered working set and its IDs drop it
            expect(getTransactionIDs(result.current.reportTransactions)).toEqual(['1', '2']);
            expect(getTransactionIDs(result.current.transactions)).toEqual(['1']);
            expect(result.current.reportTransactionIDs).toEqual(['1']);
        });

        it('should keep a transaction pending deletion in the working set while offline', async () => {
            // Given the same deleted expense, but offline, so the delete never reached the server
            await seedTransactions([buildTransaction('1'), buildTransaction('2', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})]);
            act(() => setForceOffline(true));
            await waitForBatchedUpdates();

            const {result} = await renderData([buildComment('1')]);

            // Then the expense stays visible
            expect(getTransactionIDs(result.current.transactions)).toEqual(['1', '2']);
            expect(result.current.reportTransactionIDs).toEqual(['1', '2']);
        });

        it('should report a pending deletion even though the expense is out of the working set', async () => {
            // Given a deleted expense that the working set filters out while online
            await seedTransactions([buildTransaction('1'), buildTransaction('2', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})]);

            const {result} = await renderData([buildComment('1')]);

            // Then the flag reads the raw collection, so the banner it drives stays up
            expect(result.current.hasPendingDeletionTransaction).toBe(true);
            expect(result.current.transactions).toHaveLength(1);
        });

        it('should report no pending deletion for an empty collection', async () => {
            // Given a report with no transactions
            const {result} = await renderData([buildComment('1')]);

            // Then the empty path reads as settled
            expect(result.current.reportTransactions).toEqual([]);
            expect(result.current.transactions).toEqual([]);
            expect(result.current.reportTransactionIDs).toEqual([]);
            expect(result.current.hasPendingDeletionTransaction).toBe(false);
        });

        it('should return no transactions when the report ID is missing', async () => {
            // Given seeded transactions and a route that has not resolved a report ID
            await seedTransactions([buildTransaction('1')]);

            const {result} = renderHook(() => useMoneyRequestReportData(undefined, [buildComment('1')]));
            await act(async () => {
                await waitForBatchedUpdates();
            });

            // Then the collection lookup is skipped rather than reading every report's expenses
            expect(result.current.transactions).toEqual([]);
            expect(result.current.reportTransactionIDs).toEqual([]);
        });
    });

    describe('memoization', () => {
        it('should keep the derived arrays referentially stable across a re-render with unchanged inputs', async () => {
            // Given the hook rendered with a settled report
            await seedTransactions([buildTransaction('1')]);
            const props = {reportActions: [buildComment('2'), buildComment('1')]};
            const {result, rerender} = await renderData(props.reportActions);
            const first = result.current;

            // When re-rendering with the same action chain and the same Onyx data
            rerender(props);
            await act(async () => {
                await waitForBatchedUpdates();
            });

            // Then every derivation keeps its identity
            expect(result.current.reportActions).toBe(first.reportActions);
            expect(result.current.reportTransactions).toBe(first.reportTransactions);
            expect(result.current.transactions).toBe(first.transactions);
            expect(result.current.reportTransactionIDs).toBe(first.reportTransactionIDs);
            expect(result.current.reportActionIDs).toBe(first.reportActionIDs);
        });

        it('should follow a longer action chain without disturbing the transactions', async () => {
            // Given the hook rendered with two comments and one expense
            await seedTransactions([buildTransaction('1')]);
            const {result, rerender} = await renderData([buildComment('2'), buildComment('1')]);

            // When a newer comment arrives at the head of the chain
            rerender({reportActions: [buildComment('3'), buildComment('2'), buildComment('1')]});
            await act(async () => {
                await waitForBatchedUpdates();
            });

            // Then the action derivations track the new chain and the transaction ones keep the same expense
            expect(getIDs(result.current.reportActions)).toEqual(['3', '2', '1']);
            expect(result.current.reportActionIDs).toEqual(['3', '2', '1']);
            expect(result.current.reportTransactionIDs).toEqual(['1']);
        });

        it('should follow a growing transaction collection without disturbing the actions', async () => {
            // Given the hook rendered with one expense
            await seedTransactions([buildTransaction('1')]);
            const props = {reportActions: [buildComment('1')]};
            const {result, rerender} = await renderData(props.reportActions);

            // When a second expense lands while the action chain is untouched
            rerender(props);
            await seedTransactions([buildTransaction('1'), buildTransaction('2')]);
            await act(async () => {
                await waitForBatchedUpdates();
            });

            // Then the transaction derivations pick it up and the action derivations are unaffected
            expect(result.current.reportTransactionIDs).toEqual(['1', '2']);
            expect(result.current.transactions).toHaveLength(2);
            expect(getIDs(result.current.reportActions)).toEqual(['1']);
            expect(result.current.reportActionIDs).toEqual(['1']);
        });
    });
});
