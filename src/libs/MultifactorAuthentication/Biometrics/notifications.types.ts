import type {MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI, MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from '@components/MultifactorAuthenticationContext/ui';
import type {MultifactorAuthenticationScenario} from './types';

type MultifactorAuthenticationScenarioConfig = typeof MULTIFACTOR_AUTHENTICATION_NOTIFICATION_UI;

type FeedbackScreenConfigNames = {
    [K in MultifactorAuthenticationScenario]: keyof MultifactorAuthenticationScenarioConfig[K];
};

type MultifactorAuthenticationNotificationType<T extends MultifactorAuthenticationScenario> = `${Lowercase<T>}-${Lowercase<FeedbackScreenConfigNames[T]>}`;

type AllMultifactorAuthenticationNotificationType = MultifactorAuthenticationNotificationType<MultifactorAuthenticationScenario>;

type MultifactorAuthenticationPromptType = keyof typeof MULTIFACTOR_AUTHENTICATION_PROMPT_UI;

export type {AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationNotificationType, MultifactorAuthenticationPromptType};
