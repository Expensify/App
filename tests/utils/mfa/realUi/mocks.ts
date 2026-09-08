import type {UseBiometricsReturn} from '@components/MultifactorAuthentication/biometrics/shared/types';
import type createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import type {
    AuthorizeInput,
    AuthorizeOutput,
    CreateCredentialInput,
    CreateCredentialOutput,
    LoadRegistrationStateInput,
    LoadRegistrationStateOutput,
    RequestRegistrationChallengeInput,
    RequestRegistrationChallengeOutput,
    ValidateDeviceInput,
} from '@components/MultifactorAuthentication/machine/types';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type Navigation from '@libs/Navigation/Navigation';

import {useEffect} from 'react';
import {fromPromise} from 'xstate';

// This module keeps mutable mock state and factory bodies outside the test so the test stays focused on
// mock registrations and assertions.

type CapturedCallback = () => void;
type NavigationTransitionOverrides = Pick<typeof Navigation, 'runAfterTransition' | 'runAfterUpcomingTransition'>;
type PendingCall<TOutput> = {
    resolve: (output: TOutput) => void;
    reject: (error: Error) => void;
};

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

let pendingRegistrationStateCapture: ((hasLocalCredentials: boolean) => void) | undefined;

/** Lets a test hold the Provider's pre-INIT registration-state snapshot across an account switch. */
const registrationStateCaptureControl = {
    defer: () => {
        biometricsMock.areLocalCredentialsKnownToServer = () =>
            new Promise<boolean>((resolve) => {
                pendingRegistrationStateCapture = resolve;
            });
    },
    resolve: (hasLocalCredentials: boolean) => {
        const resolve = pendingRegistrationStateCapture;
        pendingRegistrationStateCapture = undefined;
        if (!resolve) {
            throw new Error('No pending registration-state capture is available.');
        }
        resolve(hasLocalCredentials);
    },
    reset: () => {
        pendingRegistrationStateCapture = undefined;
        biometricsMock.areLocalCredentialsKnownToServer = () => Promise.resolve(false);
    },
};

/**
 * Builds a controlled deferred mock for one invoked machine actor. Each machine invocation parks a
 * pending promise that the test settles later through `resolve` or `reject`, at the exact path step
 * where the machine expects the actor outcome.
 */
function createControlledActor<TOutput, TInput>(actorID: string) {
    let pendingCall: PendingCall<TOutput> | undefined;

    function takePendingCall(): PendingCall<TOutput> {
        const call = pendingCall;
        pendingCall = undefined;
        if (!call) {
            throw new Error(`No pending ${actorID} call is available.`);
        }
        return call;
    }

    return {
        actor: fromPromise<TOutput, TInput>(
            () =>
                new Promise<TOutput>((resolve, reject) => {
                    pendingCall = {resolve, reject};
                }),
        ),
        resolve: (output: TOutput) => takePendingCall().resolve(output),
        reject: () => takePendingCall().reject(new Error(`Mock ${actorID} actor rejected for this path`)),
        reset: () => {
            pendingCall = undefined;
        },
    };
}

const validateDeviceControl = createControlledActor<MFAResult, ValidateDeviceInput>('validateDevice');
const loadRegistrationStateControl = createControlledActor<LoadRegistrationStateOutput, LoadRegistrationStateInput>('loadRegistrationState');
const requestRegistrationChallengeControl = createControlledActor<RequestRegistrationChallengeOutput, RequestRegistrationChallengeInput>('requestRegistrationChallenge');
const createCredentialControl = createControlledActor<CreateCredentialOutput, CreateCredentialInput>('createCredential');
const authorizeControl = createControlledActor<AuthorizeOutput, AuthorizeInput>('authorize');

function resetMfaUiMocks() {
    pendingModalClose.clear();
    registrationStateCaptureControl.reset();
    validateDeviceControl.reset();
    loadRegistrationStateControl.reset();
    requestRegistrationChallengeControl.reset();
    createCredentialControl.reset();
    authorizeControl.reset();
}

/** Replaces the machine's side-effect actors with controlled test implementations. */
function mfaActorsMock() {
    const actors = {
        validateDevice: validateDeviceControl.actor,
        loadRegistrationState: loadRegistrationStateControl.actor,
        requestRegistrationChallenge: requestRegistrationChallengeControl.actor,
        createCredential: createCredentialControl.actor,
        authorize: authorizeControl.actor,
    } satisfies ReturnType<typeof createActors>;

    return {
        __esModule: true,
        default: () => actors,
    };
}

function biometricsHookMock() {
    return {
        __esModule: true,
        default: () => biometricsMock,
    };
}

/**
 * Stubs only the validate-code email request. It is a backend call outside the modal lifecycle
 * contract, and the machine fires it when the walk enters the validate-code screen.
 */
function userActionsMock() {
    return {
        ...jest.requireActual<Record<string, unknown>>('@libs/actions/User'),
        requestValidateCodeAction: jest.fn(),
    };
}

function renderHtmlMock() {
    return {
        __esModule: true,
        default: () => null,
    };
}

/**
 * Replaces the resend countdown, a real-time presentational timer outside the modal lifecycle
 * contract. Finishing it immediately keeps the resend button pressable for the walk.
 */
function validateCodeCountdownMock() {
    function ImmediatelyFinishedCountdown({onCountdownFinish}: {onCountdownFinish: () => void}) {
        // Babel memoizes this nested mock component while OXC does not detect it. Memoization is unnecessary here, so opt out to keep both compilers aligned.
        'use no memo';

        useEffect(() => {
            onCountdownFinish();
        }, [onCountdownFinish]);
        return null;
    }
    return {
        __esModule: true,
        default: ImmediatelyFinishedCountdown,
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

export {
    pendingModalClose,
    registrationStateCaptureControl,
    validateDeviceControl,
    loadRegistrationStateControl,
    requestRegistrationChallengeControl,
    createCredentialControl,
    authorizeControl,
    resetMfaUiMocks,
    mfaActorsMock,
    userActionsMock,
    biometricsHookMock,
    renderHtmlMock,
    validateCodeCountdownMock,
    syncHistoryMock,
    navigationMock,
};
