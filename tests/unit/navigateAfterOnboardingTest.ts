import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type { OnyxEntry } from 'react-native-onyx';
import type { Report } from '@src/types/onyx';

const ONBOARDING_ADMINS_CHAT_REPORT_ID = '1';
const ONBOARDING_POLICY_ID = '2';
const ACTIVE_WORKSPACE_ID = '3';
const REPORT_ID = '4';
const USER_ID = '5'
const mockFindLastAccessedReport = jest.fn();
const mockShouldOpenOnAdminRoom = jest.fn();

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        triggerTransitionEnd: jest.fn(),
    };
});

jest.mock('@libs/ReportUtils', () => ({
    findLastAccessedReport: () => mockFindLastAccessedReport() as OnyxEntry<Report>,
    parseReportRouteParams: jest.fn(() => ({})),
    isConciergeChatReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isConciergeChatReport,
}));

jest.mock('@libs/Navigation/shouldOpenOnAdminRoom', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => mockShouldOpenOnAdminRoom() as boolean,
}));

describe('navigateAfterOnboarding', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should navigate to the admin room report if shouldOpenAdminRoom and has onboardingAdminsChatReportID', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');

        navigateAfterOnboarding(false, true, undefined, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, true);
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
    });

    it('should not navigate if shouldOpenAdminRoom is false', () => {
        navigateAfterOnboarding(false, true, undefined, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, false);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to LHN on small screens', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = { reportID: REPORT_ID, policyID: 'policyID' };
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ACTIVE_WORKSPACE_ID, undefined, false);
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should not navigate to the last accessed report if it is a concierge chat report', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = {
            reportID: REPORT_ID,
            participants: {
                [CONST.ACCOUNT_ID.CONCIERGE.toString()]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                [USER_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Concierge',
            type: CONST.REPORT.TYPE.CHAT,
        };
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ACTIVE_WORKSPACE_ID, undefined, false);
        expect(navigate).not.toHaveBeenCalled();
    });

    it('should not navigate to the last accessed report if it matches the onboarding policy ID', () => {
        const lastAccessedReport = { reportID: REPORT_ID, policyID: ONBOARDING_POLICY_ID };
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ACTIVE_WORKSPACE_ID, undefined, false);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
