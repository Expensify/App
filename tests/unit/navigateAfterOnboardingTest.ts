import {navigateAfterOnboarding} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import type * as ReportUtils from '@libs/ReportUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ONBOARDING_ADMINS_CHAT_REPORT_ID = '1';
const ONBOARDING_POLICY_ID = '2';
const REPORT_ID = '3';
const USER_ID = '4';
const mockFindLastAccessedReport = jest.fn<ReportUtils.LastAccessedReport | undefined, Parameters<typeof ReportUtils.findLastAccessedReport>>();
const mockShouldOpenOnAdminRoom = jest.fn(() => false);
const mockIsReportTopmostSplitNavigator = jest.fn(() => false);

jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {
        isHybridApp: jest.fn(() => false),
        shouldUseStaging: jest.fn(),
        closeReactNativeApp: jest.fn(),
        completeOnboarding: jest.fn(),
        switchAccount: jest.fn(),
        sendAuthToken: jest.fn(),
        getHybridAppSettings: jest.fn(() => Promise.resolve(null)),
        getInitialURL: jest.fn(() => Promise.resolve(null)),
        onURLListenerAdded: jest.fn(),
        signInToOldDot: jest.fn(),
        signOutFromOldDot: jest.fn(),
        startSignOut: jest.fn(),
        cancelSignOut: jest.fn(),
        clearOldDotAfterSignOut: jest.fn(),
    },
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        triggerTransitionEnd: jest.fn(),
    };
});

jest.mock('@libs/ReportUtils', () => ({
    findLastAccessedReport: (...args: Parameters<typeof mockFindLastAccessedReport>) => mockFindLastAccessedReport(...args),
    parseReportRouteParams: jest.fn(() => ({})),
    isConciergeChatReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isConciergeChatReport,
    isArchivedReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isArchivedReport,
    isThread: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isThread,
    getAllPolicyReports: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getAllPolicyReports,
    isValidReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isValidReport,
    generateReportAttributes: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').generateReportAttributes,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getAllReportErrors: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getAllReportErrors,
    getViolatingReportIDForRBRInLHN: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getViolatingReportIDForRBRInLHN,
    generateIsEmptyReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').generateIsEmptyReport,
    isExpenseReport: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isExpenseReport,
    isSelfDM: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').isSelfDM,
}));

jest.mock('@libs/Navigation/helpers/shouldOpenOnAdminRoom', () => ({
    __esModule: true,
    default: () => mockShouldOpenOnAdminRoom(),
}));

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => ({
    __esModule: true,
    default: () => mockIsReportTopmostSplitNavigator(),
}));

