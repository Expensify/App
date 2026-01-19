/**
 * Type definitions for multifactor authentication components.
 */
import type {ValueOf} from 'type-fest';
import type {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationStep,
    MultifactorAuthenticationTrigger,
    MultifactorAuthenticationTriggerArgument,
    MultifactorKeyStoreOptions,
} from '@libs/MultifactorAuthentication/Biometrics/types';
import type CONST from '@src/CONST';
import type {
    AllMultifactorAuthenticationNotificationType,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
} from './config/types';

type MultifactorAuthorization<T extends MultifactorAuthenticationScenario> = (
    scenario: T,
    params: MultifactorAuthenticationScenarioParams<T> & {
        chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null>;
    },
) => Promise<MultifactorAuthenticationStatus<boolean>>;

type RegisterFunction<T, Q> = (
    params: {validateCode?: number} & MultifactorKeyStoreOptions & T,
    scenario?: MultifactorAuthenticationScenario,
    notificationPaths?: Partial<NotificationPaths>,
    softPromptAccepted?: boolean,
) => Promise<Q>;

type Register<T = boolean> = RegisterFunction<{chainedWithAuthorization: true}, MultifactorAuthenticationPartialStatus<string>> &
    RegisterFunction<{chainedWithAuthorization?: false}, MultifactorAuthenticationStatus<T>> &
    RegisterFunction<{chainedWithAuthorization?: boolean}, MultifactorAuthenticationStatus<T> | MultifactorAuthenticationPartialStatus<string>>;

type BiometricsStatus = {
    isAnyDeviceRegistered: boolean;
    isBiometryRegisteredLocally: boolean;
    isLocalPublicKeyInAuth: boolean;
};

type MultifactorAuthenticationInfo = {
    deviceSupportBiometrics: boolean;
} & BiometricsStatus;

type MultifactorAuthenticationStatusMessage = {
    description: string;
    title: string;
    headerTitle: string;
};

type UseBiometricsSetup = MultifactorAuthenticationStep &
    MultifactorAuthenticationInfo &
    MultifactorAuthenticationStatusMessage & {
        /** Sets up multifactorial authentication by generating keys and registering with backend */
        register: Register;

        /** Completes current request and updates UI state accordingly */
        cancel: (wasRecentStepSuccessful?: boolean) => MultifactorAuthenticationStatus<BiometricsStatus>;

        refresh: () => Promise<MultifactorAuthenticationStatus<BiometricsStatus>>;
    };

type TriggerWithArgument = keyof MultifactorAuthenticationTriggerArgument;
type MultifactorTriggerArgument<T extends MultifactorAuthenticationTrigger> = T extends TriggerWithArgument ? MultifactorAuthenticationTriggerArgument[T] : void;

type UseMultifactorAuthentication = {
    info: MultifactorAuthenticationInfo &
        MultifactorAuthenticationStatusMessage & {
            success: undefined | boolean;
            headerTitle: string;
            scenario: MultifactorAuthenticationScenario | undefined;
        };
    proceed: <T extends MultifactorAuthenticationScenario>(
        scenario: T,
        params?: MultifactorAuthenticationScenarioParams<T> & Partial<NotificationPaths>,
    ) => Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>>;
    update: (
        params: Partial<AllMultifactorAuthenticationFactors> & {
            softPromptDecision?: boolean;
        },
    ) => Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>>;
    trigger: <T extends MultifactorAuthenticationTrigger>(
        triggerType: T,
        argument?: MultifactorTriggerArgument<T>,
    ) => Promise<MultifactorAuthenticationStatus<MultifactorAuthenticationScenarioStatus>>;
};

type MultifactorAuthenticationScenarioStatus = {
    payload?: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario>;
    type?: MultifactorAuthenticationStatusKeyType;
};

type MultifactorAuthenticationStatusKeyType = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE>;

/**
 * Authentication type name derived from secure store values.
 */
type AuthTypeName = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['NAME'];

type NoScenarioForStatusReason = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON>;

type SetMultifactorAuthenticationStatus<T> = (
    partialStatus: MultifactorAuthenticationPartialStatus<T> | ((prevStatus: MultifactorAuthenticationStatus<T>) => MultifactorAuthenticationStatus<T>),
    scenario: MultifactorAuthenticationScenario | NoScenarioForStatusReason,
    customNotificationPaths?: Partial<NotificationPaths>,
) => MultifactorAuthenticationStatus<T>;

type UseMultifactorAuthenticationStatus<T> = [MultifactorAuthenticationStatus<T>, SetMultifactorAuthenticationStatus<T>];

type NotificationPaths = {
    successNotification: AllMultifactorAuthenticationNotificationType;
    failureNotification: AllMultifactorAuthenticationNotificationType;
};

export type {
    SetMultifactorAuthenticationStatus,
    MultifactorAuthenticationStatusKeyType,
    AuthTypeName,
    UseMultifactorAuthenticationStatus,
    UseBiometricsSetup,
    Register,
    MultifactorAuthorization,
    UseMultifactorAuthentication,
    MultifactorAuthenticationScenarioStatus,
    MultifactorAuthenticationStatusMessage,
    BiometricsStatus,
    MultifactorTriggerArgument,
    NotificationPaths,
    NoScenarioForStatusReason,
};
