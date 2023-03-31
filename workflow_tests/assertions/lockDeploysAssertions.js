const utils = require('../utils/utils');

const assertlockStagingDeploysJobExecuted = (workflowResult, didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion(
            'Checkout',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Checking out',
            [{key: 'ref', value: 'main'}, {key: 'fetch-depth', value: '0'}, {key: 'token', value: '***'}],
            [],
        ),
        utils.createStepAssertion(
            'Wait for staging deploys to finish',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Waiting for staging deploys to finish',
            [{key: 'GITHUB_TOKEN', value: '***'}],
            [],
        ),
        utils.createStepAssertion(
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
        utils.createStepAssertion(
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
        utils.createStepAssertion(
            'Checkout',
            true,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Checking out',
            [{key: 'ref', value: 'main'}, {key: 'fetch-depth', value: '0'}, {key: 'token', value: '***'}],
            [],
        ),
        utils.createStepAssertion(
            'Wait for staging deploys to finish',
            false,
            null,
            'LOCKSTAGINGDEPLOYS',
            'Waiting for staging deploys to finish',
            [{key: 'GITHUB_TOKEN', value: '***'}],
            [],
        ),
        utils.createStepAssertion(
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
