import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';

import CONST from '@src/CONST';

import type {EmptyObject} from 'type-fest';

import type {Payload as AuthorizeTransactionPayload} from './AuthorizeTransaction';
import type {Payload as ChangePINPayload} from './ChangePIN';
import type {Payload as RevealPINPayload} from './RevealPIN';
import type {Payload as SetPersonalDetailsAndRevealCardDetailsPayload} from './SetPersonalDetailsAndRevealCardDetails';
import type {Payload as SetPINOrderCardPayload} from './SetPINOrderCard';

import AuthorizeTransaction from './AuthorizeTransaction';
import BiometricsTest from './BiometricsTest';
import ChangePIN from './ChangePIN';
import customConfig from './DefaultUserInterface';
import RevealPIN from './RevealPIN';
import SetPersonalDetailsAndRevealCardDetails from './SetPersonalDetailsAndRevealCardDetails';
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
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PERSONAL_DETAILS_AND_REVEAL_CARD_DETAILS]: SetPersonalDetailsAndRevealCardDetailsPayload;
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
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PERSONAL_DETAILS_AND_REVEAL_CARD_DETAILS]: customConfig(SetPersonalDetailsAndRevealCardDetails),
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
