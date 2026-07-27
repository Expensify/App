import type {AllowedAuthenticationMethods} from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';
import type {MultifactorAuthenticationScenarioConfigFor} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
} from '@components/MultifactorAuthentication/config/types';

import type {RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {MFAError, MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import type CONST from '@src/CONST';

/**
 * The machine's context: the fields the chart owns and writes. Each lives here, not in
 * `MultifactorAuthenticationState` - migrating a field into the machine means removing it from the
 * reducer shape, so every field has exactly one home and a stale reducer read of a migrated field is
 * a compile error.
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

    /** Whether the local credential captured at flow start is among the server-known credential IDs */
    localCredentialsKnownToServer: boolean;

    /** Magic code the user entered on this flow's validate-code screen */
    validateCode: string | undefined;

    /** Error the validate-code screen shows inline while the flow stays on it, as opposed to `error`, which ends the flow */
    continuableError: MFAError | undefined;

    /** Registration challenge returned after the backend accepts the magic code */
    registrationChallenge: RegistrationChallenge | undefined;

    /** Whether the user approved the soft prompt during this flow. The durable acceptance lives in Onyx under the device-biometrics key. */
    softPromptApproved: boolean;

    /** Whether the cancel-confirmation modal triggered by a back press is currently visible */
    isCancelConfirmVisible: boolean;
};

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
    localCredentialsKnownToServer: boolean;
};

/** Events handled by the MFA state machine. */
type MfaEvent =
    | MultifactorAuthenticationInitEvent
    | {type: 'CLOSE_MODAL'}
    | {type: 'MODAL_CLOSED'}
    | {type: 'SOFT_PROMPT_APPROVED'}
    | {type: 'VALIDATE_CODE_ENTERED'; validateCode: string}
    | {type: 'CLEAR_CONTINUABLE_ERROR'};

/** Describes the input the machine passes to the device-check actor. */
type ValidateDeviceInput = {allowedAuthenticationMethods: AllowedAuthenticationMethods};

/** Identifies the per-account Onyx member read by the soft-prompt actor. */
type ReadHasAcceptedSoftPromptInput = {accountID: number};

/** Magic code sent to the backend to obtain a registration challenge. */
type RequestRegistrationChallengeInput = {validateCode: string};

/** A successful response must carry the validated registration challenge. */
type RequestRegistrationChallengeOutput = MFAResult<{challenge: RegistrationChallenge}>;

export type {
    MfaContext,
    MfaEvent,
    MfaModalState,
    MultifactorAuthenticationInitEvent,
    ReadHasAcceptedSoftPromptInput,
    RequestRegistrationChallengeInput,
    RequestRegistrationChallengeOutput,
    ValidateDeviceInput,
};
