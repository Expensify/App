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
import {MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP, MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './config';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from './config/types';
import {
    convertResultIntoMultifactorAuthenticationStatus,
    EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    getCancelStatus,
    getNotificationPath,
    getNotificationRoute,
    isOnProtectedRoute,
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
        message: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.message,
        title: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.title,
        headerTitle: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.title,
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
    const [mergedStatus, setMergedStatus] = useMultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>(
        {
            scenario: undefined,
            type: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
            successNotification: undefined,
            failureNotification: undefined,
        },
        CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
    );
    const {translate} = useLocalize();

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            const shouldRedirect = !mergedStatus.value.scenario && isOnProtectedRoute();

            if (shouldRedirect) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_NOT_FOUND, {forceReplace: true});
            }
        });
    }, [mergedStatus.value.scenario]);

    const success = useRef<boolean | undefined>(undefined);
    // to avoid waiting for the next render
    const softPromptStore = useRef<{
        accepted: boolean | undefined;
        validateCode: number | undefined;
    }>({
        accepted: undefined,
        validateCode: undefined,
    });
    const {accountID} = useCurrentUserPersonalDetails();

    const getNotificationPaths = (scenario: MultifactorAuthenticationScenario | undefined, customNotificationPaths?: NotificationPaths) => {
        const scenarioPrefix = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
        const successPath = getNotificationPath(customNotificationPaths?.successNotification, scenarioPrefix, 'success');
        const failurePath = getNotificationPath(customNotificationPaths?.failureNotification, scenarioPrefix, 'failure');

        return {
            success: getNotificationRoute(successPath),
            failure: getNotificationRoute(failurePath),
            successPath,
            failurePath,
        };
    };

    const navigate = (status: MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>, softPrompt?: boolean, revokeAction?: boolean) => {
        const {
            step,
            value: {scenario, successNotification, failureNotification},
        } = status;

        if (revokeAction) {
            success.current = undefined;
            return;
        }

        if (softPrompt) {
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
            success.current = undefined;
            return;
        }

        const {requiredFactorForNextStep, isRequestFulfilled, wasRecentStepSuccessful} = step;

        // Handle required factors
        if (requiredFactorForNextStep === CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE && !Navigation.isActiveRoute(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE)) {
            requestValidateCodeAction();
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE);
            success.current = undefined;
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
        const notificationPaths = getNotificationPaths(scenario, {successNotification, failureNotification});
        const scenarioRoute: Route = screen ? (normalizedConfigs[screen].path as Route) : ROUTES.MULTIFACTOR_AUTHENTICATION_NOT_FOUND;

        if (wasRecentStepSuccessful === true && !Navigation.isActiveRoute(notificationPaths.success)) {
            Navigation.navigate(notificationPaths.success);
            success.current = true;
            return;
        }

        if (wasRecentStepSuccessful === false && !Navigation.isActiveRoute(notificationPaths.failure)) {
            Navigation.navigate(notificationPaths.failure);
            success.current = false;
            return;
        }

        if (wasRecentStepSuccessful === undefined && !Navigation.isActiveRoute(scenarioRoute)) {
            Navigation.navigate(scenarioRoute);
            success.current = undefined;
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
        const [status, typeOverride, rest] = args;
        const {softPrompt, revoke} = rest ?? {};
        let type = typeOverride;
        if (!type && typeof status !== 'function') {
            type = status?.value.type;
        }
        const merged = setMergedStatus(status, type);
        navigate(merged, softPrompt, revoke);
        return merged;
    };

    const allowedMethods = <T extends MultifactorAuthenticationScenario>(scenario: T) => {
        const {allowedAuthentication} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
        const canUseBiometrics = shouldAllowBiometrics(allowedAuthentication);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const isBiometricsAllowed = canUseBiometrics && (NativeBiometrics.setup.isLocalPublicKeyInAuth || softPromptStore.current.accepted);

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
    ) => {
        if (!allowedMethods(scenario).biometrics) {
            return setStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus(scenario, params));
        }

        const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

        const nativePromptTitle = translate(nativePromptTitleTPath);

        const result = await NativeBiometrics.setup.register({...params, nativePromptTitle});
        const status = convertResultIntoMultifactorAuthenticationStatus(result, scenario, CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION, params);
        const mergedResult = setStatus(status);

        if (params.chainedWithAuthorization) {
            return {...mergedResult, value: result.value} as MultifactorAuthenticationStatus<string>;
        }
        return mergedResult;
    }) as Register<MultifactorAuthenticationScenarioStatus>;
    // ) as Register<MultifactorAuthenticationScenarioStatus>;

    const authorize = async <T extends MultifactorAuthenticationScenario>(
        scenario: T,
        params: MultifactorAuthenticationScenarioParams<T> & {
            chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null> | undefined;
        },
        notificationPaths?: NotificationPaths,
    ) => {
        if (!allowedMethods(scenario).biometrics) {
            return setStatus(...MergedHooksStatus.createBiometricsNotAllowedStatus(scenario, params, true, notificationPaths));
        }
        return setStatus(
            convertResultIntoMultifactorAuthenticationStatus(
                await NativeBiometrics.authorize(scenario, params),
                scenario,
                CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION,
                params,
                notificationPaths,
            ),
            undefined,
        );
    };

    const cancel = (
        args?: {
            wasRecentStepSuccessful?: boolean;
        } & NotificationPaths,
    ) => {
        const {successNotification, failureNotification, wasRecentStepSuccessful} = args ?? {};

        const {scenario, type} = mergedStatus.value;
        softPromptStore.current.accepted = undefined;
        softPromptStore.current.validateCode = undefined;

        const cancelStatus = getCancelStatus(type, wasRecentStepSuccessful, NativeBiometrics.cancel, NativeBiometrics.setup.cancel);
        const scenarioType = type ?? CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION;

        return setStatus(
            convertResultIntoMultifactorAuthenticationStatus(cancelStatus, scenario, scenarioType, false, {
                successNotification,
                failureNotification,
            }),
        );
    };

    const process = async <T extends MultifactorAuthenticationScenario>(
        scenario: T,
        params?: MultifactorAuthenticationScenarioParams<T> & NotificationPaths,
    ): Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>> => {
        const {successNotification, failureNotification} = params ?? {};

        const notificationPaths = {
            successNotification,
            failureNotification,
        };

        if (NativeBiometrics.setup.isBiometryRegisteredLocally && !NativeBiometrics.setup.isLocalPublicKeyInAuth) {
            await resetKeys(accountID);
            await NativeBiometrics.setup.refresh();
        }

        const shouldNavigateToSoftPrompt = !NativeBiometrics.setup.isLocalPublicKeyInAuth && softPromptStore.current.accepted === undefined && NativeBiometrics.setup.deviceSupportBiometrics;

        if (shouldNavigateToSoftPrompt) {
            const {validateCode} = params ?? softPromptStore.current;
            softPromptStore.current.validateCode = validateCode;

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
                        notificationPaths,
                    ),
                undefined,
                {
                    softPrompt: !!validateCode,
                },
            );
        }

        if (!NativeBiometrics.setup.isLocalPublicKeyInAuth) {
            /** Multifactor authentication is not configured, let's do that first */
            /** Run the setup method */
            if (!params) {
                return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus, notificationPaths));
            }

            const requestStatus = await register({...params, chainedWithAuthorization: true}, scenario);

            if (!requestStatus.step.wasRecentStepSuccessful) {
                return setStatus(
                    convertResultIntoMultifactorAuthenticationStatus(requestStatus, scenario, CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION, params, notificationPaths),
                );
            }

            return authorize(scenario, {...params, chainedPrivateKeyStatus: requestStatus}, notificationPaths);
        }

        const config = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

        // If the scenario is pure, the payload is not needed hence for the process call the params can be empty
        if (!params && !('pure' in config)) {
            return setStatus((prevStatus) => MergedHooksStatus.badRequestStatus(prevStatus, notificationPaths));
        }

        /** Multifactor authentication is configured already, let's do the challenge logic */
        const result = await authorize(scenario, {...(params as MultifactorAuthenticationScenarioParams<T>), chainedPrivateKeyStatus: undefined}, notificationPaths);

        if (result.reason === 'multifactorAuthentication.reason.error.keyMissingOnTheBE') {
            await NativeBiometrics.setup.revoke();
        }

        return result;
    };

    const update = async (
        params: Partial<AllMultifactorAuthenticationFactors> & {
            softPromptDecision?: boolean;
        },
    ) => {
        const {scenario, payload} = mergedStatus.value;
        const {isRequestFulfilled} = mergedStatus.step;

        if (!scenario || isRequestFulfilled) {
            return setStatus(MergedHooksStatus.badRequestStatus(mergedStatus));
        }

        softPromptStore.current.accepted = params.softPromptDecision ?? softPromptStore.current.accepted;

        return process(scenario, {
            ...payload,
            ...params,
            validateCode: params.validateCode ?? softPromptStore.current.validateCode,
        });
    };

    const revoke = async () => {
        const revokeStatus = await NativeBiometrics.setup.revoke();
        return setStatus(
            (prevStatus) =>
                convertResultIntoMultifactorAuthenticationStatus(
                    revokeStatus,
                    prevStatus.value.scenario,
                    prevStatus.value.type ?? CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION,
                    false,
                ),
            CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
            {
                softPrompt: false,
                revoke: true,
            },
        );
    };

    const trigger = async <T extends MultifactorAuthenticationTrigger>(triggerType: T, argument?: MultifactorTriggerArgument<T>) => {
        switch (triggerType) {
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.REVOKE:
                return revoke();
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FULFILL:
                return cancel({wasRecentStepSuccessful: true, ...(argument ? {successNotification: argument} : {})});
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.CANCEL:
                return cancel();
            case CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FAILURE:
                return cancel({wasRecentStepSuccessful: false, ...(argument ? {failureNotification: argument} : {})});
            default:
                return mergedStatus;
        }
    };

    const {isLocalPublicKeyInAuth, isBiometryRegisteredLocally, isAnyDeviceRegistered, deviceSupportBiometrics} = NativeBiometrics.setup;
    const {scenario, successNotification, failureNotification} = mergedStatus.value;

    const {wasRecentStepSuccessful} = mergedStatus.step;
    const {successPath, failurePath} = getNotificationPaths(scenario, {
        successNotification,
        failureNotification,
    });

    const pathToUse = wasRecentStepSuccessful ? successPath : failurePath;
    const notificationConfig = pathToUse ? MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP[pathToUse] : undefined;

    const defaultTitle = mergedStatus.title;
    let headerTitle = defaultTitle;
    let title = defaultTitle;

    if (notificationConfig?.headerTitle) {
        headerTitle = translate(notificationConfig.headerTitle);
    }
    if (notificationConfig?.title) {
        title = translate(notificationConfig.title);
    }

    const info = {
        title,
        headerTitle,
        message: mergedStatus.message,
        success: success.current,
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
