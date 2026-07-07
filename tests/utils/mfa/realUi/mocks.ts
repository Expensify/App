import type {UseBiometricsReturn} from '@components/MultifactorAuthentication/biometrics/shared/types';
import type Navigation from '@libs/Navigation/Navigation';

// This module keeps mutable mock state and factory bodies outside the test so the test stays focused on
// mock registrations and assertions.

type CapturedCallback = () => void;
type NavigationTransitionOverrides = Pick<typeof Navigation, 'runAfterTransition' | 'runAfterUpcomingTransition'>;

let pendingCloseCallback: CapturedCallback | undefined;

/**
 * Captures the callback scheduled by the navigator through `runAfterUpcomingTransition`
 * while the machine is `closing`. The `MODAL_CLOSED` executor runs it, causing the
 * navigator to send `MODAL_CLOSED` and complete the transition to `closed`.
 */
const pendingModalClose = {
    capture: (callback: CapturedCallback) => {
        pendingCloseCallback = callback;
    },
    run: () => {
        const callback = pendingCloseCallback;
        pendingCloseCallback = undefined;
        if (!callback) {
            throw new Error('No close callback was captured. The navigator schedules it through Navigation.runAfterUpcomingTransition when it enters the closing state.');
        }
        callback();
    },
    clear: () => {
        pendingCloseCallback = undefined;
    },
};

/**
 * Provides only the biometric values captured for telemetry while preparing `INIT`. They do not
 * currently affect machine transitions. The `Pick` makes renamed hook fields fail type checking.
 */
const biometricsMock: Pick<UseBiometricsReturn, 'serverKnownCredentialIDs' | 'areLocalCredentialsKnownToServer'> = {
    serverKnownCredentialIDs: [],
    areLocalCredentialsKnownToServer: () => Promise.resolve(false),
};

function resetMfaUiMocks() {
    pendingModalClose.clear();
}

function biometricsHookMock() {
    return {
        __esModule: true,
        default: () => biometricsMock,
    };
}

function syncHistoryMock() {
    return {
        __esModule: true,
        default: () => {},
    };
}

const navigationTransitionOverrides = {
    runAfterTransition: (callback) => {
        callback();
        return {cancel: () => {}};
    },
    runAfterUpcomingTransition: (callback) => {
        pendingModalClose.capture(callback);
        return {cancel: () => pendingModalClose.clear()};
    },
} satisfies NavigationTransitionOverrides;

/**
 * Reuses the shared Navigation stubs and adds the transition methods the flow needs to observe.
 * `runAfterTransition` runs its callback immediately because jsdom has no real transition, while
 * `runAfterUpcomingTransition` captures the teardown callback so the `closing` state stays observable.
 * Missing methods remain undefined so new dependencies fail explicitly.
 */
function navigationMock() {
    const sharedNavigationMock = jest.requireActual<{default: Record<string, unknown>}>('@libs/Navigation/__mocks__/Navigation').default;
    return {
        __esModule: true,
        default: {
            ...sharedNavigationMock,
            ...navigationTransitionOverrides,
        },
    };
}

export {pendingModalClose, resetMfaUiMocks, biometricsHookMock, syncHistoryMock, navigationMock};
