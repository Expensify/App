import {renderHook, waitFor} from '@testing-library/react-native';

import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

const CURRENT_USER_ACCOUNT_ID = 1;
const RECIPIENT_ACCOUNT_ID = 2;

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: CURRENT_USER_ACCOUNT_ID}),
}));

const REPORT = {
    reportID: '1',
    type: CONST.REPORT.TYPE.CHAT,
    participants: {
        [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        [RECIPIENT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    },
} as Report;

const PARENT_REPORT_ID = '2';
const PARENT_REPORT_ACTION_ID = '3';
const THREAD = {...REPORT, parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID};

const RECIPIENT_PERSONAL_DETAILS: PersonalDetailsList = {
    [RECIPIENT_ACCOUNT_ID]: {
        accountID: RECIPIENT_ACCOUNT_ID,
        login: 'user@example.com',
        displayName: 'User',
        validated: true,
        timezone: {automatic: true, selected: 'America/New_York'},
    },
};

describe('useReportRecipientLocalTime', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('updates when personal details list changes', async () => {
        const {result} = renderHook(() => useReportRecipientLocalTime({report: REPORT}));

        await waitFor(() => {
            expect(result.current).toBe(false);
        });

        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, RECIPIENT_PERSONAL_DETAILS);

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it.each([CONST.IOU.REPORT_ACTION_TYPE.TRACK, CONST.IOU.REPORT_ACTION_TYPE.CREATE])('hides the local time once the parent action of the thread is a %s expense', async (type) => {
        // Given a thread with one other participant, whose parent action has not loaded yet
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, RECIPIENT_PERSONAL_DETAILS);
        const {result} = renderHook(() => useReportRecipientLocalTime({report: THREAD}));
        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        // When the parent expense action arrives, as it does when a thread is opened from Search
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
            [PARENT_REPORT_ACTION_ID]: {reportActionID: PARENT_REPORT_ACTION_ID, actionName: CONST.REPORT.ACTIONS.TYPE.IOU, message: {type}},
        });

        // Then the row goes away, because an expense thread is about the expense and not a conversation with that person
        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('keeps the local time in a comment thread', async () => {
        // Given a thread with one other participant, whose parent action is a comment
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, RECIPIENT_PERSONAL_DETAILS);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
            [PARENT_REPORT_ACTION_ID]: {reportActionID: PARENT_REPORT_ACTION_ID, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT},
        });

        // When reading whether to show the local time
        const {result} = renderHook(() => useReportRecipientLocalTime({report: THREAD}));

        // Then it stays visible, because only expense threads hide it
        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });
});
