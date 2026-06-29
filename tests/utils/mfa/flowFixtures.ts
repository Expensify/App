import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationInitEvent} from '@components/MultifactorAuthentication/machine/types';
import CONST from '@src/CONST';

const MFA_TEST_SCENARIO_NAME = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST;

function createInitEvent(): MultifactorAuthenticationInitEvent {
    return {
        type: 'INIT',
        scenarioName: MFA_TEST_SCENARIO_NAME,
        scenario: getScenarioConfig(MFA_TEST_SCENARIO_NAME),
        payload: undefined,
    };
}

export default createInitEvent;
export {MFA_TEST_SCENARIO_NAME};
