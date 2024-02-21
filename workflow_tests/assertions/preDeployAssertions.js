const utils = require('../utils/utils');

const assertTypecheckJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Run typecheck workflow', true, null, 'TYPECHECK', 'Running typecheck workflow')];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertLintJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Run lint workflow', true, null, 'LINT', 'Running lint workflow')];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertTestJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Run test workflow', true, null, 'TEST', 'Running test workflow')];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertChooseDeployActionsJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Get merged pull request', true, null, 'CHOOSE_DEPLOY_ACTIONS', 'Getting merged pull request', [{key: 'github_token', value: '***'}]),
        utils.createStepAssertion('Check if StagingDeployCash is locked', true, null, 'CHOOSE_DEPLOY_ACTIONS', 'Checking StagingDeployCash', [{key: 'GITHUB_TOKEN', value: '***'}]),
        utils.createStepAssertion('Check if merged pull request should trigger a deploy', true, ''),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertSkipDeployJobExecuted = (workflowResult, didExecute = true) => {
    const body = ':hand: This PR was not deployed to staging yet because QA is ongoing. It will be automatically deployed to staging after the next production release.';
    const steps = [
        utils.createStepAssertion('Comment on deferred PR', true, null, 'SKIP_DEPLOY', 'Skipping deploy', [
            {key: 'github_token', value: '***'},
            {key: 'number', value: '123'},
            {key: 'body', value: body},
        ]),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertCreateNewVersionJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Create new version', true, null, 'CREATE_NEW_VERSION', 'Creating new version')];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertUpdateStagingJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Run turnstyle', true, null, 'UPDATE_STAGING', 'Running turnstyle', [
            {key: 'poll-interval-seconds', value: '10'},
            {key: 'GITHUB_TOKEN', value: '***'},
        ]),
        utils.createStepAssertion('Checkout main', true, null, 'UPDATE_STAGING', 'Checkout main', [
            {key: 'ref', value: 'main'},
            {key: 'token', value: '***'},
        ]),
        utils.createStepAssertion('Setup Git for OSBotify', true, null, 'UPDATE_STAGING', 'Setup Git for OSBotify', [{key: 'GPG_PASSPHRASE', value: '***'}]),
        utils.createStepAssertion('Update staging branch from main', true, null, 'UPDATE_STAGING', 'Update staging branch from main'),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertUpdateStagingJobFailed = (workflowResult, didFail = false) => {
    const steps = [
        utils.createStepAssertion('Announce failed workflow in Slack', true, null, 'UPDATE_STAGING', 'Announcing failed workflow in Slack', [{key: 'SLACK_WEBHOOK', value: '***'}]),
    ];

    steps.forEach((expectedStep) => {
        if (didFail) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

module.exports = {
    assertTypecheckJobExecuted,
    assertLintJobExecuted,
    assertTestJobExecuted,
    assertChooseDeployActionsJobExecuted,
    assertSkipDeployJobExecuted,
    assertCreateNewVersionJobExecuted,
    assertUpdateStagingJobExecuted,
    assertUpdateStagingJobFailed,
};
