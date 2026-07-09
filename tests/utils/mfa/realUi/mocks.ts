import type {UseBiometricsReturn} from '@components/MultifactorAuthentication/biometrics/shared/types';
import type createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import type {ValidateDeviceInput} from '@components/MultifactorAuthentication/machine/types';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type Navigation from '@libs/Navigation/Navigation';

import {fromPromise} from 'xstate';

import type {ActorOutcome} from '../flowPaths';

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

/**
 * Per-path outcomes for the mock actors the walk provides, keyed by actor id. The walk sets this from a
 * path's graph events before rendering, so an `xstate.error.actor.<id>` step makes that actor reject and
 * an `xstate.done.actor.<id>` step makes it resolve with the output fixture the graph generated the
 * branch from. Unlisted actors default to resolving with their mock's default output.
 */
let actorOutcomes: Record<string, ActorOutcome> = {};

function setActorOutcomes(outcomes: Record<string, ActorOutcome>) {
    actorOutcomes = outcomes;
}

function getActorOutcome(actorId: string): ActorOutcome {
    return actorOutcomes[actorId] ?? {kind: 'resolve', output: undefined};
}

function resetMfaUiMocks() {
    pendingModalClose.clear();
    actorOutcomes = {};
}

function makeActorMock<TInput, TOutput>(actorID: string, defaultOutput: TOutput) {
    return fromPromise<TOutput, TInput>(async () => {
        const outcome = getActorOutcome(actorID);
        if (outcome.kind === 'reject') {
            throw new Error(`Mock MFA actor "${actorID}" rejected for this path`);
        }
        if (outcome.output === undefined) {
            return defaultOutput;
        }
        // The recorded output originates from this actor's typed done-event fixtures in `flowPaths.ts`,
        // and the generic outcome record cannot carry that link, so it narrows back to the output type.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return outcome.output as TOutput;
    });
}

/**
 * Replaces the machine's side-effect actors with graph-driven promises. `satisfies` makes adding a real
 * actor a type error here until the UI walk defines its mock.
 */
function mfaActorsMock() {
    const actors = {
        validateDevice: makeActorMock<ValidateDeviceInput, MFAResult>('validateDevice', {success: true}),
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

export {pendingModalClose, setActorOutcomes, resetMfaUiMocks, mfaActorsMock, biometricsHookMock, renderHtmlMock, syncHistoryMock, navigationMock};
