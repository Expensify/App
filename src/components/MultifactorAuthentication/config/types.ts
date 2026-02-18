/**
 * Configuration types for multifactor authentication UI and scenarios.
 */
import type {EmptyObject, ValueOf} from 'type-fest';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {
    AllMultifactorAuthenticationBaseParameters,
    MultifactorAuthenticationActionParams,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationReason,
    MultifactorAuthenticationScenarioCallback,
} from '@libs/MultifactorAuthentication/Biometrics/types';
import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type SCREENS from '@src/SCREENS';
import type {MULTIFACTOR_AUTHENTICATION_PROMPT_UI, MultifactorAuthenticationScenarioPayload} from './index';

/**
 * Configuration for cancel confirmation modal in multifactor authentication.
 */
type MultifactorAuthenticationCancelConfirm = {
    description?: TranslationPaths;
    cancelButtonText?: TranslationPaths;
    confirmButtonText?: TranslationPaths;
    title?: TranslationPaths;
};

/**
 * Configuration for multifactor authentication prompt display with animation and translations.
 */
type MultifactorAuthenticationPromptConfig = {
    animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths;
};

/**
 * Collection of prompts keyed by prompt identifier.
 */
type MultifactorAuthenticationPrompt = Record<string, MultifactorAuthenticationPromptConfig>;

/**
 * Configuration for modals in multifactor authentication flows.
 */
type MultifactorAuthenticationModal = {
    cancelConfirmation: MultifactorAuthenticationCancelConfirm;
};

type FailureScreenOverrides = Partial<Record<MultifactorAuthenticationReason, React.ReactElement>>;

/**
 * Outcome screens and related configuration displayed after MFA flow completes.
 * Screen fields are required in resolved configs, all fields optional in custom configs (merged with defaults).
 */
type MultifactorAuthenticationOutcomeScreens = {
    successScreen: React.ReactElement;
    defaultClientFailureScreen: React.ReactElement;
    defaultServerFailureScreen: React.ReactElement;
    failureScreens?: FailureScreenOverrides;
};

/**
 * Response from a multifactor authentication scenario action.
 */
type MultifactorAuthenticationScenarioResponse = {
    httpStatusCode: number | undefined;
    reason: MultifactorAuthenticationReason;
    message: string | undefined;

    /** Optional response body containing scenario-specific data (e.g., {pin: number} for PIN reveal) */
    body?: Record<string, unknown>;
};

/**
 * Multifactor authentication screen identifiers.
 */
type MultifactorAuthenticationScreen = ValueOf<typeof SCREENS.MULTIFACTOR_AUTHENTICATION>;

/**
 * Pure function type for scenario actions that return HTTP response and reason.
 */
type MultifactorAuthenticationScenarioPureMethod<T extends Record<string, unknown>> = (
    params: MultifactorAuthenticationActionParams<T, 'signedChallenge'>,
) => Promise<MultifactorAuthenticationScenarioResponse>;

/**
 * Shared scenario fields (non-UI) common to both resolved and custom configs.
 */
type MultifactorAuthenticationScenarioBase<T extends Record<string, unknown> = EmptyObject> = {
    action: MultifactorAuthenticationScenarioPureMethod<T>;
    allowedAuthenticationMethods: Array<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>>;
    screen: MultifactorAuthenticationScreen;

    /**
     * Whether the scenario does not require any additional parameters except for the native biometrics data.
     * If it is the case, the scenario needs to be defined as such
     * so the absence of payload will be tolerated at the run-time.
     */
    pure?: true;

    /**
     * Callback function that is invoked after the API call completes (success or failure).
     * The callback receives the success status and input containing HTTP code, message, and response body.
     * Returns a MultifactorAuthenticationCallbackResponse value that determines the post-callback behavior
     * (e.g., whether to show the outcome screen or let the callback handle navigation).
     */
    callback?: MultifactorAuthenticationScenarioCallback;
};

/**
 * Complete scenario configuration including action, UI, and metadata.
 */
type MultifactorAuthenticationScenarioConfig<T extends Record<string, unknown> = EmptyObject> = MultifactorAuthenticationScenarioBase<T> &
    MultifactorAuthenticationOutcomeScreens & {
        MODALS: MultifactorAuthenticationModal;
    };

/**
 * Scenario configuration for custom scenarios with optional overrides.
 * Outcome screens and modals are optional — they are merged with defaults at runtime.
 */
type MultifactorAuthenticationScenarioCustomConfig<T extends Record<string, unknown> = EmptyObject> = MultifactorAuthenticationScenarioBase<T> &
    Partial<MultifactorAuthenticationOutcomeScreens> & {
        MODALS?: Partial<MultifactorAuthenticationModal>;
    };

/**
 * Default UI configuration shared across scenarios.
 */
type MultifactorAuthenticationDefaultUIConfig = Required<MultifactorAuthenticationOutcomeScreens> & {
    MODALS: MultifactorAuthenticationModal;
};

/**
 * Record mapping all scenarios to their configurations.
 */
type MultifactorAuthenticationScenarioConfigRecord = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioConfig<never>>;

/**
 * Additional parameters specific to a scenario.
 */
type MultifactorAuthenticationScenarioAdditionalParams<T extends MultifactorAuthenticationScenario> = T extends keyof MultifactorAuthenticationScenarioPayload
    ? MultifactorAuthenticationScenarioPayload[T]
    : EmptyObject;

/**
 * Optional authentication factors with scenario-specific parameters.
 */
type MultifactorAuthenticationScenarioParams<T extends MultifactorAuthenticationScenario> = Partial<AllMultifactorAuthenticationBaseParameters> &
    MultifactorAuthenticationScenarioAdditionalParams<T>;

/**
 * All required authentication factors with scenario-specific parameters.
 */
type MultifactorAuthenticationProcessScenarioParameters<T extends MultifactorAuthenticationScenario> = AllMultifactorAuthenticationBaseParameters &
    MultifactorAuthenticationScenarioAdditionalParams<T>;

type MultifactorAuthenticationPromptType = keyof typeof MULTIFACTOR_AUTHENTICATION_PROMPT_UI;

/**
 * Parameters required for biometrics registration scenario.
 */
type RegisterBiometricsParams = MultifactorAuthenticationActionParams<
    {
        keyInfo: MultifactorAuthenticationKeyInfo;
    },
    'validateCode'
>;

/**
 * Type-safe parameters for each multifactor authentication scenario.
 */
type MultifactorAuthenticationScenarioParameters = {
    [key in MultifactorAuthenticationScenario]: MultifactorAuthenticationActionParams<
        key extends keyof MultifactorAuthenticationScenarioPayload ? MultifactorAuthenticationScenarioPayload[key] : EmptyObject,
        'signedChallenge'
    >;
} & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'REGISTER-BIOMETRICS': RegisterBiometricsParams;
};

/**
 * Identifier for different multifactor authentication scenarios.
 */
type MultifactorAuthenticationScenario = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO>;

export type {
    MultifactorAuthenticationPrompt,
    MultifactorAuthenticationModal,
    MultifactorAuthenticationScenarioResponse,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationPromptType,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationOutcomeScreens,
    MultifactorAuthenticationScenarioConfigRecord,
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationDefaultUIConfig,
    MultifactorAuthenticationScenarioCustomConfig,
    FailureScreenOverrides,
};
