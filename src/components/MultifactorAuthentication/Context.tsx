import React, {createContext, useContext, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {requestValidateCodeAction, triggerOnyxConnect} from '@libs/API/MultifactorAuthenticationMock';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationTrigger,
} from '@libs/MultifactorAuthentication/Biometrics/types';
// TODO: MFA/Release Replace with actual logic, triggerOnyxConnect call is done here to trigger Onyx connect call for mocked API
// import {requestValidateCodeAction} from '@libs/actions/User';
import {MultifactorAuthenticationCallbacks} from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import {normalizedConfigs} from '@navigation/linkingConfig/config';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './config';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from './config/types';
import {
    convertResultIntoMultifactorAuthenticationStatus,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    getCancelStatus,
    getNotificationPaths,
    getNotificationRoute,
    isOnProtectedRoute,
    isValidScenario,
    MergedHooksStatus,
    resetKeys,
    shouldAllowBiometrics,
} from './helpers';
import type {MultifactorAuthenticationScenarioStatus, MultifactorTriggerArgument, NotificationPaths, Register, UseMultifactorAuthentication} from './types';
import useMultifactorAuthenticationStatus from './useMultifactorAuthenticationStatus';
import useNativeBiometrics from './useNativeBiometrics';

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
    process: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    update: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    trigger: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
});

