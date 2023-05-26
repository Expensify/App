const utils = require('../utils/utils');

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

const assertIsExpensifyEmployeeJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Get merged pull request', true, null, 'IS_EXPENSIFY_EMPLOYEE', 'Getting merged pull request', [{key: 'github_token', value: '***'}]),
        utils.createStepAssertion('Check whether the actor is member of Expensify/expensify team', true, null, 'IS_EXPENSIFY_EMPLOYEE', 'Checking actors Expensify membership', [
            {key: 'GITHUB_TOKEN', value: '***'},
            {key: 'username', value: 'Dummy Author'},
            {key: 'team', value: 'Expensify/expensify'},
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

const assertNewContributorWelcomeMessageJobExecuted = (workflowResult, didExecute = true, isOsBotify = false, isFirstPr = false) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'NEW_CONTRIBUTOR_WELCOME_MESSAGE', 'Checking out', [{key: 'token', value: '***'}]),
        utils.createStepAssertion('Get merged pull request', true, null, 'NEW_CONTRIBUTOR_WELCOME_MESSAGE', 'Getting merged pull request', [{key: 'github_token', value: '***'}]),
        utils.createStepAssertion(isOsBotify ? 'Get PR count for OSBotify' : 'Get PR count for Dummy Author', true, null, 'NEW_CONTRIBUTOR_WELCOME_MESSAGE', 'Getting PR count', [
            {key: 'GITHUB_TOKEN', value: '***'},
        ]),
    ];
    const osBotifyBody =
        '@OSBotify, Great job getting your first Expensify/App pull request over the finish line! ' +
        ":tada:\n\nI know there's a lot of information in our " +
        '[contributing guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md), ' +
        'so here are some points to take note of :memo::\n\n1. Now that your first PR has been merged, you can be ' +
        "hired for another issue. Once you've completed a few issues, you may be eligible to work on more than one " +
        'job at a time.\n2. Once your PR is deployed to our staging servers, it will undergo quality assurance (QA) ' +
        "testing. If we find that it doesn't work as expected or causes a regression, you'll be responsible for " +
        'fixing it. Typically, we would revert this PR and give you another chance to create a similar PR without ' +
        'causing a regression.\n3. Once your PR is deployed to _production_, we start a 7-day timer :alarm_clock:. ' +
        'After it has been on production for 7 days without causing any regressions, then we pay out the Upwork job. ' +
        ":moneybag:\n\nSo it might take a while before you're paid for your work, but we typically post multiple " +
        "new jobs every day, so there's plenty of opportunity. I hope you've had a positive experience " +
        'contributing to this repo! :blush:';
    const userBody =
        '@Dummy Author, Great job getting your first Expensify/App pull request over the finish ' +
        "line! :tada:\n\nI know there's a lot of information in our " +
        '[contributing guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md), ' +
        'so here are some points to take note of :memo::\n\n1. Now that your first PR has been merged, you can be ' +
        "hired for another issue. Once you've completed a few issues, you may be eligible to work on more than one " +
        'job at a time.\n2. Once your PR is deployed to our staging servers, it will undergo quality assurance (QA) ' +
        "testing. If we find that it doesn't work as expected or causes a regression, you'll be responsible for " +
        'fixing it. Typically, we would revert this PR and give you another chance to create a similar PR without ' +
        'causing a regression.\n3. Once your PR is deployed to _production_, we start a 7-day timer :alarm_clock:. ' +
        'After it has been on production for 7 days without causing any regressions, then we pay out the Upwork ' +
        "job. :moneybag:\n\nSo it might take a while before you're paid for your work, but we typically post " +
        "multiple new jobs every day, so there's plenty of opportunity. I hope you've had a positive experience " +
        'contributing to this repo! :blush:';
    if (isFirstPr) {
        steps.push(
            utils.createStepAssertion(
                isOsBotify ? "Comment on OSBotify\\'s first pull request!" : "Comment on Dummy Author\\'s first pull request!",
                true,
                null,
                'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
                'Creating comment',
                [
                    {key: 'github_token', value: '***'},
                    {key: 'number', value: '12345'},
                    {key: 'body', value: isOsBotify ? osBotifyBody : userBody},
                ],
            ),
        );
    }

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
        utils.createStepAssertion('Check if merged pull request was an automated PR', true, ''),
        utils.createStepAssertion('Check if merged pull request has `CP Staging` label', true, ''),
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
    const body = ':hand: This PR was not deployed to staging yet because QA is ongoing. It will be automatically ' + 'deployed to staging after the next production release.';
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

