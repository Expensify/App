const utils = require('../utils/utils');

const assertValidateActorJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Check if user is deployer', true, null, 'VALIDATEACTOR', 'Checking if user is a deployer', [], [{key: 'GITHUB_TOKEN', value: '***'}])];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertCreateNewVersionJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('Create new version', true, null, 'CREATENEWVERSION', 'Creating new version', [], [])];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertCherryPickJobExecuted = (workflowResult, user = 'Dummy Author', pullRequestNumber = '1234', didExecute = true, hasConflicts = false, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion(
            'Checkout staging branch',
            true,
            null,
            'CHERRYPICK',
            'Checking out staging branch',
            [
                {key: 'ref', value: 'staging'},
                {key: 'token', value: '***'},
            ],
            [],
        ),
        utils.createStepAssertion('Set up git for OSBotify', true, null, 'CHERRYPICK', 'Setting up git for OSBotify', [{key: 'GPG_PASSPHRASE', value: '***'}], []),
        utils.createStepAssertion('Get previous app version', true, null, 'CHERRYPICK', 'Get previous app version', [{key: 'SEMVER_LEVEL', value: 'PATCH'}]),
        utils.createStepAssertion('Fetch history of relevant refs', true, null, 'CHERRYPICK', 'Fetch history of relevant refs'),
        utils.createStepAssertion('Get version bump commit', true, null, 'CHERRYPICK', 'Get version bump commit', [], []),
        utils.createStepAssertion(
            'Get merge commit for pull request to CP',
            true,
            null,
            'CHERRYPICK',
            'Get merge commit for pull request to CP',
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'USER', value: user},
                {key: 'PULL_REQUEST_NUMBER', value: pullRequestNumber},
            ],
            [],
        ),
        utils.createStepAssertion('Cherry-pick the version-bump to staging', true, null, 'CHERRYPICK', 'Cherry-picking the version-bump to staging', [], []),
        utils.createStepAssertion('Cherry-pick the merge commit of target PR', true, null, 'CHERRYPICK', 'Cherry-picking the merge commit of target PR', [], []),
        utils.createStepAssertion('Push changes', true, null, 'CHERRYPICK', 'Pushing changes', [], []),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const conflictSteps = [
        utils.createStepAssertion(
            'Create Pull Request to manually finish CP',
            true,
            null,
            'CHERRYPICK',
            'Creating Pull Request to manually finish CP',
            [],
            [{key: 'GITHUB_TOKEN', value: 'os_botify_api_token'}],
        ),
    ];

    conflictSteps.forEach((step) => {
        if (didExecute && hasConflicts) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });

    const failedSteps = [
        utils.createStepAssertion(
            'Announces a CP failure in the #announce Slack room',
            true,
            null,
            'CHERRYPICK',
            'Announcing a CP failure',
            [{key: 'status', value: 'custom'}],
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'SLACK_WEBHOOK_URL', value: '***'},
            ],
        ),
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
    assertValidateActorJobExecuted,
    assertCreateNewVersionJobExecuted,
    assertCherryPickJobExecuted,
};
