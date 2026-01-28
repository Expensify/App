import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import type {Payload as AuthorizeTransactionPayload} from './AuthorizeTransaction';
import AuthorizeTransaction from './AuthorizeTransaction';
import BiometricsTest from './BiometricsTest';
import {customConfig} from './DefaultUserInterface';

/**
 * Payload types for multifactor authentication scenarios.
 * Since the BiometricsTest does not require any payload, it is an empty object for now.
 * The AuthorizeTransaction Scenario will change it, as it needs the transactionID to be provided as well.
 *
 * {
 *     "AUTHORIZE-TRANSACTION": {
 *         transactionID: string;
 *     }
 * }
 */
type Payloads = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: AuthorizeTransactionPayload;
};

/**
 * Configuration records for all multifactor authentication scenarios.
 */
const Configs = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST]: customConfig(BiometricsTest),
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION]: customConfig(AuthorizeTransaction),
} as const satisfies MultifactorAuthenticationScenarioConfigRecord;

export default Configs;
export type {Payloads};
