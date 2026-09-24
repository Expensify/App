import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

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

let mockRouteParams: Record<string, unknown> = {reportID: REPORT_ID};
const mockSetParams = jest.fn();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: () => ({key: 'report', name: 'Report', params: mockRouteParams}),
    useNavigation: () => ({setParams: mockSetParams, addListener: jest.fn(() => jest.fn())}),
    useIsFocused: () => true,
}));

const mockOpenReport = jest.fn();
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof UserActionsReport>('@userActions/Report'),
    openReport: (...args: Parameters<typeof UserActionsReport.openReport>) => {
        mockOpenReport(...args);
    },
}));

function HandlerTree({isInPreloadedTab}: {isInPreloadedTab: boolean}) {
    return (
        <IsInPreloadedTabContext.Provider value={isInPreloadedTab}>
            <OnyxListItemProvider>
                <ReportFetchHandler />
            </OnyxListItemProvider>
        </IsInPreloadedTabContext.Provider>
    );
}

function renderHandler(isInPreloadedTab = false) {
    return render(<HandlerTree isInPreloadedTab={isInPreloadedTab} />);
}

/** Regression tests for the guards that suppress openReport for a client-generated report ID that doesn't exist on the server yet. */
describe('ReportFetchHandler', () => {
    beforeEach(async () => {
        mockOpenReport.mockClear();
        mockSetParams.mockClear();
        mockRouteParams = {reportID: REPORT_ID};
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
        });
        await waitForBatchedUpdates();
    });

    it('does NOT call openReport when isPendingCreation is set and the report does not exist locally yet', async () => {
        // Given an optimistic destination that has not been created locally yet
        mockRouteParams = {reportID: REPORT_ID, isPendingCreation: 'true'};

        // When the pre-mounted destination starts handling report fetches
        renderHandler();
        await waitForBatchedUpdates();

        // Then fetching is deferred because the server cannot resolve the optimistic report ID
        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('expires a stale isPendingCreation flag when the focused screen never receives a report row', async () => {
        // Given a restored route that still carries isPendingCreation but has no submit writing the report
        mockRouteParams = {reportID: REPORT_ID, isPendingCreation: 'true'};
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
        mockRouteParams = {reportID: REPORT_ID};
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
        mockRouteParams = {reportID: REPORT_ID, isPendingCreation: 'true'};
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
