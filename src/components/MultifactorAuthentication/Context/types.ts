/**
 * Type definitions for multifactor authentication components.
 */
import type {ValueOf} from 'type-fest';
import type {
    AllMultifactorAuthenticationOutcomeType,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParams,
} from '@components/MultifactorAuthentication/config/types';
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

type MultifactorAuthorization<T extends MultifactorAuthenticationScenario> = (
    scenario: T,
    params: MultifactorAuthenticationScenarioParams<T> & {
        chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null>;
    },
) => Promise<MultifactorAuthenticationStatus<boolean>>;

type RegisterFunction<T, Q> = (
    params: {validateCode?: number} & MultifactorKeyStoreOptions<typeof CONST.MULTIFACTOR_AUTHENTICATION.KEY_ALIASES.PRIVATE_KEY> & T,
    scenario?: MultifactorAuthenticationScenario,
    outcomePaths?: Partial<OutcomePaths>,
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
    executeScenario: <T extends MultifactorAuthenticationScenario>(scenario: T, params?: MultifactorAuthenticationScenarioParams<T> & Partial<OutcomePaths>) => Promise<void>;
    update: (
        params: Partial<AllMultifactorAuthenticationFactors> & {
            softPromptDecision?: boolean;
        },
    ) => Promise<void>;
    trigger: <T extends MultifactorAuthenticationTrigger>(triggerType: T, argument?: MultifactorTriggerArgument<T>) => Promise<void>;
    setValidateCode: (validateCode: string) => void;
    cancel: () => Promise<void>;
    state: {
        scenario: MultifactorAuthenticationScenario | undefined;
    };
    setSoftPromptApproved: (decision: boolean) => void;
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

type MarqetaAuthTypeName = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['MQ_VALUE'];

type UseMultifactorAuthenticationStatus<T> = [MultifactorAuthenticationStatus<T>, SetMultifactorAuthenticationStatus<T>];

type NoScenarioForStatusReason = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON>;

type SetMultifactorAuthenticationStatus<T> = (
    partialStatus: MultifactorAuthenticationPartialStatus<T> | ((prevStatus: MultifactorAuthenticationStatus<T>) => MultifactorAuthenticationStatus<T>),
    scenario: MultifactorAuthenticationScenario | NoScenarioForStatusReason,
    customOutcomePaths?: Partial<OutcomePaths>,
) => MultifactorAuthenticationStatus<T>;

type OutcomePaths = {
    successOutcome: AllMultifactorAuthenticationOutcomeType;
    failureOutcome: AllMultifactorAuthenticationOutcomeType;
};

export type {
    SetMultifactorAuthenticationStatus,
    MultifactorAuthenticationStatusKeyType,
    AuthTypeName,
    MarqetaAuthTypeName,
    UseMultifactorAuthenticationStatus,
    UseBiometricsSetup,
    Register,
    MultifactorAuthorization,
    UseMultifactorAuthentication,
    MultifactorAuthenticationScenarioStatus,
    MultifactorAuthenticationStatusMessage,
    BiometricsStatus,
    OutcomePaths,
    MultifactorTriggerArgument,
    NoScenarioForStatusReason,
};
