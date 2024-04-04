import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertVerifyJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'VERIFY', 'Checkout'),
        createStepAssertion('Setup Node', true, null, 'VERIFY', 'Setup Node', [], []),
        createStepAssertion('Verify podfile', true, null, 'VERIFY', 'Verify podfile', [], []),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

export default {assertVerifyJobExecuted};
