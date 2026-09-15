import {renderHook} from '@testing-library/react-native';

import useMoneyRequestReportPagination from '@components/MoneyRequestReportView/useMoneyRequestReportPagination';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import createRandomReportAction from '../utils/collections/reportActions';

const REPORT_ID = '1';

const mockLoadOlderChats = jest.fn();
const mockLoadNewerChats = jest.fn();
jest.mock('@hooks/useLoadReportActions', () => ({
    __esModule: true,
    default: () => ({loadOlderChats: mockLoadOlderChats, loadNewerChats: mockLoadNewerChats}),
}));

jest.mock('@userActions/Report', () => ({
    getOlderActions: jest.fn(),
}));

let mockIsSearchTopmostFullScreenRoute = false;
jest.mock('@navigation/helpers/isSearchTopmostFullScreenRoute', () => ({
    __esModule: true,
    default: () => mockIsSearchTopmostFullScreenRoute,
}));

// `runAfterTransitions` normally defers to the end of an in-flight navigation animation. Run the
// callback synchronously here and record the cancel handle so tests can assert cleanup.
const mockCancel = jest.fn();
const mockRunAfterTransitions = jest.fn(({callback}: {callback: () => void}) => {
    callback();
    return {cancel: mockCancel};
});
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: (options: {callback: () => void}) => mockRunAfterTransitions(options),
    },
}));

const {getOlderActions: mockGetOlderActions} = jest.requireMock<{getOlderActions: jest.Mock}>('@userActions/Report');

function makeAction(reportActionID: string, actionName: OnyxTypes.ReportAction['actionName'] = CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT): OnyxTypes.ReportAction {
    return {...createRandomReportAction(Number(reportActionID)), reportActionID, actionName} as OnyxTypes.ReportAction;
}

/** A page of actions large enough to pass the backfill threshold, with one IOU action in it. */
function makeActionsAboveBackfillThreshold(): OnyxTypes.ReportAction[] {
    const actions = Array.from({length: 60}, (value, index) => makeAction(`${index + 1}`));
    actions[0] = makeAction('1', CONST.REPORT.ACTIONS.TYPE.IOU);
    return actions;
}

type Params = Parameters<typeof useMoneyRequestReportPagination>[0];

function renderPagination(params: Partial<Params> = {}) {
    const initialParams: Params = {
        reportID: REPORT_ID,
        reportActions: [makeAction('1')],
        reportActionIDs: ['1'],
        transactionThreadReportID: undefined,
        hasOlderActions: true,
        hasNewerActions: false,
        isOffline: false,
        reportPaginationState: undefined,
        reportLoadingState: {isLoadingInitialReportActions: false},
        ...params,
    };

    return renderHook((props: Params) => useMoneyRequestReportPagination(props), {initialProps: initialParams});
}

