import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import type {MultifactorAuthenticationInitEvent} from '@components/MultifactorAuthentication/machine/types';
import CONST from '@src/CONST';

const MFA_TEST_SCENARIO_NAME = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST;

type MfaTestScenarioParams = MultifactorAuthenticationScenarioParams<typeof MFA_TEST_SCENARIO_NAME>;

/**
 * A non-empty payload for the test scenario. The traversal pairs it with the bare fixture so flows with
 * and without a payload occupy distinct context vertices in the graph.
 */
const MFA_TEST_PAYLOAD: MfaTestScenarioParams = {validateCode: '123456'};

// The narrowed generic ties `scenarioName`, `scenario`, and `payload` to the same scenario, so pairing
// the name with another scenario's config here is a compile error.
function createInitEvent(payload?: MfaTestScenarioParams): MultifactorAuthenticationInitEvent<typeof MFA_TEST_SCENARIO_NAME> {
    return {
        type: 'INIT',
        scenarioName: MFA_TEST_SCENARIO_NAME,
        scenario: getScenarioConfig(MFA_TEST_SCENARIO_NAME),
        payload,
    };
}

/**
 * Narrows a traversal event to the test-scenario INIT fixture shape. The scenario-name check is enough,
 * because {@link createInitEvent} is the only source of INIT events in the traversal and it correlates
 * the payload with the scenario name by construction. The parameter accepts any typed event, because
 * `xstate/graph` erases everything but `type` from the event an executor receives.
 */
function isTestScenarioInitEvent(event: {type: string}): event is MultifactorAuthenticationInitEvent<typeof MFA_TEST_SCENARIO_NAME> {
    return event.type === 'INIT' && 'scenarioName' in event && event.scenarioName === MFA_TEST_SCENARIO_NAME;
}

/**
 * Names a traversal event in path titles and transition descriptions. The INIT fixtures differ only in
 * their payload, which the titles otherwise erase, so a failure would not tell which fixture broke. The
 * label lists the payload keys instead of the serialized payload to stay short and stable.
 */
function describeTraversalEvent(event: {type: string}): string {
    if (!isTestScenarioInitEvent(event)) {
        return event.type;
    }
    return event.payload === undefined ? 'INIT(bare)' : `INIT(${Object.keys(event.payload).join(', ')})`;
}

export default createInitEvent;
export {describeTraversalEvent, isTestScenarioInitEvent, MFA_TEST_PAYLOAD, MFA_TEST_SCENARIO_NAME};
