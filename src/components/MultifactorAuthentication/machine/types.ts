import type {AllowedAuthenticationMethods} from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';
import type {CreateCredentialParams} from '@components/MultifactorAuthentication/biometrics/shared/types';
import type {MultifactorAuthenticationScenarioConfigFor} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationScenarioResponse,
} from '@components/MultifactorAuthentication/config/types';

import type {RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {MFAError, MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo} from '@libs/MultifactorAuthentication/shared/types';

import type {RunScenarioAction} from '@userActions/MultifactorAuthentication/processing';

import type CONST from '@src/CONST';

/**
 * The machine's context: every field the flow owns and writes. The legacy reducer that used to hold
 * the not-yet-migrated fields has been fully retired, so this is now the flow's only state - there is
 * no second shape a field could still live in.
 */
type MfaContext = {
    /** Account that owns the active flow and its device-local MFA state */
    accountID: number | undefined;

    /** Current error state - stops the flow and navigates to the failure outcome */
    error: MFAError | undefined;

    /** Scenario name identifier (e.g. 'AUTHORIZE-TRANSACTION') */
    scenarioName: MultifactorAuthenticationScenario | undefined;

    /** Current scenario configuration being executed */
    scenario: MultifactorAuthenticationScenarioConfigFor<MultifactorAuthenticationScenario> | undefined;

    /** Additional parameters for the current scenario */
    payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined;

    /** Scenario action already bound to the matching payload while INIT's scenario generic is known. */
    runScenarioAction: RunScenarioAction | undefined;

    /** Validate code the user entered on this flow's validate-code screen */
    validateCode: string | undefined;

    /** Registration challenge retained through post-registration authorization; recovery clears it before re-registration. */
    registrationChallenge: RegistrationChallenge | undefined;

    /** Whether the user approved the soft prompt during this flow. The durable acceptance lives in Onyx under the device-biometrics key. */
    softPromptApproved: boolean;

    /** Whether the cancel-confirmation modal triggered by a back press is currently visible */
    isCancelConfirmVisible: boolean;

    /** Authentication method the authorization actor signed the challenge with */
    authenticationMethod: AuthTypeInfo | undefined;

    /** Response from the scenario action, carried for the outcome/callback slice that will consume it */
    scenarioResponse: MultifactorAuthenticationScenarioResponse | undefined;

    /**
     * Last prompt sub-state that had something to show. Kept after the flow moves on to the outcome,
     * so the prompt screen doesn't snap back to default content while it's still mounted and
     * animating out. Cleared when the machine enters `closed` after the modal finishes closing.
     */
    promptPresentationPhase: PromptPresentationPhase | undefined;

    /** Same idea as `promptPresentationPhase`, for the validate-code screen. */
    validateCodePresentationPhase: ValidateCodePresentationPhase | undefined;
};

/** See `MfaContext.promptPresentationPhase`. */
type PromptPresentationPhase =
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.AWAITING_SOFT_PROMPT
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.CREATING_CREDENTIAL
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.AUTHORIZING;

/** See `MfaContext.validateCodePresentationPhase`. */
type ValidateCodePresentationPhase =
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.AWAITING_VALIDATE_CODE
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.REQUESTING_REGISTRATION_CHALLENGE;

/** Modal lifecycle state the view layer reads: the machine's three top-level states. */
type MfaModalState =
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.CLOSED
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.OPEN
    | typeof CONST.MULTIFACTOR_AUTHENTICATION.MFA_STATE.CLOSING;

/**
 * `T` keeps the scenario name, config, and payload aligned.
 * The default allows this event to be used as part of `MfaEvent`.
 */
type MultifactorAuthenticationInitEvent<T extends MultifactorAuthenticationScenario = MultifactorAuthenticationScenario> = {
    type: 'INIT';
    accountID: number;
    scenarioName: T;
    scenario: MultifactorAuthenticationScenarioConfigFor<T>;
    payload: MultifactorAuthenticationScenarioParams<T> | undefined;
    runScenarioAction: RunScenarioAction;
};

/** Events handled by the MFA state machine. */
type MfaEvent =
    | MultifactorAuthenticationInitEvent
    | {type: 'CLOSE_MODAL'}
    | {type: 'MODAL_CLOSED'}
    | {type: 'SOFT_PROMPT_APPROVED'}
    | {type: 'VALIDATE_CODE_ENTERED'; validateCode: string}
    | {type: 'RESEND_VALIDATE_CODE'}
    | {type: 'VALIDATE_CODE_CHANGED'};

/** Describes the input the machine passes to the device-check actor. */
type ValidateDeviceInput = {allowedAuthenticationMethods: AllowedAuthenticationMethods};

/** Identifies the account whose device-local registration state the machine loads. */
type LoadRegistrationStateInput = {accountID: number};

/** Device-local signals needed to choose between registration and authorization. */
type LoadRegistrationStateOutput = {
    hasLocalCredentials: boolean;
    hasEverAcceptedSoftPrompt: boolean;
};

/** Validate code sent to the backend to obtain a registration challenge. */
type RequestRegistrationChallengeInput = {validateCode: string};

/** A successful response must carry the validated registration challenge. */
type RequestRegistrationChallengeOutput = MFAResult<{challenge: RegistrationChallenge}>;

/** Input the machine passes to the credential-creation actor: everything `CreateCredentialParams` needs except the abort signal, which the actor supplies itself. */
type CreateCredentialInput = Omit<CreateCredentialParams, 'signal'>;

/** The credential-creation actor's result. `keyInfo` never leaves the actor, so a success carries no additional data. */
type CreateCredentialOutput = MFAResult;

/** Input the machine passes to the authorization actor: the account and the scenario runner bound at INIT. */
type AuthorizeInput = {
    accountID: number;
    runScenarioAction: RunScenarioAction;
};

/** The authorization actor's result. A success carries the authentication method the ceremony signed with and the scenario action's response. */
type AuthorizeOutput = MFAResult<{scenarioResponse: MultifactorAuthenticationScenarioResponse; authenticationMethod: AuthTypeInfo}>;

export type {
    AuthorizeInput,
    AuthorizeOutput,
    CreateCredentialInput,
    CreateCredentialOutput,
    LoadRegistrationStateInput,
    LoadRegistrationStateOutput,
    MfaContext,
    MfaEvent,
    MfaModalState,
    MultifactorAuthenticationInitEvent,
    RequestRegistrationChallengeInput,
    RequestRegistrationChallengeOutput,
    ValidateDeviceInput,
};
