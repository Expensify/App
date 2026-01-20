/**
 * Configuration exports for multifactor authentication UI components and scenarios.
 */
import mapMultifactorAuthenticationNotification from './mapMultifactorAuthenticationNotifications';
import MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG from './scenarios';

const MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP = mapMultifactorAuthenticationNotification(MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG);

export {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG, MULTIFACTOR_AUTHENTICATION_NOTIFICATION_MAP};
export {default as MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from './scenarios/prompts';
export {default as MULTIFACTOR_AUTHENTICATION_DEFAULT_UI} from './scenarios/DefaultUserInterface';
export type {Payloads as MultifactorAuthenticationScenarioPayload} from './scenarios';
