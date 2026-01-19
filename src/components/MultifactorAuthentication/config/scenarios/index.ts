import type {EmptyObject} from 'type-fest';
import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import BiometricsTest from './BiometricsTest';
import {customConfig} from './DefaultUserInterface';

/**
 * Payload types for multifactor authentication scenarios.
 * Since the BiometricsTest does not require any payload, it is an empty object for now.
 * The AuthorizeTransaction Scenario will change it.
 */
type Payloads = EmptyObject;

/**
 * Configuration records for all multifactor authentication scenarios.
 */
const Configs = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST]: customConfig(BiometricsTest),
} as const satisfies MultifactorAuthenticationScenarioConfigRecord;

export default Configs;
export type {Payloads};
