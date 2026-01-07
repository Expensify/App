import type {ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {IllustrationName} from '@components/Icon/chunks/illustrations.chunk';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from './index';

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

type MultifactorAuthenticationScenarioConfig = {
    allowedAuthentication: ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>;
    nativePromptTitle: TranslationPaths;
} & MultifactorAuthenticationUI;

type MultifactorAuthenticationScenarioCustomConfig = Omit<MultifactorAuthenticationScenarioConfig, 'MODALS' | 'NOTIFICATIONS' | 'nativePromptTitle'> & {
    nativePromptTitle?: TranslationPaths;
    MODALS?: MultifactorAuthenticationModalOptional;
    NOTIFICATIONS: MultifactorAuthenticationNotificationOptional;
};

type MultifactorAuthenticationDefaultUIConfig = Pick<MultifactorAuthenticationScenarioConfig, 'nativePromptTitle' | 'MODALS' | 'NOTIFICATIONS'>;

type MultifactorAuthenticationScenarioConfigRecord = Record<MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioConfig>;

type MultifactorAuthenticationScenario = ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO>;

export type {
    MultifactorAuthenticationPrompt,
    MultifactorAuthenticationNotificationRecord,
    MultifactorAuthenticationNotificationMap,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationNotificationOptions,
    MultifactorAuthenticationScenarioConfigRecord,
    MultifactorAuthenticationDefaultUIConfig,
    MultifactorAuthenticationScenarioCustomConfig,
};
