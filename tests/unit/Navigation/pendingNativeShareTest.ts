import {
    deferPendingNativeShareUntilOnboardingExit,
    keepNativeShareForOnboardingExit,
    openPendingNativeShare,
    setPendingNativeShare,
    shouldParkNativeShare,
} from '@libs/Navigation/helpers/pendingNativeShare';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {runSessionCleanupCallbacks} from '@libs/SessionCleanup';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

// A user who signed in during this session, so a share that arrives while signed in is still parked until onboarding is settled.
jest.mock('@libs/SessionUtils', () => ({
    didUserLogInDuringSession: jest.fn(() => true),
}));

// Holds the callbacks that wait for a transition, so a test can decide when the welcome modal has finished closing.
const mockTransitionCallbacks: Array<() => void> = [];

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
            mockTransitionCallbacks.push(callback);
            return {cancel: jest.fn()};
        }),
    },
}));

function finishTransitions() {
    for (const callback of mockTransitionCallbacks.splice(0)) {
        callback();
    }
}

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
        // Resets the parked share and the "onboarding settled" mark, like a sign-out does.
        runSessionCleanupCallbacks();
        stateListeners.length = 0;
        mockTransitionCallbacks.length = 0;
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

    it('lets the onboarding exit open a share that is still pending', () => {
        // Given a share that was parked while onboarding was already on screen, so the router never got to defer it
        setPendingNativeShare();

        // When the onboarding exit runs
        const openedByExit = openPendingNativeShare({afterOnboarding: true});

        // Then the exit opens it instead of leaving it stranded, and the router finds nothing left to open
        expect(openedByExit).toBe(true);
        expect(openPendingNativeShare()).toBe(false);
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('does not start over when the same link is parked again', () => {
        // Given a share that onboarding already deferred
        setPendingNativeShare();
        deferPendingNativeShareUntilOnboardingExit();

        // When the link that parked it is processed again (DeepLinkHandler re-runs with the same launch URL)
        setPendingNativeShare();

        // Then it is still the onboarding exit's to open, not the router's
        expect(openPendingNativeShare()).toBe(false);
        expect(openPendingNativeShare({afterOnboarding: true})).toBe(true);
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('leaves the share to the onboarding exit while the onboarding modal is still on screen', () => {
        // Given a pending share, and onboarding that has just completed but whose modal has not been dismissed yet
        setPendingNativeShare();
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState(SCREENS.HOME, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR));

        // When the router rules onboarding out and tries to open the share
        const openedByRouter = openPendingNativeShare();

        // Then nothing is pushed over the onboarding modal, where the exit's dismiss would pop it again
        expect(openedByRouter).toBe(false);
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();

        // When the exit has dismissed the modal and navigated to the landing screen
        mockedNavigationRef.getRootState.mockReturnValue(buildRootState(SCREENS.HOME));
        const openedByExit = openPendingNativeShare({afterOnboarding: true});

        // Then the exit opens the share
        expect(openedByExit).toBe(true);
        expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_ROOT, {waitForTransition: true});
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

        // Then the push waits for the modal's closing transition, because the modal can navigate once it ends
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);

        // When that transition has finished
        finishTransitions();

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

        // When the modal is dismissed and its closing transition has finished
        emitRootState(SCREENS.HOME);
        finishTransitions();

        // Then the share flow is pushed again
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(2);
    });

    it('does not push after the welcome modal closes if the user signed out in the meantime', () => {
        // Given a push that a welcome modal redirected, and the modal is then dismissed
        setPendingNativeShare();
        openPendingNativeShare();
        emitRootState(SCREENS.HOME, NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR);
        emitRootState(SCREENS.HOME);

        // When the session ends before the closing transition finishes
        runSessionCleanupCallbacks();
        finishTransitions();

        // Then nothing is pushed for the next account
        expect(mockedNavigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('gives up instead of looping when the push keeps being redirected', () => {
        // Given a push that is redirected into a welcome modal every time
        setPendingNativeShare();
        openPendingNativeShare();
        for (let i = 0; i < 4; i++) {
            emitRootState(SCREENS.HOME, NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR);
            emitRootState(SCREENS.HOME);
            finishTransitions();
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

    describe('share flow removed by onboarding', () => {
        it('keeps a share flow that the onboarding redirect drops, for the onboarding exit', () => {
            // Given a share flow that is already open, whoever opened it (on HybridApp the link is routed right after sign-in)
            // When OnboardingGuard redirects to onboarding, which rebuilds the stack without the share flow
            keepNativeShareForOnboardingExit();

            // Then the share is not lost: the router leaves it alone and the onboarding exit reopens it
            expect(openPendingNativeShare()).toBe(false);
            expect(mockedNavigation.navigate).not.toHaveBeenCalled();
            expect(openPendingNativeShare({afterOnboarding: true})).toBe(true);
            expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.SHARE_ROOT, {waitForTransition: true});
        });

        it('keeps a share this module pushed itself when the push is redirected to onboarding', () => {
            // Given a pending share whose push is in flight
            setPendingNativeShare();
            openPendingNativeShare();

            // When OnboardingGuard redirects that push to onboarding, and the user then finishes onboarding
            keepNativeShareForOnboardingExit();
            emitRootState(SCREENS.HOME, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
            mockedNavigationRef.getRootState.mockReturnValue(buildRootState(SCREENS.HOME));

            // Then the onboarding exit opens it again
            expect(openPendingNativeShare({afterOnboarding: true})).toBe(true);
            expect(mockedNavigation.navigate).toHaveBeenCalledTimes(2);
        });
    });

    describe('shares that arrive after onboarding is settled', () => {
        it('stops parking shares once the router has ruled onboarding out', () => {
            // Given a user who signed in during this session, whose shares are parked until onboarding is settled
            expect(shouldParkNativeShare(true)).toBe(true);

            // When the router rules onboarding out
            openPendingNativeShare();

            // Then a share that arrives later opens straight away
            expect(shouldParkNativeShare(true)).toBe(false);
        });

        it('keeps parking shares while the onboarding modal is still on screen', () => {
            // Given onboarding that has completed but whose modal is still mounted
            mockedNavigationRef.getRootState.mockReturnValue(buildRootState(SCREENS.HOME, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR));

            // When the router rules onboarding out
            openPendingNativeShare();

            // Then a share that arrives now is still parked, until the onboarding exit has run
            expect(shouldParkNativeShare(true)).toBe(true);
            openPendingNativeShare({afterOnboarding: true});
            expect(shouldParkNativeShare(true)).toBe(false);
        });
    });
});
