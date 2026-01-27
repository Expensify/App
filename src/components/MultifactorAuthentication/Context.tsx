import React, {createContext, useContext, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {requestValidateCodeAction} from '@libs/actions/User';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationTrigger,
} from '@libs/MultifactorAuthentication/Biometrics/types';
import {MultifactorAuthenticationCallbacks} from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import {normalizedConfigs} from '@navigation/linkingConfig/config';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './config';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from './config/types';
import {
    ContextStatus,
    convertResultIntoMultifactorAuthenticationStatus,
    doesDeviceSupportBiometrics,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    getCancelStatus,
    getOutcomePath,
    getOutcomePaths,
    getOutcomeRoute,
    isOnProtectedRoute,
    isValidScenario,
    resetKeys,
    shouldAllowBiometrics,
} from './helpers';
import type {MultifactorAuthenticationScenarioStatus, MultifactorTriggerArgument, OutcomePaths, Register, UseMultifactorAuthentication} from './types';
import useMultifactorAuthenticationStatus from './useMultifactorAuthenticationStatus';
import useNativeBiometrics from './useNativeBiometrics';

/**
 * Context for multifactor authentication state and operations.
 * Provides access to authentication info, proceed, update, and trigger functions.
 * Default empty context value for use before provider is mounted.
 */
const MultifactorAuthenticationContext = createContext<UseMultifactorAuthentication>({
    info: {
        isLocalPublicKeyInAuth: false,
        isAnyDeviceRegistered: false,
        isBiometryRegisteredLocally: false,
        deviceSupportBiometrics: false,
        description: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.description,
        title: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.title,
        headerTitle: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.headerTitle,
        success: undefined,
        scenario: undefined,
    },
    proceed: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    update: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    trigger: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
});

type MultifactorAuthenticationContextProviderProps = {
    /**
     * The children of the full-screen loader context provider.
     */
    children: ReactNode;
};

/**
 * Provider component that manages multifactor authentication context and state.
 * Orchestrates biometric setup, authorization, and navigation flows.
 * @param children - React components to provide context to.
 */
