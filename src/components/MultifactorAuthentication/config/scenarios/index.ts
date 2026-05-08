import type {EmptyObject} from 'type-fest';
import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import type {Payload as AuthorizeTransactionPayload} from './AuthorizeTransaction';
import AuthorizeTransaction from './AuthorizeTransaction';
import BiometricsTest from './BiometricsTest';
import type {Payload as ChangePINPayload} from './ChangePIN';
import ChangePIN from './ChangePIN';
import customConfig from './DefaultUserInterface';
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
};

/**
 * Configuration records for all multifactor authentication scenarios.
 */
const Configs = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST]: customConfig(BiometricsTest),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD]: customConfig(SetPINOrderCard),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: customConfig(AuthorizeTransaction),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_PIN]: customConfig(RevealPIN),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.CHANGE_PIN]: customConfig(ChangePIN),
} as const satisfies MultifactorAuthenticationScenarioConfigRecord;

export default Configs;
export type {Payloads};
