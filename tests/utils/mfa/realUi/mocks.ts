import type {UseBiometricsReturn} from '@components/MultifactorAuthentication/biometrics/shared/types';

// This module keeps mutable mock state and factory bodies outside the test so the test stays focused on
// mock registrations and assertions.

type CapturedCallback = () => void;

let pendingCloseCallback: CapturedCallback | undefined;

/**
 * Captures the navigator's close callback so the test can observe `closing` before driving
 * `MODAL_CLOSED`.
 */
const pendingModalClose = {
    capture: (callback: CapturedCallback) => {
        pendingCloseCallback = callback;
    },
    run: () => {
        const callback = pendingCloseCallback;
        pendingCloseCallback = undefined;
        callback?.();
    },
    clear: () => {
        pendingCloseCallback = undefined;
    },
};

/**
 * Provides only the biometric values read during `INIT`. The `Pick` makes renamed hook fields fail type
 * checking.
 */
const biometricsMock: Pick<UseBiometricsReturn, 'serverKnownCredentialIDs' | 'areLocalCredentialsKnownToServer'> = {
    serverKnownCredentialIDs: [],
    areLocalCredentialsKnownToServer: () => Promise.resolve(false),
};

function resetMfaUiMocks() {
    pendingModalClose.clear();
    biometricsMock.serverKnownCredentialIDs = [];
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

/**
 * Reuses the shared Navigation stubs and overrides the two transition methods the flow needs to observe.
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
            runAfterTransition: (callback: () => void) => {
                callback();
                return {cancel: () => {}};
            },
            runAfterUpcomingTransition: (callback: () => void) => {
                pendingModalClose.capture(callback);
                return {cancel: () => pendingModalClose.clear()};
            },
        },
    };
}

export {pendingModalClose, biometricsMock, resetMfaUiMocks, biometricsHookMock, syncHistoryMock, navigationMock};
