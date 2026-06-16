/**
 * Configuration exports for multifactor authentication UI components and scenarios.
 */
import MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG from './scenarios';

export {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG};
export {getScenarioConfig} from './scenarios';
export {default as MULTIFACTOR_AUTHENTICATION_PROMPT_UI} from './scenarios/prompts';
export type {MultifactorAuthenticationScenarioConfigFor} from './scenarios';
export type {Payloads as MultifactorAuthenticationScenarioPayload} from './scenarios/types';
