import {assign, setup} from 'xstate';
import {DEFAULT_STATE} from '@components/MultifactorAuthentication/Context/state';
import {navigate as mfaNavigate, resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {MfaEvent, MfaMachineContext} from './types';

const {isModalOpen, ...machineDefaults} = DEFAULT_STATE;
const DEFAULT_CONTEXT: MfaMachineContext = machineDefaults;

/**
 * MFA state machine. The top level models the modal lifecycle (`idle` -> `open` -> `closing`); the
 * child states of `open` map 1:1 to the screen the user currently sees. Later slices add screens as
 * `open` children, per-screen work as child states of its screen, and events shared by every screen
 * (e.g. SET_ERROR) on `open` itself.
 *
 * No state is `final`: one long-lived actor serves every MFA flow (a top-level final state would
 * stop it).
 */
const mfaMachine = setup({
    // `{} as T` inside setup({types}) is XState v5's documented typing idiom (the values are erased
    // at runtime and only carry types); there is no assertion-free way to express it.
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
    types: {
        context: {} as MfaMachineContext,
        events: {} as MfaEvent,
    },
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */
    actions: {
        initFromEvent: assign(({event}) => {
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
        markFlowComplete: assign({isFlowComplete: true}),
        navigateToSuccessOutcome: () => {
            // runAfterTransition defers the push until the modal-open transition settles, so the
            // success screen slides in with a measured width (Android animation race).
            Navigation.runAfterTransition(() => mfaNavigate(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS));
        },
        hideCancelConfirm: assign({isCancelConfirmVisible: false}),
        resetContext: assign(() => ({...DEFAULT_CONTEXT})),
        // Clears the module-level navigation buffer (pendingNavigation/hasInitialLaidOut). Owned by
        // the machine so a navigator that unmounts mid-close cannot leave a stale buffered screen
        // behind for the next flow.
        resetNavigationBuffer: () => resetMfaNavigation(),
    },
    delays: {
        // How long `closing` waits for MODAL_CLOSED before re-entering `idle` on its own; longer
        // than any close animation can take.
        closeFallback: CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS + CONST.ANIMATED_TRANSITION,
    },
}).createMachine({
    id: 'mfa',
    initial: 'idle',
    context: DEFAULT_CONTEXT,
    states: {
        idle: {
            // The wipe runs on every (re)entry so no flow data (validate code, challenges, scenario
            // response) outlives the modal.
            entry: ['resetContext', 'resetNavigationBuffer'],
            on: {
                // Accepted only here: an INIT sent while the modal is open or still closing is
                // dropped rather than started on dirty state.
                INIT: {target: 'open', actions: 'initFromEvent'},
            },
        },
        open: {
            initial: 'preparing',
            on: {
                CLOSE_MODAL: {target: 'closing', actions: 'hideCancelConfirm'},
            },
            states: {
                // Transparent initial screen. PR-5 has no pre-screen work yet, so it falls straight through;
                // later slices replace `always` with child states (device check, registration decision, ...).
                preparing: {
                    always: 'outcome',
                },
                outcome: {
                    initial: 'success',
                    states: {
                        success: {
                            entry: ['markFlowComplete', 'navigateToSuccessOutcome'],
                        },
                    },
                },
            },
        },
        // Modal teardown. The context still holds the flow data here on purpose: the outcome screen
        // stays visible while it slides out. The navigator sends MODAL_CLOSED once the close
        // animation finishes; if it unmounts before that, the event never comes and the
        // `closeFallback` timer re-enters `idle` instead.
        closing: {
            on: {
                MODAL_CLOSED: 'idle',
            },
            after: {
                closeFallback: {target: 'idle'},
            },
        },
    },
});

export default mfaMachine;
