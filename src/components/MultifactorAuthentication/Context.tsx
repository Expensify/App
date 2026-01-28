/**
 * MultifactorAuthenticationContextProvider and useMultifactorAuthenticationContext
 *
 * Manages the entire multifactor authentication flow including:
 * - Biometric device registration (setting up private key and biometric data)
 * - Biometric authorization (challenge/proof of biometric)
 * - Validation code entry and verification
 * - Soft prompt display for biometric setup suggestions
 * - Navigation to outcome screens based on authentication results
 *
 * The provider orchestrates three main operations:
 * 1. `register` - Sets up biometrics on the device (one-time or on demand)
 * 2. `authorize` - Performs the actual authentication challenge
 * 3. `proceed` - Orchestrates the full flow based on device state
 *
 * State is managed using `useMultifactorAuthenticationStatus` hook.
 * Navigation is triggered through the `navigate` function based on the current status.
 */
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
    doesDeviceSupportBiometrics,
    extractAdditionalParameters,
    getOutcomePath,
    getOutcomePaths,
    getOutcomeRoute,
    isOnProtectedRoute,
    isValidScenario,
    processRegistration,
    resetKeys,
    shouldAllowBiometrics,
} from './helpers';
import type {MultifactorAuthenticationScenarioStatus, MultifactorTriggerArgument, OutcomePaths, UseMultifactorAuthentication} from './types';
import useMultifactorAuthenticationStatus from './useMultifactorAuthenticationStatus';
import useNativeBiometrics from './useNativeBiometrics';

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
        wasRecentStepSuccessful: false,
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
    },
};

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
    proceed: () => Promise.resolve(),
    update: () => Promise.resolve(),
    trigger: () => Promise.resolve(),
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

    /**
     * Tracks if the user has accepted the soft biometric setup prompt.
     * Can only be `true` (user accepted) or `undefined` (not yet answered).
     * No rejection option exists - users can only accept or navigate back.
     */
    const didUserAcceptSoftPrompt = useRef<true | undefined>(undefined);

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

        if (!hasEligibleAuthenticationMethods) {
            const scenarioLowerCase = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
            const outcome = getOutcomePath(scenarioLowerCase, 'no-eligible-methods');
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(outcome));
            return;
        }

        if (shouldShowSoftPrompt) {
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
            return;
        }

        // Handle required factors
        if (requiredFactorForNextStep === CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE && !Navigation.isActiveRoute(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE)) {
            requestValidateCodeAction();
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE);
            return;
        }

        /**
         * Don't proceed with outcome navigation until the API authentication request completes.
         * This prevents navigating before we know if the authentication succeeded or failed.
         * Previous checks (eligible methods, magic code, soft prompt) don't depend on API operations,
         * so their order relative to this check does not matter.
         */
        if (!isRequestFulfilled) {
            return;
        }

        /**
         * Execute registered callbacks when the authentication request is fulfilled.
         * These callbacks allow external components (outside the RHP) to perform cleanup, state refresh,
         * or other side effects after successful authentication (e.g., refreshing biometric setup status).
         */
        for (const callback of Object.values(MultifactorAuthenticationCallbacks.onFulfill)) {
            callback();
        }

        const {screen} = scenario ? MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] : {};

        // Navigate based on step result
        const successRoute = getOutcomeRoute(outcomePaths.successOutcome);
        const failureRoute = getOutcomeRoute(outcomePaths.failureOutcome);

        const scenarioRoute: Route = screen ? (normalizedConfigs[screen].path as Route) : ROUTES.MULTIFACTOR_AUTHENTICATION_NOT_FOUND;

        /**
         * Navigate based on the step outcome.
         * At this point, we've already verified:
         * - `isRequestFulfilled` is true (the async request completed)
         * - No `requiredFactorForNextStep` is pending (no more factors needed)
         * Therefore, `wasRecentStepSuccessful` represents the outcome of the final step in the flow.
         * Navigate to the corresponding outcome screen (success, failure, or back to scenario).
         */
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
    };

    const allowedMethods = <T extends MultifactorAuthenticationScenario>(scenario: T, softPromptAccepted?: boolean) => {
        const {allowedAuthenticationMethods} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
        const canUseBiometrics = shouldAllowBiometrics(allowedAuthenticationMethods);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const isBiometricsAllowed = canUseBiometrics && (NativeBiometrics.info.isLocalPublicKeyInAuth || softPromptAccepted);
        return {
            // passkeys: shouldAllowPasskeys(allowedAuthenticationMethods),
            biometrics: isBiometricsAllowed,
        };
    };

    /**
     * Performs the authorization (challenge) step of multifactor authentication.
     * Verifies that biometrics are allowed and delegates to the native biometrics authorization.
     * Can be chained after a device registration if the private key was just set up.
     * @param scenario - The authentication scenario being performed.
     * @param params - Scenario parameters and optional chainedPrivateKeyStatus from a prior registration.
     * @param outcomePaths - Navigation paths for success and failure outcomes.
     * @param softPromptAccepted - Whether the user has accepted the soft biometric setup prompt.
     * @returns The updated authentication status with authorization result.
     */
    const authorize = async <T extends MultifactorAuthenticationScenario>(
        scenario: T,
        params: MultifactorAuthenticationScenarioParams<T> & {
            chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null> | undefined;
        },
        outcomePaths?: Partial<OutcomePaths>,
        softPromptAccepted?: boolean,
    ) => {
        if (!allowedMethods(scenario, softPromptAccepted).biometrics) {
            return setStatus(
                {
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: true,
                        requiredFactorForNextStep: undefined,
                    },
                    value: {
                        payload: extractAdditionalParameters<T>(params),
                    },
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BIOMETRICS_NOT_ALLOWED,
                },
                scenario,
                outcomePaths,
            );
        }

        await NativeBiometrics.authorize({...params, scenario}, async (result) => {
            if (result.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.REGISTRATION_REQUIRED) {
                await resetKeys(accountID);
            }

            setStatus(
                {
                    reason: result.reason,
                    value: {
                        payload: params ? extractAdditionalParameters<T>(params) : undefined,
                        type: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION,
                    },
                    step: {
                        wasRecentStepSuccessful: result.success,
                        isRequestFulfilled: true,
                        requiredFactorForNextStep: undefined,
                    },
                },
                scenario,
                outcomePaths,
            );
        });
    };

    const register = async <T extends MultifactorAuthenticationScenario>(
        params: MultifactorAuthenticationScenarioParams<T> & {
            chainedWithAuthorization?: boolean;
            nativePromptTitle: string;
        },
        scenario: T,
        outcomePaths?: Partial<OutcomePaths>,
        softPromptAccepted?: boolean,
    ) => {
        if (!allowedMethods(scenario, softPromptAccepted).biometrics) {
            return setStatus(
                {
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: true,
                        requiredFactorForNextStep: undefined,
                    },
                    value: {
                        payload: extractAdditionalParameters<T>(params),
                    },
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BIOMETRICS_NOT_ALLOWED,
                },
                scenario,
                outcomePaths,
            );
        }

        const {nativePromptTitle, validateCode} = params;

        if (!validateCode) {
            return setStatus(
                (prevStatus) => ({
                    ...prevStatus,
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: false,
                        requiredFactorForNextStep: CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE,
                    },
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.VALIDATE_CODE_MISSING,
                }),
                CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.REGISTER,
            );
        }

        // const result = await NativeBiometrics.register({...params, nativePromptTitle}, scenario);
        await NativeBiometrics.register({...params, nativePromptTitle}, async (result) => {
            const status = {
                reason: result.reason,
                value: {
                    payload: extractAdditionalParameters<T>(params),
                    type: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION,
                },
                step: {
                    wasRecentStepSuccessful: result.success,
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                },
            };

            if (!result.success || !params.chainedWithAuthorization) {
                return setStatus(status, scenario, outcomePaths);
            }

            if (!result.publicKey || !result.authenticationMethod || !result.challenge) {
                return setStatus(
                    {
                        ...status,
                        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
                    },
                    scenario,
                );
            }

            const registrationResult = await processRegistration({
                publicKey: result.publicKey,
                validateCode: String(validateCode),
                authenticationMethod: result.authenticationMethod,
                challenge: result.challenge,
            });

            if (!registrationResult.success) {
                return setStatus(
                    {
                        ...status,
                        reason: registrationResult.reason,
                        step: {
                            ...status.step,
                            wasRecentStepSuccessful: false,
                        },
                    },
                    scenario,
                );
            }

            await authorize(
                scenario,
                {
                    ...params,
                    chainedPrivateKeyStatus: {
                        ...status,
                        value: result.privateKey ?? null,
                    },
                },
                outcomePaths,
                softPromptAccepted,
            );
        });
    };

    const cancel = (
        args?: {
            wasRecentStepSuccessful?: boolean;
        } & Partial<OutcomePaths>,
    ) => {
        const {successOutcome, failureOutcome, wasRecentStepSuccessful} = args ?? {};

        const {type} = mergedStatus.value;
        const {scenario} = mergedStatus;

        didUserAcceptSoftPrompt.current = undefined;
        storedValidateCode.current = undefined;

        const cancelStatus = {
            ...mergedStatus,
            step: {
                isRequestFulfilled: true,
                wasRecentStepSuccessful,
                requiredFactorForNextStep: undefined,
            },
        };

        const scenarioType = type ?? CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION;

        return setStatus(
            {
                ...cancelStatus,
                value: {
                    payload: undefined,
                    type: scenarioType,
                },
            },
            scenario ?? CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.CANCEL,
            {
                successOutcome,
                failureOutcome,
            },
        );
    };

    const proceed = async <T extends MultifactorAuthenticationScenario>(scenario: T, params?: MultifactorAuthenticationScenarioParams<T> & Partial<OutcomePaths>) => {
        const {successOutcome, failureOutcome} = params ?? {};
        const softPromptAccepted = didUserAcceptSoftPrompt.current;

        const outcomePaths = {
            successOutcome,
            failureOutcome,
        };

        if (!doesDeviceSupportBiometrics()) {
            return setStatus((prevStatus) => prevStatus, scenario, outcomePaths, {
                hasEligibleAuthenticationMethods: false,
            });
        }

        if (NativeBiometrics.info.isBiometryRegisteredLocally && !NativeBiometrics.info.isLocalPublicKeyInAuth) {
            await resetKeys(accountID);
            await NativeBiometrics.refresh();
        }

        const shouldNavigateToSoftPrompt = !NativeBiometrics.info.isLocalPublicKeyInAuth && softPromptAccepted === undefined && NativeBiometrics.info.deviceSupportsBiometrics;

        if (shouldNavigateToSoftPrompt) {
            const validateCode = params?.validateCode ?? storedValidateCode.current;
            storedValidateCode.current = validateCode;

            /**
             * Check if we have the validation code before proceeding to the soft prompt.
             * The user must first complete magic code validation before we can show the soft biometric setup prompt.
             * Note: validateCode is also checked later in useNativeBiometricsSetup during actual device registration.
             * In re-registration scenarios, users may need to provide validateCode even if they don't see the soft prompt.
             */
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
                    ({
                        ...prevStatus,
                        step: {...prevStatus.step, ...stepUpdate},
                        value: {
                            payload: params ? extractAdditionalParameters<T>(params) : undefined,
                            type: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
                        },
                    }) as typeof prevStatus,
                scenario,
                outcomePaths,
                {
                    // Only show soft prompt if we have the validation code; otherwise request it first
                    shouldShowSoftPrompt: !!validateCode,
                },
            );
        }

        if (!NativeBiometrics.info.isLocalPublicKeyInAuth) {
            /**
             * Device is not registered yet - the private key hasn't been stored in the native keystore.
             * We need to register the device first before we can perform authorization.
             */

            /**
             * Validate that we have the required scenario parameters to register the device.
             * The `params` object contains the user's authentication proof (codes, signatures, biometric type)
             * and the scenario-specific context (transaction IDs, request data, etc.) needed to complete setup.
             * Without these parameters, we cannot proceed.
             */
            if (!params) {
                return setStatus(
                    (currentStatus) => ({
                        ...currentStatus,
                        value: {
                            ...currentStatus.value,
                        },
                        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
                        step: {
                            wasRecentStepSuccessful: false,
                            isRequestFulfilled: true,
                            requiredFactorForNextStep: undefined,
                        },
                    }),
                    scenario,
                    outcomePaths,
                );
            }

            const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

            const nativePromptTitle = translate(nativePromptTitleTPath);

            await register({...params, chainedWithAuthorization: true, nativePromptTitle}, scenario, outcomePaths, softPromptAccepted);
        }

        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

        // If the scenario is pure, the payload is not needed hence for the proceed call the params can be empty
        if (!params && !('pure' in config)) {
            return setStatus(
                (currentStatus) => ({
                    ...currentStatus,
                    value: {
                        ...currentStatus.value,
                    },
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: true,
                        requiredFactorForNextStep: undefined,
                    },
                }),
                scenario,
                outcomePaths,
            );
        }

        /** Multifactor authentication is configured already, let's do the challenge logic */
        await authorize(scenario, {...(params as MultifactorAuthenticationScenarioParams<T>), chainedPrivateKeyStatus: undefined}, outcomePaths, softPromptAccepted);
    };

    /**
     * Handles updates to the authentication flow state from UI components.
     * Specifically processes user input like validation codes and soft prompt decisions,
     * then re-runs the authentication flow logic with the new data.
     * @param params - User input containing validation codes, biometric choices, or soft prompt decision
     * @returns The updated authentication status after processing the input
     */
    const update = async (
        params: Partial<AllMultifactorAuthenticationFactors> & {
            softPromptDecision?: boolean;
        },
    ) => {
        const {payload} = mergedStatus.value;
        const {isRequestFulfilled} = mergedStatus.step;
        const {scenario} = mergedStatus;

        // Guard against updates before a scenario is set or after authentication is already complete
        if (!scenario || isRequestFulfilled) {
            return setStatus(
                (currentStatus) => ({
                    ...currentStatus,
                    value: {
                        ...currentStatus.value,
                    },
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: true,
                        requiredFactorForNextStep: undefined,
                    },
                }),
                scenario ?? CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.UPDATE,
            );
        }

        // Preserve validation code across state updates and track soft prompt acceptance
        const validateCode = params.validateCode ?? storedValidateCode.current;
        didUserAcceptSoftPrompt.current = params.softPromptDecision ? true : didUserAcceptSoftPrompt.current;

        // Re-run the full authentication flow with the new user input
        await proceed(scenario, {
            ...payload,
            ...params,
            validateCode,
        });
    };

    /**
     * Public API for external components to programmatically end the authentication flow.
     * Allows terminating the flow with a specific outcome (success, cancellation, or failure)
     * and navigates to the corresponding outcome screen.
     * Internally uses `cancel()` which is the function that actually terminates the flow
     * and handles navigation for all three outcome types.
     * @param triggerType - The outcome type: FULFILL (success), CANCEL (user cancelled), or FAILURE
     * @param argument - Optional outcome path or scenario for custom navigation routing
     * @returns The updated authentication status
     */
    const trigger = async <T extends MultifactorAuthenticationTrigger>(triggerType: T, argument?: MultifactorTriggerArgument<T>) => {
        const isScenarioArgument = argument && isValidScenario(argument);
        const scenarioOutcomePaths = isScenarioArgument ? getOutcomePaths(argument) : {};

        switch (triggerType) {
            // Authentication succeeded - mark as complete with success and navigate to success outcome
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FULFILL:
                return cancel({wasRecentStepSuccessful: true, ...(isScenarioArgument ? scenarioOutcomePaths : {successOutcome: argument ?? undefined})});

            // User cancelled the authentication flow - no explicit success/failure, just end the flow
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.CANCEL:
                return cancel(isScenarioArgument ? scenarioOutcomePaths : {successOutcome: argument ?? undefined});

            // Authentication failed - mark as complete with failure and navigate to failure outcome
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FAILURE:
                return cancel({wasRecentStepSuccessful: false, ...(isScenarioArgument ? scenarioOutcomePaths : {failureOutcome: argument ?? undefined})});
            default:
                break;
        }
    };

    const {isLocalPublicKeyInAuth, isBiometryRegisteredLocally, isAnyDeviceRegistered, deviceSupportsBiometrics} = NativeBiometrics.info;
    const {scenario} = mergedStatus;

    const {wasRecentStepSuccessful, requiredFactorForNextStep, isRequestFulfilled} = mergedStatus.step;

    // Only report success status once authentication is complete (no pending factors and request fulfilled).
    // While authentication is in progress, success is undefined.
    const isAuthenticationComplete = !requiredFactorForNextStep && isRequestFulfilled;
    const success = isAuthenticationComplete ? wasRecentStepSuccessful : undefined;

    const {title, headerTitle, description} = mergedStatus;

    const info = {
        title,
        headerTitle,
        description,
        success,
        deviceSupportBiometrics: deviceSupportsBiometrics,
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
