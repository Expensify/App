import React, {createContext, useCallback, useContext, useMemo, useRef} from 'react';
import type {ReactNode} from 'react';
import {
    areMultifactorAuthorizationParamsValid,
    convertResultIntoMFAStatus,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    MergedHooksStatus,
    shouldAllowBiometrics,
    shouldAllowFallback,
} from '@hooks/MultifactorAuthentication/helpers';
import type {MultifactorAuthenticationScenarioStatus, Register, UseMultifactorAuthentication} from '@hooks/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@hooks/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useMultifactorAuthorizationFallback from '@hooks/MultifactorAuthentication/useMultifactorAuthorizationFallback';
import useNativeBiometrics from '@hooks/MultifactorAuthentication/useNativeBiometrics';
import useOnyx from '@hooks/useOnyx';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationTrigger,
} from '@libs/MultifactorAuthentication/Biometrics/types';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
// TODO: Replace with actual logic, triggerOnyxConnect call is done here to trigger Onyx connect call for mocked API
// import {requestValidateCodeAction} from '@libs/actions/User';
import {requestValidateCodeAction, triggerOnyxConnect} from '../../../__mocks__/ecuk_api';
import MULTI_FACTOR_AUTHENTICATION_SCENARIOS from './config';

const MultifactorAuthenticationContext = createContext<UseMultifactorAuthentication>({
    info: {
        isBiometryConfigured: false,
        deviceSupportBiometrics: false,
        message: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.message,
        title: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.title,
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

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    // TODO: Remove this when mocked API is no more used
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
    const success = useRef<boolean | undefined>(undefined);
    const afterRevoke = useRef<boolean>(false);
    // to avoid waiting for next render
    const softPromptStore = useRef<{
        accepted: boolean | undefined;
        validateCode: number | undefined;
    }>({
        accepted: undefined,
        validateCode: undefined,
    });
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const is2FAEnabled = !!account?.requiresTwoFactorAuth && false;
    // const overridenScreens = useRef<{
    //     success: AllMultifactorAuthenticationNotificationType | undefined;
    //     failure: AllMultifactorAuthenticationNotificationType | undefined;
    // }>({
    //     success: undefined,
    //     failure: undefined,
    // })

    const navigate = useCallback(
        (status: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>, softPrompt?: boolean) => {
            const {
                step,
                value: {scenario},
            } = status;

            const scenarioRoute: Route = scenario ? MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario].route : ROUTES.NOT_FOUND;
            const scenarioPrefix = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
            const notificationPaths = {
                success: scenarioPrefix ? ROUTES.MULTIFACTORAUTHENTICATION_NOTIFICATION.getRoute(`${scenarioPrefix}-success`) : ROUTES.NOT_FOUND,
                failure: scenarioPrefix ? ROUTES.MULTIFACTORAUTHENTICATION_NOTIFICATION.getRoute(`${scenarioPrefix}-failure`) : ROUTES.NOT_FOUND,
            };

            if (afterRevoke.current) {
                afterRevoke.current = false;
                Navigation.navigate(scenarioRoute);
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

            // TODO: powinna byc mozliwosc wyboru innego typu screena w process
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

            navigate(merged, softPrompt);

            if (revoke) {
                afterRevoke.current = true;
            }

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
                biometrics: shouldAllowBiometrics(securityLevel) && (NativeBiometrics.setup.isBiometryConfigured || softPromptStore.current.accepted),
            };
        },
        [NativeBiometrics.setup.isBiometryConfigured],
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

    const cancel = useCallback(() => {
        const {scenario, type} = mergedStatus.value;
        softPromptStore.current.accepted = undefined;
        softPromptStore.current.validateCode = undefined;

        if (type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION) {
            return setStatus(convertResultIntoMFAStatus(NativeBiometrics.cancel(), scenario, type, false));
        }
        if (type === CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK) {
            return setStatus(convertResultIntoMFAStatus(MultifactorAuthorizationFallback.cancel(), scenario, type, false));
        }

        return setStatus(convertResultIntoMFAStatus(NativeBiometrics.setup.cancel(), scenario, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, false));
    }, [NativeBiometrics, MultifactorAuthorizationFallback, mergedStatus.value, setStatus]);

    const process = useCallback(
        async <T extends MultifactorAuthenticationScenario>(
            scenario: T,
            params?: MultifactorAuthenticationScenarioParams<T>,
        ): Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>> => {
            if (!NativeBiometrics.setup.isBiometryConfigured && softPromptStore.current.accepted === undefined) {
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

            if (!NativeBiometrics.setup.isBiometryConfigured) {
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
        [NativeBiometrics.setup, allowedMethods, authorize, authorizeFallback, register, setStatus],
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

    const done = useCallback(() => {
        const {step} = mergedStatus;

        const result = cancel();
        success.current = !!step.wasRecentStepSuccessful && step.isRequestFulfilled;
        return result;
    }, [cancel, mergedStatus]);

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

    const info = useMemo(
        () => ({
            title: mergedStatus.title,
            message: mergedStatus.message,
            isBiometryConfigured: NativeBiometrics.setup.isBiometryConfigured,
            deviceSupportBiometrics: NativeBiometrics.setup.deviceSupportBiometrics,
            success: success.current,
        }),
        [NativeBiometrics.setup.deviceSupportBiometrics, NativeBiometrics.setup.isBiometryConfigured, mergedStatus.message, mergedStatus.title],
    );

    const trigger = useCallback(
        async (triggerType: MultifactorAuthenticationTrigger) => {
            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.REVOKE) {
                return revoke();
            }

            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.FULFILL) {
                return done();
            }

            if (triggerType === CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.CANCEL) {
                return cancel();
            }

            return mergedStatus;
        },
        [cancel, done, mergedStatus, revoke],
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
