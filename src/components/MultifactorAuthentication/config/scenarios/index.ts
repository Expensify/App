import type {EmptyObject} from 'type-fest';
import type {MultifactorAuthenticationScenarioConfigRecord} from '@components/MultifactorAuthentication/config/types';
import CONST from '@src/CONST';
import BiometricsTest from './BiometricsTest';
import {customConfig} from './DefaultUserInterface';

type Payloads = EmptyObject;

const Configs = {
    [CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST]: customConfig(BiometricsTest),
} as const satisfies MultifactorAuthenticationScenarioConfigRecord;

export default Configs;
export type {Payloads};
