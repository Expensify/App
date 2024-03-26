import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertVerifySignedCommitsJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('Verify signed commits', true, null, 'VERIFYSIGNEDCOMMITS', 'Verify signed commits', [{key: 'GITHUB_TOKEN', value: '***'}], [])] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

// eslint-disable-next-line import/prefer-default-export
export {assertVerifySignedCommitsJobExecuted};
