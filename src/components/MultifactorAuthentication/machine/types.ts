import type {AllowedAuthenticationMethods} from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';
import type {MultifactorAuthenticationScenarioConfigFor} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
} from '@components/MultifactorAuthentication/config/types';

import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

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
};

/** Events handled by the MFA state machine. */
type MfaEvent = MultifactorAuthenticationInitEvent | {type: 'CLOSE_MODAL'} | {type: 'MODAL_CLOSED'} | {type: 'SOFT_PROMPT_APPROVED'};

/** Describes the input the machine passes to the device-check actor. */
type ValidateDeviceInput = {allowedAuthenticationMethods: AllowedAuthenticationMethods};

/** Identifies the per-account Onyx member read by the soft-prompt actor. */
type ReadHasAcceptedSoftPromptInput = {accountID: number};

export type {MfaContext, MfaEvent, MfaModalState, MultifactorAuthenticationInitEvent, ReadHasAcceptedSoftPromptInput, ValidateDeviceInput};
