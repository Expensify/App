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
const mockGetFocusedReportId = jest.fn<string | undefined, []>();

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
jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    setActiveTransactionIDs: jest.fn(() => Promise.resolve()),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getFocusedReportId: () => mockGetFocusedReportId(),
    navigationRef: {
        getRootState: jest.fn(() => ({
            routes: [],
        })),
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

        // Then the transaction thread still opens, since the list does not show the expense itself
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('thread-1', undefined, undefined, ''), {forceReplace: false});
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
});
