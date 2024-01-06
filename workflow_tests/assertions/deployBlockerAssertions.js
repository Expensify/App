const utils = require('../utils/utils');

const assertUpdateChecklistJobExecuted = (workflowResult, didExecute = true, isSuccessful = true) => {
    const steps = [utils.createStepAssertion('updateChecklist', true, null, 'UPDATECHECKLIST', 'Run updateChecklist')];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            if (isSuccessful) {
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertDeployBlockerJobExecuted = (workflowResult, didExecute = true, isSuccessful = true, failsAt = -1) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'DEPLOYBLOCKER', 'Checkout'),
        utils.createStepAssertion(
            'Give the issue/PR the Hourly, Engineering labels',
            true,
            null,
            'DEPLOYBLOCKER',
            'Give the issue/PR the Hourly, Engineering labels',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
        utils.createStepAssertion('Comment on deploy blocker', true, null, 'DEPLOYBLOCKER', 'Comment on deploy blocker', [], [{key: 'GITHUB_TOKEN', value: '***'}]),
    ];

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
        utils.createStepAssertion(
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
    ];

    successSteps.forEach((step) => {
        if (didExecute && isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });

    const failedSteps = [
        utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'DEPLOYBLOCKER', 'Announce failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}], []),
    ];

    failedSteps.forEach((step) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });
};

module.exports = {
    assertUpdateChecklistJobExecuted,
    assertDeployBlockerJobExecuted,
};
