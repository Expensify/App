import {act, render} from '@testing-library/react-native';

import UnreadIndicatorUpdater from '@components/UnreadIndicatorUpdater';

import {useCurrentReportIDState} from '@hooks/useCurrentReportID';

import AppStateMonitor from '@libs/AppStateMonitor';
import {Scheduler} from '@libs/Scheduler';
import UnreadIndicatorUtils from '@libs/UnreadIndicatorUpdater';
import updateUnread, {setUnreadUpdateCallback} from '@libs/UnreadIndicatorUpdater/updateUnread';

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
    useCurrentReportIDState: jest.fn(() => ({currentReportID: undefined})),
}));
jest.mock('@libs/AppStateMonitor', () => ({
    __esModule: true,
    default: {addBecameActiveListener: jest.fn(() => () => {})},
}));

const mockUpdateUnread = jest.mocked(updateUnread);
const mockUseCurrentReportIDState = jest.mocked(useCurrentReportIDState);
const mockAddBecameActiveListener = jest.mocked(AppStateMonitor.addBecameActiveListener);
const mockSetUnreadUpdateCallback = jest.mocked(setUnreadUpdateCallback);

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
        mockUseCurrentReportIDState.mockReturnValue({currentReportID: undefined});
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
        mockUseCurrentReportIDState.mockReturnValue({currentReportID: '1'});
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

    describe('when the scan waits for React to be idle', () => {
        let idleTasks: Array<() => void> = [];

        beforeEach(() => {
            idleTasks = [];
            jest.spyOn(Scheduler, 'scheduleWhenIdle').mockImplementation((callback) => {
                idleTasks.push(callback);
                return {
                    cancel: () => {
                        idleTasks = idleTasks.filter((task) => task !== callback);
                    },
                };
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('does not scan or publish while rendering, only when the idle task runs', async () => {
            // Given an unread chat and a scheduler that holds the idle tasks
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, unreadReport);
            const scanSpy = jest.spyOn(UnreadIndicatorUtils, 'getUnreadReportIDsForUnreadIndicator');

            // When the updater is mounted
            render(<UnreadIndicatorUpdater />);
            await waitForBatchedUpdatesWithAct();

            // Then one task is waiting, and neither the scan nor the badge ran yet
            expect(idleTasks).toHaveLength(1);
            expect(scanSpy).not.toHaveBeenCalled();
            expect(mockUpdateUnread).not.toHaveBeenCalled();

            // When React becomes idle and the task runs
            act(() => {
                idleTasks.at(0)?.();
            });

            // Then the scan ran once and the count is published
            expect(scanSpy).toHaveBeenCalledTimes(1);
            expect(mockUpdateUnread).toHaveBeenLastCalledWith(1, ['1']);
        });

        it('shares one scan over the latest data between changes that arrive before the idle task runs', async () => {
            // Given the updater has published one unread report
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, unreadReport);
            const scanSpy = jest.spyOn(UnreadIndicatorUtils, 'getUnreadReportIDsForUnreadIndicator');
            render(<UnreadIndicatorUpdater />);
            await waitForBatchedUpdatesWithAct();
            act(() => {
                idleTasks.at(0)?.();
            });
            scanSpy.mockClear();

            // When the report is changed twice and then read before the next idle task runs
            await act(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastMessageText: 'first change'}));
            await act(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastMessageText: 'second change'}));
            await act(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastReadTime: '2023-09-08 07:15:44.030'}));
            await waitForBatchedUpdatesWithAct();

            // Then only the latest task is still waiting, and nothing was scanned yet
            expect(idleTasks).toHaveLength(1);
            expect(scanSpy).not.toHaveBeenCalled();

            // When that task runs
            act(() => {
                idleTasks.at(0)?.();
            });

            // Then a single scan used the latest data, where the report is read
            expect(scanSpy).toHaveBeenCalledTimes(1);
            expect(mockUpdateUnread).toHaveBeenLastCalledWith(0, []);
        });

        it('ends with the latest count when the Concierge indicator asks for a new publish while a scan is still waiting', async () => {
            // Given the updater has published one unread report and the report was then read, so a new scan is waiting
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, unreadReport);
            render(<UnreadIndicatorUpdater />);
            await waitForBatchedUpdatesWithAct();
            act(() => {
                idleTasks.at(0)?.();
            });
            expect(mockUpdateUnread).toHaveBeenLastCalledWith(1, ['1']);
            await act(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastReadTime: '2023-09-08 07:15:44.030'}));
            await waitForBatchedUpdatesWithAct();
            expect(idleTasks).toHaveLength(1);

            // When the Concierge indicator asks for a publish before the waiting scan ran, so it can only publish the last completed count
            mockUpdateUnread.mockClear();
            mockSetUnreadUpdateCallback.mock.calls.at(-1)?.[0]();
            expect(mockUpdateUnread).toHaveBeenCalledTimes(1);
            expect(mockUpdateUnread).toHaveBeenLastCalledWith(1, ['1']);

            // And then the waiting scan runs
            act(() => {
                idleTasks.at(0)?.();
            });

            // Then the badge ends with the count from the latest data
            expect(mockUpdateUnread).toHaveBeenLastCalledWith(0, []);
        });
    });
});
