import type {ValueOf} from 'type-fest';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationFactor, MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import Navigation from '@navigation/Navigation';
import {requestBiometricChallenge} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import ROUTES, {MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import {MULTIFACTOR_AUTHENTICATION_DEFAULT_UI, MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './config';
import type {
    AllMultifactorAuthenticationNotificationType,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
} from './config/types';
import type {AuthTypeName, BiometricsStatus, MultifactorAuthenticationScenarioStatus, MultifactorAuthenticationStatusKeyType, NoScenarioForStatusReason, NotificationPaths} from './types';

const failedStep = {
    wasRecentStepSuccessful: false,
    isRequestFulfilled: true,
    requiredFactorForNextStep: undefined,
};

const EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus> = {
    value: {},
    notificationPaths: {
        successNotification: 'biometrics-test-success',
        failureNotification: 'biometrics-test-failure',
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
 * A stored public key indicates a successful prior configuration.
 */
async function isBiometryConfigured(accountID: number) {
    const {value: localPublicKey} = await PublicKeyStore.get(accountID);
    const {publicKeys: authPublicKeys = []} = await requestBiometricChallenge();

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
 * Sets success to false but marks the request as fulfilled since no further scenario is possible.
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
 * Creates a status requesting a validation code from the user.
 * Sets success to false and unfulfilled since user input is required.
 */
function createValidateCodeMissingStatus(prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> {
    return {
        ...prevStatus,
        step: createBaseStep(false, false, CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE),
        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.VALIDATE_CODE_MISSING,
    };
}

/**
 * Creates a status from a key store error.
 * Preserves the error details but marks the request as fulfilled since retry is needed.
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
 * Creates a status reflecting the result of registering with the backend.
 * Success is based on the API response but always marks as fulfilled.
 */
function createRegistrationResultStatus(partialStatus: Partial<MultifactorAuthenticationPartialStatus<BiometricsStatus>>) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
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
 * Creates a status reflecting whether multifactorial authentication is configured.
 * Only updates the configuration flag while preserving other status fields.
 */
function createRefreshStatusStatus(setupStatus: BiometricsStatus, overwriteStatus?: Partial<MultifactorAuthenticationStatus<BiometricsStatus>>) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
        ...prevStatus,
        ...overwriteStatus,
        value: setupStatus,
    });
}

/**
 * Helper function that converts a numeric authentication type from SecureStore into
 * a human-readable string name.
 */
const getAuthTypeName = <T>({type}: MultifactorAuthenticationPartialStatus<T>): AuthTypeName | undefined =>
    Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === type)?.NAME;

const additionalParametersToExclude = ['chainedWithAuthorization', 'chainedPrivateKeyStatus'] as const;

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

// const shouldAllowPasskeys = (allowedAuthentication: ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>) =>
//     allowedAuthentication === CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS || allowedAuthentication === CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_OR_PASSKEYS;

const shouldAllowBiometrics = (allowedAuthentication: ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>) =>
    allowedAuthentication === CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS || allowedAuthentication === CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_OR_PASSKEYS;

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

const createEmptyStatus = <T>(initialValue: T, {headerTitle, title, description}: {headerTitle: string; title: string; description: string}): MultifactorAuthenticationStatus<T> => ({
    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ACTION_MADE_YET,
    headerTitle,
    title,
    description,
    notificationPaths: {
        successNotification: 'biometrics-test-success',
        failureNotification: 'biometrics-test-failure',
    },
    scenario: undefined,
    value: initialValue,
    step: {
        wasRecentStepSuccessful: undefined,
        requiredFactorForNextStep: undefined,
        isRequestFulfilled: true,
    },
});

const isProtectedRoute = (route: string) => Object.values(MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES).some((protectedRoute) => route.startsWith(`/${protectedRoute}`));

const isOnProtectedRoute = () => isProtectedRoute(Navigation.getActiveRouteWithoutParams());

const getNotificationPath = (scenarioPrefix: Lowercase<MultifactorAuthenticationScenario> | undefined, suffix: string): AllMultifactorAuthenticationNotificationType => {
    return `${scenarioPrefix ?? 'biometrics-test'}-${suffix}` as AllMultifactorAuthenticationNotificationType;
};

const getNotificationRoute = (path: AllMultifactorAuthenticationNotificationType | undefined): Route => {
    if (!path) {
        return ROUTES.MULTIFACTOR_AUTHENTICATION_NOT_FOUND;
    }
    return ROUTES.MULTIFACTOR_AUTHENTICATION_NOTIFICATION.getRoute(path);
};

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
function convertResultIntoMultifactorAuthenticationStatus<T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationStatus<unknown> | MultifactorAuthenticationPartialStatus<unknown>,
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

const getMultifactorCancelConfirmModalConfig = (scenario?: MultifactorAuthenticationScenario) => {
    return (scenario ? MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] : MULTIFACTOR_AUTHENTICATION_DEFAULT_UI).MODALS.cancelConfirmation;
};

const badRequestStatus = (
    currentStatus: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>,
): MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus> => {
    return {
        ...currentStatus,
        value: {
            ...currentStatus.value,
        },
        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.BAD_REQUEST,
        step: {
            ...failedStep,
        },
    };
};

const isValidScenario = (scenario: string): scenario is MultifactorAuthenticationScenario => {
    const scenarios = Object.values(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO);
    return !!scenarios.find((sc) => sc === scenario);
};

const shouldClearScenario = (scenario: MultifactorAuthenticationScenario | NoScenarioForStatusReason) => {
    return scenario === CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.FULFILL || scenario === CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.CANCEL;
};

const getNotificationPaths = (scenario: MultifactorAuthenticationScenario | undefined): NotificationPaths => {
    const scenarioPrefix = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
    const successNotification = getNotificationPath(scenarioPrefix, 'success');
    const failureNotification = getNotificationPath(scenarioPrefix, 'failure');

    return {
        successNotification,
        failureNotification,
    };
};

/**
 * Cleans up multifactorial authentication configuration by removing both private and public keys
 * from secure storage. Used when resetting or recovering from a failed setup.
 */
async function resetKeys(accountID: number) {
    await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);
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
    createCancelStatus,
    createBaseStep,
    createRefreshStatusStatus,
    createEmptyStatus,
} as const;

const MergedHooksStatus = {
    createBiometricsNotAllowedStatus,
    badRequestStatus,
} as const;

export {
    getAuthTypeName,
    doesDeviceSupportBiometrics,
    isBiometryConfigured,
    isValidScenario,
    shouldClearScenario,
    getNotificationPaths,
    createAuthorizeErrorStatus,
    shouldAllowBiometrics,
    convertResultIntoMultifactorAuthenticationStatus,
    getNotificationRoute,
    getNotificationPath,
    resetKeys,
    isOnProtectedRoute,
    getMultifactorCancelConfirmModalConfig,
    isProtectedRoute,
    getCancelStatus,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    MergedHooksStatus,
    Status,
};
