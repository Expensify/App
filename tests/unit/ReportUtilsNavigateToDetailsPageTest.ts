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

const adminsRoom: Report = {
    reportID: REPORT_ID,
    policyID: POLICY_ID,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
    type: CONST.REPORT.TYPE.CHAT,
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
            // PR #90113 dropped the hardcoded report base path on purpose: `REPORT_DETAILS.entryScreens` allows
            // Search and workspace rooms as entry points, and details is meant to open within whichever of those
            // the user is currently in. Re-anchoring to `r/<reportID>` here would regress that.
            mockGetActiveRoute.mockReturnValue('search/all/12345');

            navigateToDetailsPage(adminsRoom);

            expect(mockNavigate).toHaveBeenCalledWith('search/all/12345/details');
        });
    });

    describe('inside the Side Panel', () => {
        it('anchors details to the report instead of the screen behind the panel', () => {
            // Regression test for https://github.com/Expensify/App/issues/94977.
            // `SidePanelReport` renders `ReportScreen` with a synthetic route, so the report is never part of the
            // navigation state. After onboarding the RHP variant experiment leaves the workspace overview as the
            // active route, and falling back to it built `/workspaces/<policyID>/overview/details`, which fails the
            // `REPORT_DETAILS` entryScreens check and rendered the Not found page.
            mockGetActiveRoute.mockReturnValue(`/workspaces/${POLICY_ID}/overview`);

            navigateToDetailsPage(adminsRoom, true);

            expect(mockNavigate).toHaveBeenCalledWith(`r/${REPORT_ID}/details`);
            expect(mockGetActiveRoute).not.toHaveBeenCalled();
        });
    });

    it('does not navigate when the report has no reportID', () => {
        navigateToDetailsPage(undefined);

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
