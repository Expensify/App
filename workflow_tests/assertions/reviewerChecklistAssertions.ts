import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertChecklistJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('reviewerChecklist.js', true, null, 'CHECKLIST', 'reviewerChecklist.js', [{key: 'GITHUB_TOKEN', value: '***'}], [])] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

export default {assertChecklistJobExecuted};
