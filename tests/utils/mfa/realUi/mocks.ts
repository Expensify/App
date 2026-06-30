import type {UseBiometricsReturn} from '@components/MultifactorAuthentication/biometrics/shared/types';

/**
 * Shared, mutable mock seam for the model-based MFA UI test. The jest.mock factories in `jestMocks`
 * read from these holders, and the harness / event executors drive them. Keeping the seam in one
 * module means the future "mock the backend responses" work has a single place to grow.
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

export {pendingModalClose, biometricsMock, resetMfaUiMocks};
