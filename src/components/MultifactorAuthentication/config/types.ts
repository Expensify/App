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
 * Configuration for displaying multifactor authentication notifications with illustrations and text.
 */
type MultifactorAuthenticationNotificationConfig = {
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
 * Collection of notifications keyed by notification type.
 */
type MultifactorAuthenticationNotification = Record<string, MultifactorAuthenticationNotificationConfig>;

/**
 * Configuration for modals in multifactor authentication flows.
 */
type MultifactorAuthenticationModal = {
    cancelConfirmation: MultifactorAuthenticationCancelConfirm;
};

/**
 * Optional modal configuration for scenarios that may not have custom modals.
 */
type MultifactorAuthenticationModalOptional = {
    cancelConfirmation?: Partial<MultifactorAuthenticationCancelConfirm>;
};

/**
 * Optional notification configuration with partial properties for scenario overrides.
 */
type MultifactorAuthenticationNotificationOptional = Record<string, Partial<MultifactorAuthenticationNotificationConfig>>;

/**
 * Type representation of the scenario configuration constant.
 */
type MultifactorAuthenticationConfigRecordConst = typeof MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG;

/**
 * Maps each scenario to its notifications configuration type.
 */
type MultifactorAuthenticationScenarioNotificationConst = {
    [K in MultifactorAuthenticationScenario]: MultifactorAuthenticationConfigRecordConst[K]['NOTIFICATIONS'];
};

/**
 * Available notification options for each scenario.
 */
type MultifactorAuthenticationNotificationScenarioOptions = {
    [K in MultifactorAuthenticationScenario]: keyof MultifactorAuthenticationScenarioNotificationConst[K];
};

/**
 * Maps scenarios to their notification configurations.
 */
type MultifactorAuthenticationNotificationRecord = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationNotification>;

/**
 * Constructs a kebab-case notification type string from scenario and notification name.
 */
type MultifactorAuthenticationNotificationType<T extends MultifactorAuthenticationScenario> = `${Lowercase<T>}-${KebabCase<MultifactorAuthenticationNotificationScenarioOptions[T]>}`;

type MultifactorAuthenticationUI = {
    MODALS: MultifactorAuthenticationModal;
    NOTIFICATIONS: MultifactorAuthenticationNotification;
};

/**
 * All possible notification type keys across all scenarios.
 */
type AllMultifactorAuthenticationNotificationType = MultifactorAuthenticationNotificationType<MultifactorAuthenticationScenario>;

/**
 * Maps all notification type keys to their configurations.
 */
type MultifactorAuthenticationNotificationMap = Record<AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationNotificationConfig>;

/**
 * All available notification options across scenarios.
 */
type MultifactorAuthenticationNotificationOptions = keyof MultifactorAuthenticationScenarioNotificationConst[MultifactorAuthenticationScenario];

/**
 * Notification type suffixes for a specific scenario (removes the scenario prefix).
 */
type MultifactorAuthenticationNotificationSuffixes<T extends MultifactorAuthenticationScenario> = Replace<AllMultifactorAuthenticationNotificationType, `${Lowercase<T>}-`, ''>;

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
    allowedAuthentication: ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>;
    screen: MultifactorAuthenticationScreen;
    pure?: true;
    nativePromptTitle: TranslationPaths;
} & MultifactorAuthenticationUI;

/**
 * Scenario configuration for custom scenarios with optional overrides.
 */
type MultifactorAuthenticationScenarioCustomConfig<T extends Record<string, unknown> = EmptyObject> = Omit<
    MultifactorAuthenticationScenarioConfig<T>,
    'MODALS' | 'NOTIFICATIONS' | 'nativePromptTitle'
> & {
    nativePromptTitle?: TranslationPaths;
    MODALS?: MultifactorAuthenticationModalOptional;
    NOTIFICATIONS: MultifactorAuthenticationNotificationOptional;
};

/**
 * Default UI configuration shared across scenarios.
 */
type MultifactorAuthenticationDefaultUIConfig = Pick<MultifactorAuthenticationScenarioConfig, 'nativePromptTitle' | 'MODALS' | 'NOTIFICATIONS'>;

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
    MultifactorAuthenticationNotificationRecord,
    MultifactorAuthenticationNotificationMap,
    MultifactorAuthenticationScenarioResponseWithSuccess,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationNotificationOptions,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationScenarioConfigRecord,
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationDefaultUIConfig,
    MultifactorAuthenticationNotificationSuffixes,
    MultifactorAuthenticationScenarioCustomConfig,
};
