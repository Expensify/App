import type {Step} from '@kie/act-js';
import {createStepAssertion} from 'workflow_tests/utils/utils';

function assertChecklistJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'CHECKLIST', 'Checkout'),
        createStepAssertion('authorChecklist.js', true, null, 'CHECKLIST', 'Running authorChecklist.js', [{key: 'GITHUB_TOKEN', value: '***'}], []),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

// eslint-disable-next-line import/prefer-default-export
export {assertChecklistJobExecuted};
