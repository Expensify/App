import Navigation from '@libs/Navigation/Navigation';
import {navigateToDetailsPage} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn(),
}));

jest.mock('@libs/Permissions');

const REPORT_ID = '4139850258346598';
const POLICY_ID = 'D5C313FD8FDF2B3F';
const CONCIERGE_REPORT_ID = '7215488612093755';
const CONCIERGE_ACCOUNT_ID = 8392101;

const adminsRoom: Report = {
    reportID: REPORT_ID,
    policyID: POLICY_ID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
    type: CONST.REPORT.TYPE.CHAT,
};

// The Side Panel shows either the admins room or the Concierge report. Concierge is a chat report with no chat type
// and a single other participant, so it is a 1:1 chat and takes the `PROFILE` branch of `navigateToDetailsPage`.
const conciergeChat: Report = {
    reportID: CONCIERGE_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
    participants: {
        [CONCIERGE_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    },
};

describe('navigateToDetailsPage', () => {
    const mockNavigate = jest.mocked(Navigation.navigate);
    const mockGetActiveRoute = jest.mocked(Navigation.getActiveRoute);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('outside the Side Panel', () => {
        it('opens details in the context of the active route', () => {
            mockGetActiveRoute.mockReturnValue(`r/${REPORT_ID}`);

            navigateToDetailsPage(adminsRoom);

            expect(mockNavigate).toHaveBeenCalledWith(`r/${REPORT_ID}/details`);
        });

        it('keeps the Search context so details does not jump to the report', () => {
            mockGetActiveRoute.mockReturnValue('search/all/12345');

            navigateToDetailsPage(adminsRoom);

            expect(mockNavigate).toHaveBeenCalledWith('search/all/12345/details');
        });

        it('opens the profile of a 1:1 chat in the context of the active route', () => {
            mockGetActiveRoute.mockReturnValue(`r/${CONCIERGE_REPORT_ID}`);

            navigateToDetailsPage(conciergeChat);

            expect(mockNavigate).toHaveBeenCalledWith(`r/${CONCIERGE_REPORT_ID}/a/${CONCIERGE_ACCOUNT_ID}`);
        });
    });

    describe('inside the Side Panel', () => {
        it('anchors details to the report instead of the screen behind the panel', () => {
            mockGetActiveRoute.mockReturnValue(`/workspaces/${POLICY_ID}/overview`);

            navigateToDetailsPage(adminsRoom, true);

            expect(mockNavigate).toHaveBeenCalledWith(`r/${REPORT_ID}/details`);
            expect(mockGetActiveRoute).not.toHaveBeenCalled();
        });

        it('anchors the profile of a 1:1 chat to the report instead of the screen behind the panel', () => {
            mockGetActiveRoute.mockReturnValue(`/workspaces/${POLICY_ID}/overview`);

            navigateToDetailsPage(conciergeChat, true);

            expect(mockNavigate).toHaveBeenCalledWith(`r/${CONCIERGE_REPORT_ID}/a/${CONCIERGE_ACCOUNT_ID}`);
            expect(mockGetActiveRoute).not.toHaveBeenCalled();
        });
    });

    it('does not navigate when the report has no reportID', () => {
        navigateToDetailsPage(undefined);

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
