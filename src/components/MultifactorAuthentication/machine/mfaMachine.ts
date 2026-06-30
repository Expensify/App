import {navigate as mfaNavigate, resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';

import {createLocalMFAError, MFAActorError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import {assign, setup} from 'xstate';

import type {MfaContext, MfaEvent} from './types';

import createActors from './mfaActors';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

// Absolute targets for the two outcome leaves, whose ids are set on the leaves below. The device
// check runs under `preparing`, so reaching the sibling `outcome` branch needs an id target rather
// than a relative one.
const SUCCESS_TARGET = `#${MFA_STATE.SUCCESS}` as const;
const FAILURE_TARGET = `#${MFA_STATE.FAILURE}` as const;

const DEFAULT_CONTEXT: MfaContext = {
    error: undefined,
    scenarioName: undefined,
    scenario: undefined,
    payload: undefined,
    isCancelConfirmVisible: false,
};

/**
 * MFA state machine. The top level models the modal lifecycle (`closed` -> `open` -> `closing`); the
 * child states of `open` map 1:1 to the screen the user currently sees. Later slices add screens as
 * `open` children, per-screen work as child states of its screen, and events shared by every screen
 * (e.g. SET_ERROR) on `open` itself.
 *
 * No state is `final`: one long-lived actor serves every MFA flow (a top-level final state would
 * stop it).
 */
const MFAMachine = setup({
    // `{} as T` inside setup({types}) is XState v5's documented typing idiom (the values are erased
    // at runtime and only carry types); there is no assertion-free way to express it.
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
    types: {
        context: {} as MfaContext,
        events: {} as MfaEvent,
    },
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
    actors: createActors(),
    actions: {
        // Seeds the flow's context from the INIT event. A named action's event is typed as the full
        // MfaEvent union, so the guard narrows it to INIT to read the scenario fields; INIT is the only
        // transition wired here, so that early return is unreachable (it just satisfies the type checker).
        initFlow: assign(({event}) => {
            if (event.type !== 'INIT') {
                return {};
            }
            return {
                ...DEFAULT_CONTEXT,
                scenarioName: event.scenarioName,
                scenario: event.scenario,
                payload: event.payload,
            };
        }),
        // Navigates to the outcome route that matches the error in context. OutcomePage reads the same
        // error to render the specific success or failure screen, so the route only labels the outcome
        // in the stack. runAfterTransition defers the push until the modal-open transition settles, which
        // lets the screen slide in with a measured width and avoids the Android animation race.
        navigateToOutcome: ({context}) => {
            const screen = context.error ? SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_FAILURE : SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS;
            Navigation.runAfterTransition(() => mfaNavigate(screen));
        },
        // Runs on CLOSE_MODAL: drops the cancel-confirmation modal so it cannot linger over the
        // closing navigator (CLOSE_MODAL can fire without the flow completing, e.g. an offline cancel).
        hideCancelConfirmModal: assign({isCancelConfirmVisible: false}),
        resetContext: assign(() => ({...DEFAULT_CONTEXT})),
        // Clears the module-level navigation buffer (pendingNavigation/hasInitialLaidOut). Owned by
        // the machine so a navigator that unmounts mid-close cannot leave a stale buffered screen
        // behind for the next flow.
        clearModalOpenNavigationState: () => resetMfaNavigation(),
    },
    delays: {
        // How long `closing` waits for MODAL_CLOSED before re-entering `closed` on its own; longer
        // than any close animation can take.
        closeFallback: CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS + CONST.ANIMATED_TRANSITION,
    },
}).createMachine({
    id: 'mfa',
    initial: MFA_STATE.CLOSED,
    context: DEFAULT_CONTEXT,
    states: {
        [MFA_STATE.CLOSED]: {
            // The wipe runs on every (re)entry so no flow data (validate code, challenges, scenario
            // response) outlives the modal.
            entry: ['resetContext', 'clearModalOpenNavigationState'],
            on: {
                // Accepted only here: an INIT sent while the modal is open or still closing is
                // dropped rather than started on dirty state.
                INIT: {target: MFA_STATE.OPEN, actions: 'initFlow'},
            },
        },
        [MFA_STATE.OPEN]: {
            initial: MFA_STATE.PREPARING,
            on: {
                CLOSE_MODAL: {target: MFA_STATE.CLOSING, actions: 'hideCancelConfirmModal'},
                // Any open state can hit a fatal error. It records the error and ends the flow on the
                // failure outcome, where the screen is chosen from the error reason.
                SET_ERROR: {target: FAILURE_TARGET, actions: assign({error: ({event}) => event.error})},
            },
            states: {
                // The transparent initial screen. Its child states run the pre-screen work the user
                // waits through. This slice adds the device check, and later slices add the
                // registration and authorization steps as siblings.
                [MFA_STATE.PREPARING]: {
                    initial: MFA_STATE.VALIDATING_DEVICE,
                    states: {
                        [MFA_STATE.VALIDATING_DEVICE]: {
                            invoke: {
                                id: 'validateDevice',
                                src: 'validateDevice',
                                input: ({context}) => ({scenario: context.scenario}),
                                // The device passed both gates, so continue to the outcome screen.
                                // Device-ok lands on success until the registration and authorization
                                // slices insert their steps before it.
                                onDone: SUCCESS_TARGET,
                                // The actor throws the blocking MFAError when the device cannot complete
                                // the scenario, so carry it to the failure outcome. A non-MFAError means
                                // the platform check itself threw unexpectedly.
                                onError: {
                                    target: FAILURE_TARGET,
                                    actions: assign({
                                        error: ({event}) =>
                                            event.error instanceof MFAActorError
                                                ? event.error.mfaError
                                                : createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION, 'Device check threw an unexpected error'),
                                    }),
                                },
                            },
                        },
                    },
                },
                [MFA_STATE.OUTCOME]: {
                    // Entering the outcome navigates once to the route matching the error. The success
                    // and failure children are the finite states the flow settles on, which the tests and
                    // later slices read. Their `id` lets the device check target them from the `preparing`
                    // branch.
                    entry: ['navigateToOutcome'],
                    initial: MFA_STATE.SUCCESS,
                    states: {
                        [MFA_STATE.SUCCESS]: {id: MFA_STATE.SUCCESS},
                        [MFA_STATE.FAILURE]: {id: MFA_STATE.FAILURE},
                    },
                },
            },
        },
        // Modal teardown. The context still holds the flow data here on purpose: the outcome screen
        // stays visible while it slides out. The navigator sends MODAL_CLOSED once the close
        // animation finishes; if it unmounts before that, the event never comes and the
        // `closeFallback` timer re-enters `closed` instead.
        [MFA_STATE.CLOSING]: {
            on: {
                MODAL_CLOSED: MFA_STATE.CLOSED,
            },
            after: {
                closeFallback: {target: MFA_STATE.CLOSED},
            },
        },
    },
});

export default MFAMachine;
