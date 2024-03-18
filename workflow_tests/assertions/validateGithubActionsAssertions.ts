import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertVerifyJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'VERIFY', 'Checkout'),
        createStepAssertion('Setup Node', true, null, 'VERIFY', 'Setup Node', [], []),
        createStepAssertion('Verify Javascript Action Builds', true, null, 'VERIFY', 'Verify Javascript Action Builds', [], []),
        createStepAssertion('Validate actions and workflows', true, null, 'VERIFY', 'Validate actions and workflows', [], []),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

// eslint-disable-next-line import/prefer-default-export
export {assertVerifyJobExecuted};
