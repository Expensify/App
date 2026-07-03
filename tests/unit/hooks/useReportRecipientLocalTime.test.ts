import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

import {renderHook, waitFor} from '@testing-library/react-native';
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
});
