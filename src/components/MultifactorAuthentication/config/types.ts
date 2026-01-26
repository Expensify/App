/**
 * Configuration types for multifactor authentication UI and scenarios.
 */
import type {ViewStyle} from 'react-native';
import type {EmptyObject, KebabCase, Replace, ValueOf} from 'type-fest';
import type {IllustrationName} from '@components/Icon/chunks/illustrations.chunk';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationActionParams,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationReason,
} from '@libs/MultifactorAuthentication/Biometrics/types';
import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type SCREENS from '@src/SCREENS';
import type {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG, MultifactorAuthenticationScenarioPayload} from './index';

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
 * Configuration for displaying multifactor authentication outcomes with illustrations and text.
 */
type MultifactorAuthenticationOutcomeConfig = {
    illustration: IllustrationName;
    iconWidth: number;
    iconHeight: number;
    padding: ViewStyle;
    headerTitle: TranslationPaths;
    title: TranslationPaths;
    description: TranslationPaths;
    customDescription?: React.FunctionComponent;
};

/**
 * Collection of prompts keyed by prompt identifier.
 */
type MultifactorAuthenticationPrompt = Record<string, MultifactorAuthenticationPromptConfig>;

/**
 * Collection of outcomes keyed by an outcome type.
 */
type MultifactorAuthenticationOutcome = Record<string, MultifactorAuthenticationOutcomeConfig>;

/**
 * Configuration for modals in multifactor authentication flows.
 */
type MultifactorAuthenticationModal = {
    cancelConfirmation: MultifactorAuthenticationCancelConfirm;
};

/**
 * Override configuration for modals with partial properties.
 * This allows customization of specific modal aspects without redefining the entire structure.
 * e.g. "Authentication attempt" in the cancel confirmation modal can be changed to "Transaction approval".
 */
type MultifactorAuthenticationModalOptional = {
    cancelConfirmation?: Partial<MultifactorAuthenticationCancelConfirm>;
};

/**
 * Optional outcome configuration with partial properties for scenario overrides.
 */
type MultifactorAuthenticationOutcomeOptional = Record<string, Partial<MultifactorAuthenticationOutcomeConfig>>;

/**
 * Type representation of the scenario configuration constant.
 */
type MultifactorAuthenticationConfigRecordConst = typeof MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG;

/**
 * Maps each scenario to its outcomes configuration type.
 */
type MultifactorAuthenticationScenarioOutcomeConst = {
    [K in MultifactorAuthenticationScenario]: MultifactorAuthenticationConfigRecordConst[K]['OUTCOMES'];
};

/**
 * Available outcome options for each scenario.
 */
type MultifactorAuthenticationOutcomeScenarioOptions = {
    [K in MultifactorAuthenticationScenario]: keyof MultifactorAuthenticationScenarioOutcomeConst[K];
};

/**
 * Maps scenarios to their outcome configurations.
 */
type MultifactorAuthenticationOutcomeRecord = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationOutcome>;

/**
 * Constructs a kebab-case outcome type string from scenario and outcome name.
 */
type MultifactorAuthenticationOutcomeType<T extends MultifactorAuthenticationScenario> = `${Lowercase<T>}-${KebabCase<MultifactorAuthenticationOutcomeScenarioOptions[T]>}`;

type MultifactorAuthenticationUI = {
    MODALS: MultifactorAuthenticationModal;
    OUTCOMES: MultifactorAuthenticationOutcome;
};

/**
 * All possible outcome types key across all scenarios.
 */
type AllMultifactorAuthenticationOutcomeType = MultifactorAuthenticationOutcomeType<MultifactorAuthenticationScenario>;

/**
 * Maps all outcome type keys to their configurations.
 */
type MultifactorAuthenticationOutcomeMap = Record<AllMultifactorAuthenticationOutcomeType, MultifactorAuthenticationOutcomeConfig>;

/**
 * All available outcome options across scenarios.
 */
type MultifactorAuthenticationOutcomeOptions = keyof MultifactorAuthenticationScenarioOutcomeConst[MultifactorAuthenticationScenario];

/**
 * Outcome type suffixes for a specific scenario (removes the scenario prefix).
 */
type MultifactorAuthenticationOutcomeSuffixes<T extends MultifactorAuthenticationScenario> = Replace<AllMultifactorAuthenticationOutcomeType, `${Lowercase<T>}-`, ''>;

/**
 * Response from a multifactor authentication scenario action.
 */
type MultifactorAuthenticationScenarioResponse = {
    httpCode: number;
    reason: MultifactorAuthenticationReason;
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
 * Complete scenario configuration including action, UI, and metadata.
 */
type MultifactorAuthenticationScenarioConfig<T extends Record<string, unknown> = EmptyObject> = {
    action: MultifactorAuthenticationScenarioPureMethod<T>;
    allowedAuthenticationMethods: Array<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>>;
    screen: MultifactorAuthenticationScreen;

    /**
     * Whether the scenario does not require any additional parameters except for the native biometrics data.
     * If it is the case, the scenario needs to be defined as such
     * so the absence of payload will be tolerated at the run-time.
     */
    pure?: true;
    nativePromptTitle: TranslationPaths;
} & MultifactorAuthenticationUI;

/**
 * Scenario configuration for custom scenarios with optional overrides.
 */
type MultifactorAuthenticationScenarioCustomConfig<T extends Record<string, unknown> = EmptyObject> = Omit<
    MultifactorAuthenticationScenarioConfig<T>,
    'MODALS' | 'OUTCOMES' | 'nativePromptTitle'
> & {
    nativePromptTitle?: TranslationPaths;
    MODALS?: MultifactorAuthenticationModalOptional;
    OUTCOMES: MultifactorAuthenticationOutcomeOptional;
};

/**
 * Default UI configuration shared across scenarios.
 */
type MultifactorAuthenticationDefaultUIConfig = Pick<MultifactorAuthenticationScenarioConfig, 'nativePromptTitle' | 'MODALS' | 'OUTCOMES'>;

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
type MultifactorAuthenticationScenarioParams<T extends MultifactorAuthenticationScenario> = Partial<AllMultifactorAuthenticationFactors> &
    MultifactorAuthenticationScenarioAdditionalParams<T>;

/**
 * All required authentication factors with scenario-specific parameters.
 */
type MultifactorAuthenticationProcessScenarioParameters<T extends MultifactorAuthenticationScenario> = AllMultifactorAuthenticationFactors &
    MultifactorAuthenticationScenarioAdditionalParams<T>;

/**
 * Scenario response with success status indicator.
 */
type MultifactorAuthenticationScenarioResponseWithSuccess = {
    httpCode: number | undefined;
    successful: boolean;
};

/**
 * Parameters required for biometrics registration scenario.
 */
type RegisterBiometricsParams = MultifactorAuthenticationActionParams<
    {
        keyInfo: MultifactorAuthenticationKeyInfo<'biometric'>;
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
    MultifactorAuthenticationOutcome,
    MultifactorAuthenticationModal,
    MultifactorAuthenticationOutcomeRecord,
    MultifactorAuthenticationOutcomeMap,
    MultifactorAuthenticationScenarioResponseWithSuccess,
    MultifactorAuthenticationScenarioResponse,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationOutcomeOptions,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationOutcomeType,
    AllMultifactorAuthenticationOutcomeType,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationUI,
    MultifactorAuthenticationScenarioConfigRecord,
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationDefaultUIConfig,
    MultifactorAuthenticationOutcomeSuffixes,
    MultifactorAuthenticationScenarioCustomConfig,
};
