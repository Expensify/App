import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {IsHiddenWideTabPreMountContext} from '@hooks/useIsHiddenWideTabPreMount';
import {IsInPreloadedTabContext} from '@hooks/useIsInPreloadedTab';

import ReportFetchHandler from '@pages/inbox/ReportFetchHandler';

import type * as UserActionsReport from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const PUBLIC_ROOM_ID = '2';

// The real useRoute returns a stable object until the route actually changes, and the fetch effect keys off that
// identity. Mirror it here, or every re-render would look like a navigation and fire its own openReport.
let mockRoute: {key: string; name: string; params: Record<string, unknown>} = {key: 'report', name: 'Report', params: {reportID: REPORT_ID}};
const mockSetParams = jest.fn();

function setRouteParams(params: Record<string, unknown>) {
    mockRoute = {key: 'report', name: 'Report', params};
}

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: () => mockRoute,
    useNavigation: () => ({setParams: mockSetParams, addListener: jest.fn(() => jest.fn())}),
    useIsFocused: () => true,
}));

let mockIsOffline = false;
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

const mockOpenReport = jest.fn<void, Parameters<typeof UserActionsReport.openReport>>();
const mockFlagReportNavigatedAway = jest.fn<void, Parameters<typeof UserActionsReport.flagReportNavigatedAway>>();
const mockClearReportNavigatedAway = jest.fn<void, Parameters<typeof UserActionsReport.clearReportNavigatedAway>>();
const mockUpdateLastVisitTime = jest.fn<void, Parameters<typeof UserActionsReport.updateLastVisitTime>>();
const mockReadNewestAction = jest.fn<void, Parameters<typeof UserActionsReport.readNewestAction>>();
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof UserActionsReport>('@userActions/Report'),
    openReport: (...args: Parameters<typeof UserActionsReport.openReport>) => {
        mockOpenReport(...args);
    },
    flagReportNavigatedAway: (...args: Parameters<typeof UserActionsReport.flagReportNavigatedAway>) => {
        mockFlagReportNavigatedAway(...args);
    },
    clearReportNavigatedAway: (...args: Parameters<typeof UserActionsReport.clearReportNavigatedAway>) => {
        mockClearReportNavigatedAway(...args);
    },
    updateLastVisitTime: (...args: Parameters<typeof UserActionsReport.updateLastVisitTime>) => {
        mockUpdateLastVisitTime(...args);
    },
    readNewestAction: (...args: Parameters<typeof UserActionsReport.readNewestAction>) => {
        mockReadNewestAction(...args);
    },
}));

function HandlerTree({isInPreloadedTab, isHiddenPreMount = false}: {isInPreloadedTab: boolean; isHiddenPreMount?: boolean}) {
    return (
        <IsInPreloadedTabContext.Provider value={isInPreloadedTab}>
            <IsHiddenWideTabPreMountContext.Provider value={isHiddenPreMount}>
                <OnyxListItemProvider>
                    <ReportFetchHandler />
                </OnyxListItemProvider>
            </IsHiddenWideTabPreMountContext.Provider>
        </IsInPreloadedTabContext.Provider>
    );
}

function renderHandler(isInPreloadedTab = false, isHiddenPreMount = false) {
    return render(
        <HandlerTree
            isInPreloadedTab={isInPreloadedTab}
            isHiddenPreMount={isHiddenPreMount}
        />,
    );
}

