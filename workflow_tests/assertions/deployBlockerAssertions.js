const utils = require('../utils/utils');

const assertDeployBlockerJobExecuted = (workflowResult, issueTitle, issueNumber, didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'DEPLOYBLOCKER',
            'Checkout',
            [{key: 'fetch-depth', value: '0'}, {key: 'token', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Get URL, title, & number of new deploy blocker (issue)',
            true,
            null,
            'DEPLOYBLOCKER',
            'Get URL, title and number of new deploy blocker - issue',
            [],
            [{key: 'TITLE', value: issueTitle}],
        ),
        utils.getStepAssertion(
            'Update StagingDeployCash with new deploy blocker',
            true,
            null,
            'DEPLOYBLOCKER',
            'Update StagingDeployCash with new deploy blocker',
            [{key: 'GITHUB_TOKEN', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Give the issue/PR the Hourly, Engineering labels',
            true,
            null,
            'DEPLOYBLOCKER',
            'Give the issue/PR the Hourly, Engineering labels',
            [{key: 'add-labels', value: 'Hourly, Engineering'}, {key: 'remove-labels', value: 'Daily, Weekly, Monthly'}],
            [],
        ),
        utils.getStepAssertion(
            'Comment on deferred PR',
            true,
            null,
            'DEPLOYBLOCKER',
            'Comment on deferred PR',
            [{key: 'github_token', value: '***'}, {key: 'number', value: issueNumber}],
            [],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            if (isSuccessful) {
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }

    const successSteps = [
        utils.getStepAssertion(
            'Post the issue in the #expensify-open-source slack room',
            true,
            null,
            'DEPLOYBLOCKER',
            'Post the issue in the expensify-open-source slack room',
            [{key: 'status', value: 'custom'}],
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'SLACK_WEBHOOK_URL', value: '***'}],
        ),
    ];

    for (const step of successSteps) {
        if (didExecute && isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }

    const failedSteps = [
        utils.getStepAssertion(
            'Announce failed workflow in Slack',
            true,
            null,
            'DEPLOYBLOCKER',
            'Announce failed workflow in Slack',
            [{key: 'SLACK_WEBHOOK', value: '***'}],
            [],
        ),
    ];

    for (const step of failedSteps) {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    }
};

module.exports = {
    assertDeployBlockerJobExecuted,
};
