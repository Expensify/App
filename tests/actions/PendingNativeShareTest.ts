import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {runSessionCleanupCallbacks} from '@libs/SessionCleanup';

import {clearPendingNativeShare, deferPendingNativeShareUntilOnboardingExit, openPendingNativeShare, setPendingNativeShare} from '@userActions/Share';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: jest.fn(() => true),
        getRootState: jest.fn(() => ({routes: [{key: 'home', name: 'Home'}]})),
    },
}));

const mockedNavigation = jest.mocked(Navigation);
const mockedNavigationRef = jest.mocked(navigationRef);

describe('pending native share', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearPendingNativeShare();
        mockedNavigationRef.isReady.mockReturnValue(true);
        mockedNavigationRef.getRootState.mockReturnValue({key: 'root', index: 0, routeNames: [SCREENS.HOME], routes: [{key: 'home', name: SCREENS.HOME}], stale: false, type: 'stack'});
    });

    it('does nothing when no native share is pending', () => {
        // Given no share was captured while signed out

        // When either consumer runs
        const openedNow = openPendingNativeShare();
        const openedAfterOnboarding = openPendingNativeShare({afterOnboarding: true});

        // Then nothing is opened, so every ordinary sign-in and onboarding exit is unaffected
        expect(openedNow).toBe(false);
        expect(openedAfterOnboarding).toBe(false);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it('opens a pending share exactly once', () => {
        // Given a share captured while signed out
        setPendingNativeShare();

        // When the signed-in app opens it, and something tries to open it again
        const openedFirst = openPendingNativeShare();
        const openedAgain = openPendingNativeShare();

        // Then the share flow is pushed a single time, after any in-flight transition
        expect(openedFirst).toBe(true);
        expect(openedAgain).toBe(false);
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_ROOT, {waitForTransition: true});
    });

    it('hands a share deferred by onboarding to the onboarding exit only', () => {
        // Given a share captured while signed out for a user who still needs onboarding
        setPendingNativeShare();
        deferPendingNativeShareUntilOnboardingExit();

        // When the onboarding router re-evaluates (e.g. once onboarding completes) before the exit has run
        const openedByRouter = openPendingNativeShare();

        // Then the router must not open it, so it cannot race the landing navigation of the onboarding exit
        expect(openedByRouter).toBe(false);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();

        // When the onboarding exit runs
        const openedByExit = openPendingNativeShare({afterOnboarding: true});

        // Then the share opens on top of the landing screen, once
        expect(openedByExit).toBe(true);
        expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_ROOT, {waitForTransition: true});
        expect(openPendingNativeShare({afterOnboarding: true})).toBe(false);
    });

    it('leaves a share that was never deferred to the onboarding router', () => {
        // Given a share captured while signed out for a user who does not need onboarding
        setPendingNativeShare();

        // When an onboarding exit runs anyway (e.g. a completed user re-entering a task screen)
        const openedByExit = openPendingNativeShare({afterOnboarding: true});

        // Then the exit leaves it alone and the router still opens it
        expect(openedByExit).toBe(false);
        expect(openPendingNativeShare()).toBe(true);
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('only defers a share that is actually pending', () => {
        // Given no share was captured
        deferPendingNativeShareUntilOnboardingExit();

        // When the onboarding exit runs
        // Then nothing is opened: deferring must not conjure a share out of nothing
        expect(openPendingNativeShare({afterOnboarding: true})).toBe(false);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it('does not push a second share modal when the share flow is already mounted', () => {
        // Given a pending share while the ShareModalNavigator is already in the root stack
        setPendingNativeShare();
        mockedNavigationRef.getRootState.mockReturnValue({
            key: 'root',
            index: 1,
            routeNames: [SCREENS.HOME, NAVIGATORS.SHARE_MODAL_NAVIGATOR],
            routes: [
                {key: 'home', name: SCREENS.HOME},
                {key: 'share', name: NAVIGATORS.SHARE_MODAL_NAVIGATOR},
            ],
            stale: false,
            type: 'stack',
        });

        // When it is opened
        const opened = openPendingNativeShare();

        // Then the intent is consumed without navigating, because the mounted flow already re-reads the staged file
        expect(opened).toBe(true);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it('is cleared on sign-out so it cannot replay for the next account', () => {
        // Given a share captured while signed out
        setPendingNativeShare();

        // When the session is cleaned up
        runSessionCleanupCallbacks();

        // Then nothing opens for whoever signs in next
        expect(openPendingNativeShare()).toBe(false);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });
});
