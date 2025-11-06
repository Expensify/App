import type MULTIFACTOR_AUTHENTICATION_UI from '@components/MultifactorAuthenticationContext/ui';
import type {MultifactorAuthenticationScenario} from './types';

type MultifactorAuthenticationScenarioConfig = typeof MULTIFACTOR_AUTHENTICATION_UI;

type FeedbackScreenConfigNames = {
    [K in MultifactorAuthenticationScenario]: keyof MultifactorAuthenticationScenarioConfig[K];
};

type MultifactorAuthenticationNotificationType<T extends MultifactorAuthenticationScenario> = `${Lowercase<T>}-${Lowercase<FeedbackScreenConfigNames[T]>}`;

type AllMultifactorAuthenticationNotificationType = MultifactorAuthenticationNotificationType<MultifactorAuthenticationScenario>;

export type {AllMultifactorAuthenticationNotificationType, MultifactorAuthenticationNotificationType};
