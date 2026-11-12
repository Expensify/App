import {act, render, renderHook, screen} from '@testing-library/react-native';

import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';

import {useIsAppLoadPending, useIsReportLoadPending} from '@hooks/useInFlightRequests';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import {WRITE_COMMANDS} from '@libs/API/types';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import ReportActionsListBody from '@pages/inbox/report/ReportActionsList';
import UserTypingEventListener from '@pages/inbox/report/UserTypingEventListener';
import ReportActions from '@pages/inbox/ReportActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type {OnyxKey, OnyxValue} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '123';
const OTHER_REPORT_ID = '456';

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: jest.fn(() => ({params: {reportID: REPORT_ID}})),
    };
});

jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/usePaginatedReportActions', () => jest.fn());
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn());

// Keep the routing, transaction filtering and loading predicates real. Only the expensive leaf
// lists are mocked so assertions describe which surface the user receives.
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportActionsList', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportActionsList', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/UserTypingEventListener', () => jest.fn(() => null));
jest.mock('@libs/telemetry/markOpenReportEnd', () => jest.fn());

const mockUseNetwork = jest.mocked(useNetwork);
const mockUseOnyx = jest.mocked(useOnyx);
const mockUseRoute = jest.mocked(useRoute);
const mockUsePaginatedReportActions = jest.mocked(usePaginatedReportActions);
const mockUseReportTransactionsCollection = jest.mocked(useReportTransactionsCollection);
const mockMoneyRequestList = jest.mocked(MoneyRequestReportActionsList);
const mockReportActionsListBody = jest.mocked(ReportActionsListBody);
const mockUserTypingEventListener = jest.mocked(UserTypingEventListener);
const mockMarkOpenReportEnd = jest.mocked(markOpenReportEnd);

const defaultPaginatedReportActionsResult: ReturnType<typeof usePaginatedReportActions> = {
    windowActions: [],
    linkedAction: undefined,
    oldestUnreadReportAction: undefined,
    cachedActions: undefined,
    hasNewerActions: false,
    hasOlderActions: false,
    report: undefined,
};

const mockReport: OnyxTypes.Report = {
    reportID: REPORT_ID,
    reportName: 'Test report',
    type: CONST.REPORT.TYPE.CHAT,
    chatReportID: OTHER_REPORT_ID,
    ownerAccountID: 123,
    lastVisibleActionCreated: '2023-01-01',
    total: 0,
};

const moneyReportTypes = [CONST.REPORT.TYPE.EXPENSE, CONST.REPORT.TYPE.IOU, CONST.REPORT.TYPE.INVOICE];

type ReportLoadingStateOverrides = Partial<OnyxTypes.ReportLoadingState>;

function setupUseOnyx(
    options: {
        report?: OnyxTypes.Report | undefined;
        isLoadingApp?: boolean;
        isReportLoadPending?: boolean;
        loadingState?: ReportLoadingStateOverrides;
        conciergeReportID?: string;
    } = {},
) {
    const report = 'report' in options ? options.report : mockReport;
    const requests: OnyxTypes.AnyRequest[] = [];
    if (options.isLoadingApp) {
        requests.push({command: WRITE_COMMANDS.OPEN_APP});
    }
    if (options.isReportLoadPending) {
        requests.push({command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: report?.reportID ?? REPORT_ID}});
    }

    const values: Partial<Record<string, OnyxValue<OnyxKey>>> = {
        [ONYXKEYS.IS_LOADING_APP]: options.isLoadingApp ?? false,
        [ONYXKEYS.PERSISTED_REQUESTS]: requests,
        [ONYXKEYS.CONCIERGE_REPORT_ID]: options.conciergeReportID,
        [`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${report?.reportID ?? REPORT_ID}`]: {
            isLoadingInitialReportActions: false,
            hasOnceLoadedReportActions: true,
            ...options.loadingState,
        },
        [`${ONYXKEYS.COLLECTION.REPORT}${report?.reportID ?? REPORT_ID}`]: report,
    };

    mockUseOnyx.mockImplementation((key, onyxOptions) => {
        // Each key has its own value type; the generic hook mock also has to support selectors
        // used by the real in-flight request hooks instead of returning a shared loading boolean.
        const value = values[key];
        const selectedValue = onyxOptions?.selector ? onyxOptions.selector(value) : value;
        return [selectedValue ?? undefined, {status: 'loaded'}];
    });
}

