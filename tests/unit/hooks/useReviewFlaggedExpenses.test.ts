import {act, renderHook} from '@testing-library/react-native';

import useReviewFlaggedExpenses from '@pages/home/ForYouSection/useReviewFlaggedExpenses';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type * as ReactNavigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import {createMockReport} from '../../utils/ReportTestUtils';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockNavigateToTransactionThread = jest.fn();
jest.mock('@hooks/useNavigateToTransactionThread', () => jest.fn(() => mockNavigateToTransactionThread));

const mockNavigate = jest.fn<void, [string]>();
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: (route: string) => mockNavigate(route)}}));

const mockSetActiveTransactionIDs = jest.fn<Promise<void>, [string[], {source?: string} | undefined]>(() => Promise.resolve());
jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: (ids: string[], options?: {source?: string}) => mockSetActiveTransactionIDs(ids, options),
    CAROUSEL_SOURCE: {homeReviewFlagged: 'home:reviewFlagged'},
}));

// The hook gates its O(n) scan on useIsFocused(). Mock it with a toggleable flag so tests can exercise the
// focused (live scan) and blurred (scan skipped, last count retained) paths.
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => mockIsFocused,
    };
});

const ACCOUNT_ID = 1;

/**
 * Seeds the Onyx collections the hook scans so each provided transaction surfaces as a flagged expense:
 * an OPEN/OPEN expense report owned by the current user, a transaction on it, and a MISSING_CATEGORY violation.
 */
