import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ReportFetchHandler from '@pages/inbox/ReportFetchHandler';

import type * as UserActionsReport from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = '1';

let mockRouteParams: Record<string, unknown> = {reportID: REPORT_ID};

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useRoute: () => ({key: 'report', name: 'Report', params: mockRouteParams}),
    useNavigation: () => ({setParams: jest.fn(), addListener: jest.fn(() => jest.fn())}),
    useIsFocused: () => true,
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

/**
 * Regression tests for the pre-mount destination guards in ReportFetchHandler.
 *
 * reportIDFromRoute can be a client-generated optimistic ID for a chat/report that doesn't exist on the
 * server yet (see getSubmitExpensePreMountDestinationRoute.ts). Calling openReport for that ID 403s and
 * latches the not-found page, so these guards must suppress the fetch until the real row exists locally.
 */
describe('ReportFetchHandler', () => {
    beforeEach(async () => {
        mockOpenReport.mockClear();
        mockRouteParams = {reportID: REPORT_ID};
        await Onyx.clear();
        await Onyx.multiSet({
            [ONYXKEYS.IS_LOADING_APP]: false,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
        });
        await waitForBatchedUpdates();
    });

    it('does NOT call openReport when isPendingCreation is set and the report does not exist locally yet', async () => {
        mockRouteParams = {reportID: REPORT_ID, isPendingCreation: 'true'};

        renderHandler();
        await waitForBatchedUpdates();

        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('calls openReport again once the pre-mounted report exists locally and isPendingCreation clears', async () => {
        mockRouteParams = {reportID: REPORT_ID};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await waitForBatchedUpdates();

        renderHandler();
        await waitForBatchedUpdates();

        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID}));
    });

    it('does NOT call openReport while the promotion marker is set, even though the report row exists', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${REPORT_ID}`, true);
        await waitForBatchedUpdates();

        renderHandler();
        await waitForBatchedUpdates();

        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('calls openReport again once the promotion marker is cleared', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_PRE_MOUNT_PROMOTION}${REPORT_ID}`, null);
        await waitForBatchedUpdates();

        renderHandler();
        await waitForBatchedUpdates();

        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: REPORT_ID}));
    });
});
