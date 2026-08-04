import {deviceVerificationType} from '@components/MultifactorAuthentication/biometrics/operations';
import {navigate as mfaNavigate, resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';

import {createUnhandledExceptionMFAError, getMFAFailureError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import Navigation from '@libs/Navigation/Navigation';

import {markHasAcceptedSoftPrompt} from '@userActions/MultifactorAuthentication';
import {requestValidateCodeAction} from '@userActions/User';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import {CONST as COMMON_CONST} from 'expensify-common';
import {assign, setup} from 'xstate';

import type {MfaContext, MfaEvent} from './types';

import createActors from './mfaActors';

const MFA_STATE = CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE;

// Absolute targets for the screen branches. The device check runs under `preparing`, so reaching a
// sibling branch needs an id target rather than a relative one.
const OUTCOME_TARGET = `#${MFA_STATE.OUTCOME}` as const;
const PROMPT_TARGET = `#${MFA_STATE.PROMPT}` as const;
const VALIDATE_CODE_TARGET = `#${MFA_STATE.VALIDATE_CODE}` as const;

// One literal shared by both branches of an explicit soft-prompt approval, so they can't drift apart.
const SOFT_PROMPT_ACCEPTED_ACTIONS = ['approveSoftPrompt', 'persistSoftPromptAcceptance'] as const;

// Which prompt variant the screen renders is a device property, resolved once per platform.
const PROMPT_TYPE = CONST.MULTIFACTOR_AUTHENTICATION.PROMPT_TYPE_MAP[deviceVerificationType];

const DEFAULT_CONTEXT: MfaContext = {
    accountID: undefined,
    error: undefined,
    scenarioName: undefined,
    scenario: undefined,
    payload: undefined,
    validateCode: undefined,
    registrationChallenge: undefined,
    softPromptApproved: false,
    hasEverAcceptedSoftPrompt: false,
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
        hasRegistrationChallenge: ({context}) => context.registrationChallenge !== undefined,
    },
    actions: {
        // Seeds the flow's context from the INIT event. A named action's event is typed as the full
        // machine-event union, so the guard narrows it to INIT to read the scenario fields; INIT is the
        // only transition wired here, so that early return is unreachable (it just satisfies the type checker).
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
                hasEverAcceptedSoftPrompt: event.hasEverAcceptedSoftPrompt,
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
        navigateToValidateCode: () => {
            Navigation.runAfterTransition(() => mfaNavigate(SCREENS.MULTIFACTOR_AUTHENTICATION.VALIDATE_CODE));
        },
        // Emails the user a validate code. Runs only on the decision transition into the
        // validate-code screen and on an explicit resend request, never on (re)entry, so the
        // invalid-code retry loop cannot resend the email.
        requestValidateCode: () => requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.REGISTER_AUTHENTICATION_KEY}),
        // Stores the submitted code. Same narrowing pattern as initFlow: only VALIDATE_CODE_ENTERED
        // is wired here, so the early return just satisfies the type checker.
        submitValidateCode: assign(({event}) => {
            if (event.type !== 'VALIDATE_CODE_ENTERED') {
                return {};
            }
            return {validateCode: event.validateCode};
        }),
        clearValidateCode: assign({validateCode: undefined}),
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
                                // A fresh (re-)registration always requires soft-prompt approval, regardless of
                                // `hasEverAcceptedSoftPrompt`. A returning user who already accepted it skips
                                // straight to the outcome instead of re-confirming.
                                //
                                // Scoped shortcut: production re-authenticates behind a loader before the outcome.
                                // This slice has no authorization actor yet - revisit this guard once one exists.
                                onDone: [
                                    {guard: ({context, event}) => event.output && context.hasEverAcceptedSoftPrompt, target: OUTCOME_TARGET},
                                    {guard: ({event}) => event.output, target: PROMPT_TARGET},
                                    {target: VALIDATE_CODE_TARGET, actions: 'requestValidateCode'},
                                ],
                                onError: {
                                    target: OUTCOME_TARGET,
                                    actions: assign({error: ({event}) => createUnhandledExceptionMFAError('Local credentials check', event.error)}),
                                },
                            },
                        },
                    },
                },
                [MFA_STATE.VALIDATE_CODE]: {
                    id: MFA_STATE.VALIDATE_CODE,
                    entry: 'navigateToValidateCode',
                    initial: MFA_STATE.AWAITING_VALIDATE_CODE,
                    states: {
                        // Waits for the emailed code. A resend is accepted only here, so one fired
                        // while the challenge request is in flight is dropped instead of emailing a
                        // code the pending submission ignores.
                        [MFA_STATE.AWAITING_VALIDATE_CODE]: {
                            initial: MFA_STATE.AWAITING_INPUT,
                            on: {
                                VALIDATE_CODE_ENTERED: {target: MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE, actions: 'submitValidateCode'},
                                RESEND_VALIDATE_CODE: {target: `.${MFA_STATE.AWAITING_INPUT}`, actions: 'requestValidateCode'},
                            },
                            states: {
                                [MFA_STATE.AWAITING_INPUT]: {},
                                // The backend rejected the submitted code. The screen shows the
                                // inline error exactly while this state is active, so every way out
                                // (typing, a resend, a new submission) drops the error by
                                // construction and nothing stale can outlive the screen.
                                [MFA_STATE.INVALID_CODE]: {
                                    on: {
                                        VALIDATE_CODE_CHANGED: MFA_STATE.AWAITING_INPUT,
                                    },
                                },
                            },
                        },
                        [MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE]: {
                            // The submitted code is needed only while this actor starts and runs. Clear it on
                            // every way out so the one-time code cannot outlive the request that consumes it.
                            exit: 'clearValidateCode',
                            invoke: {
                                id: 'requestRegistrationChallenge',
                                src: 'requestRegistrationChallenge',
                                input: ({context}) => {
                                    if (context.validateCode === undefined) {
                                        throw new Error('MFA validate code must be stored before requesting a registration challenge');
                                    }
                                    return {validateCode: context.validateCode};
                                },
                                onDone: [
                                    {
                                        guard: ({event}) => event.output.success,
                                        target: PROMPT_TARGET,
                                        actions: assign({registrationChallenge: ({event}) => (event.output.success ? event.output.challenge : undefined)}),
                                    },
                                    {
                                        guard: ({event}) =>
                                            !event.output.success && getMFAFailureError(event.output).reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE,
                                        target: `${MFA_STATE.AWAITING_VALIDATE_CODE}.${MFA_STATE.INVALID_CODE}`,
                                    },
                                    {target: OUTCOME_TARGET, actions: assign({error: ({event}) => getMFAFailureError(event.output)})},
                                ],
                                onError: {
                                    target: OUTCOME_TARGET,
                                    actions: assign({error: ({event}) => createUnhandledExceptionMFAError('Registration challenge request', event.error)}),
                                },
                            },
                        },
                    },
                },
                // Reached for a fresh/re-registration, or a returning user who hasn't accepted the soft
                // prompt yet - see the routing comment on `decidingRegistration`.
                [MFA_STATE.PROMPT]: {
                    id: MFA_STATE.PROMPT,
                    entry: ['navigateToPrompt'],
                    initial: MFA_STATE.AWAITING_SOFT_PROMPT,
                    on: {
                        SOFT_PROMPT_APPROVED: [
                            {guard: 'hasRegistrationChallenge', target: MFA_STATE.CREATING_CREDENTIAL, actions: SOFT_PROMPT_ACCEPTED_ACTIONS},
                            {target: MFA_STATE.OUTCOME, actions: SOFT_PROMPT_ACCEPTED_ACTIONS},
                        ],
                    },
                    states: {
                        [MFA_STATE.AWAITING_SOFT_PROMPT]: {},
                    },
                },
                // Turns a pending registration challenge into a real credential: platform ceremony, then
                // backend registration. Reached from both soft-prompt exits when a challenge is pending.
                // No `entry` action on purpose — whatever screen is already up (prompt, or nothing) just
                // stays visible during the ceremony, same as legacy.
                [MFA_STATE.CREATING_CREDENTIAL]: {
                    id: MFA_STATE.CREATING_CREDENTIAL,
                    invoke: {
                        id: 'createCredential',
                        src: 'createCredential',
                        input: ({context}) => {
                            if (context.accountID === undefined || context.registrationChallenge === undefined) {
                                throw new Error('MFA account and registration challenge must be stored before creating a credential');
                            }
                            return {accountID: context.accountID, registrationChallenge: context.registrationChallenge};
                        },
                        onDone: [
                            {guard: ({event}) => !event.output.success, target: OUTCOME_TARGET, actions: assign({error: ({event}) => getMFAFailureError(event.output)})},
                            {target: OUTCOME_TARGET},
                        ],
                        onError: {
                            target: OUTCOME_TARGET,
                            actions: assign({error: ({event}) => createUnhandledExceptionMFAError('Credential registration', event.error)}),
                        },
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
