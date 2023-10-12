const utils = require('../utils/utils');

const assertDeployBlockerJobExecuted = (workflowResult, issueTitle, issueNumber, didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'DEPLOYBLOCKER', 'Checkout', [{key: 'token', value: '***'}], []),
        utils.createStepAssertion(
            'Get URL, title, & number of new deploy blocker (issue)',
            true,
            null,
            'DEPLOYBLOCKER',
            'Get URL, title and number of new deploy blocker - issue',
            [],
            [{key: 'TITLE', value: issueTitle}],
        ),
        utils.createStepAssertion(
            'Update StagingDeployCash with new deploy blocker',
            true,
            null,
            'DEPLOYBLOCKER',
            'Update StagingDeployCash with new deploy blocker',
            [{key: 'GITHUB_TOKEN', value: '***'}],
            [],
        ),
        utils.createStepAssertion(
            'Give the issue/PR the Hourly, Engineering labels',
            true,
            null,
            'DEPLOYBLOCKER',
            'Give the issue/PR the Hourly, Engineering labels',
            [
                {key: 'add-labels', value: 'Hourly, Engineering'},
                {key: 'remove-labels', value: 'Daily, Weekly, Monthly'},
            ],
            [],
        ),
        utils.createStepAssertion(
            'Comment on deferred PR',
            true,
            null,
            'DEPLOYBLOCKER',
            'Comment on deferred PR',
            [
                {key: 'github_token', value: '***'},
                {key: 'number', value: issueNumber},
            ],
            [],
        ),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            if (isSuccessful) {
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
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
    assertDeployBlockerJobExecuted,
};