const assertUpdateStagingJobExecuted = (workflowResult, didExecute = true, shouldCp = false) => {
    const steps = [
        utils.createStepAssertion('Run turnstyle', true, null, 'UPDATE_STAGING', 'Running turnstyle', [
            {key: 'poll-interval-seconds', value: '10'},
            {key: 'GITHUB_TOKEN', value: '***'},
        ]),
    ];
    if (shouldCp) {
        steps.push(
            utils.createStepAssertion('Cherry-pick PR to staging', true, null, 'UPDATE_STAGING', 'Cherry picking', [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'WORKFLOW', value: 'cherryPick.yml'},
                {key: 'INPUTS', value: '{ PULL_REQUEST_NUMBER: 123, NEW_VERSION: 1.2.3 }'},
            ]),
        );
    } else {
        steps.push(
            utils.createStepAssertion('Update staging branch from main', true, null, 'UPDATE_STAGING', 'Updating staging branch', [
                {key: 'TARGET_BRANCH', value: 'staging'},
                {key: 'OS_BOTIFY_TOKEN', value: '***'},
                {key: 'GPG_PASSPHRASE', value: '***'},
            ]),
        );
    }
    steps.push(
        utils.createStepAssertion('Checkout staging', true, null, 'UPDATE_STAGING', 'Checking out staging', [
            {key: 'ref', value: 'staging'},
            {key: 'fetch-depth', value: '0'},
        ]),
        utils.createStepAssertion('Tag staging', true, null, 'UPDATE_STAGING', 'Tagging staging'),
        utils.createStepAssertion('Update StagingDeployCash', true, null, 'UPDATE_STAGING', 'Updating StagingDeployCash', [
            {key: 'GITHUB_TOKEN', value: '***'},
            {key: 'NPM_VERSION', value: '1.2.3'},
        ]),
        utils.createStepAssertion('Find open StagingDeployCash', true, null, 'UPDATE_STAGING', 'Finding open StagingDeployCash', null, [{key: 'GITHUB_TOKEN', value: '***'}]),
    );
    if (shouldCp) {
        steps.push(
            utils.createStepAssertion(
                'Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
                true,
                null,
                'UPDATE_STAGING',
                'Commenting in StagingDeployCash',
                null,
                [{key: 'GITHUB_TOKEN', value: '***'}],
            ),
            utils.createStepAssertion('Wait for staging deploys to finish', true, null, 'UPDATE_STAGING', 'Waiting for staging deploy to finish', [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'TAG', value: '1.2.3'},
            ]),
            utils.createStepAssertion(
                'Comment in StagingDeployCash to alert Applause that cherry-picked pull request has been deployed.',
                true,
                null,
                'UPDATE_STAGING',
                'Commenting in StagingDeployCash',
                null,
                [{key: 'GITHUB_TOKEN', value: '***'}],
            ),
        );
    }

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
    assertLintJobExecuted,
    assertTestJobExecuted,
    assertIsExpensifyEmployeeJobExecuted,
    assertNewContributorWelcomeMessageJobExecuted,
    assertChooseDeployActionsJobExecuted,
    assertSkipDeployJobExecuted,
    assertCreateNewVersionJobExecuted,
    assertUpdateStagingJobExecuted,
    assertUpdateStagingJobFailed,
};
