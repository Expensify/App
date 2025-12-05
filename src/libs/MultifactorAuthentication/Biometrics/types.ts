import type {ViewStyle} from 'react-native';
import type {EmptyObject, ValueOf} from 'type-fest';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config';
import type {AllMultifactorAuthenticationNotificationType} from '@components/MultifactorAuthentication/types';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SignedChallenge} from './ED25519/types';
import type {SECURE_STORE_VALUES} from './SecureStore';
import type VALUES from './VALUES';

type BasicMultifactorAuthenticationRequirementTypes = {
    [VALUES.FACTORS.SIGNED_CHALLENGE]: SignedChallenge;
    [VALUES.FACTORS.VALIDATE_CODE]: number;
    [VALUES.FACTORS.OTP]: number;
};

type MultifactorAuthenticationNotificationConfig = {
    headerTitle?: TranslationPaths;
    title?: TranslationPaths;
};

type MultifactorAuthenticationCancelConfirm = {
    description?: TranslationPaths;
    cancelButtonText?: TranslationPaths;
    confirmButtonText?: TranslationPaths;
    title?: TranslationPaths;
};

type MultifactorAuthenticationUIConfig = {
    illustration: IconAsset;
    iconWidth: number;
    iconHeight: number;
    padding: ViewStyle;
    notification?: MultifactorAuthenticationNotificationConfig;
};

type MultifactorAuthenticationUIConfigOptions = Record<string, MultifactorAuthenticationUIConfig>;

type MultifactorAuthenticationModalConfigs = {
    cancelConfirmation: MultifactorAuthenticationCancelConfirm;
};

type MultifactorAuthenticationUIModalConfigOptions = Record<MultifactorAuthenticationScenario, Partial<MultifactorAuthenticationModalConfigs>>;

type MultifactorAuthenticationNotificationUI = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationUIConfigOptions>;

type MultifactorAuthenticationPartialStatusConditional<OmitStep> = OmitStep extends false
    ? {
          /** The status of the multifactorial authentication operation */
          step: MultifactorAuthenticationStep;
      }
    : EmptyObject;

type MultifactorAuthenticationTrigger = ValueOf<typeof VALUES.TRIGGER>;

type MultifactorAuthenticationTriggerArgument = {
    [VALUES.TRIGGER.FAILURE]: AllMultifactorAuthenticationNotificationType;
    [VALUES.TRIGGER.FULFILL]: AllMultifactorAuthenticationNotificationType;
};

/**
 * Represents the core status information for multifactorial authentication operations.
 * @template T - The type of the value of the multifactorial authentication operation.
 * @template OmitStep - Whether to omit the step from the partial status.
 */
type MultifactorAuthenticationPartialStatus<T, OmitStep = false> = MultifactorAuthenticationPartialStatusConditional<OmitStep> & {
    /**
     * The result value of the multifactorial authentication operation.
     * Can be of various types depending on the operation, commonly boolean or string.
     */
    value: T;

    /**
     * Translation key explaining the current status or error condition.
     * Used to provide user feedback about what happened.
     */
    reason: TranslationPaths;

    /**
     * The numeric authentication type identifier from SecureStore.
     * Indicates which authentication method was used (e.g. multifactorial authentication, passcode).
     */
    type?: ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>['CODE'];
};

/**
 * Complete status object for multifactorial authentication operations, extending the partial status.
 * Used to track and communicate the full state of multifactorial authentication/authorization,
 * including user-facing messages and authentication details.
 */
type MultifactorAuthenticationStatus<T, OmitStep = false> = MultifactorAuthenticationPartialStatus<T, OmitStep> & {
    /** Human-readable name of the authentication method used */
    typeName?: string;

    /**
     * Formatted message combining status, reason, and authentication type
     * for displaying detailed feedback to users
     */
    message: string;

    /**
     * Concise status message suitable for headers or brief notifications
     * Examples: "Authorization Successful", "Authentication Failed"
     */
    title: string;
};

/**
 * Response type for multifactorial authentication scenario operations
 */
type MultifactorAuthenticationScenarioResponse = {
    httpCode: number;
    reason: TranslationPaths;
};

/**
 * Response type that includes a success indicator
 */
type MultifactorAuthenticationScenarioResponseWithSuccess = {
    httpCode: number | undefined;
    successful: boolean;
};

type Simplify<T> = T extends Record<string, unknown> ? {[K in keyof T]: Simplify<T[K]>} : T;

