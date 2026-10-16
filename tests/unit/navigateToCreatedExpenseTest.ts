import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import type isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import navigateToCreatedExpense from '@libs/Navigation/helpers/navigateToCreatedExpense';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockIsReportTopmostSplitNavigator = jest.fn<boolean, []>();
const mockIsSearchTopmostFullScreenRoute = jest.fn<boolean, []>();
const mockIsReportOpenInRHP = jest.fn<ReturnType<typeof isReportOpenInRHP>, Parameters<typeof isReportOpenInRHP>>();
const mockGetIsNarrowLayout = jest.fn<boolean, []>();
const mockGetCurrentRoute = jest.fn<{params?: Record<string, unknown>} | undefined, []>();
const mockGetFocusedReportId = jest.fn<string | undefined, [unknown]>();
const mockGetRootState = jest.fn<unknown, []>(() => ({routes: []}));
const mockGetTopmostReportId = jest.fn<string | undefined, []>();
const mockIsMoneyRequestReport = jest.fn<boolean, [string]>();

function buildTransaction(transactionID: string): Transaction {
    return {transactionID, reportID: 'iou-1', amount: 0, created: '', currency: CONST.CURRENCY.USD, merchant: '', comment: {}};
}

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => () => mockIsReportTopmostSplitNavigator());
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute());
jest.mock('@libs/Navigation/helpers/isReportOpenInRHP', () => (state: Parameters<typeof isReportOpenInRHP>[0]) => mockIsReportOpenInRHP(state));
jest.mock('@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue', () => (callback: () => void) => {
    callback();
});
jest.mock('@libs/getIsNarrowLayout', () => () => mockGetIsNarrowLayout());
jest.mock('@libs/ReportUtils', () => ({
    isMoneyRequestReport: (reportID: string) => mockIsMoneyRequestReport(reportID),
}));
jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: jest.fn(() => Promise.resolve()),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getFocusedReportId: (state: unknown) => mockGetFocusedReportId(state),
    getTopmostReportId: () => mockGetTopmostReportId(),
    navigationRef: {
        getRootState: () => mockGetRootState(),
        current: {
            getCurrentRoute: () => mockGetCurrentRoute(),
        },
    },
}));

jest.mock('@react-navigation/native');

