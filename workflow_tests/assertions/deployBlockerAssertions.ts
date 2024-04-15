import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertUpdateChecklistJobExecuted(workflowResult: Step[], didExecute = true, isSuccessful = true) {
    const steps = [createStepAssertion('updateChecklist', true, null, 'UPDATECHECKLIST', 'Run updateChecklist')] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            if (isSuccessful) {
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertDeployBlockerJobExecuted(workflowResult: Step[], didExecute = true, isSuccessful = true, failsAt = -1) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'DEPLOYBLOCKER', 'Checkout'),
        createStepAssertion(
            'Give the issue/PR the Hourly, Engineering labels',
            true,
            null,
            'DEPLOYBLOCKER',
            'Give the issue/PR the Hourly, Engineering labels',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
        createStepAssertion('Comment on deploy blocker', true, null, 'DEPLOYBLOCKER', 'Comment on deploy blocker', [], [{key: 'GITHUB_TOKEN', value: '***'}]),
    ] as const;

    steps.forEach((expectedStep, i) => {
        if (didExecute) {
            if (failsAt === -1 || i < failsAt) {
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else if (i === failsAt) {
                steps[i].status = 1;
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            } else {
                expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const successSteps = [
        createStepAssertion(
            'Post the issue in the #expensify-open-source slack room',
            true,
            null,
            'DEPLOYBLOCKER',
            'Post the issue in the expensify-open-source slack room',
            [{key: 'status', value: 'custom'}],
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'SLACK_WEBHOOK_URL', value: '***'},
            ],
        ),
    ] as const;

    successSteps.forEach((step) => {
        if (didExecute && isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });

    const failedSteps = [
        createStepAssertion('Announce failed workflow in Slack', true, null, 'DEPLOYBLOCKER', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ] as const;

    failedSteps.forEach((step) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });
}

export default {assertUpdateChecklistJobExecuted, assertDeployBlockerJobExecuted};