/**
 * Core type definitions for multifactorial authentication functionality
 */

/**
 * Represents a specific multifactorial authentication scenario from the constants
 */
type MultifactorAuthenticationScenario = ValueOf<typeof VALUES.SCENARIO>;

/**
 * Represents a specific multifactorial authentication factor from the constants
 */
type MultifactorAuthenticationFactor = ValueOf<typeof VALUES.FACTORS>;

type MultifactorAuthenticationFactors = {
    [K in MultifactorAuthenticationFactorsRequirements as K extends {
        origin: typeof VALUES.FACTORS_ORIGIN.FALLBACK;
    }
        ? never
        : K['parameter']]: BasicMultifactorAuthenticationRequirementTypes[K['id']];
};

/**
 * Maps fallback scenarios to their required factors
 */
type MultifactorAuthorizationFallbackFactors = {
    [K in MultifactorAuthenticationFactorsRequirements as K extends {
        origin: typeof VALUES.FACTORS_ORIGIN.FALLBACK;
    }
        ? K['parameter']
        : never]?: BasicMultifactorAuthenticationRequirementTypes[K['id']];
};

type AllMultifactorAuthenticationFactors = Simplify<MultifactorAuthenticationFactors & MultifactorAuthorizationFallbackFactors>;

/**
 * Represents the step of the multifactorial authentication operation.
 */
type MultifactorAuthenticationStep = {
    /** Whether the recent step was successful */
    wasRecentStepSuccessful: boolean | undefined;

    /** The required factor for the next step */
    requiredFactorForNextStep: MultifactorAuthenticationFactor | undefined;

    /** Whether the request has been fulfilled */
    isRequestFulfilled: boolean;
};

type MultifactorAuthenticationScenarioAdditionalParams<T extends MultifactorAuthenticationScenario> = T extends keyof MultifactorAuthenticationScenarioParameters
    ? MultifactorAuthenticationScenarioParameters[T]
    : EmptyObject;

/**
 * Parameters required for a multifactorial authentication scenario, optionally including stored factor verification
 */
type MultifactorAuthenticationScenarioParams<T extends MultifactorAuthenticationScenario> = Partial<AllMultifactorAuthenticationFactors> &
    MultifactorAuthenticationScenarioAdditionalParams<T>;

/**
 * Function signature for handling a multifactorial authentication scenario
 */
type MultifactorAuthenticationScenarioMethod<T extends MultifactorAuthenticationScenario> = (
    params: MultifactorAuthenticationScenarioParams<T>,
) => Promise<MultifactorAuthenticationScenarioResponse>;

type MultifactorAuthenticationScenarioData<T extends MultifactorAuthenticationScenario> = {
    action: MultifactorAuthenticationScenarioMethod<T>;
    securityLevel: ValueOf<typeof VALUES.SECURITY_LEVEL>;
    route: Route;
};

type MultifactorAuthenticationPromptUIObject = {
    animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths;
};

type MultifactorAuthenticationPromptUI = Record<string, MultifactorAuthenticationPromptUIObject>;

/**
 * Maps scenarios to their handlers and configuration
 */
type MultifactorAuthenticationScenarioMap = {
    [T in MultifactorAuthenticationScenario]: MultifactorAuthenticationScenarioData<T>;
};

/**
 * Defines the requirements for each multifactorial authentication factor
 */
type MultifactorAuthenticationFactorsRequirements = ValueOf<typeof VALUES.FACTORS_REQUIREMENTS>;

type MultifactorAuthenticationResponseTranslationPath = typeof VALUES.RESPONSE_TRANSLATION_PATH;

type MultifactorAuthenticationKeyType = ValueOf<typeof VALUES.KEY_ALIASES>;

export type {
    MultifactorAuthenticationFactor,
    MultifactorAuthenticationStep,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthorizationFallbackFactors,
    MultifactorAuthenticationResponseTranslationPath,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioResponse,
    MultifactorAuthenticationScenarioMethod,
    MultifactorAuthenticationScenarioMap,
    MultifactorAuthenticationKeyType,
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationScenarioResponseWithSuccess,
    MultifactorAuthenticationStatus,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationTrigger,
    MultifactorAuthenticationUIConfig,
    MultifactorAuthenticationUIConfigOptions,
    MultifactorAuthenticationPromptUI,
    MultifactorAuthenticationNotificationUI,
    MultifactorAuthenticationTriggerArgument,
    MultifactorAuthenticationUIModalConfigOptions,
};