function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    const NativeBiometrics = useNativeBiometrics();
    const [mergedStatus, setMergedStatus] = useMultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>({
        type: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
    });
    const {translate} = useLocalize();

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            const shouldRedirect = !mergedStatus.scenario && isOnProtectedRoute();

            if (shouldRedirect) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_NOT_FOUND, {forceReplace: true});
            }
        });
    }, [mergedStatus.scenario]);

    const softStorePromptAccepted = useRef<boolean | undefined>(undefined);

    const storedValidateCode = useRef<number | undefined>(undefined);

    const {accountID} = useCurrentUserPersonalDetails();

    /**
     * Navigates to the appropriate screen based on authentication status and result.
     * Handles required factors, callbacks, and result-specific routing.
     * @param status - The current authentication status.
     * @param shouldShowSoftPrompt - Whether to navigate to soft prompt for biometric setup.
     * @param hasEligibleAuthenticationMethods - Value is `true` if the user's device supports at least one eligible method (i.e. biometric, passkey, and/or device passcode)
     */
    const navigate = (status: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>, shouldShowSoftPrompt?: boolean, hasEligibleAuthenticationMethods = true) => {
        const {step, scenario, outcomePaths} = status;

        const {requiredFactorForNextStep, isRequestFulfilled, wasRecentStepSuccessful} = step;

        if (shouldShowSoftPrompt) {
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
            return;
        }

        if (!hasEligibleAuthenticationMethods) {
            const scenarioLowerCase = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
            const outcome = getOutcomePath(scenarioLowerCase, 'no-eligible-methods');
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(outcome));
            return;
        }

        // Handle required factors
        if (requiredFactorForNextStep === CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE && !Navigation.isActiveRoute(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE)) {
            requestValidateCodeAction();
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE);
            return;
        }

        if (!isRequestFulfilled) {
            return;
        }

        // Execute callbacks when request is fulfilled
        for (const callback of Object.values(MultifactorAuthenticationCallbacks.onFulfill)) {
            callback();
        }

        const {screen} = scenario ? MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] : {};

        // Navigate based on step result
        const successRoute = getOutcomeRoute(outcomePaths.successOutcome);
        const failureRoute = getOutcomeRoute(outcomePaths.failureOutcome);

        const scenarioRoute: Route = screen ? (normalizedConfigs[screen].path as Route) : ROUTES.MULTIFACTOR_AUTHENTICATION_NOT_FOUND;

        if (wasRecentStepSuccessful === true && !Navigation.isActiveRoute(successRoute)) {
            Navigation.navigate(successRoute);
            return;
        }

        if (wasRecentStepSuccessful === false && !Navigation.isActiveRoute(failureRoute)) {
            Navigation.navigate(failureRoute);
            return;
        }

        if (wasRecentStepSuccessful === undefined && !Navigation.isActiveRoute(scenarioRoute)) {
            Navigation.navigate(scenarioRoute);
        }
    };

    /**
     * Updates the merged authentication status and navigates based on new state.
     * Wrapper around setMergedStatus that also triggers navigation.
     * @returns The updated merged status.
     */
    const setStatus = (
        ...args: [
            ...Parameters<typeof setMergedStatus>,
            rest?: {
                shouldShowSoftPrompt?: boolean;
                hasEligibleAuthenticationMethods?: boolean;
            },
        ]
    ) => {
        const [status, scenario, outcomePaths, rest] = args;
        const {shouldShowSoftPrompt, hasEligibleAuthenticationMethods} = rest ?? {};
        const merged = setMergedStatus(status, scenario, outcomePaths);

        navigate(merged, shouldShowSoftPrompt, hasEligibleAuthenticationMethods);
        return merged;
    };

    const allowedMethods = <T extends MultifactorAuthenticationScenario>(scenario: T, softPromptAccepted?: boolean) => {
        const {allowedAuthenticationMethods} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
        const canUseBiometrics = shouldAllowBiometrics(allowedAuthenticationMethods);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const isBiometricsAllowed = canUseBiometrics && (NativeBiometrics.setup.isLocalPublicKeyInAuth || softPromptAccepted);
        return {
            // passkeys: shouldAllowPasskeys(allowedAuthenticationMethods),
            biometrics: isBiometricsAllowed,
        };
    };

    const register = (async <T extends MultifactorAuthenticationScenario>(
        params: MultifactorAuthenticationScenarioParams<T> & {
            chainedWithAuthorization?: boolean;
            nativePromptTitle: string;
        },
        scenario: T,
        outcomePaths?: Partial<OutcomePaths>,
        softPromptAccepted?: boolean,
    ) => {
        if (!allowedMethods(scenario, softPromptAccepted).biometrics) {
            return setStatus(ContextStatus.createBiometricsNotAllowedStatus<T>(params), scenario, outcomePaths);
        }

        const {nativePromptTitle} = params;

        const result = await NativeBiometrics.setup.register({...params, nativePromptTitle}, scenario);
        const status = convertResultIntoMultifactorAuthenticationStatus(result, scenario, CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, params);
        const mergedResult = setStatus(status, scenario, outcomePaths);

        if (params.chainedWithAuthorization) {
            return {...mergedResult, value: result.value} as MultifactorAuthenticationStatus<string>;
        }
        return mergedResult;
    }) as Register<MultifactorAuthenticationScenarioStatus>;

    const authorize = async <T extends MultifactorAuthenticationScenario>(
        scenario: T,
        params: MultifactorAuthenticationScenarioParams<T> & {
            chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null> | undefined;
        },
        outcomePaths?: Partial<OutcomePaths>,
        softPromptAccepted?: boolean,
    ) => {
        if (!allowedMethods(scenario, softPromptAccepted).biometrics) {
            return setStatus(ContextStatus.createBiometricsNotAllowedStatus<T>(params), scenario, outcomePaths);
        }
        return setStatus(
            convertResultIntoMultifactorAuthenticationStatus(
                await NativeBiometrics.authorize(scenario, params),
                scenario,
                CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION,
                params,
            ),
            scenario,
            outcomePaths,
        );
    };

    const cancel = (
        args?: {
            wasRecentStepSuccessful?: boolean;
        } & Partial<OutcomePaths>,
    ) => {
        const {successOutcome, failureOutcome, wasRecentStepSuccessful} = args ?? {};

        const {type} = mergedStatus.value;
        const {scenario} = mergedStatus;

        softStorePromptAccepted.current = undefined;
        storedValidateCode.current = undefined;

        const cancelStatus = getCancelStatus(type, wasRecentStepSuccessful, NativeBiometrics.cancel, NativeBiometrics.setup.cancel);
        const scenarioType = type ?? CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION;

        return setStatus(
            convertResultIntoMultifactorAuthenticationStatus(cancelStatus, scenario, scenarioType, false),
            scenario ?? CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.CANCEL,
            {
                successOutcome,
                failureOutcome,
            },
        );
    };

    const proceed = async <T extends MultifactorAuthenticationScenario>(
        scenario: T,
        params?: MultifactorAuthenticationScenarioParams<T> & Partial<OutcomePaths>,
    ): Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>> => {
        const {successOutcome, failureOutcome} = params ?? {};
        const softPromptAccepted = softStorePromptAccepted.current;

        const outcomePaths = {
            successOutcome,
            failureOutcome,
        };

        if (!doesDeviceSupportBiometrics()) {
            return setStatus((prevStatus) => prevStatus, scenario, outcomePaths, {
                hasEligibleAuthenticationMethods: false,
            });
        }

        if (NativeBiometrics.setup.isBiometryRegisteredLocally && !NativeBiometrics.setup.isLocalPublicKeyInAuth) {
            await resetKeys(accountID);
            await NativeBiometrics.setup.refresh();
        }

        const shouldNavigateToSoftPrompt = !NativeBiometrics.setup.isLocalPublicKeyInAuth && softPromptAccepted === undefined && NativeBiometrics.setup.deviceSupportBiometrics;

        if (shouldNavigateToSoftPrompt) {
            const validateCode = params?.validateCode ?? storedValidateCode.current;
            storedValidateCode.current = validateCode;

            let stepUpdate = {};
            if (!validateCode) {
                stepUpdate = {
                    isRequestFulfilled: false,
                    requiredFactorForNextStep: CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE,
                    wasRecentStepSuccessful: undefined,
                };
            }

            return setStatus(
                (prevStatus) =>
                    convertResultIntoMultifactorAuthenticationStatus(
                        {...prevStatus, step: {...prevStatus.step, ...stepUpdate}},
                        scenario,
                        CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
                        params ?? false,
                    ),
                scenario,
                outcomePaths,
                {
                    shouldShowSoftPrompt: !!validateCode,
                },
            );
        }

        if (!NativeBiometrics.setup.isLocalPublicKeyInAuth) {
            /** Device is not registered, let's do that first */

            /** Run the setup method */
            if (!params) {
                return setStatus((prevStatus) => ContextStatus.badRequestStatus(prevStatus), scenario, outcomePaths);
            }

            const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

            const nativePromptTitle = translate(nativePromptTitleTPath);

            const requestStatus = await register({...params, chainedWithAuthorization: true, nativePromptTitle}, scenario, outcomePaths, softPromptAccepted);

            if (!requestStatus.step.wasRecentStepSuccessful) {
                return setStatus(
                    convertResultIntoMultifactorAuthenticationStatus(requestStatus, scenario, CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION, params),
                    scenario,
                    outcomePaths,
                );
            }

            return authorize(scenario, {...params, chainedPrivateKeyStatus: requestStatus}, outcomePaths, softPromptAccepted);
        }

        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

        // If the scenario is pure, the payload is not needed hence for the proceed call the params can be empty
        if (!params && !('pure' in config)) {
            return setStatus((prevStatus) => ContextStatus.badRequestStatus(prevStatus), scenario, outcomePaths);
        }

        /** Multifactor authentication is configured already, let's do the challenge logic */
        const result = await authorize(scenario, {...(params as MultifactorAuthenticationScenarioParams<T>), chainedPrivateKeyStatus: undefined}, outcomePaths, softPromptAccepted);

        if (result.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.REGISTRATION_REQUIRED) {
            await resetKeys(accountID);
        }

        return result;
    };

    const update = async (
        params: Partial<AllMultifactorAuthenticationFactors> & {
            softPromptDecision?: boolean;
        },
    ) => {
        const {payload} = mergedStatus.value;
        const {isRequestFulfilled} = mergedStatus.step;
        const {scenario} = mergedStatus;

        if (!scenario || isRequestFulfilled) {
            return setStatus(ContextStatus.badRequestStatus(mergedStatus), scenario ?? CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.UPDATE);
        }

        const validateCode = params.validateCode ?? storedValidateCode.current;
        softStorePromptAccepted.current = params.softPromptDecision ?? softStorePromptAccepted.current;

        return proceed(scenario, {
            ...payload,
            ...params,
            validateCode,
        });
    };

    const trigger = async <T extends MultifactorAuthenticationTrigger>(triggerType: T, argument?: MultifactorTriggerArgument<T>) => {
        const isScenarioArgument = argument && isValidScenario(argument);
        const scenarioOutcomePaths = isScenarioArgument ? getOutcomePaths(argument) : {};

        switch (triggerType) {
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FULFILL:
                return cancel({wasRecentStepSuccessful: true, ...(isScenarioArgument ? scenarioOutcomePaths : {successOutcome: argument ?? undefined})});
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.CANCEL:
                return cancel(isScenarioArgument ? scenarioOutcomePaths : {successOutcome: argument ?? undefined});
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FAILURE:
                return cancel({wasRecentStepSuccessful: false, ...(isScenarioArgument ? scenarioOutcomePaths : {failureOutcome: argument ?? undefined})});
            default:
                return mergedStatus;
        }
    };

    const {isLocalPublicKeyInAuth, isBiometryRegisteredLocally, isAnyDeviceRegistered, deviceSupportBiometrics} = NativeBiometrics.setup;
    const {scenario} = mergedStatus;

    const {wasRecentStepSuccessful, requiredFactorForNextStep, isRequestFulfilled} = mergedStatus.step;

    let success;

    if (!!requiredFactorForNextStep || !isRequestFulfilled) {
        success = undefined;
    } else {
        success = wasRecentStepSuccessful;
    }

    const {title, headerTitle, description} = mergedStatus;

    const info = {
        title,
        headerTitle,
        description,
        success,
        deviceSupportBiometrics,
        isLocalPublicKeyInAuth,
        isBiometryRegisteredLocally,
        isAnyDeviceRegistered,
        scenario,
    };

    // The React compiler prohibits the use of useCallback and useMemo in new components
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const MultifactorAuthenticationData = {info, proceed, update, trigger};

    return <MultifactorAuthenticationContext.Provider value={MultifactorAuthenticationData}>{children}</MultifactorAuthenticationContext.Provider>;
}

/**
 * Hook to access multifactor authentication context.
 * Must be used within a MultifactorAuthenticationContextProvider.
 * @returns The multifactor authentication context with info, proceed, update, and trigger functions.
 * @throws Error if used outside of the provider.
 */
function useMultifactorAuthenticationContext(): UseMultifactorAuthentication {
    const context = useContext(MultifactorAuthenticationContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationContext must be used within a MultifactorAuthenticationContextProvider');
    }

    return context;
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export default MultifactorAuthenticationContextProvider;
export {MultifactorAuthenticationContext, useMultifactorAuthenticationContext};
