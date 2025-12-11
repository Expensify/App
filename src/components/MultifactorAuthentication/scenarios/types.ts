import type {ViewStyle} from 'react-native';
import type {EmptyObject, ValueOf} from 'type-fest';
import type {IllustrationName} from '@components/Icon/chunks/illustrations.chunk';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {AllMultifactorAuthenticationFactors} from '@libs/MultifactorAuthentication/Biometrics/types';
import type VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import type {MULTIFACTOR_AUTHENTICATION_PROMPT_UI, MULTIFACTOR_AUTHENTICATION_UI, MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParameters} from './index';

type MultifactorAuthenticationCancelConfirm = {
    description?: TranslationPaths;
    cancelButtonText?: TranslationPaths;
    confirmButtonText?: TranslationPaths;
    title?: TranslationPaths;
};

type MultifactorAuthenticationPromptConfig = {
    animation: DotLottieAnimation;
    title: TranslationPaths;
    subtitle: TranslationPaths;
};

type MultifactorAuthenticationNotificationConfig = {
    illustration: IllustrationName;
    iconWidth: number;
    iconHeight: number;
    padding: ViewStyle;
    headerTitle?: TranslationPaths;
    title?: TranslationPaths;
};

type MultifactorAuthenticationPrompt = Record<string, MultifactorAuthenticationPromptConfig>;

type MultifactorAuthenticationNotification = Record<string, MultifactorAuthenticationNotificationConfig>;

type MultifactorAuthenticationModal = {
    cancelConfirmation?: MultifactorAuthenticationCancelConfirm;
};

type MultifactorAuthenticationUIRecordConst = typeof MULTIFACTOR_AUTHENTICATION_UI;

type MultifactorAuthenticationScenarioNotificationConst = {
    [K in keyof MultifactorAuthenticationUIRecordConst]: MultifactorAuthenticationUIRecordConst[K]['NOTIFICATIONS'];
};

type MultifactorAuthenticationNotificationScenarioOptions = {
    [K in MultifactorAuthenticationScenario]: keyof MultifactorAuthenticationScenarioNotificationConst[K];
};

type MultifactorAuthenticationNotificationRecord = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationNotification>;

type MultifactorAuthenticationNotificationType<T extends MultifactorAuthenticationScenario> = `${Lowercase<T>}-${Lowercase<MultifactorAuthenticationNotificationScenarioOptions[T]>}`;

type MultifactorAuthenticationUIRecord = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationUI>;

type MultifactorAuthenticationUI = {
    MODALS: MultifactorAuthenticationModal;
    NOTIFICATIONS: MultifactorAuthenticationNotification;
};

type AllMultifactorAuthenticationNotificationType = MultifactorAuthenticationNotificationType<MultifactorAuthenticationScenario>;

type MultifactorAuthenticationNotificationMap = Record<AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationNotificationConfig>;

type MultifactorAuthenticationNotificationMapEntry = Record<MultifactorAuthenticationNotificationType<MultifactorAuthenticationScenario>, MultifactorAuthenticationNotificationConfig>;

type MultifactorAuthenticationNotificationOptions = keyof MultifactorAuthenticationScenarioNotificationConst[MultifactorAuthenticationScenario];

type MultifactorAuthenticationScenarioResponse = {
    httpCode: number;
    reason: TranslationPaths;
};

type MultifactorAuthenticationScenarioPureMethod<T> = (params: Partial<AllMultifactorAuthenticationFactors> & T) => Promise<MultifactorAuthenticationScenarioResponse>;

type MultifactorAuthenticationScenarioConfig<T> = {
    action: MultifactorAuthenticationScenarioPureMethod<T>;
    allowedAuthentication: ValueOf<typeof VALUES.TYPE>;
    route: Route;
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
    allowedAuthentication: ValueOf<typeof VALUES.TYPE>;
    route: Route;
};

/**
 * Maps scenarios to their handlers and configuration
 */
type MultifactorAuthenticationScenarioMap = {
    [T in MultifactorAuthenticationScenario]: MultifactorAuthenticationScenarioData<T>;
};

/**
 * Response type that includes a success indicator
 */
type MultifactorAuthenticationScenarioResponseWithSuccess = {
    httpCode: number | undefined;
    successful: boolean;
};

type MultifactorAuthenticationPromptType = keyof typeof MULTIFACTOR_AUTHENTICATION_PROMPT_UI;

export type {
    MultifactorAuthenticationPrompt,
    MultifactorAuthenticationNotification,
    MultifactorAuthenticationModal,
    MultifactorAuthenticationNotificationRecord,
    MultifactorAuthenticationNotificationMap,
    MultifactorAuthenticationScenarioResponseWithSuccess,
    MultifactorAuthenticationScenarioResponse,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationNotificationMapEntry,
    MultifactorAuthenticationNotificationOptions,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationPromptType,
    AllMultifactorAuthenticationNotificationType,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationUI,
    MultifactorAuthenticationUIRecord,
    MultifactorAuthenticationScenarioMap,
};
