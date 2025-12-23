import type {ViewStyle} from 'react-native';
import type {EmptyObject, ValueOf} from 'type-fest';
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
import type {MULTIFACTOR_AUTHENTICATION_PROMPT_UI, MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG, MultifactorAuthenticationScenarioPayload} from './index';

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
    headerTitle: TranslationPaths;
    title: TranslationPaths;
    description: TranslationPaths;
};

type MultifactorAuthenticationPrompt = Record<string, MultifactorAuthenticationPromptConfig>;

type MultifactorAuthenticationNotification = Record<string, MultifactorAuthenticationNotificationConfig>;

type MultifactorAuthenticationModal = {
    cancelConfirmation: MultifactorAuthenticationCancelConfirm;
};

type MultifactorAuthenticationModalOptional = {
    cancelConfirmation?: Partial<MultifactorAuthenticationCancelConfirm>;
};

type MultifactorAuthenticationNotificationOptional = Record<string, Partial<MultifactorAuthenticationNotificationConfig>>;

type MultifactorAuthenticationConfigRecordConst = typeof MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG;

type MultifactorAuthenticationScenarioNotificationConst = {
    [K in MultifactorAuthenticationScenario]: MultifactorAuthenticationConfigRecordConst[K]['NOTIFICATIONS'];
};

type MultifactorAuthenticationNotificationScenarioOptions = {
    [K in MultifactorAuthenticationScenario]: keyof MultifactorAuthenticationScenarioNotificationConst[K];
};

type MultifactorAuthenticationNotificationRecord = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationNotification>;

type MultifactorAuthenticationNotificationType<T extends MultifactorAuthenticationScenario> = `${Lowercase<T>}-${Lowercase<MultifactorAuthenticationNotificationScenarioOptions[T]>}`;

type MultifactorAuthenticationUI = {
    MODALS: MultifactorAuthenticationModal;
    NOTIFICATIONS: MultifactorAuthenticationNotification;
};

type AllMultifactorAuthenticationNotificationType = MultifactorAuthenticationNotificationType<MultifactorAuthenticationScenario>;

type MultifactorAuthenticationNotificationMap = Record<AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationNotificationConfig>;

type MultifactorAuthenticationNotificationOptions = keyof MultifactorAuthenticationScenarioNotificationConst[MultifactorAuthenticationScenario];

type MultifactorAuthenticationScenarioResponse = {
    httpCode: number;
    reason: MultifactorAuthenticationReason;
};

type MultifactorAuthenticationScreen = ValueOf<typeof SCREENS.MULTIFACTOR_AUTHENTICATION>;

type MultifactorAuthenticationScenarioPureMethod<T extends Record<string, unknown>> = (
    params: MultifactorAuthenticationActionParams<T, 'signedChallenge'>,
) => Promise<MultifactorAuthenticationScenarioResponse>;

type MultifactorAuthenticationScenarioConfig<T extends Record<string, unknown> = EmptyObject> = {
    action: MultifactorAuthenticationScenarioPureMethod<T>;
    allowedAuthentication: ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>;
    screen: MultifactorAuthenticationScreen;
    pure?: true;
    nativePromptTitle: TranslationPaths;
} & MultifactorAuthenticationUI;

type MultifactorAuthenticationScenarioCustomConfig<T extends Record<string, unknown> = EmptyObject> = Omit<
    MultifactorAuthenticationScenarioConfig<T>,
    'MODALS' | 'NOTIFICATIONS' | 'nativePromptTitle'
> & {
    nativePromptTitle?: TranslationPaths;
    MODALS?: MultifactorAuthenticationModalOptional;
    NOTIFICATIONS: MultifactorAuthenticationNotificationOptional;
};

type MultifactorAuthenticationDefaultUIConfig = Pick<MultifactorAuthenticationScenarioConfig<never>, 'nativePromptTitle' | 'MODALS' | 'NOTIFICATIONS'>;

type MultifactorAuthenticationScenarioConfigRecord = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioConfig<never>>;

type MultifactorAuthenticationScenarioAdditionalParams<T extends MultifactorAuthenticationScenario> = T extends keyof MultifactorAuthenticationScenarioPayload
    ? MultifactorAuthenticationScenarioPayload[T]
    : EmptyObject;

/**
 * Parameters required for a multifactorial authentication scenario, optionally including stored factor verification
 */
type MultifactorAuthenticationScenarioParams<T extends MultifactorAuthenticationScenario> = Partial<AllMultifactorAuthenticationFactors> &
    MultifactorAuthenticationScenarioAdditionalParams<T>;

type MultifactorAuthenticationProcessScenarioParameters<T extends MultifactorAuthenticationScenario> = AllMultifactorAuthenticationFactors &
    MultifactorAuthenticationScenarioAdditionalParams<T>;

/**
 * Response type that includes a success indicator
 */
type MultifactorAuthenticationScenarioResponseWithSuccess = {
    httpCode: number | undefined;
    successful: boolean;
};

type MultifactorAuthenticationPromptType = keyof typeof MULTIFACTOR_AUTHENTICATION_PROMPT_UI;

type RegisterBiometricsParams = MultifactorAuthenticationActionParams<
    {
        keyInfo: MultifactorAuthenticationKeyInfo<'biometric'>;
    },
    'validateCode'
>;

type MultifactorAuthenticationScenarioParameters = {
    [key in MultifactorAuthenticationScenario]: MultifactorAuthenticationActionParams<
        key extends keyof MultifactorAuthenticationScenarioPayload ? MultifactorAuthenticationScenarioPayload[key] : EmptyObject,
        'signedChallenge'
    >;
} & {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'REGISTER-BIOMETRICS': RegisterBiometricsParams;
};

type MultifactorAuthenticationScenario = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO>;

export type {
    MultifactorAuthenticationPrompt,
    MultifactorAuthenticationNotification,
    MultifactorAuthenticationModal,
    MultifactorAuthenticationNotificationRecord,
    MultifactorAuthenticationNotificationMap,
    MultifactorAuthenticationScenarioResponseWithSuccess,
    MultifactorAuthenticationScenarioResponse,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationNotificationOptions,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationPromptType,
    AllMultifactorAuthenticationNotificationType,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationUI,
    MultifactorAuthenticationScenarioConfigRecord,
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationDefaultUIConfig,
    MultifactorAuthenticationScenarioCustomConfig,
};