/** Regression tests for the guards that suppress openReport for a client-generated report ID that doesn't exist on the server yet. */
describe('ReportFetchHandler', () => {
    beforeEach(async () => {
        mockOpenReport.mockClear();
        mockFlagReportNavigatedAway.mockClear();
        mockClearReportNavigatedAway.mockClear();
        mockUpdateLastVisitTime.mockClear();
        mockReadNewestAction.mockClear();
        mockSetParams.mockClear();
        mockIsOffline = false;
        setRouteParams({reportID: REPORT_ID});
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
        });
        await waitForBatchedUpdates();
    });

    it('does NOT call openReport when isPendingCreation is set and the report does not exist locally yet', async () => {
        // Given an optimistic destination that has not been created locally yet
        setRouteParams({reportID: REPORT_ID, isPendingCreation: 'true'});

        // When the pre-mounted destination starts handling report fetches
        renderHandler();
        await waitForBatchedUpdates();

        // Then fetching is deferred because the server cannot resolve the optimistic report ID
        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('expires a stale isPendingCreation flag when the focused screen never receives a report row', async () => {
        // Given a restored route that still carries isPendingCreation but has no submit writing the report
        setRouteParams({reportID: REPORT_ID, isPendingCreation: 'true'});
        jest.useFakeTimers();

        // When the focused screen waits without a report row
        renderHandler();
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.STALE_PENDING_CREATION_ROUTE_TIMEOUT - 1);
        });
        expect(mockSetParams).not.toHaveBeenCalled();

        // Then the flag is cleared once the grace period elapses, so fetching and the not-found guard can resolve the screen
        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(mockSetParams).toHaveBeenCalledWith({isPendingCreation: undefined});
        jest.useRealTimers();
    });

    it('calls openReport again once the pre-mounted report exists locally and isPendingCreation clears', async () => {
        // Given a pre-mounted report that has become locally available
        setRouteParams({reportID: REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();

        // When report fetching resumes after creation completes
        renderHandler();
        await waitForBatchedUpdates();

        // Then the real report is fetched because its optimistic guard is no longer needed
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID}));
    });

    it('clears isPendingCreation once the report exists locally', async () => {
        // Given an optimistic route whose report has just become locally available
        setRouteParams({reportID: REPORT_ID, isPendingCreation: 'true'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();

        // When the handler observes the newly created report
        renderHandler();
        await waitForBatchedUpdates();

        // Then the temporary route guard is removed because future fetches are safe
        expect(mockSetParams).toHaveBeenCalledWith({isPendingCreation: undefined});
    });

    it('does NOT call openReport while the pre-mount marker is set, even though the report row exists', async () => {
        // Given a draft report pre-mounted only for speculative pre-mounting
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${REPORT_ID}`, true);
        await waitForBatchedUpdates();

        // When the handler sees the speculative report row
        renderHandler();
        await waitForBatchedUpdates();

        // Then fetching stays blocked because the report is not committed on the server
        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('loads a hidden wide submit pre-mount without marking it read or clearing its manual unread marker', async () => {
        // Given a report that exists locally, mounted hidden under the screen the user is looking at
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();

        // When the handler fetches it
        renderHandler(false, true);
        await waitForBatchedUpdates();

        // Then it still loads, so the reveal is instant, but the read state waits for the user to actually see it
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID, shouldMarkAsRead: false, shouldKeepManualUnreadMarker: true}));
    });

    it('does not flag a hidden wide submit pre-mount as navigated away when it unmounts unseen', async () => {
        // Given a report mounted hidden under the screen the user is looking at
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();
        const {unmount} = renderHandler(false, true);
        await waitForBatchedUpdates();

        // When the submit is cancelled and the hidden screen unmounts
        unmount();

        // Then the next real open is not treated as a return trip that clears a manual unread marker
        expect(mockFlagReportNavigatedAway).not.toHaveBeenCalled();
    });

    it('flags a revealed wide submit pre-mount as navigated away when it unmounts', async () => {
        // Given a hidden pre-mount that was then revealed to the user
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();
        const {rerender, unmount} = renderHandler(false, true);
        await waitForBatchedUpdates();
        rerender(
            <HandlerTree
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );
        await waitForBatchedUpdates();

        // When the screen unmounts
        unmount();

        // Then it is flagged like any report the user left
        expect(mockFlagReportNavigatedAway).toHaveBeenCalledWith(REPORT_ID);
    });

    it('does not re-fetch a hidden wide submit pre-mount when the reveal rebuilds its route', async () => {
        // Given a report that the hidden pre-mount already fetched
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();
        const {rerender} = renderHandler(false, true);
        await waitForBatchedUpdates();
        mockOpenReport.mockClear();

        // When the reveal replaces the route object with one that has the same key and params
        setRouteParams({reportID: REPORT_ID});
        rerender(
            <HandlerTree
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );
        await waitForBatchedUpdates();

        // Then no return-trip fetch runs, so the manual unread marker and the newest page stay for this visit
        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('fetches a revealed wide submit pre-mount again when the user navigates to a new route', async () => {
        // Given a hidden pre-mount that was revealed, with its rebuilt route skipped
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();
        const {rerender} = renderHandler(false, true);
        await waitForBatchedUpdates();
        setRouteParams({reportID: REPORT_ID});
        rerender(
            <HandlerTree
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );
        await waitForBatchedUpdates();
        mockOpenReport.mockClear();

        // When the route changes again after the reveal
        setRouteParams({reportID: REPORT_ID});
        rerender(
            <HandlerTree
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );
        await waitForBatchedUpdates();

        // Then the skip was spent on the reveal, so this navigation fetches like any other
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID, shouldMarkAsRead: true}));
    });

    it('ends the return trip of a hidden wide submit pre-mount when it is revealed', async () => {
        // Given a report mounted hidden under the screen the user is looking at
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();
        const {rerender} = renderHandler(false, true);
        await waitForBatchedUpdates();
        expect(mockClearReportNavigatedAway).not.toHaveBeenCalled();

        // When it is revealed
        rerender(
            <HandlerTree
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );
        await waitForBatchedUpdates();

        // Then the visit starts now, so later fetches in it do not clear a manual unread marker as a return trip
        expect(mockClearReportNavigatedAway).toHaveBeenCalledWith(REPORT_ID);
    });

    it('keeps the return trip of a hidden wide submit pre-mount that unmounts unseen', async () => {
        // Given a report mounted hidden under the screen the user is looking at
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();
        const {unmount} = renderHandler(false, true);
        await waitForBatchedUpdates();

        // When the submit is cancelled and the hidden screen unmounts
        unmount();

        // Then the next real open still counts as a return trip and clears a marker the user left
        expect(mockClearReportNavigatedAway).not.toHaveBeenCalled();
    });

    it('records the visit of a hidden wide submit pre-mount only once it is revealed', async () => {
        // Given a report mounted hidden under the screen the user is looking at
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();
        const {rerender} = renderHandler(false, true);
        await waitForBatchedUpdates();

        // Then the user has not visited it yet
        expect(mockUpdateLastVisitTime).not.toHaveBeenCalled();

        // When it is revealed
        rerender(
            <HandlerTree
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );
        await waitForBatchedUpdates();

        // Then the visit is recorded
        expect(mockUpdateLastVisitTime).toHaveBeenCalledWith(REPORT_ID);
    });

    it('marks a hidden wide submit pre-mount task report read only once it is revealed', async () => {
        // Given a task report with no read time, mounted hidden under the screen the user is looking at
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.TASK});
        await waitForBatchedUpdates();
        const {rerender} = renderHandler(false, true);
        await waitForBatchedUpdates();

        // Then the read state waits for the user to see it
        expect(mockReadNewestAction).not.toHaveBeenCalled();

        // When it is revealed
        rerender(
            <HandlerTree
                isInPreloadedTab={false}
                isHiddenPreMount={false}
            />,
        );
        await waitForBatchedUpdates();

        // Then it is marked read like any opened task report
        expect(mockReadNewestAction).toHaveBeenCalledWith(REPORT_ID, expect.anything());
    });

    it('marks a visible report read when fetching it', async () => {
        // Given a report that exists locally, on a screen the user is looking at
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();

        // When the handler fetches it
        renderHandler();
        await waitForBatchedUpdates();

        // Then the fetch marks it read like opening any report does
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID, shouldMarkAsRead: true, shouldKeepManualUnreadMarker: false}));
    });

    it('calls openReport again once the pre-mount marker is cleared', async () => {
        // Given a pre-mounted report that has completed its speculative lifecycle
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNTED_DRAFT}${REPORT_ID}`, null);
        await waitForBatchedUpdates();

        // When the handler observes that the pre-mount is complete
        renderHandler();
        await waitForBatchedUpdates();

        // Then normal fetching resumes because the report is now safe to request
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID}));
    });

    it('calls openReport again when the memory-only loaded stamp is wiped underneath a mounted screen', async () => {
        // Given a mounted report whose actions have already loaded once
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {hasOnceLoadedReportActions: true, isLoadingInitialReportActions: false});
        await waitForBatchedUpdates();
        renderHandler();
        await waitForBatchedUpdates();
        mockOpenReport.mockClear();

        // When "Clear cache and restart" drops the memory-only loading state without remounting the screen
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, null);
        await waitForBatchedUpdates();

        // Then the report is fetched again so the loading state can settle instead of staying armed forever
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID}));
    });

    it('does NOT re-fetch when the loaded stamp is wiped while offline', async () => {
        // Given a mounted report whose actions have already loaded once, on a device that has since gone offline
        mockIsOffline = true;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {hasOnceLoadedReportActions: true, isLoadingInitialReportActions: false});
        await waitForBatchedUpdates();
        renderHandler();
        await waitForBatchedUpdates();
        mockOpenReport.mockClear();

        // When the memory-only loading state is dropped
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, null);
        await waitForBatchedUpdates();

        // Then nothing is requested, because the fetch would only sit in the queue until connectivity returns
        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('does NOT re-fetch for a report whose actions simply never loaded', async () => {
        // Given a report that has been opened but has never recorded a loaded stamp
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();
        renderHandler();
        await waitForBatchedUpdates();
        mockOpenReport.mockClear();

        // When its initial load resolves without ever succeeding, the way a failed fetch leaves it
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {isLoadingInitialReportActions: false});
        await waitForBatchedUpdates();

        // Then nothing re-fetches, because a stamp that was never there is not a stamp that was wiped
        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('does NOT treat switching from a loaded report to an unloaded one as a wiped stamp', async () => {
        // Given a mounted report whose actions have already loaded once, and another report that has never loaded
        const OTHER_REPORT_ID = '3';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OTHER_REPORT_ID}`, {reportID: OTHER_REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {hasOnceLoadedReportActions: true, isLoadingInitialReportActions: false});
        await waitForBatchedUpdates();
        const {rerender} = renderHandler();
        await waitForBatchedUpdates();
        mockOpenReport.mockClear();

        // When the same screen is re-parameterized to the other report without unmounting
        setRouteParams({reportID: OTHER_REPORT_ID});
        rerender(<HandlerTree isInPreloadedTab={false} />);
        await waitForBatchedUpdates();

        // Then the other report is fetched exactly once, by the normal fetch effect, not again by the cache-clear re-fetch
        expect(mockOpenReport.mock.calls.filter(([params]) => params.reportID === OTHER_REPORT_ID)).toHaveLength(1);
    });

    it('holds the re-fetch of a wiped loaded stamp while the Inbox tab is preloaded and resumes it once it opens', async () => {
        // Given a report mounted inside a warmed tab the user has not opened yet
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {hasOnceLoadedReportActions: true, isLoadingInitialReportActions: false});
        await waitForBatchedUpdates();
        const {rerender} = renderHandler(true);
        await waitForBatchedUpdates();
        mockOpenReport.mockClear();

        // When the memory-only loading state is dropped underneath the preloaded tab
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, null);
        await waitForBatchedUpdates();

        // Then nothing is fetched, because OpenReport would mark a report the user never opened as read
        expect(mockOpenReport).not.toHaveBeenCalled();

        // When the user opens the tab, which drops the preloaded flag
        rerender(<HandlerTree isInPreloadedTab={false} />);
        await waitForBatchedUpdates();

        // Then the held re-fetch runs, so the loading state still settles instead of staying armed forever
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID}));
    });

    it('holds every openReport while the Inbox tab is preloaded and resumes them once it opens', async () => {
        // Given a report that is normally fetched on mount
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();

        // When the handler mounts inside a warmed tab the user has not opened yet
        const {rerender} = renderHandler(true);
        await waitForBatchedUpdates();

        // Then nothing is fetched, because OpenReport marks a report the user never saw as read
        expect(mockOpenReport).not.toHaveBeenCalled();

        // When the user opens the tab, which drops the preloaded flag
        rerender(<HandlerTree isInPreloadedTab={false} />);
        await waitForBatchedUpdates();

        // Then the held fetch runs, so opening the tab still loads the report
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID}));
    });

    // Unlike the fetch of this report, joining the public room has no other effect that re-runs on open, and the
    // sign-in transition that triggers it is true for a single render.
    it('joins the public room once the Inbox tab opens when the sign-in happened while it was preloaded', async () => {
        // Given an anonymous user viewing a different public room, with report data still loading
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS},
            [ONYXKEYS.VIEWING_PUBLIC_ROOM_REPORT_ID]: PUBLIC_ROOM_ID,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: true,
        });
        await waitForBatchedUpdates();

        const {rerender} = renderHandler(true);
        await waitForBatchedUpdates();

        // When the user signs in and report data finishes loading while the tab is still unopened
        await Onyx.multiSet({
            // A normal sign-in leaves no anonymous auth token type behind.
            [ONYXKEYS.SESSION]: {},
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
        });
        await waitForBatchedUpdates();
        expect(mockOpenReport).not.toHaveBeenCalledWith(expect.objectContaining({reportID: PUBLIC_ROOM_ID}));

        // Then opening the tab still joins the public room
        rerender(<HandlerTree isInPreloadedTab={false} />);
        await waitForBatchedUpdates();

        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: PUBLIC_ROOM_ID}));
    });
});
