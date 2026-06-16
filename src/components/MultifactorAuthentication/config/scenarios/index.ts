import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import AuthorizeTransaction from './AuthorizeTransaction';
import BiometricsTest from './BiometricsTest';
import ChangePIN from './ChangePIN';
import customConfig from './DefaultUserInterface';
import RevealCardDetails from './RevealCardDetails';
import RevealPIN from './RevealPIN';
import SetPINOrderCard from './SetPINOrderCard';

/**
 * Configuration records for all multifactor authentication scenarios.
 */
const MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST]: customConfig(BiometricsTest),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD]: customConfig(SetPINOrderCard),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: customConfig(AuthorizeTransaction),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_PIN]: customConfig(RevealPIN),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.CHANGE_PIN]: customConfig(ChangePIN),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_CARD_DETAILS]: customConfig(RevealCardDetails),
} as const satisfies MultifactorAuthenticationScenarioConfigRecord;

/**
 * Represents the configuration for a single multifactor authentication scenario.
 */
type MultifactorAuthenticationScenarioConfigFor<T extends MultifactorAuthenticationScenario> = (typeof MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG)[T];

/**
 * Returns the configuration for the given multifactor authentication scenario.
 */
function getScenarioConfig<T extends MultifactorAuthenticationScenario>(scenarioName: T): MultifactorAuthenticationScenarioConfigFor<T> {
    return MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenarioName];
}

export default MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG;
export {getScenarioConfig};
export type {MultifactorAuthenticationScenarioConfigFor};
