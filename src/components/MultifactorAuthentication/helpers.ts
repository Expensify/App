import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import type {AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationNotificationSuffixes, MultifactorAuthenticationScenario} from './config/types';
import type {AuthTypeName, NoScenarioForStatusReason, NotificationPaths} from './types';

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

/**
 * Constructs a notification type string from scenario prefix and notification suffix.
 * Combines the lowercase scenario name with the kebab-cased suffix (e.g., 'biometrics-test-success').
 * @param scenarioPrefix - The lowercase scenario name or undefined to use default 'biometrics-test'.
 * @param suffix - The notification suffix (success/failure).
 * @returns A fully qualified notification type string.
 */
const getNotificationPath = <T extends MultifactorAuthenticationScenario>(
    scenarioPrefix: Lowercase<T> | undefined,
    suffix: MultifactorAuthenticationNotificationSuffixes<T>,
): AllMultifactorAuthenticationNotificationType => {
    return `${scenarioPrefix ?? 'biometrics-test'}-${suffix}` as AllMultifactorAuthenticationNotificationType;
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
 * Generates success and failure notification paths for a given scenario.
 * Handles undefined scenarios by using default 'biometrics-test' prefix.
 * @param scenario - The authentication scenario or undefined for defaults.
 * @returns An object containing successNotification and failureNotification paths.
 */
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
 * Deletes both private and public keys for a given account from secure storage.
 * Performs both deletions in parallel to reset the authentication state.
 * @param accountID - The account ID whose keys should be deleted.
 */
async function resetKeys(accountID: number) {
    await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);
}

const Status = {
    createEmptyStatus,
} as const;

export {getAuthTypeName, getNotificationPaths, isValidScenario, shouldClearScenario, resetKeys, Status};
