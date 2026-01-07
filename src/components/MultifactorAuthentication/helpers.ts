import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import type {AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationScenario} from './config/types';
import type {AuthTypeName, NoScenarioForStatusReason, NotificationPaths} from './types';

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

const Status = {
    createEmptyStatus,
} as const;

export {getAuthTypeName, getNotificationPaths, isValidScenario, shouldClearScenario, Status};
