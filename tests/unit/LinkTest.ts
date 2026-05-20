import Navigation from '@libs/Navigation/Navigation';
import asyncOpenURL from '@libs/asyncOpenURL';
import {getInternalNewExpensifyPath, openLink} from '@libs/actions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@react-navigation/native', () => ({
    findFocusedRoute: jest.fn(),
}));
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        connectWithoutView: jest.fn(() => 1),
        disconnect: jest.fn(),
    },
}));
jest.mock('@libs/asyncOpenURL', () => jest.fn());
jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
}));
jest.mock('@libs/API/types', () => ({
    READ_COMMANDS: {
        SEARCH_FOR_REPORTS: 'SearchForReports',
        SEARCH_FOR_USERS: 'SearchForUsers',
    },
    SIDE_EFFECT_REQUEST_COMMANDS: {
        GENERATE_SPOTNANA_TOKEN: 'GenerateSpotnanaToken',
        OPEN_OLD_DOT_LINK: 'OpenOldDotLink',
        RECONNECT_APP: 'ReconnectApp',
    },
    WRITE_COMMANDS: {
        OPEN_APP: 'OpenApp',
        OPEN_REPORT: 'OpenReport',
    },
}));
jest.mock('@libs/isPublicScreenRoute', () => jest.fn(() => false));
jest.mock('@libs/getIsNarrowLayout', () => jest.fn(() => true));
jest.mock('@libs/Navigation/helpers/isNavigatorName', () => ({
    isOnboardingFlowName: jest.fn(() => false),
}));
jest.mock('@libs/Navigation/helpers/shouldOpenOnAdminRoom', () => jest.fn(() => false));
jest.mock('@libs/Navigation/helpers/willRouteNavigateToRHP', () => jest.fn(() => false));
jest.mock('@libs/Navigation/navigationRef', () => ({
    getRootState: jest.fn(() => ({routes: []})),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    closeRHPFlow: jest.fn(),
}));
jest.mock('@libs/NetworkState', () => ({
    getIsOffline: jest.fn(() => false),
}));
jest.mock('@libs/actions/Session', () => ({
    canAnonymousUserAccessRoute: jest.fn(() => true),
    isAnonymousUser: jest.fn(() => false),
    signOutAndRedirectToSignIn: jest.fn(),
    waitForUserSignIn: jest.fn(),
}));
jest.mock('@libs/actions/Report', () => ({
    doneCheckingPublicRoom: jest.fn(),
    navigateToConciergeChat: jest.fn(),
    openReport: jest.fn(),
}));
jest.mock('@libs/actions/Welcome', () => ({
    setOnboardingErrorMessage: jest.fn(),
}));
jest.mock('@libs/ReportUtils', () => ({
    findLastAccessedReport: jest.fn(),
    getReportIDFromLink: jest.fn(() => ''),
    getRouteFromLink: jest.fn(() => ''),
}));
jest.mock('@libs/shouldSkipDeepLinkNavigation', () => jest.fn(() => false));
jest.mock('@libs/telemetry/activeSpans', () => ({
    endSpan: jest.fn(),
    getSpan: jest.fn(),
    startSpan: jest.fn(),
}));
jest.mock('@src/selectors/Onboarding', () => ({
    hasCompletedGuidedSetupFlowSelector: jest.fn(() => true),
}));

describe('Link actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getInternalNewExpensifyPath', () => {
        it('returns the route path for New Expensify links without a protocol', () => {
            expect(getInternalNewExpensifyPath('new.expensify.com/settings/wallet')).toBe(ROUTES.SETTINGS_WALLET);
        });

        it('returns the route path for protocol-relative New Expensify links', () => {
            expect(getInternalNewExpensifyPath('//new.expensify.com/settings/wallet')).toBe(ROUTES.SETTINGS_WALLET);
        });
    });

    describe('openLink', () => {
        it('navigates New Expensify links internally when the link origin differs from the current environment', () => {
            openLink(`https://new.expensify.com/${ROUTES.SETTINGS_WALLET}`, CONST.STAGING_NEW_EXPENSIFY_URL);

            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET);
            expect(asyncOpenURL).not.toHaveBeenCalled();
        });
    });
});