function createTransactions(count: number, reportID = REPORT_ID): OnyxTypes.Transaction[] {
    return Array.from({length: count}, (_, index) => ({
        transactionID: `${index + 1}`,
        reportID,
        amount: 100,
        currency: 'USD',
        created: '2023-01-01',
        merchant: 'Test merchant',
    }));
}

function setupTransactions(transactions: OnyxTypes.Transaction[], reportActions: OnyxTypes.ReportAction[] = []) {
    mockUseReportTransactionsCollection.mockReturnValue(
        Object.fromEntries(transactions.map((transaction) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction])),
    );
    mockUsePaginatedReportActions.mockReturnValue({...defaultPaginatedReportActionsResult, windowActions: reportActions});
}

function restoreReportDataHooks() {
    mockUseOnyx.mockImplementation(jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx').default);
    mockUsePaginatedReportActions.mockImplementation(jest.requireActual<{default: typeof usePaginatedReportActions}>('@hooks/usePaginatedReportActions').default);
    mockUseReportTransactionsCollection.mockImplementation(jest.requireActual<{default: typeof useReportTransactionsCollection}>('@hooks/useReportTransactionsCollection').default);
    mockReportActionsListBody.mockImplementation(({reportID}) => <View testID={`chat-report-${reportID}`} />);
    mockMoneyRequestList.mockImplementation(() => <View testID="money-report-table" />);
}

async function seedReportTransactions(reportID: string, transactions: OnyxTypes.Transaction[]) {
    // Derived values are not registered in this suite, so seed the real key the transaction hook
    // subscribes to without bringing the application's full derived-value initialization into these tests.
    await act(async () => {
        await Onyx.merge(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, {
            [reportID]: {transactions: Object.fromEntries(transactions.map((transaction) => [transaction.transactionID, transaction])), violations: {}},
        });
        await waitForBatchedUpdates();
    });
}

function createMoneyRequestAction(transaction: OnyxTypes.Transaction): OnyxTypes.ReportAction {
    return {
        reportActionID: `${transaction.reportID}-${transaction.transactionID}`,
        reportID: transaction.reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: mockReport.ownerAccountID,
        created: transaction.created,
        message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: transaction.transactionID, html: 'Created an expense', text: 'Created an expense'},
    };
}

