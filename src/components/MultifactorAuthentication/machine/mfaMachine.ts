import {assign, setup} from 'xstate';
import {DEFAULT_STATE} from '@components/MultifactorAuthentication/Context/state';
import {navigate as mfaNavigate, resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type {MfaEvent, MfaMachineContext} from './types';

const DEFAULT_CONTEXT: MfaMachineContext = DEFAULT_STATE;

/**
 * MFA state machine. The chart (states + transitions) is declarative; navigation is the only side
 * effect in this slice. Leaving a state disposes its work before the next transition, so the
 * process()+useEffect race the old engine suffered from cannot recur.
 *
 * Top-level states map 1:1 to what the user currently sees:
 * - `idle` - modal closed, no flow running. Every (re)entry wipes the context and the navigation
 *   buffer, so no flow data (validate code, challenges, scenario response) outlives the modal;
 * - `preparing` - the transparent initial screen; pre-screen work (device check, registration
 *   decision, ...) lands here as child states in later slices;
 * - `magicCode` / `prompt` - the magic-code and prompt screens, arriving in later slices;
 * - `outcome` - the outcome screen; its children pick the variant (`success` now, `failure` later);
 * - `closing` - the modal is tearing down (slide-out + backdrop fade).
 * Sub-steps that run while a screen is shown become child states of that screen's parent.
 *
 * PR-5 (Slice 1) skeleton: INIT -> `preparing` -> (no work yet) -> `outcome.success`.
 *
 * Teardown: CLOSE_MODAL (guarded on `isModalOpen`, so duplicates are ignored) flips the flag and
 * enters `closing`; the navigator plays the close animation and reports MODAL_CLOSED, which re-enters
 * `idle`. If that report never arrives - the navigator can unmount mid-close and cancel its
 * `runAfterUpcomingTransition` callback - the `closeFallback` delayed transition wipes anyway, so the
 * context cannot outlive the modal by more than the fallback delay. No state is `final`: one
 * long-lived actor is reused for every MFA flow (a top-level final state would stop it).
 */
const mfaMachine = setup({
    types: {
        context: {} as MfaMachineContext,
        events: {} as MfaEvent,
    },
    actions: {
        initFromEvent: assign(({event}) => {
            if (event.type !== 'INIT') {
                return {};
            }
            return {
                ...DEFAULT_CONTEXT,
                isModalOpen: true,
                scenarioName: event.scenarioName,
                scenario: event.scenario,
                payload: event.payload,
            };
        }),
        markFlowComplete: assign({isFlowComplete: true}),
        // Preserve the Android animation-race fix the old handleCallback had: defer the push until the
        // modal-open transition settles so the success screen slides in with a measured width.
        navigateToSuccessOutcome: () => Navigation.runAfterTransition(() => mfaNavigate(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS)),
        closeModal: assign({isModalOpen: false, isCancelConfirmVisible: false}),
        resetContext: assign(() => ({...DEFAULT_CONTEXT})),
        // Clears the module-level navigation buffer (pendingNavigation/hasInitialLaidOut). Owned by
        // the machine so a navigator that unmounts mid-close cannot leave a stale buffered screen
        // behind for the next flow.
        resetNavigationBuffer: () => resetMfaNavigation(),
    },
    guards: {
        isModalOpen: ({context}) => context.isModalOpen,
    },
    delays: {
        // Upper bound of the navigator's MODAL_CLOSED report: transition-start wait cap + capped
        // transition duration (TransitionTracker safety nets) + the backdrop fade as margin. Only
        // reached when the report was cancelled (navigator unmounted mid-close).
        closeFallback: CONST.MAX_TRANSITION_START_WAIT_MS + CONST.MAX_TRANSITION_DURATION_MS + CONST.ANIMATED_TRANSITION,
    },
}).createMachine({
    id: 'mfa',
    initial: 'idle',
    context: DEFAULT_CONTEXT,
    on: {
        CLOSE_MODAL: {guard: 'isModalOpen', target: '.closing', actions: 'closeModal'},
    },
    states: {
        idle: {
            entry: ['resetContext', 'resetNavigationBuffer'],
            on: {
                INIT: {target: 'preparing', actions: 'initFromEvent'},
            },
        },
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
        // Modal teardown. The context still holds the flow data here on purpose: the outcome screen
        // stays visible while it slides out. The wipe happens on entering `idle` - normally on the
        // navigator's MODAL_CLOSED, or via the `closeFallback` timer if that report never arrives.
        // INIT is ignored until the wipe (declared on `idle` only), so a flow launched during the
        // close animation is dropped rather than started on dirty state.
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

export {DEFAULT_CONTEXT, mfaMachine};
