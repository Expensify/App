import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-syntax
import type * as ReportUtils from '@libs/ReportUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ONBOARDING_ADMINS_CHAT_REPORT_ID = '1';
const ONBOARDING_POLICY_ID = '2';
const ACTIVE_WORKSPACE_ID = '3';
const REPORT_ID = '4';
const USER_ID = '5';
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
    isArchivedReportWithID: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isArchivedReportWithID,
    isThread: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isThread,
}));

jest.mock('@libs/Navigation/helpers/shouldOpenOnAdminRoom', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => mockShouldOpenOnAdminRoom() as boolean,
}));

describe('navigateAfterOnboarding', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        return Onyx.clear();
    });

    it('should navigate to the admin room report if onboardingAdminsChatReportID is provided', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const testSession = {email: 'realaccount@gmail.com'};

        navigateAfterOnboarding(false, true, undefined, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, (testSession?.email ?? '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
    });

    it('should not navigate if onboardingAdminsChatReportID is not provided', () => {
        navigateAfterOnboarding(false, true, undefined, undefined);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to LHN if it is a concierge chat on small screens', async () => {
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
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, lastAccessedReport);
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ACTIVE_WORKSPACE_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(navigate).not.toHaveBeenCalled();
    });

    it('should navigate to LHN if it is onboarding workspace chat on small screens', () => {
        const lastAccessedReport = {reportID: REPORT_ID, policyID: ONBOARDING_POLICY_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ACTIVE_WORKSPACE_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to last accessed report if shouldOpenOnAdminRoom is true on small screens', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = {reportID: REPORT_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ACTIVE_WORKSPACE_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should navigate to Concierge room if user uses a test email', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = {reportID: REPORT_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);
        const testSession = {email: 'test+account@gmail.com'};

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ACTIVE_WORKSPACE_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID, (testSession?.email ?? '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });
});
