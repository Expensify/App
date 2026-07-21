import {openReportFromDeepLink} from '@libs/actions/Link';
import {navigateAfterOnboarding} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {clearPendingConciergeDeepLink, setPendingConciergeDeepLink, setPendingHomeDeepLinkIfNoPendingConcierge} from '@libs/PendingConciergeDeepLink';
import type * as PendingConciergeDeepLink from '@libs/PendingConciergeDeepLink';
import type * as ReportUtils from '@libs/ReportUtils';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const ONBOARDING_ADMINS_CHAT_REPORT_ID = '1';
const ONBOARDING_POLICY_ID = '2';
const REPORT_ID = '3';
const USER_ID = '4';
const mockFindLastAccessedReport = jest.fn<OnyxEntry<Report>, Parameters<typeof ReportUtils.findLastAccessedReport>>();
const mockShouldOpenOnAdminRoom = jest.fn();
const mockIsReportTopmostSplitNavigator = jest.fn(() => false);

function mockBrowserReloadNavigation(useLegacyFallback = false) {
    const originalGetEntriesByType = Object.getOwnPropertyDescriptor(window.performance, 'getEntriesByType');
    const originalNavigation = Object.getOwnPropertyDescriptor(window.performance, 'navigation');
    Object.defineProperty(window.performance, 'getEntriesByType', {
        configurable: true,
        value: jest.fn((type: string) => {
            if (type !== 'navigation') {
                return [];
            }
            return useLegacyFallback ? [] : [{type: 'reload'} as unknown as PerformanceNavigationTiming];
        }),
    });

    if (useLegacyFallback) {
        Object.defineProperty(window.performance, 'navigation', {
            configurable: true,
            value: {type: 1},
        });
    }

    return () => {
        if (originalGetEntriesByType) {
            Object.defineProperty(window.performance, 'getEntriesByType', originalGetEntriesByType);
        } else {
            Reflect.deleteProperty(window.performance, 'getEntriesByType');
        }

        if (originalNavigation) {
            Object.defineProperty(window.performance, 'navigation', originalNavigation);
        } else {
            Reflect.deleteProperty(window.performance, 'navigation');
        }
    };
}

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
    getReportIDFromLink: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getReportIDFromLink,
    getRouteFromLink: jest.requireActual<typeof ReportUtils>('@libs/ReportUtils').getRouteFromLink,
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
    default: () => mockShouldOpenOnAdminRoom() as boolean,
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
        clearPendingConciergeDeepLink();
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        return Onyx.clear();
    });

    it('should navigate to the admin room report if onboardingAdminsChatReportID is provided', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const testSession = {email: 'realaccount@gmail.com'};

        navigateAfterOnboarding(false, true, '', {}, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, (testSession?.email ?? '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
    });

    it('should navigate to home if onboardingAdminsChatReportID is not provided on larger screens and no report is topmost', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');

        navigateAfterOnboarding(false, true, '', {}, undefined, undefined);
        // Without an admins chat report, we fall back to HOME to trigger guard evaluation instead of opening a report.
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
        expect(navigate).toHaveBeenCalledWith(ROUTES.HOME);
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
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should pass reportNameValuePairs when looking up last accessed report', () => {
        const reportNameValuePairs = {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${REPORT_ID}`]: {private_isArchived: '2024-02-01 04:56:47.233'}};
        mockFindLastAccessedReport.mockReturnValue(undefined);
        mockShouldOpenOnAdminRoom.mockReturnValue(false);

        navigateAfterOnboarding(true, true, '', reportNameValuePairs, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID);

        expect(mockFindLastAccessedReport).toHaveBeenCalledWith(false, false, undefined, reportNameValuePairs);
    });

    it('should navigate to Concierge room if user uses a test email', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const lastAccessedReport = {reportID: REPORT_ID};
        mockFindLastAccessedReport.mockReturnValue(lastAccessedReport);
        mockShouldOpenOnAdminRoom.mockReturnValue(true);
        const testSession = {email: 'test+account@gmail.com'};

        navigateAfterOnboarding(true, true, '', {}, ONBOARDING_POLICY_ID, ONBOARDING_ADMINS_CHAT_REPORT_ID, (testSession?.email ?? '').includes('+'));
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should navigate to the admin room when the inboxAdminsBespoke variant is assigned', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        navigateAfterOnboarding(false, true, '', {}, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID, false, CONST.ONBOARDING_RHP_VARIANT.INBOX_ADMINS_BESPOKE);
        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
    });

    it('should navigate to Concierge instead of Home when a pending Concierge deep link is available', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        setPendingConciergeDeepLink();

        navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, undefined);

        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.HOME);
    });

    it('should navigate to Concierge route when pending deep link is set but conciergeReportID is empty', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        setPendingConciergeDeepLink();

        navigateAfterOnboarding(false, true, '', {}, undefined, undefined);

        expect(navigate).toHaveBeenCalledWith(ROUTES.CONCIERGE);
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.HOME);
    });

    it('should consume the pending Concierge deep link after onboarding navigation', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        setPendingConciergeDeepLink();

        navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, undefined);
        navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, undefined);

        expect(navigate).toHaveBeenNthCalledWith(1, ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
        expect(navigate).toHaveBeenNthCalledWith(2, ROUTES.HOME);
    });

    it('should preserve the pending Concierge deep link across a module reload', () => {
        setPendingConciergeDeepLink();

        jest.isolateModules(() => {
            const {consumePendingConciergeDeepLink: consumePendingConciergeDeepLinkAfterReload} = jest.requireActual<typeof PendingConciergeDeepLink>('@libs/PendingConciergeDeepLink');
            expect(consumePendingConciergeDeepLinkAfterReload()).toBe(true);
        });

        expect(window.sessionStorage.getItem('PENDING_CONCIERGE_DEEP_LINK')).toBeNull();
        clearPendingConciergeDeepLink();
    });

    it('should preserve a pending Concierge deep link when a generated home route is processed during reload', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        setPendingConciergeDeepLink();

        openReportFromDeepLink(`${CONST.NEW_EXPENSIFY_URL}/${ROUTES.HOME}`, {}, false, REPORT_ID, undefined, undefined, undefined);
        navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, undefined);

        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.HOME);
    });

    it('should not let an ambiguous home fallback override a pending Concierge deep link', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        setPendingConciergeDeepLink();

        setPendingHomeDeepLinkIfNoPendingConcierge();
        navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, undefined);

        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.HOME);
    });

    it('should clear a stale pending Concierge deep link when opening root before onboarding finishes', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        setPendingConciergeDeepLink();

        openReportFromDeepLink(`${CONST.NEW_EXPENSIFY_URL}/`, {}, false, REPORT_ID, undefined, undefined, undefined);
        navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, undefined);

        expect(navigate).toHaveBeenCalledWith(ROUTES.HOME);
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });

    it('should preserve a pending Concierge deep link when root is replayed during a browser reload', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const restoreBrowserNavigation = mockBrowserReloadNavigation();
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        setPendingConciergeDeepLink();

        try {
            openReportFromDeepLink(`${CONST.NEW_EXPENSIFY_URL}/`, {}, false, REPORT_ID, undefined, undefined, undefined);
            navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, undefined);

            expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
            expect(navigate).not.toHaveBeenCalledWith(ROUTES.HOME);
        } finally {
            restoreBrowserNavigation();
        }
    });

    it('should preserve a pending Concierge deep link when browser reload is only available from the legacy navigation API', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        const restoreBrowserNavigation = mockBrowserReloadNavigation(true);
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        setPendingConciergeDeepLink();

        try {
            openReportFromDeepLink(`${CONST.NEW_EXPENSIFY_URL}/`, {}, false, REPORT_ID, undefined, undefined, undefined);
            navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, undefined);

            expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
            expect(navigate).not.toHaveBeenCalledWith(ROUTES.HOME);
        } finally {
            restoreBrowserNavigation();
        }
    });

    it('should let the normal onboarding destination win after root clears a stale pending Concierge deep link', () => {
        const navigate = jest.spyOn(Navigation, 'navigate');
        setPendingConciergeDeepLink();

        openReportFromDeepLink(`${CONST.NEW_EXPENSIFY_URL}/`, {}, false, REPORT_ID, undefined, undefined, undefined);
        navigateAfterOnboarding(false, true, REPORT_ID, {}, undefined, ONBOARDING_ADMINS_CHAT_REPORT_ID);

        expect(navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ONBOARDING_ADMINS_CHAT_REPORT_ID));
        expect(navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(REPORT_ID));
    });
});
