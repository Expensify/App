import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertlockStagingDeploysJobExecuted(workflowResult: Step[], didExecute = true, isSuccessful = true) {
    const steps = [
        createStepAssertion(
            'Checkout',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Checking out',
            [
                {key: 'ref', value: 'main'},
                {key: 'token', value: '***'},
            ],
            [],
        ),
        createStepAssertion('Wait for staging deploys to finish', true, null, 'LOCKSTAGINGDEPLOYS', 'Waiting for staging deploys to finish', [{key: 'GITHUB_TOKEN', value: '***'}], []),
        createStepAssertion(
            'Comment in StagingDeployCash to give Applause the 🟢 to begin QA',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Commenting in StagingDeployCash',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failProdSteps = [
        createStepAssertion('Announce failed workflow', true, null, 'LOCKSTAGINGDEPLOYS', 'Announcing failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ] as const;

    failProdSteps.forEach((expectedStep) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertlockStagingDeploysJobFailedAfterFirstStep(workflowResult: Step[]) {
    const steps = [
        createStepAssertion(
            'Checkout',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Checking out',
            [
                {key: 'ref', value: 'main'},
                {key: 'token', value: '***'},
            ],
            [],
        ),
        createStepAssertion('Wait for staging deploys to finish', false, null, 'LOCKSTAGINGDEPLOYS', 'Waiting for staging deploys to finish', [{key: 'GITHUB_TOKEN', value: '***'}], []),
        createStepAssertion('Announce failed workflow', true, null, 'LOCKSTAGINGDEPLOYS', 'Announcing failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ] as const;

    steps.forEach((expectedStep) => {
        expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
    });
}

export default {assertlockStagingDeploysJobExecuted, assertlockStagingDeploysJobFailedAfterFirstStep};