async function seedFlaggedExpenses(...expenses: Array<{transactionID: string; reportID: string}>) {
    await Promise.all(
        expenses.flatMap(({transactionID, reportID}) => [
            Onyx.set(
                `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                createMockReport({
                    reportID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    ownerAccountID: ACCOUNT_ID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                }),
            ),
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {transactionID, reportID, amount: 100, currency: 'USD', created: '2024-01-01', merchant: 'Test Merchant'}),
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}]),
        ]),
    );
}

describe('useReviewFlaggedExpenses', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsFocused = true;
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID, email: 'test@example.com'});
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('returns count 0 and a no-op handler when nothing is flagged', async () => {
        const {result} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();

        expect(result.current.count).toBe(0);

        act(() => {
            result.current.reviewExpenses();
        });

        expect(mockNavigateToTransactionThread).not.toHaveBeenCalled();
    });

    it('returns the aggregated count across multiple flagged expenses', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'}, {transactionID: 't2', reportID: 'r2'}, {transactionID: 't3', reportID: 'r3'});
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();

        expect(result.current.count).toBe(3);
    });

    it('navigates to the first flagged expense thread with every flagged transaction ID as siblings', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'}, {transactionID: 't2', reportID: 'r2'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}r1`, {
                action1: {
                    reportActionID: 'action1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    childReportID: 'thread-r1',
                    message: {IOUTransactionID: 't1'},
                },
            });
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();

        expect(result.current.count).toBe(2);

        act(() => {
            result.current.reviewExpenses();
        });

        expect(mockNavigateToTransactionThread).toHaveBeenCalledTimes(1);
        expect(mockNavigateToTransactionThread).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionID: 't1',
                report: expect.objectContaining({reportID: 'r1'}),
                transaction: expect.objectContaining({transactionID: 't1'}),
                reportActions: expect.arrayContaining([expect.objectContaining({reportActionID: 'action1', childReportID: 'thread-r1'})]),
                siblingTransactionIDs: ['t1', 't2'],
                backTo: ROUTES.HOME,
            }),
        );
    });

    it('opens the flagged transaction thread when a lone flagged expense sits inside a multi-transaction report', async () => {
        // A single OPEN expense report holding two transactions, but only one is flagged. The report's
        // transactionCount is 2, so the "open the report directly" shortcut (reserved for one-transaction
        // reports) must NOT apply — pressing the row should open the flagged expense's thread instead.
        await act(async () => {
            await Onyx.set(
                `${ONYXKEYS.COLLECTION.REPORT}r1`,
                createMockReport({
                    reportID: 'r1',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    ownerAccountID: ACCOUNT_ID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    transactionCount: 2,
                }),
            );
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}t1`, {transactionID: 't1', reportID: 'r1', amount: 100, currency: 'USD', created: '2024-01-01', merchant: 'Test Merchant'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}t2`, {transactionID: 't2', reportID: 'r1', amount: 200, currency: 'USD', created: '2024-01-01', merchant: 'Test Merchant'});
            // Only t1 is flagged; t2 has no violations.
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}t1`, [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}]);
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();

        expect(result.current.count).toBe(1);

        act(() => {
            result.current.reviewExpenses();
        });

        expect(mockNavigateToTransactionThread).toHaveBeenCalledTimes(1);
        expect(mockNavigateToTransactionThread).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionID: 't1',
                report: expect.objectContaining({reportID: 'r1'}),
                siblingTransactionIDs: ['t1'],
                backTo: ROUTES.HOME,
            }),
        );
    });

    /**
     * Regression guard for https://github.com/Expensify/App/issues/99621: the prev/next carousel opens a
     * one-transaction report directly rather than its (redundant) transaction thread. This entry point has to agree,
     * or stepping forward and back drops the user on the report when they started on the thread.
     */
    it('opens the report and seeds the carousel when the flagged expenses sit in one-transaction reports', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'}, {transactionID: 't2', reportID: 'r2'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}r1`, {transactionCount: 1});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}r2`, {transactionCount: 1});
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();

        expect(result.current.count).toBe(2);

        await act(async () => {
            result.current.reviewExpenses();
            await waitForBatchedUpdatesWithAct();
        });

        expect(mockNavigateToTransactionThread).not.toHaveBeenCalled();
        expect(mockSetActiveTransactionIDs).toHaveBeenCalledWith(['t1', 't2'], {source: 'home:reviewFlagged'});
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate.mock.calls.at(0)?.at(0)).toContain('r1');
    });

    it('does not seed a carousel for a lone flagged expense in a one-transaction report', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}r1`, {transactionCount: 1});
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            result.current.reviewExpenses();
            await waitForBatchedUpdatesWithAct();
        });

        expect(mockSetActiveTransactionIDs).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('updates the count live while the Home tab stays focused', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();
        expect(result.current.count).toBe(1);

        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't2', reportID: 'r2'});
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current.count).toBe(2);
    });

    it('skips the scan and reports count 0 while the Home tab is blurred before any focused scan', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
        });
        await waitForBatchedUpdatesWithAct();

        mockIsFocused = false;
        const {result} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();

        expect(result.current.count).toBe(0);

        act(() => {
            result.current.reviewExpenses();
        });

        expect(mockNavigateToTransactionThread).not.toHaveBeenCalled();
    });

    it('retains the last focused count after the Home tab is blurred', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'}, {transactionID: 't2', reportID: 'r2'});
        });
        await waitForBatchedUpdatesWithAct();

        const {result, rerender} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();
        expect(result.current.count).toBe(2);

        // Blurring keeps the last computed count instead of flashing back to 0.
        mockIsFocused = false;
        rerender({});
        await waitForBatchedUpdatesWithAct();
        expect(result.current.count).toBe(2);
    });

    it('ignores changes while blurred and recomputes once the Home tab is refocused', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
        });
        await waitForBatchedUpdatesWithAct();

        const {result, rerender} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();
        expect(result.current.count).toBe(1);

        // A new flagged expense arrives while blurred: the scan is skipped, so the count stays cached.
        mockIsFocused = false;
        rerender({});
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't2', reportID: 'r2'});
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current.count).toBe(1);

        // Refocusing re-runs the scan and the count catches up.
        mockIsFocused = true;
        rerender({});
        await waitForBatchedUpdatesWithAct();
        expect(result.current.count).toBe(2);
    });

    it('keeps reviewExpenses referentially stable across background Onyx writes while blurred', async () => {
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
        });
        await waitForBatchedUpdatesWithAct();

        mockIsFocused = false;
        const {result, rerender} = renderHook(() => useReviewFlaggedExpenses());
        await waitForBatchedUpdatesWithAct();
        const blurredHandler = result.current.reviewExpenses;

        // A background write churns the live collection subscriptions, but the blurred handler must not change identity.
        await act(async () => {
            await seedFlaggedExpenses({transactionID: 't2', reportID: 'r2'});
        });
        await waitForBatchedUpdatesWithAct();
        rerender({});
        expect(result.current.reviewExpenses).toBe(blurredHandler);
    });
});
