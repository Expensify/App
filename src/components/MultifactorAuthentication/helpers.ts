import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationFactor, MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import {requestAuthenticationChallenge} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import type {AllMultifactorAuthenticationOutcomeType, MultifactorAuthenticationOutcomeSuffixes, MultifactorAuthenticationScenario} from './config/types';
import type {AuthTypeName, BiometricsStatus, NoScenarioForStatusReason, OutcomePaths} from './types';

/** Default failed step state with unsuccessful result and fulfilled request. */
const failedStep = {
    wasRecentStepSuccessful: false,
    isRequestFulfilled: true,
    requiredFactorForNextStep: undefined,
};

/**
 * Creates a status updater that merges an error status with a failed step state.
 * Used to mark authorization attempts that failed due to errors.
 * @param errorStatus - The error status containing reason and type information.
 * @returns A function that takes previous status and returns updated status with failed step.
 */
const createAuthorizeErrorStatus = (errorStatus: MultifactorAuthenticationPartialStatus<boolean, true>) => (prevStatus: MultifactorAuthenticationStatus<boolean>) => ({
    ...prevStatus,
    ...errorStatus,
    step: {
        ...failedStep,
    },
});

/**
 * Checks if the device supports biometric authentication methods.
 * Verifies both biometrics and credentials authentication capabilities.
 * @returns True if biometrics or credentials authentication is supported on the device.
 */
function doesDeviceSupportBiometrics() {
    const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
    return biometrics || credentials;
}

/**
 * Determines if biometric authentication is configured for the current account.
 * Checks both local key storage and backend registration status.
 * @param accountID - The account ID to check biometric configuration for.
 * @returns Object indicating whether any device is registered, if biometry is locally configured, and if local key is in auth.
 */
async function isBiometryConfigured(accountID: number) {
    const {value: localPublicKey} = await PublicKeyStore.get(accountID);
    const {publicKeys: authPublicKeys = []} = await requestAuthenticationChallenge();

    const isAnyDeviceRegistered = !!authPublicKeys.length;
    const isBiometryRegisteredLocally = !!localPublicKey;
    const isLocalPublicKeyInAuth = isBiometryRegisteredLocally && authPublicKeys.includes(localPublicKey);

    return {
        isAnyDeviceRegistered,
        isBiometryRegisteredLocally,
        isLocalPublicKeyInAuth,
    };
}

/**
 * Creates a step object indicating the result of an authentication attempt.
 * @param wasSuccessful - Whether the authentication step was successful.
 * @param isRequestFulfilled - Whether the request is complete and fulfilled.
 * @param requiredFactor - The next required factor for multi-factor authentication, if any.
 * @returns A step object with status flags and required factor information.
 */
const createBaseStep = (wasSuccessful: boolean, isRequestFulfilled: boolean, requiredFactor?: MultifactorAuthenticationFactor) => ({
    wasRecentStepSuccessful: wasSuccessful,
    isRequestFulfilled,
    requiredFactorForNextStep: requiredFactor,
});

/**
 * Creates a status for unsupported devices that cannot use biometric authentication.
 * Clears biometric configuration flags while preserving registration status.
 * @param prevStatus - The previous authentication status.
 * @returns Updated status indicating the device does not support biometrics.
 */
function createUnsupportedDeviceStatus(prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> {
    return {
        ...prevStatus,
        value: {
            isAnyDeviceRegistered: prevStatus.value.isAnyDeviceRegistered,
            isLocalPublicKeyInAuth: false,
            isBiometryRegisteredLocally: false,
        },
        step: createBaseStep(false, true),
    };
}

/**
 * Creates a status indicating that the validate code is missing for biometric registration.
 * Sets up the next required factor as VALIDATE_CODE.
 * @param prevStatus - The previous authentication status.
 * @returns Updated status with missing validate code requirement.
 */
function createValidateCodeMissingStatus(prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> {
    return {
        ...prevStatus,
        step: createBaseStep(false, false, CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE),
        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.VALIDATE_CODE_MISSING,
    };
}

/**
 * Creates a status updater for key-related errors during biometric operations.
 * Marks the step as failed and fulfilled with the provided error details.
 * @param reason - The error reason code.
 * @param type - The authentication type code for the error.
 * @returns A function that takes previous status and returns status with error information.
 */
function createKeyErrorStatus({reason, type}: MultifactorAuthenticationPartialStatus<boolean, true>) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
        ...prevStatus,
        reason,
        type,
        step: createBaseStep(false, true),
    });
}

/**
 * Creates a status updater for successful biometric registration results.
 * Updates step status based on whether the registration was successful.
 * @param partialStatus - Partial status containing the registration result information.
 * @returns A function that merges registration results with previous status.
 */
function createRegistrationResultStatus(partialStatus: Partial<MultifactorAuthenticationPartialStatus<BiometricsStatus>>) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
        ...prevStatus,
        ...partialStatus,
        step: createBaseStep(!!partialStatus.step?.wasRecentStepSuccessful, true),
    });
}

/**
 * Creates a status updater for when the biometric process is cancelled.
 * Sets the request as fulfilled and optionally records if the step was successful before cancellation.
 * @param wasRecentStepSuccessful - Optional flag indicating if the step was successful before cancellation.
 * @returns A function that updates status to reflect the cancelled state.
 */
