import type {ValueOf} from 'type-fest';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationFactor, MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import Navigation from '@navigation/Navigation';
import {requestAuthenticationChallenge} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import ROUTES, {MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import {MULTIFACTOR_AUTHENTICATION_DEFAULT_UI, MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './config';
import type {
    AllMultifactorAuthenticationOutcomeType,
    MultifactorAuthenticationOutcomeSuffixes,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
} from './config/types';
import type {AuthTypeName, BiometricsStatus, MultifactorAuthenticationScenarioStatus, MultifactorAuthenticationStatusKeyType, NoScenarioForStatusReason, OutcomePaths} from './types';

/** Default failed step state with unsuccessful result and fulfilled request. */
const failedStep = {
    wasRecentStepSuccessful: false,
    isRequestFulfilled: true,
    requiredFactorForNextStep: undefined,
};

const EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus> = {
    value: {},
    outcomePaths: {
        successOutcome: 'biometrics-test-success',
        failureOutcome: 'biometrics-test-failure',
    },
    scenario: undefined,
    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ACTION_MADE_YET,
    headerTitle: 'Biometrics authentication',
    title: 'You couldn’t be authenticated',
    description: 'Your authentication attempt was unsuccessful.',
    step: {
        ...failedStep,
    },
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

const additionalParametersToExclude = ['chainedWithAuthorization', 'chainedPrivateKeyStatus'] as const;

/**
 * Extracts additional scenario parameters by removing factor-related and special parameters.
 * Used to isolate custom parameters passed to a scenario from authentication factors.
 * @param params - The scenario parameters including factors and additional custom parameters.
 * @returns Object containing only the additional custom parameters for the scenario.
 */
const extractAdditionalParameters = <T extends MultifactorAuthenticationScenario>(
    params: MultifactorAuthenticationScenarioParams<T> & Record<string, unknown>,
): MultifactorAuthenticationScenarioAdditionalParams<T> => {
    const factorParams = Object.values(CONST.MULTIFACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS).map(({parameter}) => parameter);
    const newParams = {...params};
    for (const param of factorParams) {
        if (param in newParams) {
            delete newParams[param];
        }
    }
    for (const additionalParameter of additionalParametersToExclude) {
        if (additionalParameter in newParams) {
            delete newParams[additionalParameter];
        }
    }
    return newParams;
};

/**
 * Determines if a biometric authentication method is allowed for a given authentication type.
 * @param allowedAuthenticationMethods - The list of authentication types configuration to check.
 * @returns True if biometrics authentication is allowed, false otherwise.
 */
const shouldAllowBiometrics = (allowedAuthenticationMethods: Array<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>>) =>
    allowedAuthenticationMethods.includes(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS);

/**
 * Creates a status indicating that biometric authentication is not allowed.
 * Extracts additional scenario parameters for later use.
 * @param params - Scenario parameters to extract custom payload from.
 * @returns Partial status with biometrics not allowed reason and extracted payload.
 */
// eslint-disable-next-line rulesdir/no-negated-variables
const createBiometricsNotAllowedStatus = <T extends MultifactorAuthenticationScenario>(
    params: MultifactorAuthenticationScenarioParams<T> & Record<string, unknown>,
): MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioStatus> => {
    return {
        step: {
            ...failedStep,
        },
        value: {
            payload: extractAdditionalParameters<T>(params),
        },
        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BIOMETRICS_NOT_ALLOWED,
    };
};

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
 * Checks if a given route is a protected multifactor authentication route.
 * @param route - The route path to check.
 * @returns True if the route is protected, false otherwise.
 */
const isProtectedRoute = (route: string) => Object.values(MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES).some((protectedRoute) => route.startsWith(`/${protectedRoute}`));

/**
 * Determines if the currently active route is a protected multifactor authentication route.
 * @returns True if currently on a protected route, false otherwise.
 */
const isOnProtectedRoute = () => isProtectedRoute(Navigation.getActiveRouteWithoutParams());

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
 * Converts an outcome path to a navigation route.
 * Returns an outcome route if a path exists, otherwise returns the not found route.
 * @param path - The outcome path (e.g., 'biometrics-test-success').
 * @returns The navigation route for the outcome or not found page.
 */
const getOutcomeRoute = (path: AllMultifactorAuthenticationOutcomeType | undefined): Route => {
    if (!path) {
        return ROUTES.MULTIFACTOR_AUTHENTICATION_NOT_FOUND;
    }
    return ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(path);
};

/**
 * Creates a cancel status based on the current authentication scenario type.
 * Delegates to either authorization or setup cancel depending on the type.
 * @param type - The current multifactor authentication scenario type.
 * @param wasRecentStepSuccessful - Whether the recent step was successful before cancellation.
 * @param nativeBiometricsCancel - Cancel function for native biometrics authorization.
 * @param setupCancel - Cancel function for biometric setup.
 * @returns The appropriate cancel status for the scenario type.
 */
const getCancelStatus = (
    type: MultifactorAuthenticationScenarioStatus['type'],
    wasRecentStepSuccessful: boolean | undefined,
    nativeBiometricsCancel: (wasRecentStepSuccessful?: boolean) => MultifactorAuthenticationStatus<boolean>,
    setupCancel: (wasRecentStepSuccessful?: boolean) => MultifactorAuthenticationStatus<BiometricsStatus>,
): MultifactorAuthenticationStatus<boolean | BiometricsStatus> => {
    if (type === CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION) {
        return nativeBiometricsCancel(wasRecentStepSuccessful);
    }
    return setupCancel(wasRecentStepSuccessful);
};

/**
 * Converts any authentication result into a standardized status object.
 * Overload signatures for type-safe full and partial status handling.
 */
function convertResultIntoMultifactorAuthenticationStatus<T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationStatus<unknown>,
    scenario: T | undefined,
    type: MultifactorAuthenticationStatusKeyType,
    params: MultifactorAuthenticationScenarioParams<T> | false,
): MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>;
function convertResultIntoMultifactorAuthenticationStatus<T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationPartialStatus<unknown>,
    scenario: T | undefined,
    type: MultifactorAuthenticationStatusKeyType,
    params: MultifactorAuthenticationScenarioParams<T> | false,
): MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioStatus>;
/**
 * Converts any authentication result status into a standardized scenario status.
 * Extracts scenario parameters and attaches them as payload to the new status.
 * @param status - The source status (can be full or partial).
 * @param scenario - The authentication scenario (optional).
 * @param type - The scenario type (authorization, authentication, etc.).
 * @param params - Scenario parameters to extract into payload, or false if none.
 * @returns The converted status with scenario-specific value structure.
 */
function convertResultIntoMultifactorAuthenticationStatus<T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationStatus<unknown> | MultifactorAuthenticationPartialStatus<unknown>,
    scenario: T | undefined,
    type: MultifactorAuthenticationStatusKeyType,
    params: MultifactorAuthenticationScenarioParams<T> | false,
): MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioStatus> | MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus> {
    return {
        ...status,
        value: {
            payload: params ? extractAdditionalParameters<T>(params) : undefined,
            type,
        },
    };
}

