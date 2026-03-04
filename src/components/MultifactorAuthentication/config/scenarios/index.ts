import type {EmptyObject} from 'type-fest';
import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import type {Payload as AuthorizeTransactionPayload} from './AuthorizeTransaction';
import AuthorizeTransaction from './AuthorizeTransaction';
import BiometricsTest from './BiometricsTest';
import type {Payload as ChangePinPayload} from './ChangePin';
import ChangePin from './ChangePin';
import {customConfig} from './DefaultUserInterface';
import type {Payload as RevealPinPayload} from './RevealPin';
import RevealPin from './RevealPin';
import type {Payload as SetPinOrderCardPayload} from './SetPinOrderCard';
import SetPinOrderCard from './SetPinOrderCard';

/**
 * Payload types for multifactor authentication scenarios.
 * Each scenario that requires additional parameters should have its payload type defined here.
 */
type Payloads = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST]: EmptyObject;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD]: SetPinOrderCardPayload;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: AuthorizeTransactionPayload;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_PIN]: RevealPinPayload;
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.CHANGE_PIN]: ChangePinPayload;
};

/**
 * Configuration records for all multifactor authentication scenarios.
 */
const Configs = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST]: customConfig(BiometricsTest),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD]: customConfig(SetPinOrderCard),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: customConfig(AuthorizeTransaction),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_PIN]: customConfig(RevealPin),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.CHANGE_PIN]: customConfig(ChangePin),
} as const satisfies MultifactorAuthenticationScenarioConfigRecord;

export default Configs;
export type {Payloads};
