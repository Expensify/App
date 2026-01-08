import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationFactor, MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import {requestBiometricChallenge} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import {MULTIFACTOR_AUTHENTICATION_DEFAULT_UI, MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './config';
import type {AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationScenario} from './config/types';
import type {AuthTypeName, BiometricsStatus, NoScenarioForStatusReason, NotificationPaths} from './types';

const failedStep = {
    wasRecentStepSuccessful: false,
    isRequestFulfilled: true,
    requiredFactorForNextStep: undefined,
};

const createAuthorizeErrorStatus = (errorStatus: MultifactorAuthenticationPartialStatus<boolean, true>) => (prevStatus: MultifactorAuthenticationStatus<boolean>) => ({
    ...prevStatus,
    ...errorStatus,
    step: {
        ...failedStep,
    },
});

function doesDeviceSupportBiometrics() {
    const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
    return biometrics || credentials;
}

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

const createBaseStep = (wasSuccessful: boolean, isRequestFulfilled: boolean, requiredFactor?: MultifactorAuthenticationFactor) => ({
    wasRecentStepSuccessful: wasSuccessful,
    isRequestFulfilled,
    requiredFactorForNextStep: requiredFactor,
});

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

function createValidateCodeMissingStatus(prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> {
    return {
        ...prevStatus,
        step: createBaseStep(false, false, CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE),
        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.VALIDATE_CODE_MISSING,
    };
}

function createKeyErrorStatus({reason, type}: MultifactorAuthenticationPartialStatus<boolean, true>) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
        ...prevStatus,
        reason,
        type,
        step: createBaseStep(false, true),
    });
}

function createRegistrationResultStatus(partialStatus: Partial<MultifactorAuthenticationPartialStatus<BiometricsStatus>>) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
        ...prevStatus,
        ...partialStatus,
        step: createBaseStep(!!partialStatus.step?.wasRecentStepSuccessful, true),
    });
}

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

function createRefreshStatusStatus(setupStatus: BiometricsStatus, overwriteStatus?: Partial<MultifactorAuthenticationStatus<BiometricsStatus>>) {
    return (prevStatus: MultifactorAuthenticationStatus<BiometricsStatus>): MultifactorAuthenticationStatus<BiometricsStatus> => ({
        ...prevStatus,
        ...overwriteStatus,
        value: setupStatus,
    });
}

const getAuthTypeName = <T>({type}: MultifactorAuthenticationPartialStatus<T>): AuthTypeName | undefined =>
    Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === type)?.NAME;

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

const getNotificationPath = (scenarioPrefix: Lowercase<MultifactorAuthenticationScenario> | undefined, suffix: string): AllMultifactorAuthenticationNotificationType => {
    return `${scenarioPrefix ?? 'biometrics-test'}-${suffix}` as AllMultifactorAuthenticationNotificationType;
};

const getMultifactorCancelConfirmModalConfig = (scenario?: MultifactorAuthenticationScenario) => {
    return (scenario ? MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] : MULTIFACTOR_AUTHENTICATION_DEFAULT_UI).MODALS.cancelConfirmation;
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

export {
    getAuthTypeName,
    doesDeviceSupportBiometrics,
    isBiometryConfigured,
    isValidScenario,
    shouldClearScenario,
    getNotificationPaths,
    createAuthorizeErrorStatus,
    resetKeys,
    getMultifactorCancelConfirmModalConfig,
    Status,
};
