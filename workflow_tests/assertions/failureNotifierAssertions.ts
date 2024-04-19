import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertNotifyFailureJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Fetch Workflow Run Jobs', true, null, 'NOTIFYFAILURE', 'Fetch Workflow Run Jobs', [], []),
        createStepAssertion('Process Each Failed Job', true, null, 'NOTIFYFAILURE', 'Process Each Failed Job', [], []),
    ] as const;

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
}

export default {assertNotifyFailureJobExecuted};