describe('navigateAfterOnboarding', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        return Onyx.clear();
    });

    it('should navigate to the admin room report if onboardingAdminsChatReportID is provided', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const testSession = {email: 'realaccount@gmail.com'};

        navigateAfterOnboarding(false, true, '', {}, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, (testSession?.email ?? '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID), undefined);
    });

    it('should navigate to home if onboardingAdminsChatReportID is not provided on larger screens and no report is topmost', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');

        navigateAfterOnboarding(false, true, '', {}, undefined, undefined);
        // Without an admins chat report, we fall back to HOME to trigger guard evaluation instead of opening a report.
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
        expect(navigate).toHaveBeenCalledWith(ROUTES.HOME, undefined);
    });

    it('should preserve the topmost report if onboardingAdminsChatReportID is not provided on larger screens', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);

        navigateAfterOnboarding(false, true, '', {}, undefined, undefined);
        expect(navigate).not.toHaveBeenCalled();
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

        navigateAfterOnboarding(true, true, REPORT_ID, {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should not navigate to last accessed report if it is onboarding expense chat on small screens', () => {
        const lastAccessedReport = {reportID: REPORT_ID, policyID: ONBOARDING_POLICY_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should not navigate to last accessed report if it is selfDM chat on small screens', () => {
        const lastAccessedReport = {reportID: REPORT_ID, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should navigate to last accessed report if shouldOpenOnAdminRoom is true on small screens', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = {reportID: REPORT_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);

        navigateAfterOnboarding(true, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID), undefined);
    });

    it('should pass reportNameValuePairs when looking up last accessed report', () => {
        const reportNameValuePairs = {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID}`]: {private_isArchived: '2024-02-01 04:56:47.233'}};
        mockFindLastAccessedReport.mockReturnValue(undefined);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, '', reportNameValuePairs, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);

        expect(mockFindLastAccessedReport).toHaveBeenCalledWith(false, undefined, false, undefined, reportNameValuePairs);
    });

    it('should navigate to Concierge room if user uses a test email', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = {reportID: REPORT_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);
        const testSession = {email: 'test+account@gmail.com'};

        navigateAfterOnboarding(true, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID, (testSession?.email ?? '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID), undefined);
    });

    it('should navigate to the admin room when the inboxAdminsBespoke variant is assigned', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        navigateAfterOnboarding(false, true, '', {}, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, false, {variantOverride: CONST.ONBOARDING_RHP_VARIANT.INBOX_ADMINS_BESPOKE});
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID), undefined);
    });

    it('should land on Home instead of the admin room for the homePageNoRHP variant', () => {
        // Given an admin whose #admins room exists, which the control and inboxAdminsBespoke arms open after onboarding
        const navigate = jest.spyOn(Navigation, 'navigate');

        // When onboarding finishes with the homePageNoRHP arm of the experiment
        navigateAfterOnboarding(false, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID, false, {variantOverride: CONST.ONBOARDING_RHP_VARIANT.HOME_PAGE_NO_RHP});

        // Then the user starts on Home, so Home's Getting started is the only onboarding surface they see
        expect(navigate).toHaveBeenCalledWith(ROUTES.HOME, undefined);
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID), undefined);
    });

    it.each([CONST.ONBOARDING_COMPANY_SIZE.MICRO_SMALL, CONST.ONBOARDING_COMPANY_SIZE.SMALL, CONST.ONBOARDING_COMPANY_SIZE.LARGE])(
        'should land on Home with the side panel closed at company size %s for the homePageNoRHP variant',
        async (companySize) => {
            // Given a company size that decides whether the older RHP arms open the side panel, and a side panel left open
            const navigate = jest.spyOn(Navigation, 'navigate');
            await Onyx.set(ONYXKEYS.ONBOARDING_COMPANY_SIZE, companySize);
            await Onyx.set(ONYXKEYS.NVP_SIDE_PANEL, {open: true, openNarrowScreen: true});

            // When onboarding finishes with the homePageNoRHP arm
            navigateAfterOnboarding(false, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID, false, {variantOverride: CONST.ONBOARDING_RHP_VARIANT.HOME_PAGE_NO_RHP});
            await waitForBatchedUpdates();

            // Then the arm behaves the same at every company size: Home, with the side panel closed on every layout
            expect(navigate).toHaveBeenCalledWith(ROUTES.HOME, undefined);
            const sidePanel = await getOnyxValue(ONYXKEYS.NVP_SIDE_PANEL);
            expect(sidePanel?.open).toBe(false);
            expect(sidePanel?.openNarrowScreen).toBe(false);
        },
    );

    it('should keep a report that is already on top for the homePageNoRHP variant', async () => {
        // Given a report is already showing, which the other paths that end on Home also leave in place
        const navigate = jest.spyOn(Navigation, 'navigate');
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        await Onyx.set(ONYXKEYS.NVP_SIDE_PANEL, {open: true});

        // When onboarding finishes with the homePageNoRHP arm
        navigateAfterOnboarding(false, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID, false, {variantOverride: CONST.ONBOARDING_RHP_VARIANT.HOME_PAGE_NO_RHP});
        await waitForBatchedUpdates();

        // Then the report stays where it is, and the side panel is still closed
        expect(navigate).not.toHaveBeenCalled();
        const sidePanel = await getOnyxValue(ONYXKEYS.NVP_SIDE_PANEL);
        expect(sidePanel?.open).toBe(false);
    });

    it('should use the stored homePageNoRHP variant when the onboarding response does not carry one', async () => {
        // Given the variant was saved to Onyx earlier and the completion response has no variant of its own
        const navigate = jest.spyOn(Navigation, 'navigate');
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT, CONST.ONBOARDING_RHP_VARIANT.HOME_PAGE_NO_RHP);

        // When onboarding finishes without a variant override
        navigateAfterOnboarding(false, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);

        // Then the stored variant still applies and the user lands on Home rather than the admin room
        expect(navigate).toHaveBeenCalledWith(ROUTES.HOME, undefined);
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID), undefined);
    });
});