type MultifactorAuthenticationContextProviderProps = {
    /**
     * The children of the full-screen loader context provider.
     */
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    // TODO: MFA/Release Remove this when mocked API is no longer used
    triggerOnyxConnect();

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

    const navigate = (status: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>, softPrompt?: boolean, revokeAction?: boolean) => {
        const {step, scenario, notificationPaths} = status;

        const {requiredFactorForNextStep, isRequestFulfilled, wasRecentStepSuccessful} = step;

        if (revokeAction) {
            return;
        }

        if (softPrompt) {
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
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
        const successRoute = getNotificationRoute(notificationPaths.successNotification);
        const failureRoute = getNotificationRoute(notificationPaths.failureNotification);

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

    const setStatus = (
        ...args: [
            ...Parameters<typeof setMergedStatus>,
            rest?: {
                softPrompt?: boolean;
                revoke?: boolean;
            },
        ]
    ) => {
        const [status, scenario, notificationPaths, rest] = args;
        const {softPrompt, revoke} = rest ?? {};
        const merged = setMergedStatus(status, scenario, notificationPaths);

        navigate(merged, softPrompt, revoke);
        return merged;
    };

    const allowedMethods = <T extends MultifactorAuthenticationScenario>(scenario: T, softPromptAccepted?: boolean) => {
        const {allowedAuthentication} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
        const canUseBiometrics = shouldAllowBiometrics(allowedAuthentication);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const isBiometricsAllowed = canUseBiometrics && (NativeBiometrics.setup.isLocalPublicKeyInAuth || softPromptAccepted);
        return {
            // passkeys: shouldAllowPasskeys(allowedAuthentication),
            biometrics: isBiometricsAllowed,
        };
    };

    const register = (async <T extends MultifactorAuthenticationScenario>(
        params: MultifactorAuthenticationScenarioParams<T> & {
            chainedWithAuthorization?: boolean;
        },
        scenario: T,
        notificationPaths?: Partial<NotificationPaths>,
        softPromptAccepted?: boolean,
    ) => {
        if (!allowedMethods(scenario, softPromptAccepted).biometrics) {
            return setStatus(MergedHooksStatus.createBiometricsNotAllowedStatus<T>(params), scenario, notificationPaths);
        }

        const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

        const nativePromptTitle = translate(nativePromptTitleTPath);

        const result = await NativeBiometrics.setup.register({...params, nativePromptTitle}, scenario);
        const status = convertResultIntoMultifactorAuthenticationStatus(result, scenario, CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, params);
        const mergedResult = setStatus(status, scenario, notificationPaths);

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
        notificationPaths?: Partial<NotificationPaths>,
        softPromptAccepted?: boolean,
    ) => {
        if (!allowedMethods(scenario, softPromptAccepted).biometrics) {
            return setStatus(MergedHooksStatus.createBiometricsNotAllowedStatus<T>(params), scenario, notificationPaths);
        }
        return setStatus(
            convertResultIntoMultifactorAuthenticationStatus(
                await NativeBiometrics.authorize(scenario, params),
                scenario,
                CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION,
                params,
            ),
            scenario,
            notificationPaths,
        );
    };

    const cancel = (
        args?: {
            wasRecentStepSuccessful?: boolean;
        } & Partial<NotificationPaths>,
    ) => {
        const {successNotification, failureNotification, wasRecentStepSuccessful} = args ?? {};

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
                successNotification,
                failureNotification,
            },
        );
    };

    const process = async <T extends MultifactorAuthenticationScenario>(
        scenario: T,
        params?: MultifactorAuthenticationScenarioParams<T> & Partial<NotificationPaths>,
    ): Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>> => {
        const {successNotification, failureNotification} = params ?? {};
        const softPromptAccepted = softStorePromptAccepted.current;

        const notificationPaths = {
            successNotification,
            failureNotification,
        };

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
                notificationPaths,
                {
                    softPrompt: !!validateCode,
                },
            );
        }

        if (!NativeBiometrics.setup.isLocalPublicKeyInAuth) {
            /** Multifactor authentication is not configured, let's do that first */
            /** Run the setup method */
            if (!params) {
                return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus), scenario, notificationPaths);
            }

            const requestStatus = await register({...params, chainedWithAuthorization: true}, scenario, notificationPaths, softPromptAccepted);

            if (!requestStatus.step.wasRecentStepSuccessful) {
                return setStatus(
                    convertResultIntoMultifactorAuthenticationStatus(requestStatus, scenario, CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION, params),
                    scenario,
                    notificationPaths,
                );
            }

            return authorize(scenario, {...params, chainedPrivateKeyStatus: requestStatus}, notificationPaths, softPromptAccepted);
        }

        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

        // If the scenario is pure, the payload is not needed hence for the process call the params can be empty
        if (!params && !('pure' in config)) {
            return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus), scenario, notificationPaths);
        }

        /** Multifactor authentication is configured already, let's do the challenge logic */
        const result = await authorize(scenario, {...(params as MultifactorAuthenticationScenarioParams<T>), chainedPrivateKeyStatus: undefined}, notificationPaths, softPromptAccepted);

        if (result.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_MISSING_ON_THE_BACKEND) {
            await NativeBiometrics.setup.revoke();
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
            return setStatus(MergedHooksStatus.badRequestStatus(mergedStatus), scenario ?? CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.UPDATE);
        }

        const validateCode = params.validateCode ?? storedValidateCode.current;
        softStorePromptAccepted.current = params.softPromptDecision ?? softStorePromptAccepted.current;

        return process(scenario, {
            ...payload,
            ...params,
            validateCode,
        });
    };

    const revoke = async () => {
        const revokeStatus = await NativeBiometrics.setup.revoke();
        return setStatus(
            (prevStatus) =>
                convertResultIntoMultifactorAuthenticationStatus(
                    revokeStatus,
                    prevStatus.scenario,
                    prevStatus.value.type ?? CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION,
                    false,
                ),
            CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.REVOKE,
            undefined,
            {
                softPrompt: false,
                revoke: true,
            },
        );
    };

    const trigger = async <T extends MultifactorAuthenticationTrigger>(triggerType: T, argument?: MultifactorTriggerArgument<T>) => {
        const isScenarioArgument = argument && isValidScenario(argument);
        const scenarioNotificationPaths = isScenarioArgument ? getNotificationPaths(argument) : {};

        switch (triggerType) {
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.REVOKE:
                return revoke();
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FULFILL:
                return cancel({wasRecentStepSuccessful: true, ...(isScenarioArgument ? scenarioNotificationPaths : {successNotification: argument ?? undefined})});
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.CANCEL:
                return cancel(isScenarioArgument ? scenarioNotificationPaths : {successNotification: argument ?? undefined});
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FAILURE:
                return cancel({wasRecentStepSuccessful: false, ...(isScenarioArgument ? scenarioNotificationPaths : {failureNotification: argument ?? undefined})});
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
    const MultifactorAuthenticationData = {info, process, update, trigger};

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
