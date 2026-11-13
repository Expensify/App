import {act, render} from '@testing-library/react-native';

import UnreadIndicatorUpdater from '@components/UnreadIndicatorUpdater';

import {useCurrentReportIDState} from '@hooks/useCurrentReportID';

import AppStateMonitor from '@libs/AppStateMonitor';
import updateUnread from '@libs/UnreadIndicatorUpdater/updateUnread';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/UnreadIndicatorUpdater', () => jest.requireActual<{default: unknown}>('../../src/components/UnreadIndicatorUpdater/index.tsx'));
jest.mock('@libs/UnreadIndicatorUpdater/updateUnread', () => ({
    __esModule: true,
    default: jest.fn(),
    setUnreadUpdateCallback: jest.fn(),
}));

jest.mock('@hooks/useCurrentReportID', () => ({
    useCurrentReportIDState: jest.fn(() => ({currentReportID: undefined, currentRHPReportID: undefined})),
}));
jest.mock('@libs/AppStateMonitor', () => ({
    __esModule: true,
    default: {addBecameActiveListener: jest.fn(() => () => {})},
}));

const mockUpdateUnread = jest.mocked(updateUnread);
const mockUseCurrentReportIDState = jest.mocked(useCurrentReportIDState);
const mockAddBecameActiveListener = jest.mocked(AppStateMonitor.addBecameActiveListener);

const CURRENT_USER_ACCOUNT_ID = 1;

const unreadReport = {
    reportID: '1',
    reportName: 'test',
    type: CONST.REPORT.TYPE.CHAT,
    participants: {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
    lastReadTime: '2023-07-08 07:15:44.030',
    lastVisibleActionCreated: '2023-08-08 07:15:44.030',
    lastActorAccountID: 2,
    lastMessageText: 'test',
};

describe('UnreadIndicatorUpdater', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@test.com'});
        mockUpdateUnread.mockClear();
        mockAddBecameActiveListener.mockClear();
        mockUseCurrentReportIDState.mockReturnValue({currentReportID: undefined, currentRHPReportID: undefined});
    });

    it('publishes the unread count from the reports in Onyx', async () => {
        // Given a chat the user is in whose last message, from someone else, is newer than the last time it was read
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, unreadReport);

        // When the updater is mounted
        render(<UnreadIndicatorUpdater />);
        await waitForBatchedUpdatesWithAct();

        // Then the tab title and badge get a count of one, with that report's ID
        expect(mockUpdateUnread).toHaveBeenLastCalledWith(1, ['1']);
    });

    it('publishes a new count when a report is read', async () => {
        // Given the updater is showing one unread report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, unreadReport);
        render(<UnreadIndicatorUpdater />);
        await waitForBatchedUpdatesWithAct();
        expect(mockUpdateUnread).toHaveBeenLastCalledWith(1, ['1']);

        // When the report is read, so its last read time passes its last action
        await act(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastReadTime: '2023-09-08 07:15:44.030'}));
        await waitForBatchedUpdatesWithAct();

        // Then the count drops to zero without waiting for any other trigger
        expect(mockUpdateUnread).toHaveBeenLastCalledWith(0, []);
    });

    it('publishes a new count when the user opens a report that only counts while it is open', async () => {
        // Given an unread report with no name, which the list skips unless it is the report being viewed
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, {...unreadReport, reportName: undefined});
        const {rerender} = render(<UnreadIndicatorUpdater />);
        await waitForBatchedUpdatesWithAct();
        expect(mockUpdateUnread).toHaveBeenLastCalledWith(0, []);

        // When the user navigates to that report
        mockUseCurrentReportIDState.mockReturnValue({currentReportID: '1', currentRHPReportID: undefined});
        rerender(<UnreadIndicatorUpdater />);
        await waitForBatchedUpdatesWithAct();

        // Then the count is recomputed for the new current report instead of reusing the old snapshot
        expect(mockUpdateUnread).toHaveBeenLastCalledWith(1, ['1']);
    });

    it('republishes the latest count when the app comes back to the foreground', async () => {
        // Given the updater has published one unread report and the report was then read
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, unreadReport);
        render(<UnreadIndicatorUpdater />);
        await waitForBatchedUpdatesWithAct();
        await act(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastReadTime: '2023-09-08 07:15:44.030'}));
        await waitForBatchedUpdatesWithAct();
        mockUpdateUnread.mockClear();

        // When the app becomes active, firing the most recently registered listener
        const becameActive = mockAddBecameActiveListener.mock.calls.at(-1)?.[0];
        becameActive?.();

        // Then the badge is set again from the latest data, not the count from the first render
        expect(mockUpdateUnread).toHaveBeenCalledTimes(1);
        expect(mockUpdateUnread).toHaveBeenLastCalledWith(0, []);
    });
});
