import {deviceVerificationType} from '@components/MultifactorAuthentication/biometrics/operations';
import {navigate as mfaNavigate, resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';

import {createUnhandledExceptionMFAError, getMFAFailureError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import Navigation from '@libs/Navigation/Navigation';

import {markHasAcceptedSoftPrompt} from '@userActions/MultifactorAuthentication';
import {requestValidateCodeAction} from '@userActions/User';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import {assign, setup} from 'xstate';

import type {MfaContext, MfaEvent} from './types';

import createActors from './mfaActors';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

// Absolute targets for the screen branches. The device check runs under `preparing`, so reaching a
// sibling branch needs an id target rather than a relative one.
const OUTCOME_TARGET = `#${MFA_STATE.OUTCOME}` as const;
const PROMPT_TARGET = `#${MFA_STATE.PROMPT}` as const;
const SOFT_PROMPT_CHECK_TARGET = `#${MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE}` as const;
const MAGIC_CODE_TARGET = `#${MFA_STATE.REQUESTING_VALIDATE_CODE}` as const;

// Which prompt variant the screen renders is a device property, resolved once per platform.
const PROMPT_TYPE = CONST.MULTIFACTOR_AUTHENTICATION.PROMPT_TYPE_MAP[deviceVerificationType];

const DEFAULT_CONTEXT: MfaContext = {
    accountID: undefined,
    error: undefined,
    scenarioName: undefined,
    scenario: undefined,
    payload: undefined,
    validateCode: undefined,
    continuableError: undefined,
    softPromptApproved: false,
    isCancelConfirmVisible: false,
};

/**
 * MFA state machine. The top level models the modal lifecycle (`closed` -> `open` -> `closing`); the
 * child states of `open` map 1:1 to the screen the user currently sees.
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
    guards: {
        hasError: ({context}) => context.error !== undefined,
    },
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
                accountID: event.accountID,
                scenarioName: event.scenarioName,
                scenario: event.scenario,
                payload: event.payload,
            };
        }),
        // Deferring the outcome push until the modal-open transition settles lets the screen slide in
        // with a measured width and avoids the Android animation race.
        navigateToSuccessOutcome: () => {
            Navigation.runAfterTransition(() => mfaNavigate(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS));
        },
        navigateToFailureOutcome: () => {
            Navigation.runAfterTransition(() => mfaNavigate(SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_FAILURE));
        },
        navigateToPrompt: () => {
            Navigation.runAfterTransition(() => mfaNavigate(SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT, {promptType: PROMPT_TYPE}));
        },
        navigateToMagicCode: () => {
            Navigation.runAfterTransition(() => mfaNavigate(SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE));
        },
        // Emails the user a magic code. Runs only on the decision transition into the magic-code
        // screen, never on (re)entry, so the invalid-code retry loop cannot resend the email.
        requestValidateCode: () => requestValidateCodeAction(),
        // Stores the submitted code. Same narrowing pattern as initFlow: only VALIDATE_CODE_ENTERED
        // is wired here, so the early return just satisfies the type checker.
        submitValidateCode: assign(({event}) => {
            if (event.type !== 'VALIDATE_CODE_ENTERED') {
                return {};
            }
            return {validateCode: event.validateCode};
        }),
        clearContinuableError: assign({continuableError: undefined}),
        approveSoftPrompt: assign({softPromptApproved: true}),
        persistSoftPromptAcceptance: ({context}) => {
            if (context.accountID === undefined) {
                throw new Error('MFA account must be initialized before persisting soft-prompt acceptance');
            }
            markHasAcceptedSoftPrompt(context.accountID);
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
            },
            states: {
                // This is the transparent initial screen, and its child states run the pre-screen
                // work the user waits through.
                [MFA_STATE.PREPARING]: {
                    initial: MFA_STATE.VALIDATING_DEVICE,
                    states: {
                        [MFA_STATE.VALIDATING_DEVICE]: {
                            invoke: {
                                id: 'validateDevice',
                                src: 'validateDevice',
                                input: ({context}) => {
                                    if (!context.scenario) {
                                        throw new Error('MFA scenario must be initialized before device validation');
                                    }
                                    return {allowedAuthenticationMethods: context.scenario.allowedAuthenticationMethods};
                                },
                                // An error stored earlier in the flow wins even over a successful device check.
                                onDone: [
                                    {guard: ({event}) => !event.output.success, target: OUTCOME_TARGET, actions: assign({error: ({event}) => getMFAFailureError(event.output)})},
                                    {guard: ({context}) => context.error !== undefined, target: OUTCOME_TARGET},
                                    {target: MFA_STATE.DECIDING_REGISTRATION},
                                ],
                                // Expected refusals travel as failed results through onDone, so a
                                // rejection means the platform check itself threw unexpectedly.
                                onError: {
                                    target: OUTCOME_TARGET,
                                    actions: assign({error: ({event}) => createUnhandledExceptionMFAError('Device check', event.error)}),
                                },
                            },
                        },
                        [MFA_STATE.DECIDING_REGISTRATION]: {
                            invoke: {
                                id: 'checkLocalCredentials',
                                src: 'checkLocalCredentials',
                                input: ({context}) => {
                                    if (context.accountID === undefined) {
                                        throw new Error('MFA account must be initialized before the registration decision');
                                    }
                                    return {accountID: context.accountID};
                                },
                                // A returning user's credentials are already registered, and a re-entered
                                // flow already carries a code, so only a fresh registration asks for one.
                                onDone: [
                                    {guard: ({event}) => event.output, target: SOFT_PROMPT_CHECK_TARGET},
                                    {guard: ({context}) => context.validateCode !== undefined, target: SOFT_PROMPT_CHECK_TARGET},
                                    {target: MAGIC_CODE_TARGET, actions: ['requestValidateCode', 'navigateToMagicCode']},
                                ],
                                onError: {
                                    target: OUTCOME_TARGET,
                                    actions: assign({error: ({event}) => createUnhandledExceptionMFAError('Local credentials check', event.error)}),
                                },
                            },
                        },
                        [MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE]: {
                            id: MFA_STATE.CHECKING_SOFT_PROMPT_ACCEPTANCE,
                            invoke: {
                                id: 'readHasAcceptedSoftPrompt',
                                src: 'readHasAcceptedSoftPrompt',
                                input: ({context}) => {
                                    if (context.accountID === undefined) {
                                        throw new Error('MFA account must be initialized before reading soft-prompt acceptance');
                                    }
                                    return {accountID: context.accountID};
                                },
                                onDone: [{guard: ({event}) => event.output, target: OUTCOME_TARGET}, {target: PROMPT_TARGET}],
                                onError: {
                                    target: OUTCOME_TARGET,
                                    actions: assign({error: ({event}) => createUnhandledExceptionMFAError('Soft-prompt acceptance read', event.error)}),
                                },
                            },
                        },
                    },
                },
                // This branch shows the magic-code screen while a fresh registration waits for the
                // emailed code. A rejected code either stays here as an inline, continuable error
                // (invalid code, targetless so re-entry actions cannot run) or ends the flow.
                [MFA_STATE.REQUESTING_VALIDATE_CODE]: {
                    id: MFA_STATE.REQUESTING_VALIDATE_CODE,
                    on: {
                        VALIDATE_CODE_ENTERED: {target: SOFT_PROMPT_CHECK_TARGET, actions: 'submitValidateCode'},
                        VALIDATE_CODE_REJECTED: [
                            {
                                guard: ({event}) => event.error.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE,
                                actions: assign({continuableError: ({event}) => event.error}),
                            },
                            {target: OUTCOME_TARGET, actions: assign({error: ({event}) => event.error})},
                        ],
                        CLEAR_CONTINUABLE_ERROR: {actions: 'clearContinuableError'},
                    },
                },
                // This branch shows the soft prompt when the current account has not accepted it on this device.
                [MFA_STATE.PROMPT]: {
                    id: MFA_STATE.PROMPT,
                    entry: ['navigateToPrompt'],
                    initial: MFA_STATE.AWAITING_SOFT_PROMPT,
                    on: {
                        SOFT_PROMPT_APPROVED: {
                            target: MFA_STATE.OUTCOME,
                            actions: ['approveSoftPrompt', 'persistSoftPromptAcceptance'],
                        },
                    },
                    states: {
                        [MFA_STATE.AWAITING_SOFT_PROMPT]: {},
                    },
                },
                [MFA_STATE.OUTCOME]: {
                    id: MFA_STATE.OUTCOME,
                    initial: MFA_STATE.RESOLVING_OUTCOME,
                    states: {
                        [MFA_STATE.RESOLVING_OUTCOME]: {
                            always: [{guard: 'hasError', target: MFA_STATE.FAILURE}, {target: MFA_STATE.SUCCESS}],
                        },
                        [MFA_STATE.SUCCESS]: {
                            entry: ['navigateToSuccessOutcome'],
                        },
                        [MFA_STATE.FAILURE]: {entry: ['navigateToFailureOutcome']},
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