describe('useMoneyRequestReportPagination', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsSearchTopmostFullScreenRoute = false;
    });

    describe('auto-load of newer actions', () => {
        it('should load newer actions once the initial load has finished and newer actions exist', () => {
            renderPagination({hasNewerActions: true, reportPaginationState: {newestFetchedReportActionID: 'a'}});

            expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);
            expect(mockLoadNewerChats).toHaveBeenCalledWith(false);
        });

        it('should not load newer actions while the initial load is still in flight', () => {
            renderPagination({hasNewerActions: true, reportLoadingState: {isLoadingInitialReportActions: true}});

            expect(mockLoadNewerChats).not.toHaveBeenCalled();
        });

        it('should not load newer actions while offline', () => {
            renderPagination({hasNewerActions: true, isOffline: true});

            expect(mockLoadNewerChats).not.toHaveBeenCalled();
        });

        it('should not load newer actions while a newer-actions request is already in flight', () => {
            renderPagination({hasNewerActions: true, reportLoadingState: {isLoadingInitialReportActions: false, isLoadingNewerReportActions: true}});

            expect(mockLoadNewerChats).not.toHaveBeenCalled();
        });

        it('should not load newer actions when there are no loaded actions yet', () => {
            renderPagination({hasNewerActions: true, reportActions: [], reportActionIDs: []});

            expect(mockLoadNewerChats).not.toHaveBeenCalled();
        });

        it('should keep loading newer actions while the newest-fetched cursor advances', () => {
            const {rerender} = renderPagination({hasNewerActions: true, reportPaginationState: {newestFetchedReportActionID: 'a'}});
            expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);

            rerender({
                reportID: REPORT_ID,
                reportActions: [makeAction('1')],
                reportActionIDs: ['1'],
                transactionThreadReportID: undefined,
                hasOlderActions: true,
                hasNewerActions: true,
                isOffline: false,
                reportPaginationState: {newestFetchedReportActionID: 'b'},
                reportLoadingState: {isLoadingInitialReportActions: false},
            });

            expect(mockLoadNewerChats).toHaveBeenCalledTimes(2);
        });

        it('should stop loading newer actions once the newest-fetched cursor stops advancing', () => {
            const props: Params = {
                reportID: REPORT_ID,
                reportActions: [makeAction('1')],
                reportActionIDs: ['1'],
                transactionThreadReportID: undefined,
                hasOlderActions: true,
                hasNewerActions: true,
                isOffline: false,
                reportPaginationState: {newestFetchedReportActionID: 'a'},
                reportLoadingState: {isLoadingInitialReportActions: false},
            };
            const {rerender} = renderPagination(props);
            expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);

            // The same cursor coming back means the server has no more newer data to give.
            rerender({...props, reportActions: [makeAction('1'), makeAction('2')], reportActionIDs: ['1', '2']});

            expect(mockLoadNewerChats).toHaveBeenCalledTimes(1);
        });
    });

    describe('IOU backfill', () => {
        it('should backfill from the newest-fetched cursor once auto-pagination has finished', () => {
            renderPagination({reportActions: makeActionsAboveBackfillThreshold(), reportPaginationState: {newestFetchedReportActionID: 'newest'}});

            expect(mockGetOlderActions).toHaveBeenCalledTimes(1);
            expect(mockGetOlderActions).toHaveBeenCalledWith(REPORT_ID, 'newest');
        });

        it('should not backfill a report with fewer actions than the page-size threshold', () => {
            renderPagination({reportActions: [makeAction('1', CONST.REPORT.ACTIONS.TYPE.IOU)], reportPaginationState: {newestFetchedReportActionID: 'newest'}});

            expect(mockGetOlderActions).not.toHaveBeenCalled();
        });

        it('should not backfill a report with no IOU actions', () => {
            const actions = Array.from({length: 60}, (value, index) => makeAction(`${index + 1}`));
            renderPagination({reportActions: actions, reportPaginationState: {newestFetchedReportActionID: 'newest'}});

            expect(mockGetOlderActions).not.toHaveBeenCalled();
        });

        it('should not backfill while newer actions are still pending', () => {
            renderPagination({reportActions: makeActionsAboveBackfillThreshold(), hasNewerActions: true, reportPaginationState: {newestFetchedReportActionID: 'newest'}});

            expect(mockGetOlderActions).not.toHaveBeenCalled();
        });

        it('should not backfill while offline', () => {
            renderPagination({reportActions: makeActionsAboveBackfillThreshold(), isOffline: true, reportPaginationState: {newestFetchedReportActionID: 'newest'}});

            expect(mockGetOlderActions).not.toHaveBeenCalled();
        });

        it('should not backfill while an older-actions request is already in flight', () => {
            renderPagination({
                reportActions: makeActionsAboveBackfillThreshold(),
                reportPaginationState: {newestFetchedReportActionID: 'newest'},
                reportLoadingState: {isLoadingInitialReportActions: false, isLoadingOlderReportActions: true},
            });

            expect(mockGetOlderActions).not.toHaveBeenCalled();
        });

        it('should walk backwards from the oldest-fetched cursor on the passes after the first', () => {
            const reportActions = makeActionsAboveBackfillThreshold();
            const props: Params = {
                reportID: REPORT_ID,
                reportActions,
                reportActionIDs: reportActions.map((action) => action.reportActionID),
                transactionThreadReportID: undefined,
                hasOlderActions: true,
                hasNewerActions: false,
                isOffline: false,
                reportPaginationState: {newestFetchedReportActionID: 'newest'},
                reportLoadingState: {isLoadingInitialReportActions: false},
            };
            const {rerender} = renderPagination(props);
            expect(mockGetOlderActions).toHaveBeenNthCalledWith(1, REPORT_ID, 'newest');

            rerender({...props, reportPaginationState: {newestFetchedReportActionID: 'newest', oldestFetchedReportActionID: 'older-1'}});
            expect(mockGetOlderActions).toHaveBeenNthCalledWith(2, REPORT_ID, 'older-1');

            rerender({...props, reportPaginationState: {newestFetchedReportActionID: 'newest', oldestFetchedReportActionID: 'older-2'}});
            expect(mockGetOlderActions).toHaveBeenNthCalledWith(3, REPORT_ID, 'older-2');
            expect(mockGetOlderActions).toHaveBeenCalledTimes(3);
        });

        it('should stop backfilling once the oldest-fetched cursor stops advancing', () => {
            const reportActions = makeActionsAboveBackfillThreshold();
            const props: Params = {
                reportID: REPORT_ID,
                reportActions,
                reportActionIDs: reportActions.map((action) => action.reportActionID),
                transactionThreadReportID: undefined,
                hasOlderActions: true,
                hasNewerActions: false,
                isOffline: false,
                reportPaginationState: {newestFetchedReportActionID: 'newest'},
                reportLoadingState: {isLoadingInitialReportActions: false},
            };
            const {rerender} = renderPagination(props);
            expect(mockGetOlderActions).toHaveBeenCalledTimes(1);

            rerender({...props, reportPaginationState: {newestFetchedReportActionID: 'newest', oldestFetchedReportActionID: 'oldest'}});
            expect(mockGetOlderActions).toHaveBeenCalledTimes(2);

            // Re-run the effect with a fresh actions array but the same cursor: the gap is filled, so no further request.
            rerender({...props, reportActions: [...reportActions], reportPaginationState: {newestFetchedReportActionID: 'newest', oldestFetchedReportActionID: 'oldest'}});

            expect(mockGetOlderActions).toHaveBeenCalledTimes(2);
        });

        it('should cancel the pending transition callback on unmount', () => {
            const {unmount} = renderPagination({reportActions: makeActionsAboveBackfillThreshold(), reportPaginationState: {newestFetchedReportActionID: 'newest'}});

            unmount();

            expect(mockCancel).toHaveBeenCalled();
        });

        // The hook keeps its backfill cursor in refs and has no render-phase reset for a report
        // switch: it relies on `MoneyRequestReportActionsList` mounting it with `key={reportID}`.
        // A fresh mount for another report must therefore start the backfill from scratch.
        it('should restart the backfill from the newest-fetched cursor when mounted for another report', () => {
            const reportActions = makeActionsAboveBackfillThreshold();
            const {unmount} = renderPagination({
                reportID: 'A',
                reportActions,
                reportPaginationState: {newestFetchedReportActionID: 'newest-a', oldestFetchedReportActionID: 'oldest-a'},
            });
            expect(mockGetOlderActions).toHaveBeenCalledWith('A', 'newest-a');
            unmount();

            renderPagination({
                reportID: 'B',
                reportActions,
                reportPaginationState: {newestFetchedReportActionID: 'newest-b', oldestFetchedReportActionID: 'oldest-b'},
            });

            expect(mockGetOlderActions).toHaveBeenLastCalledWith('B', 'newest-b');
            expect(mockGetOlderActions).toHaveBeenCalledTimes(2);
        });
    });

    describe('list edge handlers', () => {
        it('should load older actions immediately when the search route is not topmost', () => {
            const {result} = renderPagination();

            result.current.onStartReached();

            expect(mockLoadOlderChats).toHaveBeenCalledWith(false);
            expect(mockRunAfterTransitions).not.toHaveBeenCalled();
        });

        it('should defer loading older actions until transitions finish when the search route is topmost', () => {
            mockIsSearchTopmostFullScreenRoute = true;
            const {result} = renderPagination();

            result.current.onStartReached();

            expect(mockRunAfterTransitions).toHaveBeenCalledTimes(1);
            expect(mockLoadOlderChats).toHaveBeenCalledWith(false);
        });

        it('should load newer actions when the list end is reached', () => {
            const {result} = renderPagination();

            result.current.onEndReached();

            expect(mockLoadNewerChats).toHaveBeenCalledWith(false);
        });
    });
});
