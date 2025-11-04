import type {ValueOf} from 'type-fest';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import type {
    MultifactorAuthenticationFactor,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationStatus,
    MultifactorAuthorizationFallbackScenario,
    MultifactorAuthorizationFallbackScenarioParams,
} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import type {AuthTypeName, MultifactorAuthenticationScenarioStatus, MultifactorAuthenticationStatusKeyType} from './types';

const failedStep = {
    wasRecentStepSuccessful: false,
    isRequestFulfilled: true,
    requiredFactorForNextStep: undefined,
};

const EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus> = {
    value: {
        scenario: undefined,
    },
    reason: 'multifactorAuthentication.reason.generic.notRequested',
    message: 'No request made yet',
    title: 'No request made yet',
    step: {
        ...failedStep,
    },
};

/**
 * Creates a status object for failed multifactorial authentication authorization attempts.
 * Takes the error status from a failed multifactorial authentication operation and merges it with the previous status,
 * marking the attempt as unsuccessful while fulfilling the request to prevent retries.
 */
const createAuthorizeErrorStatus = (errorStatus: MultifactorAuthenticationPartialStatus<boolean, true>) => (prevStatus: MultifactorAuthenticationStatus<boolean>) => ({
    ...prevStatus,
    ...errorStatus,
    step: {
        ...failedStep,
    },
});

