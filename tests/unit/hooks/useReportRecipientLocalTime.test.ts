import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import useReportRecipientLocalTime from '@hooks/useReportRecipientLocalTime';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

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

function ReportRecipientLocalTimeProbe({report}: {report: OnyxEntry<Report>}) {
    const canShowRecipientLocalTime = useReportRecipientLocalTime({report});
    return React.createElement(Text, null, canShowRecipientLocalTime ? 'visible' : 'hidden');
}

describe('useReportRecipientLocalTime', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('updates when personal details list changes', async () => {
        render(React.createElement(ReportRecipientLocalTimeProbe, {report: REPORT}));

        await waitFor(() => {
            expect(screen.getByText('hidden')).toBeOnTheScreen();
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, RECIPIENT_PERSONAL_DETAILS);
        });

        await waitFor(() => {
            expect(screen.getByText('visible')).toBeOnTheScreen();
        });
    });

    it('updates when the report loads after personal details are already available', async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, RECIPIENT_PERSONAL_DETAILS);
        });

        const {rerender} = render(React.createElement(ReportRecipientLocalTimeProbe, {report: undefined}));

        await waitFor(() => {
            expect(screen.getByText('hidden')).toBeOnTheScreen();
        });

        rerender(React.createElement(ReportRecipientLocalTimeProbe, {report: REPORT}));

        await waitFor(() => {
            expect(screen.getByText('visible')).toBeOnTheScreen();
        });
    });
});
