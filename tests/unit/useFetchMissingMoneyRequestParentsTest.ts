import {act, renderHook} from '@testing-library/react-native';

import useFetchMissingMoneyRequestParents, {missingParentsSelector} from '@hooks/useFetchMissingMoneyRequestParents';

import {openReport} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const CHAT_REPORT_ID = '100';
const EXPENSE_REPORT_ID = '200';
const THREAD_REPORT_ID = '300';
const IOU_ACTION_ID = '400';

let mockIsOffline = false;

jest.mock('@libs/actions/Report', () => ({
    openReport: jest.fn(),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: CURRENT_USER_ACCOUNT_ID}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

/** The transaction thread OpenApp returns after a cache clear: it has the new comment, its expense report is left out. */
const unreadThread = {
    reportID: THREAD_REPORT_ID,
    chatReportID: CHAT_REPORT_ID,
    parentReportID: EXPENSE_REPORT_ID,
    parentReportActionID: IOU_ACTION_ID,
    lastReadTime: '2026-11-01 10:00:00.000',
    lastVisibleActionCreated: '2026-11-01 11:00:00.000',
} as Report;

const iouAction = {
    reportActionID: IOU_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2026-11-01 09:00:00.000',
} as ReportAction;

async function seedColdStart({
    priorityMode = CONST.PRIORITY_MODE.GSD,
    thread = unreadThread,
    parentAction = iouAction,
}: {priorityMode?: ValueOf<typeof CONST.PRIORITY_MODE>; thread?: Report; parentAction?: ReportAction} = {}) {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, priorityMode);
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, thread);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${EXPENSE_REPORT_ID}`, {[IOU_ACTION_ID]: parentAction});
        await waitForBatchedUpdates();
    });
}

async function renderFetchMissingParents() {
    const hook = renderHook(() => useFetchMissingMoneyRequestParents());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
}

describe('useFetchMissingMoneyRequestParents', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsOffline = false;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('loads the missing expense report of an unread transaction thread in Focus mode without marking it read', async () => {
        // Given Focus mode after a cache clear, where OpenApp dropped the expense report but kept its unread transaction thread
        await seedColdStart();

        // When the hook runs once the app has loaded
        await renderFetchMissingParents();

        // Then the expense report is loaded so the LHN can show it as unread, and opening it doesn't clear the unread state
        expect(openReport).toHaveBeenCalledTimes(1);
        expect(openReport).toHaveBeenCalledWith(
            expect.objectContaining({
                reportID: EXPENSE_REPORT_ID,
                hasReportActions: true,
                shouldMarkAsRead: false,
                shouldKeepManualUnreadMarker: true,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            }),
        );
    });

    it('requests each missing parent only once while it is still loading', async () => {
        // Given the request for the missing expense report is already sent
        await seedColdStart();
        await renderFetchMissingParents();

        // When unrelated report updates re-run the hook before the parent arrives
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, {reportName: 'Updated'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}500`, {reportID: '500'});
            await waitForBatchedUpdates();
        });

        // Then the parent isn't requested again, so we don't spam OpenReport
        expect(openReport).toHaveBeenCalledTimes(1);
    });

    it('requests the parent again after it loaded and then went missing again', async () => {
        // Given the missing expense report was requested and then loaded
        await seedColdStart();
        await renderFetchMissingParents();
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, {reportID: EXPENSE_REPORT_ID});
            await waitForBatchedUpdates();
        });

        // When it disappears from Onyx again, like after another cache clear
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${EXPENSE_REPORT_ID}`, null);
            await waitForBatchedUpdates();
        });

        // Then it's fetched again instead of staying hidden
        expect(openReport).toHaveBeenCalledTimes(2);
    });

    it('does nothing outside Focus mode, since OpenApp returns every report there', async () => {
        // Given the same cold start but in the default priority mode
        await seedColdStart({priorityMode: CONST.PRIORITY_MODE.DEFAULT});

        // When the hook runs
        await renderFetchMissingParents();

        // Then no extra report is opened
        expect(openReport).not.toHaveBeenCalled();
    });

    it('waits until the app has finished loading', async () => {
        // Given OpenApp is still in flight and may still bring the parent
        await seedColdStart();
        await act(async () => {
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
            await waitForBatchedUpdates();
        });

        // When the hook runs
        await renderFetchMissingParents();

        // Then nothing is requested yet
        expect(openReport).not.toHaveBeenCalled();
    });

    it('does nothing while offline', async () => {
        // Given the user is offline
        mockIsOffline = true;
        await seedColdStart();

        // When the hook runs
        await renderFetchMissingParents();

        // Then no request is queued
        expect(openReport).not.toHaveBeenCalled();
    });

    it('ignores regular comment threads, whose parent is not dropped by the Focus filter', async () => {
        // Given an unread thread whose parent action is a plain comment, not an expense
        await seedColdStart({parentAction: {...iouAction, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}});

        // When the hook runs
        await renderFetchMissingParents();

        // Then the parent isn't opened
        expect(openReport).not.toHaveBeenCalled();
    });

    it('ignores a transaction thread that is already read', async () => {
        // Given the transaction thread has no new comment
        await seedColdStart({thread: {...unreadThread, lastReadTime: unreadThread.lastVisibleActionCreated}});

        // When the hook runs
        await renderFetchMissingParents();

        // Then there is nothing to surface, so the parent isn't opened
        expect(openReport).not.toHaveBeenCalled();
    });
});

describe('missingParentsSelector', () => {
    it('lists each missing parent once and skips parents that are already in Onyx', () => {
        // Given two unread threads under the same missing parent and one unread thread whose parent is loaded
        const reports = {
            [`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`]: unreadThread,
            [`${ONYXKEYS.COLLECTION.REPORT}301`]: {...unreadThread, reportID: '301', parentReportActionID: '401'},
            [`${ONYXKEYS.COLLECTION.REPORT}302`]: {...unreadThread, reportID: '302', parentReportID: CHAT_REPORT_ID},
            [`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`]: {reportID: CHAT_REPORT_ID},
        };

        // When selecting the missing parents
        const missingParents = missingParentsSelector(reports);

        // Then only the missing expense report is returned, once
        expect(missingParents).toEqual([{parentReportID: EXPENSE_REPORT_ID, parentReportActionID: IOU_ACTION_ID}]);
    });
});
