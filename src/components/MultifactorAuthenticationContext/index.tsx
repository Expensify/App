import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import type {ReactNode} from 'react';
import {
    areMultifactorAuthorizationParamsValid,
    convertResultIntoMFAStatus,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    MergedHooksStatus,
    resetKeys,
    shouldAllowBiometrics,
    shouldAllowFallback,
} from '@hooks/MultifactorAuthentication/helpers';
import type {MultifactorAuthenticationScenarioStatus, MultifactorTriggerArgument, Register, UseMultifactorAuthentication} from '@hooks/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@hooks/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useMultifactorAuthorizationFallback from '@hooks/MultifactorAuthentication/useMultifactorAuthorizationFallback';
import useNativeBiometrics from '@hooks/MultifactorAuthentication/useNativeBiometrics';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP from '@libs/MultifactorAuthentication/Biometrics/notifications';
import type {AllMultifactorAuthenticationNotificationType} from '@libs/MultifactorAuthentication/Biometrics/notifications.types';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationTrigger,
} from '@libs/MultifactorAuthentication/Biometrics/types';
// TODO: Replace with actual logic, triggerOnyxConnect call is done here to trigger Onyx connect call for mocked API
// import {requestValidateCodeAction} from '@libs/actions/User';
import {MFACallbacks} from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES, {MULTIFACTORAUTHENTICATION_PROTECTED_ROUTES} from '@src/ROUTES';
import {requestValidateCodeAction, triggerOnyxConnect} from '../../../__mocks__/ecuk_api';
import MULTI_FACTOR_AUTHENTICATION_SCENARIOS from './config';

const MultifactorAuthenticationContext = createContext<UseMultifactorAuthentication>({
    info: {
        isLocalPublicKeyInAuth: false,
        isAnyDeviceRegistered: false,
        isBiometryRegisteredLocally: false,
        deviceSupportBiometrics: false,
        message: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.message,
        title: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.title,
        headerTitle: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.title,
        success: undefined,
    },
    process: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    update: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    trigger: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
});

type MultifactorAuthenticationContextProviderProps = {
    /**
     * The children of the full screen loader context provider.
     */
    children: ReactNode;
};

const isProtectedRoute = (route: string) => {
    return Object.values(MULTIFACTORAUTHENTICATION_PROTECTED_ROUTES).some((protectedRoute) => route.startsWith(`/${protectedRoute}`));
};

