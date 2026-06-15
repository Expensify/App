import type {ValueOf} from 'type-fest';
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
 * Resolved config for a single scenario key, preserving that scenario's specific action signature.
 * This is the precise type behind {@link getScenarioConfig}'s return.
 */
type MultifactorAuthenticationScenarioConfigFor<T extends MultifactorAuthenticationScenario> = (typeof MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG)[T];

/**
 * Union of every resolved scenario config - the value type to store when the scenario is dynamic (not
 * known at the type level), e.g. the `scenario` field on the runtime MFA state.
 */
type MultifactorAuthenticationResolvedScenarioConfig = ValueOf<typeof MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG>;

/**
 * Returns the config for a scenario key, narrowed through the generic so each scenario's action
 * signature survives without a type assertion. Call sites that store the result next to a dynamic
 * scenario name should widen the field to {@link MultifactorAuthenticationResolvedScenarioConfig}.
 */
function getScenarioConfig<T extends MultifactorAuthenticationScenario>(scenarioName: T): MultifactorAuthenticationScenarioConfigFor<T> {
    return MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenarioName];
}

export default MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG;
export {getScenarioConfig};
export type {MultifactorAuthenticationScenarioConfigFor, MultifactorAuthenticationResolvedScenarioConfig};
