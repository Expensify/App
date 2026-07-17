import type {UseBiometricsReturn} from '@components/MultifactorAuthentication/biometrics/shared/types';
import type createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import type {ReadHasAcceptedSoftPromptInput, SoftPromptAcceptanceReadEvent, ValidateDeviceInput} from '@components/MultifactorAuthentication/machine/types';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type Navigation from '@libs/Navigation/Navigation';

import type {EventObject} from 'xstate';

import {fromCallback, fromPromise} from 'xstate';

// This module keeps mutable mock state and factory bodies outside the test so the test stays focused on
// mock registrations and assertions.

type CapturedCallback = () => void;
type NavigationTransitionOverrides = Pick<typeof Navigation, 'runAfterTransition' | 'runAfterUpcomingTransition'>;
type PendingValidateDevice = {
    resolve: (result: MFAResult) => void;
    reject: (error: Error) => void;
};
type PendingReadHasAcceptedSoftPrompt = {
    resolve: (accepted: boolean) => void;
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

let pendingValidateDeviceCall: PendingValidateDevice | undefined;
let pendingSoftPromptAcceptanceCall: PendingReadHasAcceptedSoftPrompt | undefined;

function takePendingValidateDeviceCall(): PendingValidateDevice {
    const pendingCall = pendingValidateDeviceCall;
    pendingValidateDeviceCall = undefined;
    if (!pendingCall) {
        throw new Error('No pending validateDevice call is available.');
    }
    return pendingCall;
}

function resolveValidateDevice(result: MFAResult) {
    takePendingValidateDeviceCall().resolve(result);
}

function rejectValidateDevice() {
    takePendingValidateDeviceCall().reject(new Error('Mock validateDevice actor rejected for this path'));
}

function takePendingSoftPromptAcceptanceCall(): PendingReadHasAcceptedSoftPrompt {
    const pendingCall = pendingSoftPromptAcceptanceCall;
    pendingSoftPromptAcceptanceCall = undefined;
    if (!pendingCall) {
        throw new Error('No pending readHasAcceptedSoftPrompt call is available.');
    }
    return pendingCall;
}

function resolveSoftPromptAcceptance(accepted: boolean) {
    takePendingSoftPromptAcceptanceCall().resolve(accepted);
}

function rejectSoftPromptAcceptanceRead() {
    takePendingSoftPromptAcceptanceCall().reject(new Error('Mock readHasAcceptedSoftPrompt actor rejected for this path'));
}

function resetMfaUiMocks() {
    pendingModalClose.clear();
    pendingValidateDeviceCall = undefined;
    pendingSoftPromptAcceptanceCall = undefined;
}

const validateDeviceMock = fromPromise<MFAResult, ValidateDeviceInput>(
    () =>
        new Promise<MFAResult>((resolve, reject) => {
            pendingValidateDeviceCall = {resolve, reject};
        }),
);

const readHasAcceptedSoftPromptMock = fromCallback<EventObject, ReadHasAcceptedSoftPromptInput>(({sendBack}) => {
    pendingSoftPromptAcceptanceCall = {
        resolve: (accepted) => sendBack({type: 'ACTOR_SOFT_PROMPT_ACCEPTANCE_READ', accepted} satisfies SoftPromptAcceptanceReadEvent),
        // Callback actors have no asynchronous error channel, so the controlled mock sends the
        // framework error event that a synchronous actor setup failure would produce.
        reject: (error) => sendBack({type: 'xstate.error.actor.readHasAcceptedSoftPrompt', actorId: 'readHasAcceptedSoftPrompt', error}),
    };
});

/** Replaces the machine's side-effect actors with controlled test implementations. */
function mfaActorsMock() {
    const actors = {
        validateDevice: validateDeviceMock,
        readHasAcceptedSoftPrompt: readHasAcceptedSoftPromptMock,
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

function renderHtmlMock() {
    return {
        __esModule: true,
        default: () => null,
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
    resolveValidateDevice,
    rejectValidateDevice,
    resolveSoftPromptAcceptance,
    rejectSoftPromptAcceptanceRead,
    resetMfaUiMocks,
    mfaActorsMock,
    biometricsHookMock,
    renderHtmlMock,
    syncHistoryMock,
    navigationMock,
};
