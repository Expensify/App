import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import {clearPendingPostOnboardingRoute, getAndClearPendingPostOnboardingRoute, openReportFromDeepLink, setPendingPostOnboardingRoute} from '@userActions/Link';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

const mockWaitForUserSignIn = jest.fn<Promise<void>, []>(() => Promise.resolve());
const mockIsAnonymousUser = jest.fn(() => false);
const mockHasCompletedGuidedSetupFlowSelector = jest.fn<
    (val: OnyxEntry<{hasCompletedGuidedSetupFlow?: boolean}>) => boolean | undefined,
    [OnyxEntry<{hasCompletedGuidedSetupFlow?: boolean}>]
>();

jest.mock('@libs/actions/Session', () => ({
    waitForUserSignIn: () => mockWaitForUserSignIn(),
    isAnonymousUser: () => mockIsAnonymousUser(),
    canAnonymousUserAccessRoute: jest.fn(() => true),
    signOutAndRedirectToSignIn: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    doneCheckingPublicRoom: jest.fn(),
    navigateToConciergeChat: jest.fn(),
    openReport: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    waitForProtectedRoutes: jest.fn(() => Promise.resolve()),
    getTopmostReportId: jest.fn(),
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    getRootState: jest.fn(() => ({
        key: 'root',
        index: 0,
        routeNames: ['Home'],
        routes: [{key: 'home-0', name: 'Home'}],
        stale: false,
        type: 'stack',
    })),
}));

jest.mock('@src/selectors/Onboarding', () => ({
    hasCompletedGuidedSetupFlowSelector: (val: OnyxEntry<{hasCompletedGuidedSetupFlow?: boolean}>) => mockHasCompletedGuidedSetupFlowSelector(val),
}));

describe('Link pending post-onboarding route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearPendingPostOnboardingRoute();
        mockIsAnonymousUser.mockReturnValue(false);
    });

    it('should store, return, and clear a pending post-onboarding route', () => {
        setPendingPostOnboardingRoute(ROUTES.CONCIERGE);
        expect(getAndClearPendingPostOnboardingRoute()).toBe(ROUTES.CONCIERGE);
        expect(getAndClearPendingPostOnboardingRoute()).toBeUndefined();
    });

    it('should clear a pending post-onboarding route without returning it', () => {
        setPendingPostOnboardingRoute(ROUTES.CONCIERGE);
        clearPendingPostOnboardingRoute();
        expect(getAndClearPendingPostOnboardingRoute()).toBeUndefined();
    });

    it('should save a pending Concierge route when a pre-onboarding deep link is dropped', async () => {
        const onboardingCallback = jest.fn();
        jest.spyOn(Onyx, 'connectWithoutView').mockImplementation(({callback}) => {
            onboardingCallback.mockImplementation(callback);
            return 1;
        });
        jest.spyOn(Onyx, 'disconnect').mockImplementation(() => {});

        openReportFromDeepLink('https://new.expensify.com/concierge', {}, false, undefined, undefined, undefined, undefined);

        await mockWaitForUserSignIn.mock.results[0]?.value;

        onboardingCallback({hasCompletedGuidedSetupFlow: false});
        expect(getAndClearPendingPostOnboardingRoute()).toBeUndefined();

        mockHasCompletedGuidedSetupFlowSelector.mockReturnValue(true);
        onboardingCallback({hasCompletedGuidedSetupFlow: true});

        await Navigation.waitForProtectedRoutes();

        expect(getAndClearPendingPostOnboardingRoute()).toBe(ROUTES.CONCIERGE);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Onyx.connectWithoutView).toHaveBeenCalledWith(expect.objectContaining({key: ONYXKEYS.NVP_ONBOARDING}));
        expect(navigationRef.getRootState).toHaveBeenCalled();
    });
});
