import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationInitEvent} from '@components/MultifactorAuthentication/machine/types';

import CONST from '@src/CONST';

const MFA_TEST_SCENARIO_NAME = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST;
const MFA_TEST_ACCOUNT_ID = 12345;
const MFA_TEST_VALIDATE_CODE = '123456';

/**
 * Builds the INIT event fixture for the test scenario.
 */
function createInitEvent(): MultifactorAuthenticationInitEvent<typeof MFA_TEST_SCENARIO_NAME> {
    return {
        type: 'INIT',
        accountID: MFA_TEST_ACCOUNT_ID,
        scenarioName: MFA_TEST_SCENARIO_NAME,
        scenario: getScenarioConfig(MFA_TEST_SCENARIO_NAME),
        payload: undefined,
    };
}

export default createInitEvent;
export {MFA_TEST_ACCOUNT_ID, MFA_TEST_VALIDATE_CODE};