function createCancelStatus(wasRecentStepSuccessful?: boolean) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
        ...prevStatus,
        step: {
            isRequestFulfilled: true,
            wasRecentStepSuccessful,
            requiredFactorForNextStep: undefined,
        },
    });
}

/**
 * Creates a status updater that refreshes the biometric setup status.
 * Updates the value with new biometric configuration and optionally overwrites other status fields.
 * @param setupStatus - The new biometric setup status with registration and local configuration details.
 * @param overwriteStatus - Optional partial status fields to overwrite in the update.
 * @returns A function that merges the new setup status with previous status.
 */
function createRefreshStatusStatus(setupStatus: BiometricsStatus, overwriteStatus?: Partial<MultifactorAuthenticationStatus<BiometricsStatus>>) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
        ...prevStatus,
        ...overwriteStatus,
        value: setupStatus,
    });
}

/**
 * Retrieves the authentication type name from a status object by matching the type code.
 * Returns the human-readable name (e.g., 'BIOMETRICS') if found in the secure store values.
 * @param status - The authentication status containing the type code to look up.
 * @returns The authentication type name or undefined if not found.
 */
const getAuthTypeName = <T>({type}: MultifactorAuthenticationPartialStatus<T>): AuthTypeName | undefined =>
    Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === type)?.NAME;

/**
 * Creates an empty/initial authentication status object with provided UI text and default values.
 * Used as the initial state for multifactor authentication flows.
 * @param initialValue - The initial value for the status (typically a boolean or data object).
 * @param config - Object containing UI text strings (headerTitle, title, description).
 * @returns A complete MultifactorAuthenticationStatus object with default values.
 */
const createEmptyStatus = <T>(initialValue: T, {headerTitle, title, description}: {headerTitle: string; title: string; description: string}): MultifactorAuthenticationStatus<T> => ({
    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ACTION_MADE_YET,
    headerTitle,
    title,
    description,
    outcomePaths: {
        successOutcome: 'biometrics-test-success',
        failureOutcome: 'biometrics-test-failure',
    },
    scenario: undefined,
    value: initialValue,
    step: {
        wasRecentStepSuccessful: undefined,
        requiredFactorForNextStep: undefined,
        isRequestFulfilled: true,
    },
});

/**
 * Constructs an outcome type string from scenario prefix and outcome suffix.
 * Combines the lowercase scenario name with the kebab-cased suffix (e.g., 'biometrics-test-success').
 * @param scenarioPrefix - The lowercase scenario name or undefined to use default 'biometrics-test'.
 * @param suffix - The outcome suffix (success/failure).
 * @returns A fully qualified outcome type string.
 */
const getOutcomePath = <T extends MultifactorAuthenticationScenario>(
    scenarioPrefix: Lowercase<T> | undefined,
    suffix: MultifactorAuthenticationOutcomeSuffixes<T>,
): AllMultifactorAuthenticationOutcomeType => {
    return `${scenarioPrefix ?? 'biometrics-test'}-${suffix}` as AllMultifactorAuthenticationOutcomeType;
};

/**
 * Type guard function to validate whether a string is a known multifactor authentication scenario.
 * Checks against the available scenarios defined in CONST.
 * @param scenario - The string to validate as a scenario.
 * @returns True if the scenario is valid, false otherwise.
 */
const isValidScenario = (scenario: string): scenario is MultifactorAuthenticationScenario => {
    const scenarios = Object.values(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO);
    return !!scenarios.find((sc) => sc === scenario);
};

/**
 * Determines whether a scenario reason indicates the flow should be cleared/reset.
 * Returns true for FULFILL and CANCEL scenarios which signal completion.
 * @param scenario - The scenario or status reason to check.
 * @returns True if the scenario should trigger a clear action, false otherwise.
 */
const shouldClearScenario = (scenario: MultifactorAuthenticationScenario | NoScenarioForStatusReason) => {
    return scenario === CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.FULFILL || scenario === CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.CANCEL;
};

/**
 * Generates success and failure outcome paths for a given scenario.
 * Handles undefined scenarios by using default 'biometrics-test' prefix.
 * @param scenario - The authentication scenario or undefined for defaults.
 * @returns An object containing successOutcome and failureOutcome paths.
 */
const getOutcomePaths = (scenario: MultifactorAuthenticationScenario | undefined): OutcomePaths => {
    const scenarioPrefix = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
    const successOutcome = getOutcomePath(scenarioPrefix, 'success');
    const failureOutcome = getOutcomePath(scenarioPrefix, 'failure');

    return {
        successOutcome,
        failureOutcome,
    };
};

/**
 * Deletes both private and public keys for a given account from secure storage.
 * Performs both deletions in parallel to reset the authentication state.
 * @param accountID - The account ID whose keys should be deleted.
 */
async function resetKeys(accountID: number) {
    await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);
}

const Status = {
    createUnsupportedDeviceStatus,
    createValidateCodeMissingStatus,
    createKeyErrorStatus,
    createRegistrationResultStatus,
    createCancelStatus,
    createBaseStep,
    createRefreshStatusStatus,
    createEmptyStatus,
} as const;

export {getAuthTypeName, doesDeviceSupportBiometrics, isBiometryConfigured, isValidScenario, shouldClearScenario, getOutcomePaths, createAuthorizeErrorStatus, resetKeys, Status};
