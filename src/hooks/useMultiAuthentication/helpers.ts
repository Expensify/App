import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/KeyStore';
import type {
    MultifactorAuthenticationFactor,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationStatus,
    MultifactorAuthorizationFallbackScenarioParams,
} from '@libs/MultifactorAuthentication/types';
import CONST from '@src/CONST';
import type {AuthTypeName, CreateMultifactorAuthenticationRecentStatus} from './types';

/**
 * Creates a MultifactorAuthenticationRecentStatus object that contains both the status and cancel method.
 * The status includes whether the most recent multifactorial authentication step was successful.
 * The cancel method is used to cancel the multifactorial authentication operation.
 */
const createRecentStatus: CreateMultifactorAuthenticationRecentStatus = (result, cancel) => ({
    status: {...result, value: !!result.step.wasRecentStepSuccessful},
    cancel,
});

/**
 * Creates a status object for failed multifactorial authentication authorization attempts.
 * Takes the error status from a failed multifactorial authentication operation and merges it with the previous status,
 * marking the attempt as unsuccessful while fulfilling the request to prevent retries.
 */
const createAuthorizeErrorStatus = (errorStatus: MultifactorAuthenticationPartialStatus<boolean, true>) => (prevStatus: MultifactorAuthenticationStatus<boolean>) => ({
    ...prevStatus,
    ...errorStatus,
    step: {
        wasRecentStepSuccessful: false,
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
    },
});

function areMultifactorAuthorizationFallbackParamsValid<T extends MultifactorAuthenticationScenario>(
    scenario: T,
    params: Record<string, unknown>,
): params is MultifactorAuthorizationFallbackScenarioParams<T> {
    return Object.keys(params).every((key) => {
        return CONST.MULTI_FACTOR_AUTHENTICATION.FACTOR_COMBINATIONS.TWO_FACTOR.find((factor) => CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS[factor].parameter === key);
    });
}

/**
 * Checks if the device supports either multifactorial authentication (like fingerprint/face)
 * or device credentials (like PIN/pattern) by querying the key store capabilities.
 */
function doesDeviceSupportBiometrics() {
    const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
    return biometrics || credentials;
}

/**
 * Checks if multifactorial authentication is already set up by looking for a public key in secure storage.
 * A stored public key indicates successful prior configuration.
 */
async function isBiometryConfigured() {
    return !!(await PublicKeyStore.get()).value;
}

/**
 * Cleans up multifactorial authentication configuration by removing both private and public keys
 * from secure storage. Used when resetting or recovering from failed setup.
 */
async function resetKeys() {
    await Promise.all([PrivateKeyStore.delete(), PublicKeyStore.delete()]);
}

/**
 * Creates the common status fields used across different status states.
 * Tracks success, fulfillment and any required authentication factor.
 */
const createBaseStep = (wasSuccessful: boolean, isRequestFulfilled: boolean, requiredFactor?: MultifactorAuthenticationFactor) => ({
    wasRecentStepSuccessful: wasSuccessful,
    isRequestFulfilled,
    requiredFactorForNextStep: requiredFactor,
});

/**
 * Creates a status indicating the device lacks multifactorial authentication capability.
 * Sets success to false but marks request as fulfilled since no further scenario is possible.
 */
function createUnsupportedDeviceStatus(prevStatus: MultifactorAuthenticationStatus<boolean>) {
    return {
        ...prevStatus,
        value: false,
        step: createBaseStep(false, true),
    };
}

/**
 * Creates a status requesting a validation code from the user.
 * Sets success to false and unfulfilled since user input is required.
 */
function createValidateCodeMissingStatus(prevStatus: MultifactorAuthenticationStatus<boolean>): MultifactorAuthenticationStatus<boolean> {
    return {
        ...prevStatus,
        step: createBaseStep(false, false, CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE),
        reason: 'multifactorAuthentication.reason.error.validateCodeMissing',
    };
}

/**
 * Creates a status from a key store error.
 * Preserves the error details but marks the request as fulfilled since retry is needed.
 */
function createKeyErrorStatus({reason, type}: MultifactorAuthenticationPartialStatus<boolean, true>) {
    return (prevStatus: MultifactorAuthenticationStatus<boolean>): MultifactorAuthenticationStatus<boolean> => ({
        ...prevStatus,
        reason,
        type,
        step: createBaseStep(false, true),
    });
}

/**
 * Creates a status reflecting the result of registering with the backend.
 * Success is based on the API response but always marks as fulfilled.
 */
function createRegistrationResultStatus(partialStatus: Partial<MultifactorAuthenticationPartialStatus<boolean>>) {
    return (prevStatus: MultifactorAuthenticationStatus<boolean>): MultifactorAuthenticationStatus<boolean> => ({
        ...prevStatus,
        ...partialStatus,
        step: createBaseStep(!!partialStatus.step?.wasRecentStepSuccessful, true),
    });
}

/**
 * Creates a status marking the current request as complete.
 * Success depends on having no pending requirements and previous success.
 * Returns unchanged status if already fulfilled.
 */
function createFulfillStatus(prevStatus: MultifactorAuthenticationStatus<boolean>): MultifactorAuthenticationStatus<boolean> {
    if (prevStatus.step.isRequestFulfilled) {
        return prevStatus;
    }

    const wasSuccessful = !prevStatus.step.requiredFactorForNextStep && !!prevStatus.step.wasRecentStepSuccessful;

    return {
        ...prevStatus,
        step: createBaseStep(wasSuccessful, true),
    };
}

/**
 * Creates a status reflecting whether multifactorial authentication is configured.
 * Only updates the configuration flag while preserving other status fields.
 */
function createRefreshStatusStatus(isMultifactorAuthenticationConfiguredValue: boolean) {
    return (prevStatus: MultifactorAuthenticationStatus<boolean>): MultifactorAuthenticationStatus<boolean> => ({
        ...prevStatus,
        value: isMultifactorAuthenticationConfiguredValue,
    });
}

/**
 * Collection of status creator functions for handling different multifactorial authentication states.
 * Each function builds a properly formatted status object for its specific case.
 */
const Status = {
    createUnsupportedDeviceStatus,
    createValidateCodeMissingStatus,
    createKeyErrorStatus,
    createRegistrationResultStatus,
    createFulfillStatus,
    createRefreshStatusStatus,
} as const;

/**
 * Helper function that converts a numeric authentication type from SecureStore into
 * a human-readable string name.
 */
const getAuthTypeName = <T>({type}: MultifactorAuthenticationPartialStatus<T>): AuthTypeName | undefined =>
    Object.values(CONST.MULTI_FACTOR_AUTHENTICATION.AUTH_TYPE).find(({CODE}) => CODE === type)?.NAME;

export {
    areMultifactorAuthorizationFallbackParamsValid,
    createRecentStatus,
    getAuthTypeName,
    doesDeviceSupportBiometrics,
    isBiometryConfigured,
    resetKeys,
    createAuthorizeErrorStatus,
    Status,
};
