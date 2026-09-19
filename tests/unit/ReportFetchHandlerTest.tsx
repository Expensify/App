import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ReportFetchHandler from '@pages/inbox/ReportFetchHandler';

import type * as UserActionsReport from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = '1';

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

const mockOpenReport = jest.fn();
jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<typeof UserActionsReport>('@userActions/Report'),
    openReport: (...args: Parameters<typeof UserActionsReport.openReport>) => {
        mockOpenReport(...args);
    },
}));

function renderHandler() {
    return render(
        <OnyxListItemProvider>
            <ReportFetchHandler />
        </OnyxListItemProvider>,
    );
}

/** Regression tests for the guards that suppress openReport for a client-generated report ID that doesn't exist on the server yet. */
describe('ReportFetchHandler', () => {
    beforeEach(async () => {
        mockOpenReport.mockClear();
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
});
