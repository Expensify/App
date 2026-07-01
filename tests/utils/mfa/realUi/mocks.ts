import type {UseBiometricsReturn} from '@components/MultifactorAuthentication/biometrics/shared/types';

/**
 * Mutable mock seam plus jest.mock factory bodies for the model-based MFA UI test, kept out of the test
 * file so it reads as mock registrations plus test logic. The harness and event executors drive the
 * holders; each factory returns a ready-to-use mock module (`__esModule` + `default`) and is called from
 * a `jest.mock(..., () => require('.../mocks').xMock())` factory. Keeping the seam in one module means the
 * future "mock the backend responses" work has a single place to grow.
 */

type CapturedCallback = () => void;

let pendingCloseCallback: CapturedCallback | undefined;

/**
 * Holds the callback the modal navigator hands to `Navigation.runAfterUpcomingTransition` when it
 * starts closing. The real navigator runs it once the close animation ends. The test captures it and
 * runs it explicitly so the `closing` state stays observable and `MODAL_CLOSED` stays drivable from
 * the event map instead of resolving on a timer.
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
 * Stands in for the native / WebAuthn biometrics hook. Typed as the slice of `UseBiometricsReturn`
 * the flow reads during `INIT` (captureCredentialsState), so renaming a field on the real hook fails
 * the build here. New scenarios extend the Pick with the fields they exercise.
 */
const biometricsMock: Pick<UseBiometricsReturn, 'serverKnownCredentialIDs' | 'areLocalCredentialsKnownToServer'> = {
    serverKnownCredentialIDs: [],
    areLocalCredentialsKnownToServer: () => Promise.resolve(false),
};

function resetMfaUiMocks() {
    pendingModalClose.clear();
    biometricsMock.serverKnownCredentialIDs = [];
}

/** Native / WebAuthn biometrics are out of scope for the modal-lifecycle contract, so this returns the shared biometrics mock. */
function biometricsHookMock() {
    return {
        __esModule: true,
        default: () => biometricsMock,
    };
}

/** Browser/Android back-history wiring is a separate concern from the machine <-> UI contract. */
function syncHistoryMock() {
    return {
        __esModule: true,
        default: () => {},
    };
}

/**
 * Reuses the repo's shared Navigation manual mock (every method already a no-op jest.fn()) and overrides
 * only the two the flow drives with real behavior. Spreading the shared mock rather than a catch-all
 * Proxy means a Navigation method the flow starts to depend on but that the shared mock does not stub
 * surfaces as `undefined` (a loud failure) instead of a silent no-op.
 *
 * `runAfterTransition` runs its callback immediately (no active navigation transition in jsdom).
 * `runAfterUpcomingTransition` captures the navigator's teardown callback so MODAL_CLOSED is driven
 * from the event map, not a timer.
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
