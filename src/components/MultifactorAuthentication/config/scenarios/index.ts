import type {EmptyObject} from 'type-fest';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationScenarioConfigRecord,
} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import type {Payload as AuthorizeTransactionPayload} from './AuthorizeTransaction';
import AuthorizeTransaction from './AuthorizeTransaction';
import BiometricsTest from './BiometricsTest';
import type {Payload as ChangePINPayload} from './ChangePIN';
import ChangePIN from './ChangePIN';
import customConfig from './DefaultUserInterface';
import type {Payload as RevealCardDetailsPayload} from './RevealCardDetails';
import RevealCardDetails from './RevealCardDetails';
import type {Payload as RevealPINPayload} from './RevealPIN';
import RevealPIN from './RevealPIN';
import type {Payload as SetPINOrderCardPayload} from './SetPINOrderCard';
import SetPINOrderCard from './SetPINOrderCard';

/**
 * Payload types for multifactor authentication scenarios.
 * Each scenario that requires additional parameters should have its payload type defined here.
 */
type Payloads = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST]: EmptyObject;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD]: SetPINOrderCardPayload;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: AuthorizeTransactionPayload;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_PIN]: RevealPINPayload;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.CHANGE_PIN]: ChangePINPayload;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_CARD_DETAILS]: RevealCardDetailsPayload;
};

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
 * Every entry of the config record satisfies MultifactorAuthenticationScenarioConfig at definition, but the
 * per-scenario action signatures make the record's value union non-narrowable, so the lookup needs
 * an assertion. This accessor owns the single assertion so callers don't repeat it; params are
 * type-guarded separately by ExecuteScenarioParams<T>.
 */
function getScenarioConfig(scenarioName: MultifactorAuthenticationScenario): MultifactorAuthenticationScenarioConfig {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenarioName] as MultifactorAuthenticationScenarioConfig;
}

export default MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG;
export {getScenarioConfig};
export type {Payloads};
