const utils = require('../utils/utils');

const assertlockStagingDeploysJobExecuted = (workflowResult, didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Checking out',
            [{key: 'ref', value: 'main'}, {key: 'fetch-depth', value: '0'}, {key: 'token', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Wait for staging deploys to finish',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Waiting for staging deploys to finish',
            [{key: 'GITHUB_TOKEN', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Comment in StagingDeployCash to give Applause the 🟢 to begin QA',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Commenting in StagingDeployCash',
            [],
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }

    const failProdSteps = [
        utils.getStepAssertion(
            'Announce failed workflow',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Announcing failed workflow in Slack',
            [{key: 'SLACK_WEBHOOK', value: '***'}],
            [],
        ),
    ];

    for (const expectedStep of failProdSteps) {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};

const assertlockStagingDeploysJobFailedAfterFirstStep = (workflowResult) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Checking out',
            [{key: 'ref', value: 'main'}, {key: 'fetch-depth', value: '0'}, {key: 'token', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Wait for staging deploys to finish',
            false,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Waiting for staging deploys to finish',
            [{key: 'GITHUB_TOKEN', value: '***'}],
            [],
        ),
        utils.getStepAssertion(
            'Announce failed workflow',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Announcing failed workflow in Slack',
            [{key: 'SLACK_WEBHOOK', value: '***'}],
            [],
        ),
    ];

    for (const expectedStep of steps) {
        expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
    }
};

module.exports = {
    assertlockStagingDeploysJobExecuted,
    assertlockStagingDeploysJobFailedAfterFirstStep,
};
