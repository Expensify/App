import type {ValueOf} from 'type-fest';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationPartialStatus, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import Navigation from '@navigation/Navigation';
import {registerAuthenticationKey, requestAuthenticationChallenge} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import ROUTES, {MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import Base64URL from '@src/utils/Base64URL';
import {MULTIFACTOR_AUTHENTICATION_DEFAULT_UI, MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './config';
import type {
    AllMultifactorAuthenticationOutcomeType,
    MultifactorAuthenticationOutcomeSuffixes,
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationScenarioParams,
} from './config/types';
import type {AuthTypeName, MarqetaAuthTypeName, NoScenarioForStatusReason, OutcomePaths} from './types';

/**
 * Checks if the device supports biometric authentication methods.
 * Verifies both biometrics and credentials authentication capabilities.
 * @returns True if biometrics or credentials authentication is supported on the device.
 */
function doesDeviceSupportBiometrics() {
    const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
    return biometrics || credentials;
}

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
    const factorParams = Object.values(CONST.MULTIFACTOR_AUTHENTICATION.FACTORS);

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
 * Retrieves the authentication type name from a status object by matching the type code.
 * Returns the human-readable name (e.g., 'BIOMETRICS') if found in the secure store values.
 * @param status - The authentication status containing the type code to look up.
 * @returns The authentication type name or undefined if not found.
 */
const getAuthTypeName = <T>({type}: MultifactorAuthenticationPartialStatus<T>): AuthTypeName | undefined =>
    Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === type)?.NAME;

/**
 * Determines if a biometric authentication method is allowed for a given authentication type.
 * @param allowedAuthenticationMethods - The list of authentication types configuration to check.
 * @returns True if biometrics authentication is allowed, false otherwise.
 */
const shouldAllowBiometrics = (allowedAuthenticationMethods: Array<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>>) =>
    allowedAuthenticationMethods.includes(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS);

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
 * Retrieves the cancel confirmation modal configuration for a given scenario.
 * Falls back to default UI configuration if scenario-specific config doesn't exist.
 * @param scenario - The authentication scenario (optional).
 * @returns The modal configuration for cancel confirmation.
 */
const getMultifactorCancelConfirmModalConfig = (scenario?: MultifactorAuthenticationScenario) => {
    return (scenario ? MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] : MULTIFACTOR_AUTHENTICATION_DEFAULT_UI).MODALS.cancelConfirmation;
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

type ProcessResult = {
    success: boolean;
    reason: MultifactorAuthenticationReason;
};

type RegistrationParams = {
    publicKey: string;
    validateCode: string;
    authenticationMethod: MarqetaAuthTypeName;
    challenge: string;
};

type RegistrationKeyInfo = {
    rawId: Base64URLString;
    type: 'biometric';
    response: {
        clientDataJSON: Base64URLString;
        biometric: {
            publicKey: Base64URLString;
            algorithm: -8;
        };
    };
};

function createKeyInfoObject({publicKey, challenge}: {publicKey: string; challenge: string}): RegistrationKeyInfo {
    const rawId: Base64URLString = publicKey;

    // Create clientDataJSON with the challenge
    const clientDataJSON = JSON.stringify({challenge});
    const clientDataJSONBase64 = Base64URL.encode(clientDataJSON);

    return {
        rawId,
        type: 'biometric' as const,
        response: {
            clientDataJSON: clientDataJSONBase64,
            biometric: {
                publicKey,
                algorithm: -8 as const,
            },
        },
    };
}

async function processRegistration(params: RegistrationParams): Promise<ProcessResult> {
    if (!params.validateCode) {
        return {
            success: false,
            reason: VALUES.REASON.GENERIC.VALIDATE_CODE_MISSING,
        };
    }

    if (!params.challenge) {
        return {
            success: false,
            reason: VALUES.REASON.CHALLENGE.CHALLENGE_MISSING,
        };
    }

    const keyInfo = createKeyInfoObject({
        publicKey: params.publicKey,
        challenge: params.challenge,
    });

    const {httpCode, reason} = await registerAuthenticationKey({
        keyInfo,
        validateCode: Number(params.validateCode),
        authenticationMethod: params.authenticationMethod,
    });

    const success = String(httpCode).startsWith('2');

    return {
        success,
        reason,
    };
}

async function processScenario<T extends MultifactorAuthenticationScenario>(
    scenario: T,
    params: MultifactorAuthenticationProcessScenarioParameters<T> & {authenticationMethod: MarqetaAuthTypeName},
): Promise<ProcessResult> {
    const currentScenario = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] as MultifactorAuthenticationScenarioConfig;

    if (!params.signedChallenge) {
        return {
            success: false,
            reason: VALUES.REASON.GENERIC.SIGNATURE_MISSING,
        };
    }

    const {httpCode, reason} = await currentScenario.action(params);
    const success = String(httpCode).startsWith('2');

    return {
        success,
        reason,
    };
}

export {
    getAuthTypeName,
    doesDeviceSupportBiometrics,
    isBiometryConfigured,
    isValidScenario,
    shouldClearScenario,
    getOutcomePaths,
    shouldAllowBiometrics,
    getOutcomeRoute,
    getOutcomePath,
    resetKeys,
    isOnProtectedRoute,
    getMultifactorCancelConfirmModalConfig,
    isProtectedRoute,
    extractAdditionalParameters,
    processRegistration,
    processScenario,
};
export type {ProcessResult, RegistrationParams};
