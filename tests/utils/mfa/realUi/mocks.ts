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
 * Stands in for the native / WebAuthn biometrics hook. The flow only reads the credential fields
 * during `INIT` (captureCredentialsState). `authorize` is here for the scenarios that will later sign
 * a challenge through this seam.
 */
const biometricsMock = {
    serverKnownCredentialIDs: [] as string[],
    areLocalCredentialsKnownToServer: () => Promise.resolve(false),
    authorize: () => Promise.resolve(),
};

function resetMfaUiMocks() {
    pendingModalClose.clear();
    biometricsMock.serverKnownCredentialIDs = [];
}

export {pendingModalClose, biometricsMock, resetMfaUiMocks};