const isOnProtectedRoute = () => {
    const currentRoute = Navigation.getActiveRouteWithoutParams();
    return isProtectedRoute(currentRoute);
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    // TODO: Remove this when mocked API is no longer used
    triggerOnyxConnect();

    const MultifactorAuthorizationFallback = useMultifactorAuthorizationFallback();
    const NativeBiometrics = useNativeBiometrics();
    const [mergedStatus, setMergedStatus] = useMultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>(
        {
            scenario: undefined,
            type: CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
        },
        CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
    );
    const {translate} = useLocalize();

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            const shouldRedirect = !mergedStatus.value.scenario && isOnProtectedRoute();

            if (shouldRedirect) {
                Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_NOT_FOUND, {forceReplace: true});
            }
        });
    }, [mergedStatus.value.scenario]);

    const success = useRef<boolean | undefined>(undefined);
    // to avoid waiting for next render
    const softPromptStore = useRef<{
        accepted: boolean | undefined;
        validateCode: number | undefined;
    }>({
        accepted: undefined,
        validateCode: undefined,
    });
    const {accountID} = useCurrentUserPersonalDetails();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const is2FAEnabled = !!account?.requiresTwoFactorAuth && false;
    const overriddenScreens = useRef<{
        success: AllMultifactorAuthenticationNotificationType | undefined;
        failure: AllMultifactorAuthenticationNotificationType | undefined;
    }>({
        success: undefined,
        failure: undefined,
    });

    const navigate = useCallback(
        (status: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>, softPrompt?: boolean, revokeAction?: boolean) => {
            const {
                step,
                value: {scenario},
            } = status;

            const scenarioRoute: Route = scenario ? MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario].route : ROUTES.MULTIFACTORAUTHENTICATION_NOT_FOUND;
            const scenarioPrefix = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;

            const successPath = overriddenScreens.current.success ?? (scenarioPrefix ? `${scenarioPrefix}-success` : undefined);
            const failurePath = overriddenScreens.current.failure ?? (scenarioPrefix ? `${scenarioPrefix}-failure` : undefined);

            const notificationPaths = {
                success: successPath ? ROUTES.MULTIFACTORAUTHENTICATION_NOTIFICATION.getRoute(successPath) : ROUTES.MULTIFACTORAUTHENTICATION_NOT_FOUND,
                failure: failurePath ? ROUTES.MULTIFACTORAUTHENTICATION_NOTIFICATION.getRoute(failurePath) : ROUTES.MULTIFACTORAUTHENTICATION_NOT_FOUND,
            };

            if (revokeAction) {
                success.current = undefined;
                return;
            }

            if (softPrompt) {
                Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
                success.current = undefined;
                return;
            }

            if (step.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE && !Navigation.isActiveRoute(ROUTES.MULTIFACTORAUTHENTICATION_MAGIC_CODE)) {
                requestValidateCodeAction();
                Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_MAGIC_CODE);
                success.current = undefined;
                return;
            }

            if (
                step.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.OTP &&
                is2FAEnabled &&
                !Navigation.isActiveRoute(ROUTES.MULTIFACTORAUTHENTICATION_AUTHENTICATOR)
            ) {
                Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_AUTHENTICATOR);
                success.current = undefined;
                return;
            }

            if (step.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.OTP && !is2FAEnabled && !Navigation.isActiveRoute(ROUTES.MULTIFACTORAUTHENTICATION_SMS_OTP)) {
                Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_SMS_OTP);
                success.current = undefined;
                return;
            }

            if (!step.isRequestFulfilled) {
                return;
            }

            for (const callback of Object.values(MFACallbacks.onFulfill)) {
                callback();
            }

            if (step.wasRecentStepSuccessful && !Navigation.isActiveRoute(notificationPaths.success)) {
                Navigation.navigate(notificationPaths.success);
                success.current = true;
                return;
            }

            if (step.wasRecentStepSuccessful === false && !Navigation.isActiveRoute(notificationPaths.failure)) {
                Navigation.navigate(notificationPaths.failure);
                success.current = false;
                return;
            }

            if (step.wasRecentStepSuccessful === undefined && !Navigation.isActiveRoute(scenarioRoute)) {
                Navigation.navigate(scenarioRoute);
                success.current = undefined;
            }
        },
        [is2FAEnabled],
    );

    const setStatus = useCallback(
        (...args: [...Parameters<typeof setMergedStatus>, softPrompt?: boolean, revoke?: boolean]) => {
            const [status, typeOverride, softPrompt, revoke] = args;

            const merged = setMergedStatus(status, typeOverride ?? (typeof status === 'function' ? undefined : status?.value.type));

            navigate(merged, softPrompt, revoke);

            return merged;
        },
        [navigate, setMergedStatus],
    );

    const allowedMethods = useCallback(
        <T extends MultifactorAuthenticationScenario>(scenario: T) => {
            const {securityLevel} = MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario];

            return {
                fallback: shouldAllowFallback(securityLevel),
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                biometrics: shouldAllowBiometrics(securityLevel) && (NativeBiometrics.setup.isLocalPublicKeyInAuth || softPromptStore.current.accepted),
            };
        },
        [NativeBiometrics.setup.isLocalPublicKeyInAuth],
    );

    const register = useCallback(
        async <T extends MultifactorAuthenticationScenario>(
            params: MultifactorAuthenticationScenarioParams<T> & {
                chainedWithAuthorization?: boolean;
            },
            scenario: T,
        ) => {
            const {chainedWithAuthorization} = params;

            if (!allowedMethods(scenario).biometrics) {
                return setStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus(scenario, params));
            }
            const result = await NativeBiometrics.setup.register(params);
            const status = convertResultIntoMFAStatus(result, scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, params);
            const mergedResult = setStatus(status);
            if (chainedWithAuthorization) {
                return {
                    ...mergedResult,
                    value: result.value,
                } as MultifactorAuthenticationStatus<string>;
            }
            return mergedResult;
        },
        [NativeBiometrics.setup, allowedMethods, setStatus],
    ) as Register<MultifactorAuthenticationScenarioStatus>;

    const authorizeFallback = useCallback(
        async <T extends MultifactorAuthenticationScenario>(scenario: T, params: MultifactorAuthenticationScenarioParams<T>) => {
            if (!allowedMethods(scenario).fallback) {
                return setStatus(...MergedHooksStatus.createFallbackNotAllowedStatus(scenario, params));
            }
            const result = await MultifactorAuthorizationFallback.authorize(scenario, params);
            return setStatus(convertResultIntoMFAStatus(result, scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK, params));
        },
        [MultifactorAuthorizationFallback, allowedMethods, setStatus],
    );

    const authorize = useCallback(
        async <T extends MultifactorAuthenticationScenario>(
            scenario: T,
            params: MultifactorAuthenticationScenarioParams<T> & {
                chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null> | undefined;
            },
        ) => {
            if (!allowedMethods(scenario).biometrics) {
                return setStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus(scenario, params, true));
            }
            return setStatus(convertResultIntoMFAStatus(await NativeBiometrics.authorize(scenario, params), scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION, params));
        },
        [NativeBiometrics, allowedMethods, setStatus],
    );

    const cancel = useCallback(
        (wasRecentStepSuccessful?: boolean) => {
            const {scenario, type} = mergedStatus.value;
            softPromptStore.current.accepted = undefined;
            softPromptStore.current.validateCode = undefined;

            if (type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION) {
                return setStatus(convertResultIntoMFAStatus(NativeBiometrics.cancel(wasRecentStepSuccessful), scenario, type, false));
            }
            if (type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK) {
                return setStatus(convertResultIntoMFAStatus(MultifactorAuthorizationFallback.cancel(wasRecentStepSuccessful), scenario, type, false));
            }

            return setStatus(
                convertResultIntoMFAStatus(NativeBiometrics.setup.cancel(wasRecentStepSuccessful), scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, false),
            );
        },
        [NativeBiometrics, MultifactorAuthorizationFallback, mergedStatus.value, setStatus],
    );

    const process = useCallback(
        async <T extends MultifactorAuthenticationScenario>(
            scenario: T,
            params?: MultifactorAuthenticationScenarioParams<T> & {
                successNotification?: AllMultifactorAuthenticationNotificationType;
                failureNotification?: AllMultifactorAuthenticationNotificationType;
            },
        ): Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>> => {
            const {successNotification, failureNotification} = params ?? {};

            overriddenScreens.current = {
                success: successNotification,
                failure: failureNotification,
            };

            if (NativeBiometrics.setup.isBiometryRegisteredLocally && !NativeBiometrics.setup.isLocalPublicKeyInAuth) {
                await resetKeys(accountID);
                await NativeBiometrics.setup.refresh();
            }

            const shouldNavigateToSoftPrompt =
                !NativeBiometrics.setup.isLocalPublicKeyInAuth && softPromptStore.current.accepted === undefined && NativeBiometrics.setup.deviceSupportBiometrics;

            if (shouldNavigateToSoftPrompt) {
                const {validateCode} = params ?? softPromptStore.current;
                softPromptStore.current.validateCode = validateCode;

                return setStatus(
                    (prevStatus) =>
                        convertResultIntoMFAStatus(
                            {
                                ...prevStatus,
                                step: validateCode
                                    ? prevStatus.step
                                    : {
                                          isRequestFulfilled: false,
                                          requiredFactorForNextStep: CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE,
                                          wasRecentStepSuccessful: undefined,
                                      },
                            },
                            scenario,
                            CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
                            params ?? false,
                        ),
                    undefined,
                    !!validateCode,
                );
            }

            if (!params) {
                return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus));
            }

            if (!NativeBiometrics.setup.deviceSupportBiometrics || !allowedMethods(scenario).biometrics) {
                if (!areMultifactorAuthorizationParamsValid<typeof scenario>(params)) {
                    return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus));
                }

                return authorizeFallback(scenario, params);
            }

            if (!NativeBiometrics.setup.isLocalPublicKeyInAuth) {
                /** Multi-factor authentication is not configured, let's do that first */
                /** Run the setup method */

                const requestStatus = await register(
                    {
                        ...params,
                        chainedWithAuthorization: true,
                    },
                    scenario,
                );

                if (!requestStatus.step.wasRecentStepSuccessful) {
                    return setStatus(convertResultIntoMFAStatus(requestStatus, scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION, params));
                }

                return authorize(scenario, {
                    ...params,
                    chainedPrivateKeyStatus: requestStatus,
                });
            }

            /** Multi-factor authentication is configured already, let's do the challenge logic */
            const result = await authorize(scenario, {
                ...params,
                chainedPrivateKeyStatus: undefined,
            });

            if (result.reason === 'multifactorAuthentication.reason.error.keyMissingOnTheBE') {
                await NativeBiometrics.setup.revoke();
            }

            return result;
        },
        [NativeBiometrics.setup, accountID, allowedMethods, authorize, authorizeFallback, register, setStatus],
    );

    const update = useCallback(
        async (
            params: Partial<AllMultifactorAuthenticationFactors> & {
                softPromptDecision?: boolean;
            },
        ) => {
            const {scenario, payload} = mergedStatus.value;
            const {validateCode} = softPromptStore.current;
            const {isRequestFulfilled} = mergedStatus.step;

            const {softPromptDecision = softPromptStore.current.accepted} = params;

            softPromptStore.current.accepted = softPromptDecision;

            if (!scenario || isRequestFulfilled || !payload) {
                return setStatus(MergedHooksStatus.badRequestStatus(mergedStatus));
            }

            const processParams = {
                ...payload,
                ...params,
                validateCode: params.validateCode ?? validateCode,
            };

            return process(scenario, processParams);
        },
        [mergedStatus, process, setStatus],
    );

    const revoke = useCallback(async () => {
        const revokeStatus = await NativeBiometrics.setup.revoke();
        return setStatus(
            (prevStatus) =>
                convertResultIntoMFAStatus(revokeStatus, prevStatus.value.scenario, prevStatus.value.type ?? CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, false),
            CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
            false,
            true,
        );
    }, [NativeBiometrics.setup, setStatus]);

    const info = useMemo(() => {
        const {isLocalPublicKeyInAuth, isBiometryRegisteredLocally, isAnyDeviceRegistered, deviceSupportBiometrics} = NativeBiometrics.setup;

        const {scenario} = mergedStatus.value;

        const scenarioPrefix = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
        const successPath = overriddenScreens.current.success ?? (scenarioPrefix ? `${scenarioPrefix}-success` : undefined);
        const failurePath = overriddenScreens.current.failure ?? (scenarioPrefix ? `${scenarioPrefix}-failure` : undefined);

        const pathToUse = mergedStatus.step.wasRecentStepSuccessful ? successPath : failurePath;

        const defaultTitle = mergedStatus.title;
        const {headerTitle: definedHeaderTitle, title: definedTitle} = pathToUse ? (MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP[pathToUse].notification ?? {}) : {};

        const headerTitle = definedHeaderTitle ? translate(definedHeaderTitle) : defaultTitle;
        const title = definedTitle ? translate(definedTitle) : defaultTitle;

        return {
            title,
            headerTitle,
            message: mergedStatus.message,
            success: success.current,
            deviceSupportBiometrics,
            isLocalPublicKeyInAuth,
            isBiometryRegisteredLocally,
            isAnyDeviceRegistered,
        };
    }, [NativeBiometrics.setup, mergedStatus.message, mergedStatus.step.wasRecentStepSuccessful, mergedStatus.title, mergedStatus.value, translate]);

    const trigger = useCallback(
        async <T extends MultifactorAuthenticationTrigger>(triggerType: T, argument?: MultifactorTriggerArgument<T>) => {
            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.REVOKE) {
                return revoke();
            }

            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.FULFILL) {
                if (argument) {
                    overriddenScreens.current.success = argument;
                }
                return cancel(true);
            }

            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.CANCEL) {
                return cancel();
            }

            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.FAILURE) {
                if (argument) {
                    overriddenScreens.current.failure = argument;
                }
                return cancel(false);
            }

            return mergedStatus;
        },
        [cancel, mergedStatus, revoke],
    );

    const MultifactorAuthenticationData = useMemo(
        () => ({
            info,
            process,
            update,
            trigger,
        }),
        [info, process, update, trigger],
    );

    return <MultifactorAuthenticationContext.Provider value={MultifactorAuthenticationData}>{children}</MultifactorAuthenticationContext.Provider>;
}

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