/**
 * Retrieves the cancel confirmation modal configuration for a given scenario.
 * Falls back to default UI configuration if scenario-specific config doesn't exist.
 * @param scenario - The authentication scenario (optional).
 * @returns The modal configuration for cancel confirmation.
 */
const getMultifactorCancelConfirmModalConfig = (scenario?: MultifactorAuthenticationScenario) => {
    return (scenario ? MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] : MULTIFACTOR_AUTHENTICATION_DEFAULT_UI).MODALS.cancelConfirmation;
};

/**
 * Creates a status indicating a bad request error occurred.
 * Used when required parameters are missing or invalid.
 * @param currentStatus - The current authentication status to update.
 * @returns Updated status with bad request reason and failed step.
 */
const badRequestStatus = (
    currentStatus: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>,
): MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus> => {
    return {
        ...currentStatus,
        value: {
            ...currentStatus.value,
        },
        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
        step: {
            ...failedStep,
        },
    };
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

const ContextStatus = {
    createBiometricsNotAllowedStatus,
    badRequestStatus,
} as const;

export {
    getAuthTypeName,
    doesDeviceSupportBiometrics,
    isBiometryConfigured,
    isValidScenario,
    shouldClearScenario,
    getOutcomePaths,
    createAuthorizeErrorStatus,
    shouldAllowBiometrics,
    convertResultIntoMultifactorAuthenticationStatus,
    getOutcomeRoute,
    getOutcomePath,
    resetKeys,
    isOnProtectedRoute,
    getMultifactorCancelConfirmModalConfig,
    isProtectedRoute,
    getCancelStatus,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    ContextStatus,
    Status,
};
