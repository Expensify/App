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

const stateListeners: Array<() => void> = [];

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: jest.fn(() => true),
        getRootState: jest.fn(() => ({routes: [{key: 'home', name: 'Home'}]})),
        addListener: jest.fn((_event: string, listener: () => void) => {
            stateListeners.push(listener);
            return () => {
                const index = stateListeners.indexOf(listener);
                if (index !== -1) {
                    stateListeners.splice(index, 1);
                }
            };
        }),
    },
}));

const mockedNavigation = jest.mocked(Navigation);
const mockedNavigationRef = jest.mocked(navigationRef);

type RootState = ReturnType<typeof navigationRef.getRootState>;

function buildRootState(...routeNames: string[]): RootState {
    return {
        key: 'root',
        index: routeNames.length - 1,
        routeNames,
        routes: routeNames.map((name) => ({key: name, name})),
        stale: false,
        type: 'stack',
    };
}

/** Replaces the root state and notifies the navigation state listeners, like react-navigation does after a dispatch. */
function emitRootState(...routeNames: string[]) {
    mockedNavigationRef.getRootState.mockReturnValue(buildRootState(...routeNames));
    for (const listener of [...stateListeners]) {
        listener();
    }
}

describe('pending native share', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearPendingNativeShare();
        stateListeners.length = 0;
        mockedNavigationRef.isReady.mockReturnValue(true);
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState(SCREENS.HOME));
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
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState(SCREENS.HOME, NAVIGATORS.SHARE_MODAL_NAVIGATOR));

        // When it is opened
        const opened = openPendingNativeShare();

        // Then the intent is consumed without navigating, because the mounted flow already re-reads the staged file
        expect(opened).toBe(true);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
    });

    it('consumes the intent once the share flow is in the root state', () => {
        // Given a pending share that was pushed
        setPendingNativeShare();
        openPendingNativeShare();

        // When the push is accepted and the ShareModalNavigator mounts
        emitRootState(SCREENS.HOME, NAVIGATORS.SHARE_MODAL_NAVIGATOR);

        // Then the intent is spent and nothing watches navigation state any more
        expect(stateListeners).toHaveLength(0);
        expect(openPendingNativeShare()).toBe(false);
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('does not retry on unrelated state changes while the push is in flight', () => {
        // Given a pending share that was pushed with waitForTransition (e.g. right after the post-onboarding landing)
        setPendingNativeShare();
        openPendingNativeShare();

        // When unrelated navigation settles before the share push is dispatched
        emitRootState(SCREENS.HOME, NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

        // Then the push is not duplicated
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
        expect(stateListeners).toHaveLength(1);
    });

    it('keeps the intent and pushes again after a welcome modal redirected the push', () => {
        // Given a migrated user whose welcome modal guard redirects the first navigation into its modal
        setPendingNativeShare();
        openPendingNativeShare();
        emitRootState(SCREENS.HOME, NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR);

        // Then the intent is not spent while the modal is up
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
        expect(openPendingNativeShare()).toBe(false);

        // When the user dismisses the modal
        emitRootState(SCREENS.HOME);

        // Then the share flow is pushed again, and consumed once it mounts
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(2);
        expect(mockedNavigation.navigate).toHaveBeenLastCalledWith(ROUTES.SHARE_ROOT, {waitForTransition: true});
        emitRootState(SCREENS.HOME, NAVIGATORS.SHARE_MODAL_NAVIGATOR);
        expect(stateListeners).toHaveLength(0);
        expect(openPendingNativeShare()).toBe(false);
    });

    it('pushes again after a welcome modal that was already open blocked the push', () => {
        // Given the Submit-plan welcome modal is already on top, where its guard blocks every push behind it
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState(SCREENS.HOME, NAVIGATORS.SUBMIT_PLAN_MODAL_NAVIGATOR));
        setPendingNativeShare();
        openPendingNativeShare();
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);

        // When the modal is dismissed
        emitRootState(SCREENS.HOME);

        // Then the share flow is pushed again
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(2);
    });

    it('gives up instead of looping when the push keeps being redirected', () => {
        // Given a push that is redirected into a welcome modal every time
        setPendingNativeShare();
        openPendingNativeShare();
        for (let i = 0; i < 4; i++) {
            emitRootState(SCREENS.HOME, NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR);
            emitRootState(SCREENS.HOME);
        }

        // Then the attempts are capped and the intent is dropped rather than retried forever
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(3);
        expect(stateListeners).toHaveLength(0);
        expect(openPendingNativeShare()).toBe(false);
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

    it('stops watching navigation state on sign-out while a push is in flight', () => {
        // Given a share that was pushed but has not mounted yet
        setPendingNativeShare();
        openPendingNativeShare();
        expect(stateListeners).toHaveLength(1);

        // When the session is cleaned up
        runSessionCleanupCallbacks();

        // Then the watcher is gone and a later state change cannot push the share for the next account
        expect(stateListeners).toHaveLength(0);
        emitRootState(SCREENS.HOME);
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
    });
});