function areMultifactorAuthorizationFallbackParamsValid<T extends MultifactorAuthorizationFallbackScenario>(
    scenario: T,
    params: Record<string, unknown>,
): params is MultifactorAuthorizationFallbackScenarioParams<T> {
    return Object.keys(params).every((key) => {
        return CONST.MULTI_FACTOR_AUTHENTICATION.FACTOR_COMBINATIONS.BIOMETRICS_AUTHENTICATION.find(
            (factor) => CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS[factor].parameter !== key,
        );
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
async function isBiometryConfigured(accountID: number) {
    return !!(await PublicKeyStore.get(accountID)).value;
}

/**
 * Cleans up multifactorial authentication configuration by removing both private and public keys
 * from secure storage. Used when resetting or recovering from failed setup.
 */
async function resetKeys(accountID: number) {
    await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);
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
function createCancelStatus(prevStatus: MultifactorAuthenticationStatus<boolean>): MultifactorAuthenticationStatus<boolean> {
    return {
        ...prevStatus,
        step: {
            isRequestFulfilled: true,
            wasRecentStepSuccessful: undefined,
            requiredFactorForNextStep: undefined,
        },
    };
}

function createCancelStatusWithNoValue<T>(prevStatus: MultifactorAuthenticationStatus<T>): MultifactorAuthenticationStatus<T | undefined> {
    return {
        ...prevStatus,
        value: undefined,
        step: {
            isRequestFulfilled: true,
            wasRecentStepSuccessful: undefined,
            requiredFactorForNextStep: undefined,
        },
    };
}

/**
 * Creates a status reflecting whether multifactorial authentication is configured.
 * Only updates the configuration flag while preserving other status fields.
 */
function createRefreshStatusStatus(isMultifactorAuthenticationConfiguredValue: boolean, overwriteStatus?: Partial<MultifactorAuthenticationStatus<boolean>>) {
    return (prevStatus: MultifactorAuthenticationStatus<boolean>): MultifactorAuthenticationStatus<boolean> => ({
        ...prevStatus,
        ...overwriteStatus,
        value: isMultifactorAuthenticationConfiguredValue,
    });
}

/**
 * Helper function that converts a numeric authentication type from SecureStore into
 * a human-readable string name.
 */
const getAuthTypeName = <T>({type}: MultifactorAuthenticationPartialStatus<T>): AuthTypeName | undefined =>
    Object.values(CONST.MULTI_FACTOR_AUTHENTICATION.AUTH_TYPE).find(({CODE}) => CODE === type)?.NAME;

const additionalParametersToExclude = ['chainedWithAuthorization', 'chainedPrivateKeyStatus'] as const;

const extractAdditionalParameters = <T extends MultifactorAuthenticationScenario>(
    params: MultifactorAuthenticationScenarioParams<T> & Record<string, unknown>,
): MultifactorAuthenticationScenarioAdditionalParams<T> => {
    const factorParams = Object.values(CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS).map(({parameter}) => parameter);
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

const shouldAllowFallback = (securityLevel: ValueOf<typeof CONST.MULTI_FACTOR_AUTHENTICATION.SECURITY_LEVEL>) =>
    securityLevel === CONST.MULTI_FACTOR_AUTHENTICATION.SECURITY_LEVEL.FALLBACK_ONLY || securityLevel === CONST.MULTI_FACTOR_AUTHENTICATION.SECURITY_LEVEL.BIOMETRICS_WITH_FALLBACK;

const shouldAllowBiometrics = (securityLevel: ValueOf<typeof CONST.MULTI_FACTOR_AUTHENTICATION.SECURITY_LEVEL>) =>
    securityLevel === CONST.MULTI_FACTOR_AUTHENTICATION.SECURITY_LEVEL.BIOMETRICS_WITH_FALLBACK;

// eslint-disable-next-line rulesdir/no-negated-variables
const createBiometricsNotAllowedStatus = <T extends MultifactorAuthenticationScenario>(
    scenario: T,
    params: MultifactorAuthenticationScenarioParams<T> & Record<string, unknown>,
    authorization?: boolean,
): [MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioStatus>, MultifactorAuthenticationStatusKeyType] => {
    return [
        {
            step: {
                ...failedStep,
            },
            value: {
                scenario,
                payload: extractAdditionalParameters<T>(params),
            },
            reason: 'multifactorAuthentication.reason.error.biometricsNotAllowed',
        },
        authorization ? CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION : CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION,
    ];
};

const createEmptyStatus = <T>(initialValue: T, defaultText: string): MultifactorAuthenticationStatus<T> => ({
    reason: 'multifactorAuthentication.reason.generic.notRequested',
    message: defaultText,
    title: defaultText,
    value: initialValue,
    step: {
        wasRecentStepSuccessful: undefined,
        requiredFactorForNextStep: undefined,
        isRequestFulfilled: true,
    },
});

// eslint-disable-next-line rulesdir/no-negated-variables
const createFallbackNotAllowedStatus = <T extends MultifactorAuthenticationScenario>(
    scenario: T,
    params: MultifactorAuthenticationScenarioParams<T>,
): [MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioStatus>, MultifactorAuthenticationStatusKeyType] => {
    return [
        {
            step: {
                ...failedStep,
            },
            value: {
                scenario,
                payload: extractAdditionalParameters<T>(params),
            },
            reason: 'multifactorAuthentication.reason.error.fallbackNotAllowed',
        },
        CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK,
    ];
};

function convertResultIntoMFAStatus<T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationStatus<unknown>,
    scenario: T | undefined,
    type: MultifactorAuthenticationStatusKeyType,
    params: MultifactorAuthenticationScenarioParams<T> | false,
): MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>;
function convertResultIntoMFAStatus<T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationPartialStatus<unknown>,
    scenario: T | undefined,
    type: MultifactorAuthenticationStatusKeyType,
    params: MultifactorAuthenticationScenarioParams<T> | false,
): MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioStatus>;
function convertResultIntoMFAStatus<T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationStatus<unknown> | MultifactorAuthenticationPartialStatus<unknown>,
    scenario: T | undefined,
    type: MultifactorAuthenticationStatusKeyType,
    params: MultifactorAuthenticationScenarioParams<T> | false,
): MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioStatus> | MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus> {
    return {
        ...status,
        value: {
            scenario,
            payload: params ? extractAdditionalParameters<T>(params) : undefined,
            type,
        },
    };
}

const badRequestStatus = (
    currentStatus: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>,
): MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus> => {
    return {
        ...currentStatus,
        reason: 'multifactorAuthentication.reason.error.badRequest',
        step: {
            ...failedStep,
        },
    };
};

/**
 * Collection of status creator functions for handling different multifactorial authentication states.
 * Each function builds a properly formatted status object for its specific case.
 */
const Status = {
    createUnsupportedDeviceStatus,
    createValidateCodeMissingStatus,
    createKeyErrorStatus,
    createRegistrationResultStatus,
    createCancelStatus,
    createBaseStep,
    createRefreshStatusStatus,
    createCancelStatusWithNoValue,
    createEmptyStatus,
} as const;

const MergedHooksStatus = {
    createBiometricsNotAllowedStatus,
    createFallbackNotAllowedStatus,
    badRequestStatus,
} as const;

export {
    areMultifactorAuthorizationFallbackParamsValid,
    getAuthTypeName,
    doesDeviceSupportBiometrics,
    isBiometryConfigured,
    resetKeys,
    createAuthorizeErrorStatus,
    shouldAllowFallback,
    shouldAllowBiometrics,
    convertResultIntoMFAStatus,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    MergedHooksStatus,
    Status,
};