describe('navigateToCreatedExpense', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockIsReportOpenInRHP.mockReturnValue(false);
        mockGetCurrentRoute.mockReturnValue(undefined);
        mockGetFocusedReportId.mockReturnValue(undefined);
        mockGetRootState.mockReturnValue({routes: []});
        mockGetTopmostReportId.mockReturnValue(undefined);
        mockIsMoneyRequestReport.mockReturnValue(false);
    });

    it('should do nothing when the user already has the transaction thread open', async () => {
        // Given the user opened the expense themselves before pressing "View"
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('thread-1');

        // When they press "View"
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: 'iou-1', reportTransactions: []});
        await waitForBatchedUpdates();

        // Then no navigation happens, so the report is not pushed a second time
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should do nothing when the user already has the collapsed expense report open', async () => {
        // Given the user opened the single-transaction expense report, which renders the thread itself
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('iou-1');

        // When they press "View"
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: 'iou-1', reportTransactions: [buildTransaction('txn-1')]});
        await waitForBatchedUpdates();

        // Then no navigation happens, so the same expense is not opened a second time
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should still navigate when the focused expense report lists several transactions', async () => {
        // Given the user is on an expense report holding more than one expense, so it shows a list rather than the thread
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('iou-1');

        // When they press "View"
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then the transaction thread opens on top of the report already open, since the list does not show the expense itself
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: ''}), {forceReplace: false});
    });

    it('should open the expense report then the thread RHP with the prev/next arrows on a narrow layout when the report has multiple transactions', async () => {
        // Given the user is on a chat in the Inbox tab on a narrow layout, and the report holds several expenses
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('chat-1');

        // When they press "View"
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then the thread opens in the RHP on top of its report, the same as opening it from the report preview
        const reportRoute = ROUTES.REPORT_WITH_ID.getRoute('iou-1', undefined, undefined, '');
        expect(setActiveTransactionIDs).toHaveBeenCalledWith(['txn-1', 'txn-2']);
        expect(Navigation.navigate).toHaveBeenCalledTimes(2);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, reportRoute, {forceReplace: false});
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: reportRoute}));
    });

    it('should replace the open RHP with the thread on a narrow layout when the expense report is under it', async () => {
        // Given another expense of the same report is open in the RHP, on top of the full screen expense report
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('other-thread');
        mockGetTopmostReportId.mockReturnValue('iou-1');
        mockGetCurrentRoute.mockReturnValue({params: {backTo: 'r/iou-1'}});

        // When the user presses "View"
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then the thread replaces the open RHP, so going back lands on the expense report under it
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: 'r/iou-1'}), {forceReplace: true});
    });

    it('should close the open RHP before opening the expense report and thread on a narrow layout when the RHP is over another report', async () => {
        // Given an expense of a different report is open in the RHP, on top of that other report
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('other-thread');
        mockGetTopmostReportId.mockReturnValue('other-iou');

        // When the user presses "View"
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then the RHP closes first, since a full screen report would be pushed above it instead of replacing it
        expect(Navigation.navigate).not.toHaveBeenCalled();
        const afterTransition = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0)?.afterTransition;
        afterTransition?.();

        // And then the expense report opens with the thread on top of it
        const reportRoute = ROUTES.REPORT_WITH_ID.getRoute('iou-1', undefined, undefined, '');
        expect(setActiveTransactionIDs).toHaveBeenCalledWith(['txn-1', 'txn-2']);
        expect(Navigation.navigate).toHaveBeenCalledTimes(2);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, reportRoute, {forceReplace: false});
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: reportRoute}));
    });

    it('should replace another expense report open under the RHP instead of stacking on it on a narrow layout', async () => {
        // Given an expense of another expense report is open in the RHP, on top of that report opened from its chat
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('other-thread');
        mockGetTopmostReportId.mockReturnValue('other-iou');
        mockIsMoneyRequestReport.mockImplementation((reportID) => reportID === 'other-iou');

        // When the user presses "View" and the RHP has closed, leaving the other expense report on top
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();
        mockGetCurrentRoute.mockReturnValue({params: {backTo: 'r/chat-1'}});
        jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0)?.afterTransition?.();

        // Then the new expense report replaces the other one and takes over its backTo, so going back skips it
        const reportRoute = ROUTES.REPORT_WITH_ID.getRoute('iou-1', undefined, undefined, 'r/chat-1');
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, reportRoute, {forceReplace: true});
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: reportRoute}));
    });

    it('should fall back to the expense report as the thread backTo when the replaced RHP had none', async () => {
        // Given an expense of the same report is open in the RHP without a backTo, on top of the full screen expense report
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('other-thread');
        mockGetTopmostReportId.mockReturnValue('iou-1');
        mockGetCurrentRoute.mockReturnValue({params: {}});

        // When the user presses "View"
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then the thread still points back at its expense report, so a reload keeps the user in the Inbox
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: ROUTES.REPORT_WITH_ID.getRoute('iou-1')}), {forceReplace: true});
    });

    it('should close the RHP showing the expense report itself before stacking the thread on a narrow layout', async () => {
        // Given the expense report itself is open in the RHP, on top of a chat
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('iou-1');
        mockGetTopmostReportId.mockReturnValue('chat-1');

        // When the user presses "View"
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then the RHP closes instead of being replaced by the thread, so going back still lands on the expense report
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
    });

    it('should still navigate when the focused report is a different one', async () => {
        // Given the user is viewing some other report
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockGetFocusedReportId.mockReturnValue('some-other-report');

        // When they press "View"
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: 'iou-1', reportTransactions: []});
        await waitForBatchedUpdates();

        // Then the transaction thread still opens
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('thread-1', undefined, undefined, ''), {forceReplace: false});
    });

    it('should open the transaction thread in the Spend RHP when the user is on the Spend tab', async () => {
        // Given the user is on the Spend tab
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

        // When they open a newly-created expense
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: 'iou-1', reportTransactions: []});
        await waitForBatchedUpdates();

        // Then the transaction thread opens in the Spend RHP
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: ''}), {forceReplace: false});
    });

    it('should replace the currently-open report instead of stacking when one is already open in the RHP', async () => {
        // Given a report is already open in the RHP
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);

        // When the user opens a newly-created expense
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: 'iou-1', reportTransactions: []});
        await waitForBatchedUpdates();

        // Then the open report is replaced rather than stacked on
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: ''}), {forceReplace: true});
    });

    it('should open the transaction thread as a full report when the user is on the Inbox tab on a narrow layout', () => {
        // Given the user is on the Inbox tab on a narrow layout
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(true);

        // When they open a newly-created expense
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: 'iou-1', reportTransactions: []});

        // Then the transaction thread opens as a full report
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('thread-1', undefined, undefined, ''), {forceReplace: false});
    });

    it('should open the expense report then stack the thread RHP when the user is on the Inbox tab on a wide layout and the report has multiple transactions', async () => {
        // Given the user is on the Inbox tab on a wide layout and the expense report holds several transactions
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(false);
        // When they open a newly-created expense
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then the expense report opens with the thread RHP stacked on top of it
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: 'iou-1', backTo: ''}), {forceReplace: false});
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: ''}));
    });

    it('should seed every non-deleted expense on the report so the thread shows the prev/next arrows', async () => {
        // Given the user is on the Inbox tab on a wide layout and the expense report holds several transactions, one pending delete
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(false);
        const deletedTransaction = {...buildTransaction('txn-3'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        // When they press "View"
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2'), deletedTransaction],
        });
        await waitForBatchedUpdates();

        // Then the arrows cover the report's other expenses, but skip the one being deleted
        expect(setActiveTransactionIDs).toHaveBeenCalledWith(['txn-1', 'txn-2']);
    });

    it('should seed the expenses oldest first rather than in creation order', async () => {
        // Given the expenses were created in a different order than their dates
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(false);
        const octoberExpense = {...buildTransaction('txn-oct'), created: '2026-10-01'};
        const septemberExpense = {...buildTransaction('txn-sep'), created: '2026-09-15'};
        const newExpense = {...buildTransaction('txn-new'), created: '2026-09-20'};

        // When the user presses "View" on the newest expense
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-new',
            iouReportID: 'iou-1',
            reportTransactions: [octoberExpense, septemberExpense, newExpense],
        });
        await waitForBatchedUpdates();

        // Then the arrows follow the dates, so "Next" from the new expense opens the October one
        expect(setActiveTransactionIDs).toHaveBeenCalledWith(['txn-sep', 'txn-new', 'txn-oct']);
    });

    it('should open the expense report without the replaced RHP backTo, so deleting the report falls back to its chat', async () => {
        // Given the user is on the Inbox tab on a wide layout with another report already open in the RHP
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockIsReportOpenInRHP.mockReturnValue(true);
        mockGetCurrentRoute.mockReturnValue({params: {backTo: '/home'}});

        // When they open a newly-created expense
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then the expense report opens with no backTo instead of inheriting the replaced RHP's origin
        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: 'iou-1'}), {forceReplace: true});
    });

    it('should open the expense report when the user is on the Inbox tab on a wide layout and the report has a single transaction', () => {
        // Given the user is on the Inbox tab on a wide layout and the expense report holds one transaction
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(false);
        // When they open a newly-created expense
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: 'iou-1', reportTransactions: [buildTransaction('txn-1')]});

        // Then only the expense report opens, since it collapses to the thread itself
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: 'iou-1', backTo: ''}), {forceReplace: false});
    });

    it('should open the transaction thread as a full report when there is no expense report (tracked/unreported self-DM expense) on the Inbox tab', () => {
        // Given the user is on the Inbox tab on a wide layout
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(false);

        // When they open a newly-created tracked expense, which has no expense report
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: undefined, reportTransactions: []});

        // Then the thread opens as a full report, matching how tapping it in its self-DM chat does
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('thread-1', undefined, undefined, ''), {forceReplace: false});
    });

    it('should open the transaction thread in the Spend RHP for a tracked/unreported expense when the user is on the Spend tab', async () => {
        // Given the user is on the Spend tab
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

        // When they open a newly-created tracked expense, which has no expense report
        navigateToCreatedExpense({threadReportID: 'thread-1', transactionID: 'txn-1', iouReportID: undefined, reportTransactions: []});
        await waitForBatchedUpdates();

        // Then the transaction thread still opens in the Spend RHP
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: 'thread-1', backTo: ''}), {forceReplace: false});
    });

    it('should do nothing when the transaction thread is open in an RHP the navigation state has not synced yet', async () => {
        // Given the thread was just opened in the RHP, so only the root state shows it as focused
        const rootState = {routes: [{name: 'RightModalNavigator'}]};
        mockGetRootState.mockReturnValue(rootState);
        mockGetFocusedReportId.mockImplementation((state) => (state === rootState ? 'thread-1' : 'iou-1'));
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockIsReportOpenInRHP.mockReturnValue(true);

        // When the user presses "View"
        navigateToCreatedExpense({
            threadReportID: 'thread-1',
            transactionID: 'txn-1',
            iouReportID: 'iou-1',
            reportTransactions: [buildTransaction('txn-1'), buildTransaction('txn-2')],
        });
        await waitForBatchedUpdates();

        // Then nothing happens, since the user is already looking at the thread
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
