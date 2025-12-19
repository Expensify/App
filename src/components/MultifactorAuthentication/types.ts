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

/**
 * Function that handles multifactorial authentication authorization of transactions.
 * Takes a transaction ID, optional validate code, and optional chained private key status.
 * Returns a promise resolving to the authorization status.
 */
type MultifactorAuthorization<T extends MultifactorAuthenticationScenario> = (
    scenario: T,
    params: MultifactorAuthenticationScenarioParams<T> & {
        chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null>;
    },
) => Promise<MultifactorAuthenticationStatus<boolean>>;

/**
 * Base type for the register function that handles multifactorial authentication setup.
 * Takes a validate code and additional params, returns a MultifactorAuthenticationStatus.
 */
type RegisterFunction<T, Q> = (
    params: {validateCode?: number} & MultifactorKeyStoreOptions & T,
    scenario?: unknown,
    notificationPaths?: NotificationPaths,
    softPromptAccepted?: boolean,
) => Promise<Q>;

/**
 * Function to register multifactorial authentication on the device.
 * Returns different status types based on whether authorization is chained:
 * - With chained=true: Returns a string status for the next authorization step
 * - With chained=false: Returns a boolean indicating registration success
 * - With chained unspecified: Returns either boolean or string based on flow
 */
type Register<T = boolean> = RegisterFunction<{chainedWithAuthorization: true}, MultifactorAuthenticationPartialStatus<string>> &
    RegisterFunction<{chainedWithAuthorization?: false}, MultifactorAuthenticationStatus<T>> &
    RegisterFunction<{chainedWithAuthorization?: boolean}, MultifactorAuthenticationStatus<T> | MultifactorAuthenticationPartialStatus<string>>;

type BiometricsStatus = {
    isAnyDeviceRegistered: boolean;
    isBiometryRegisteredLocally: boolean;
    isLocalPublicKeyInAuth: boolean;
};

/**
 * Information about the device's multifactorial authentication capabilities and configuration state
 */
type MultifactorAuthenticationInfo = {
    /** Whether the device supports biometric authentication (fingerprint/face) or fallback (PIN/pattern) */
    deviceSupportBiometrics: boolean;
} & BiometricsStatus;

/**
 * User-facing status messages for the current multifactorial authentication state
 */
type MultifactorAuthenticationStatusMessage = {
    /** Detailed message explaining the current state or required scenario */
    description: string;

    /** Brief status header (e.g. "Authentication Successful") */
    title: string;

    headerTitle: string;
};

/**
 * Authentication hook return type combining status information and available scenarios.
 * Returns a tuple with current state and methods to control the multifactorial authentication setup flow.
 */
type UseBiometricsSetup = MultifactorAuthenticationStep &
    MultifactorAuthenticationInfo &
    MultifactorAuthenticationStatusMessage & {
        /** Sets up multifactorial authentication by generating keys and registering with backend */
        register: Register;

        /** Clears multifactorial authentication configuration by removing stored keys */
        revoke: () => Promise<MultifactorAuthenticationStatus<BiometricsStatus>>;

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
    process: <T extends MultifactorAuthenticationScenario>(
        scenario: T,
        params?: MultifactorAuthenticationScenarioParams<T> & NotificationPaths,
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
    scenario: MultifactorAuthenticationScenario | undefined;
    payload?: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario>;
    type?: MultifactorAuthenticationStatusKeyType;
} & NotificationPaths;

/** Valid multifactorial authentication scenario types as defined in constants */
type MultifactorAuthenticationStatusKeyType = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE>;

/** Names of supported authentication types */
type AuthTypeName = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['NAME'];

/**
 * Function to update the multifactorial authentication status.
 * @param partialStatus - New status data or function to transform existing status
 * @returns Updated MultifactorAuthenticationStatus object
 */
type SetMultifactorAuthenticationStatus<T> = (
    partialStatus: MultifactorAuthenticationPartialStatus<T> | ((prevStatus: MultifactorAuthenticationStatus<T>) => MultifactorAuthenticationStatus<T>),
    overwriteType?: MultifactorAuthenticationStatusKeyType,
) => MultifactorAuthenticationStatus<T>;

/** Valid type for the useMultifactorAuthenticationStatus hook */
type UseMultifactorAuthenticationStatus<T> = [MultifactorAuthenticationStatus<T>, SetMultifactorAuthenticationStatus<T>];

type NotificationPaths = {
    successNotification?: AllMultifactorAuthenticationNotificationType;
    failureNotification?: AllMultifactorAuthenticationNotificationType;
};

export type {
    MultifactorAuthenticationStep,
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
};
