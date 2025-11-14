import {waitFor} from '@testing-library/react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {navigateAfterOnboarding} from '@libs/navigateAfterOnboarding';
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
const REPORT_ID = '3';
const USER_ID = '4';
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
    isArchivedReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isArchivedReport,
    isThread: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isThread,
    getAllPolicyReports: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getAllPolicyReports,
    isValidReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isValidReport,
    generateReportAttributes: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').generateReportAttributes,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getAllReportErrors: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getAllReportErrors,
    shouldDisplayViolationsRBRInLHN: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').shouldDisplayViolationsRBRInLHN,
    generateIsEmptyReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').generateIsEmptyReport,
    isExpenseReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isExpenseReport,
    isSelfDM: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isSelfDM,
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

        navigateAfterOnboarding(false, true, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, (testSession?.email ?? '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
    });

    it('should not navigate to the admin room report if onboardingAdminsChatReportID is not provided on larger screens', () => {
        navigateAfterOnboarding(false, true, undefined, undefined);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(undefined));
    });

    it('should not navigate to last accessed report if it is a concierge chat on small screens', async () => {
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
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, REPORT_ID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, lastAccessedReport);
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should not navigate to last accessed report if it is onboarding expense chat on small screens', () => {
        const lastAccessedReport = {reportID: REPORT_ID, policyID: ONBOARDING_POLICY_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should not navigate to last accessed report if it is selfDM chat on small screens', () => {
        const lastAccessedReport = {reportID: REPORT_ID, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should navigate to last accessed report if shouldOpenOnAdminRoom is true on small screens', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = {reportID: REPORT_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should navigate to Concierge room if user uses a test email', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = {reportID: REPORT_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);
        const testSession = {email: 'test+account@gmail.com'};

        navigateAfterOnboarding(true, true, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID, (testSession?.email ?? '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should navigate to Test Drive Modal if user wants to manage a small team', async () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        jest.spyOn(Navigation, 'isNavigationReady').mockReturnValue(Promise.resolve());

        navigateAfterOnboarding(true, true);
        await waitFor(() => expect(navigate).toHaveBeenCalledWith(ROUTES.TEST_DRIVE_MODAL_ROOT.route));
    });
});
