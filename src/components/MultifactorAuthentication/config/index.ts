/**
 * Configuration exports for multifactor authentication UI components and scenarios.
 */
import MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG from './scenarios';

export {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG};
export {default as MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from './scenarios/prompts';
export {default as MULTIFACTOR_AUTHENTICATION_DEFAULT_UI} from './scenarios/DefaultUserInterface';
export type {Payloads as MultifactorAuthenticationScenarioPayload} from './scenarios';