describe('ReportActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRoute.mockReturnValue({key: 'report-route', name: 'Report', params: {reportID: REPORT_ID}});
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUsePaginatedReportActions.mockReturnValue(defaultPaginatedReportActionsResult);
        mockUseReportTransactionsCollection.mockReturnValue({});
        mockReportActionsListBody.mockImplementation(() => <View />);
        mockMoneyRequestList.mockImplementation(() => <View />);
        setupUseOnyx();
    });

    afterEach(async () => {
        // The request hooks retain observed requests for deferred Onyx flushes. Clear that session
        // state through the real hooks so a prior pending request cannot affect the next test.
        setupUseOnyx();
        const {unmount} = renderHook(() => {
            useIsAppLoadPending();
            useIsReportLoadPending(REPORT_ID);
            useIsReportLoadPending(OTHER_REPORT_ID);
        });
        unmount();
        await waitForBatchedUpdatesWithAct();
        await Onyx.clear();
    });

    it('renders a skeleton when the report is not available yet', () => {
        // Given the route exists before its report arrives from Onyx.
        setupUseOnyx({report: undefined});

        // When the report surface mounts before its data is available.
        render(<ReportActions />);

        // Then neither list can mount with a missing report.
        expect(screen.getByTestId('ReportActionsSkeletonCover')).toBeTruthy();
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
    });

    it.each(moneyReportTypes)('chooses the %s layout from the real transaction count', (type) => {
        // Given an empty money report whose initial data has already loaded.
        setupUseOnyx({report: {...mockReport, type}});
        const {rerender} = render(<ReportActions />);

        // When no transactions exist, the empty table is still the correct money surface.
        // Then no chat body or typing listener should be mounted.
        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockUserTypingEventListener).not.toHaveBeenCalled();

        // When a single expense arrives, it uses the chat surface instead of a one-row table.
        jest.clearAllMocks();
        setupTransactions(createTransactions(1));
        setupUseOnyx({report: {...mockReport, type}});
        rerender(<ReportActions />);

        // Then the shared body and typing listener receive the current report.
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
        expect(mockReportActionsListBody.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({reportID: REPORT_ID}));
        expect(mockUserTypingEventListener.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({report: expect.objectContaining({type})}));

        // When another expense arrives on the same route, the table must replace the chat surface.
        jest.clearAllMocks();
        setupTransactions(createTransactions(2));
        setupUseOnyx({report: {...mockReport, type}});
        rerender(<ReportActions />);

        // Then the transaction count, not a mocked layout predicate, selects the table.
        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockUserTypingEventListener).not.toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
    });

    it.each(moneyReportTypes)('waits for missing %s transactions while online', (type) => {
        // Given the report total proves that an empty local collection is incomplete.
        setupUseOnyx({report: {...mockReport, type, total: -100}});

        // When the report mounts before its transactions are delivered.
        render(<ReportActions />);

        // Then a loading skeleton prevents briefly showing the wrong layout.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
    });

    it.each(moneyReportTypes)('waits for the first pending %s report load even with a zero total', (type) => {
        // Given OpenReport is queued and the report has never loaded its actions.
        setupUseOnyx({report: {...mockReport, type}, isReportLoadPending: true, loadingState: {hasOnceLoadedReportActions: false}});

        // When the real request selectors scope the load to this report.
        render(<ReportActions />);

        // Then a zero total cannot prematurely reveal an empty table.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
    });

    it('does not treat a stored loading flag as an active report request', () => {
        // Given a loaded, empty expense report has a stale initial-actions flag but no queued request.
        setupUseOnyx({report: {...mockReport, type: CONST.REPORT.TYPE.EXPENSE}, loadingState: {isLoadingInitialReportActions: true, hasOnceLoadedReportActions: false}});

        // When the route mounts after a restart.
        render(<ReportActions />);

        // Then stale metadata cannot keep the report on a skeleton forever.
        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
    });

    it('shows a loaded empty report during a later pending report refresh', () => {
        // Given the report has loaded before, so an empty collection is meaningful during refresh.
        setupUseOnyx({report: {...mockReport, type: CONST.REPORT.TYPE.EXPENSE}, isReportLoadPending: true});

        // When a subsequent OpenReport request is still queued.
        render(<ReportActions />);

        // Then refreshing does not replace the empty table with a skeleton.
        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
    });

    it.each(moneyReportTypes)('shows cached empty %s reports offline instead of waiting for transactions', (type) => {
        // Given incomplete data cannot be fetched until the device reconnects.
        mockUseNetwork.mockReturnValue({isOffline: true});
        setupUseOnyx({report: {...mockReport, type, total: -100}, isReportLoadPending: true, loadingState: {hasOnceLoadedReportActions: false}});

        // When the offline report mounts with no cached transactions.
        render(<ReportActions />);

        // Then the user receives the money surface rather than a permanent loader.
        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
    });

    it('does not wait for transactions in an optimistically created report', () => {
        // Given creation is queued locally and transactions have not reached the report collection.
        setupUseOnyx({report: {...mockReport, type: CONST.REPORT.TYPE.EXPENSE, total: -100, pendingFields: {createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}}});

        // When the optimistic report opens before its server response.
        render(<ReportActions />);

        // Then the optimistic report remains usable without a transaction wait.
        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
    });

    it.each([false, true])('keeps pending transaction deletions in the layout count (offline: %s)', (isOffline) => {
        // Given a deleting expense must remain visible beside the surviving expense until deletion resolves.
        const [first, second] = createTransactions(2);
        setupTransactions([{...first, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}, second]);
        mockUseNetwork.mockReturnValue({isOffline});
        setupUseOnyx({report: {...mockReport, type: CONST.REPORT.TYPE.EXPENSE}});

        // When transaction filtering runs with a pending deletion.
        render(<ReportActions />);

        // Then the pending row still requires the table rather than the single-expense fallback.
        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
    });

    it.each([false, true])('filters deleted action transactions according to connectivity (offline: %s)', (isOffline) => {
        // Given two transactions, one whose action is blanked while its deletion is queued.
        const transactions = createTransactions(2);
        const deletedAction: OnyxTypes.ReportAction = {
            reportActionID: 'deleted-action',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            created: '2023-01-01',
            actorAccountID: 123,
            message: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: transactions[0].transactionID, html: '', text: ''},
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        };
        setupTransactions(transactions, [deletedAction]);
        mockUseNetwork.mockReturnValue({isOffline});
        setupUseOnyx({report: {...mockReport, type: CONST.REPORT.TYPE.EXPENSE}});

        // When the real filter applies the online or offline deletion rules.
        render(<ReportActions />);

        // Then offline retains the pending row, while online falls back to the single remaining expense.
        expect(mockMoneyRequestList.mock.calls.length > 0).toBe(isOffline);
        expect(mockReportActionsListBody.mock.calls.length > 0).toBe(!isOffline);
    });

    it('renders the chat list body and typing listener for an ordinary chat', () => {
        // Given an ordinary chat has no money transactions.
        setupUseOnyx();

        // When its route mounts.
        render(<ReportActions />);

        // Then the shared chat surface receives the report rather than a table.
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
        expect(mockReportActionsListBody.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({reportID: REPORT_ID}));
        expect(mockUserTypingEventListener.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({report: mockReport}));
    });

    it('does not subscribe ordinary chats to money pagination or transaction collections', () => {
        // Given stale money data must not make an ordinary chat depend on money hooks.
        setupUseOnyx();
        setupTransactions(createTransactions(2));

        // When the real route chooses its ordinary chat boundary.
        render(<ReportActions />);

        // Then money-only hook work is absent, not merely ignored after it runs.
        expect(mockReportActionsListBody).toHaveBeenCalled();
        expect(mockUsePaginatedReportActions).not.toHaveBeenCalled();
        expect(mockUseReportTransactionsCollection).not.toHaveBeenCalled();
    });

    it('does not subscribe to money data before the report exists', () => {
        // Given the route cannot classify a report that has not arrived yet.
        setupUseOnyx({report: undefined});

        // When it displays the missing-report loader.
        render(<ReportActions />);

        // Then no money boundary or its subscriptions may mount speculatively.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockUsePaginatedReportActions).not.toHaveBeenCalled();
        expect(mockUseReportTransactionsCollection).not.toHaveBeenCalled();
    });

    it('does not wait for money data during an ordinary chat report load', () => {
        // Given an ordinary chat has an initial OpenReport request and a nonzero stored total.
        setupUseOnyx({report: {...mockReport, total: -100}, isReportLoadPending: true, loadingState: {hasOnceLoadedReportActions: false}});

        // When the chat mounts while only the report request is pending.
        render(<ReportActions />);

        // Then money readiness cannot block the chat body or run money subscriptions.
        expect(mockReportActionsListBody).toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockUsePaginatedReportActions).not.toHaveBeenCalled();
        expect(mockUseReportTransactionsCollection).not.toHaveBeenCalled();
    });

    it('renders the app-load skeleton on the chat path and closes the open-report span with warm:false', () => {
        // Given OpenApp is queued while an ordinary chat is selected.
        setupUseOnyx({isLoadingApp: true});

        // When the report mounts during app initialization.
        render(<ReportActions />);

        // Then the heavy chat body waits and the loading render closes its report span as cold.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockMarkOpenReportEnd).toHaveBeenCalledWith(REPORT_ID, mockReport, {warm: false});
    });

    it('mounts the Concierge chat body during app load', () => {
        // Given this is the main Concierge DM where the welcome screen must remain available.
        setupUseOnyx({isLoadingApp: true, conciergeReportID: REPORT_ID});

        // When OpenApp is still queued.
        render(<ReportActions />);

        // Then Concierge bypasses the app-load skeleton and its telemetry.
        expect(mockReportActionsListBody).toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockMarkOpenReportEnd).not.toHaveBeenCalled();
    });

    it('does not exempt a different chat when a Concierge report ID exists', () => {
        // Given the account has a Concierge DM, but this route is a different ordinary chat.
        setupUseOnyx({isLoadingApp: true, conciergeReportID: OTHER_REPORT_ID});

        // When app initialization is pending.
        render(<ReportActions />);

        // Then only the actual Concierge DM may bypass the app-load skeleton.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
    });

    it('does not show the app-load skeleton or fire its telemetry while offline', () => {
        // Given an app-load request cannot resolve on the offline device.
        mockUseNetwork.mockReturnValue({isOffline: true});
        setupUseOnyx({isLoadingApp: true});

        // When the cached chat opens.
        render(<ReportActions />);

        // Then offline use remains available without an app-load skeleton.
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockReportActionsListBody).toHaveBeenCalled();
        expect(mockMarkOpenReportEnd).not.toHaveBeenCalled();
    });

    it.each(moneyReportTypes)('does not show the app-load skeleton over a %s table', (type) => {
        // Given complete money-report data can already select its table.
        setupUseOnyx({report: {...mockReport, type}, isLoadingApp: true});
        setupTransactions(createTransactions(2));

        // When app initialization is still queued.
        render(<ReportActions />);

        // Then the app gate applies only to the chat path.
        expect(mockMoneyRequestList).toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockMarkOpenReportEnd).not.toHaveBeenCalled();
    });

    it.each(moneyReportTypes)('keeps the app-load gate for the single-transaction %s chat fallback', (type) => {
        // Given a single money transaction selects the shared chat surface.
        setupUseOnyx({report: {...mockReport, type}, isLoadingApp: true});
        setupTransactions(createTransactions(1));

        // When OpenApp has not completed.
        render(<ReportActions />);

        // Then using a money report does not bypass the chat path's app-load gate.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
    });

    it('changes reports on the same route without retaining the prior money layout', () => {
        // Given the mounted route currently displays a report with two expenses.
        setupUseOnyx({report: {...mockReport, type: CONST.REPORT.TYPE.EXPENSE}});
        setupTransactions(createTransactions(2));
        const {rerender} = render(<ReportActions />);
        expect(mockMoneyRequestList).toHaveBeenCalled();

        // When navigation reuses that route for an ordinary chat.
        jest.clearAllMocks();
        mockUseRoute.mockReturnValue({key: 'report-route', name: 'Report', params: {reportID: OTHER_REPORT_ID}});
        setupUseOnyx({report: {...mockReport, reportID: OTHER_REPORT_ID}});
        rerender(<ReportActions />);

        // Then the current report, not the previous transaction count, controls the surface.
        expect(mockMoneyRequestList).not.toHaveBeenCalled();
        expect(mockReportActionsListBody.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({reportID: OTHER_REPORT_ID}));
        expect(mockUserTypingEventListener.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({report: expect.objectContaining({reportID: OTHER_REPORT_ID})}));
        expect(mockUsePaginatedReportActions).not.toHaveBeenCalled();
        expect(mockUseReportTransactionsCollection).not.toHaveBeenCalled();
    });

    it('switches from chat to a loading money report and then back on the same route', () => {
        // Given an ordinary chat is already mounted on a reusable route.
        const {rerender} = render(<ReportActions />);
        expect(mockReportActionsListBody).toHaveBeenCalled();

        // When the route switches to an expense report whose transactions are missing.
        jest.clearAllMocks();
        mockUseRoute.mockReturnValue({key: 'report-route', name: 'Report', params: {reportID: OTHER_REPORT_ID}});
        setupUseOnyx({report: {...mockReport, reportID: OTHER_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, total: -100}});
        rerender(<ReportActions />);

        // Then the new report must wait rather than reuse the old chat body.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockUsePaginatedReportActions).toHaveBeenCalledWith(OTHER_REPORT_ID);
        expect(mockUseReportTransactionsCollection).toHaveBeenCalledWith(OTHER_REPORT_ID);

        // When navigation reuses the route for the original chat again.
        jest.clearAllMocks();
        mockUseRoute.mockReturnValue({key: 'report-route', name: 'Report', params: {reportID: REPORT_ID}});
        setupUseOnyx();
        rerender(<ReportActions />);

        // Then the money loader and its subscriptions do not leak into the chat lifetime.
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockReportActionsListBody).toHaveBeenCalled();
        expect(mockUsePaginatedReportActions).not.toHaveBeenCalled();
        expect(mockUseReportTransactionsCollection).not.toHaveBeenCalled();
    });

    it('hydrates a cold money report through real Onyx subscriptions before choosing its layout', async () => {
        // Given neither the report nor its transactions have been cached when the route first opens.
        restoreReportDataHooks();
        const {unmount} = render(<ReportActions />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockUsePaginatedReportActions).not.toHaveBeenCalled();
        expect(mockUseReportTransactionsCollection).not.toHaveBeenCalled();

        // When the report arrives before its expenses, real subscription updates must retain the loader.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {...mockReport, type: CONST.REPORT.TYPE.EXPENSE, total: -100});
            await waitForBatchedUpdates();
        });

        // Then incomplete cold data must not briefly select an empty table or chat body.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(screen.queryByTestId('money-report-table')).toBeNull();
        expect(screen.queryByTestId(`chat-report-${REPORT_ID}`)).toBeNull();

        // When the first expense and its action hydrate through the keys the real hooks observe.
        const transactions = createTransactions(1);
        const action = createMoneyRequestAction(transactions[0]);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[action.reportActionID]: action});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${REPORT_ID}`, [[CONST.PAGINATION_START_ID, action.reportActionID, CONST.PAGINATION_END_ID]]);
            await waitForBatchedUpdates();
        });
        await seedReportTransactions(REPORT_ID, transactions);

        // Then the single-expense chat appears without remounting the route or replacing the hooks with mocks.
        expect(screen.getByTestId(`chat-report-${REPORT_ID}`)).toBeTruthy();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(screen.queryByTestId('money-report-table')).toBeNull();
        expect(mockUsePaginatedReportActions.mock.results.at(-1)?.value).toEqual(expect.objectContaining({windowActions: [action]}));
        unmount();
    });

    it('does not carry old report subscriptions through an unavailable destination on the same route', async () => {
        // Given the current route has a fully cached two-expense report and real money hooks mounted.
        restoreReportDataHooks();
        const firstReport = {...mockReport, type: CONST.REPORT.TYPE.EXPENSE, total: -200};
        const firstTransactions = createTransactions(2);
        const firstActions = firstTransactions.map(createMoneyRequestAction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, firstReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, Object.fromEntries(firstActions.map((action) => [action.reportActionID, action])));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${REPORT_ID}`, [
            [CONST.PAGINATION_START_ID, ...firstActions.map((action) => action.reportActionID), CONST.PAGINATION_END_ID],
        ]);
        await seedReportTransactions(REPORT_ID, firstTransactions);
        const {rerender, unmount} = render(<ReportActions />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByTestId('money-report-table')).toBeTruthy();

        // When the same route changes to a report whose Onyx key has never been populated.
        mockUseRoute.mockReturnValue({key: 'report-route', name: 'Report', params: {reportID: OTHER_REPORT_ID}});
        rerender(<ReportActions />);
        await waitForBatchedUpdatesWithAct();

        // Then the previous report and transaction collection must not select the destination's surface.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(screen.queryByTestId('money-report-table')).toBeNull();
        expect(screen.queryByTestId(`chat-report-${REPORT_ID}`)).toBeNull();

        // When the destination report hydrates without any of its own transactions yet.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OTHER_REPORT_ID}`, {...mockReport, reportID: OTHER_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, total: -100});
            await waitForBatchedUpdates();
        });

        // Then the source's two expenses cannot satisfy the destination's transaction readiness.
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(screen.queryByTestId('money-report-table')).toBeNull();
        expect(mockUseReportTransactionsCollection.mock.results.at(-1)?.value).toEqual({});

        // When only the destination's single expense and action arrive.
        const destinationTransactions = createTransactions(1, OTHER_REPORT_ID).map((transaction) => ({...transaction, transactionID: 'destination-expense'}));
        const destinationAction = createMoneyRequestAction(destinationTransactions[0]);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${OTHER_REPORT_ID}`, {[destinationAction.reportActionID]: destinationAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${OTHER_REPORT_ID}`, [[CONST.PAGINATION_START_ID, destinationAction.reportActionID, CONST.PAGINATION_END_ID]]);
            await waitForBatchedUpdates();
        });
        await seedReportTransactions(OTHER_REPORT_ID, destinationTransactions);

        // Then its own action page and transaction collection select the single-expense chat.
        expect(screen.getByTestId(`chat-report-${OTHER_REPORT_ID}`)).toBeTruthy();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(screen.queryByTestId('money-report-table')).toBeNull();
        expect(mockUsePaginatedReportActions.mock.results.at(-1)?.value).toEqual(expect.objectContaining({windowActions: [destinationAction]}));
        expect(mockUseReportTransactionsCollection.mock.results.at(-1)?.value).toEqual({[destinationTransactions[0].transactionID]: destinationTransactions[0]});

        // When late report, action and transaction updates arrive for the source after navigation.
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {total: 0, type: CONST.REPORT.TYPE.CHAT});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {});
            await waitForBatchedUpdates();
        });
        await seedReportTransactions(REPORT_ID, createTransactions(3));

        // Then the destination's mounted chat and its own action page remain unchanged.
        expect(screen.getByTestId(`chat-report-${OTHER_REPORT_ID}`)).toBeTruthy();
        expect(screen.queryByTestId(`chat-report-${REPORT_ID}`)).toBeNull();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(screen.queryByTestId('money-report-table')).toBeNull();
        expect(mockUsePaginatedReportActions.mock.results.at(-1)?.value).toEqual(expect.objectContaining({windowActions: [destinationAction]}));
        expect(mockUseReportTransactionsCollection.mock.results.at(-1)?.value).toEqual({[destinationTransactions[0].transactionID]: destinationTransactions[0]});
        unmount();
    });
});
