import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationInitEvent} from '@components/MultifactorAuthentication/machine/types';
import CONST from '@src/CONST';

const MFA_TEST_SCENARIO_NAME = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST;

/**
 * Builds the INIT event fixture for the test scenario.
 */
function createInitEvent(): MultifactorAuthenticationInitEvent<typeof MFA_TEST_SCENARIO_NAME> {
    return {
        type: 'INIT',
        scenarioName: MFA_TEST_SCENARIO_NAME,
        scenario: getScenarioConfig(MFA_TEST_SCENARIO_NAME),
        payload: undefined,
    };
}

/**
 * Narrows a traversal event to the test-scenario INIT fixture shape. The scenario-name check is enough,
 * because {@link createInitEvent} is the only place that builds INIT events for the traversal. The
 * parameter accepts any typed event, because `xstate/graph` erases everything but `type` from the
 * event an executor receives.
 */
function isTestScenarioInitEvent(event: {type: string}): event is MultifactorAuthenticationInitEvent<typeof MFA_TEST_SCENARIO_NAME> {
    return event.type === 'INIT' && 'scenarioName' in event && event.scenarioName === MFA_TEST_SCENARIO_NAME;
}

export default createInitEvent;
export {isTestScenarioInitEvent, MFA_TEST_SCENARIO_NAME};
