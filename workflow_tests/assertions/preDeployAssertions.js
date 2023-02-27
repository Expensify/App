const utils = require('../utils');

const assertLintJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Run lint workflow',
            true,
            null,
            'LINT',
            'Running lint workflow',
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

const assertTestJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Run test workflow',
            true,
            null,
            'TEST',
            'Running test workflow',
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

const assertIsExpensifyEmployeeJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Get merged pull request',
            true,
            null,
            'IS_EXPENSIFY_EMPLOYEE',
            'Getting merged pull request',
            [{key: 'github_token', value: '***'}],
        ),
        utils.getStepAssertion(
            'Check whether the actor is member of Expensify/expensify team',
            true,
            null,
            'IS_EXPENSIFY_EMPLOYEE',
            'Checking actors Expensify membership',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'username', value: 'Dummy Author'}, {key: 'team', value: 'Expensify/expensify'}],
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

const assertNewContributorWelcomeMessageJobExecuted = (workflowResult, didExecute = true, isOsBotify = false, isFirstPr = false) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
            'Checking out',
            [{key: 'token', value: '***'}],
        ),
        utils.getStepAssertion(
            'Get merged pull request',
            true,
            null,
            'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
            'Getting merged pull request',
            [{key: 'github_token', value: '***'}],
        ),
        utils.getStepAssertion(
            isOsBotify ? 'Get PR count for OSBotify' : 'Get PR count for Dummy Author',
            true,
            null,
            'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
            'Getting PR count',
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];
    if (isFirstPr) {
        steps.push(
            utils.getStepAssertion(
                isOsBotify ? 'Comment on OSBotify\\\'s first pull request!' : 'Comment on Dummy Author\\\'s first pull request!',
                true,
                null,
                'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
                'Creating comment',
                [{key: 'github_token', value: '***'}, {key: 'number', value: '12345'}, {key: 'body', value: isOsBotify ? '@OSBotify, Great job getting your first Expensify/App pull request over the finish line! :tada:\n\nI know there\'s a lot of information in our [contributing guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md), so here are some points to take note of :memo::\n\n1. Now that your first PR has been merged, you can be hired for another issue. Once you\'ve completed a few issues, you may be eligible to work on more than one job at a time.\n2. Once your PR is deployed to our staging servers, it will undergo quality assurance (QA) testing. If we find that it doesn\'t work as expected or causes a regression, you\'ll be responsible for fixing it. Typically, we would revert this PR and give you another chance to create a similar PR without causing a regression.\n3. Once your PR is deployed to _production_, we start a 7-day timer :alarm_clock:. After it has been on production for 7 days without causing any regressions, then we pay out the Upwork job. :moneybag:\n\nSo it might take a while before you\'re paid for your work, but we typically post multiple new jobs every day, so there\'s plenty of opportunity. I hope you\'ve had a positive experience contributing to this repo! :blush:' : '@Dummy Author, Great job getting your first Expensify/App pull request over the finish line! :tada:\n\nI know there\'s a lot of information in our [contributing guidelines](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md), so here are some points to take note of :memo::\n\n1. Now that your first PR has been merged, you can be hired for another issue. Once you\'ve completed a few issues, you may be eligible to work on more than one job at a time.\n2. Once your PR is deployed to our staging servers, it will undergo quality assurance (QA) testing. If we find that it doesn\'t work as expected or causes a regression, you\'ll be responsible for fixing it. Typically, we would revert this PR and give you another chance to create a similar PR without causing a regression.\n3. Once your PR is deployed to _production_, we start a 7-day timer :alarm_clock:. After it has been on production for 7 days without causing any regressions, then we pay out the Upwork job. :moneybag:\n\nSo it might take a while before you\'re paid for your work, but we typically post multiple new jobs every day, so there\'s plenty of opportunity. I hope you\'ve had a positive experience contributing to this repo! :blush:'}],
            ),
        );
    }
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

const assertE2ETestsJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'E2E_TESTS',
            'Checking out',
        ),
        utils.getStepAssertion(
            'Setup node',
            true,
            null,
            'E2E_TESTS',
            'Setting up node',
        ),
        utils.getStepAssertion(
            'Setup ruby',
            true,
            null,
            'E2E_TESTS',
            'Setting up ruby',
        ),
        utils.getStepAssertion(
            'Gradle cache',
            true,
            null,
            'E2E_TESTS',
            'Building with gradle',
        ),
        utils.getStepAssertion(
            'Make zip directory for everything to send to AWS Device Farm',
            true,
            null,
            'E2E_TESTS',
            'Creating zip directory',
        ),
        utils.getStepAssertion(
            'Checkout "Compare" commit',
            true,
            null,
            'E2E_TESTS',
            'Checking out compare commit',
        ),
        utils.getStepAssertion(
            'Install node packages',
            true,
            null,
            'E2E_TESTS',
            'Installing node packages',
        ),
        utils.getStepAssertion(
            'Build "Compare" APK',
            true,
            null,
            'E2E_TESTS',
            'Building compare apk',
        ),
        utils.getStepAssertion(
            'Copy "Compare" APK',
            true,
            null,
            'E2E_TESTS',
            'Copying compare apk',
        ),
        utils.getStepAssertion(
            'Checkout "Baseline" commit (last release)',
            true,
            null,
            'E2E_TESTS',
            'Checking out baseline commit',
        ),
        utils.getStepAssertion(
            'Install node packages',
            true,
            null,
            'E2E_TESTS',
            'Installing node packages',
        ),
        utils.getStepAssertion(
            'Build "Baseline" APK',
            true,
            null,
            'E2E_TESTS',
            'Building baseline apk',
        ),
        utils.getStepAssertion(
            'Copy "Baseline" APK',
            true,
            null,
            'E2E_TESTS',
            'Copying baseline apk',
        ),
        utils.getStepAssertion(
            'Checkout previous branch for source code to run on AWS Device farm',
            true,
            null,
            'E2E_TESTS',
            'Checking out previous branch',
        ),
        utils.getStepAssertion(
            'Copy e2e code into zip folder',
            true,
            null,
            'E2E_TESTS',
            'Copying e2e tests',
        ),
        utils.getStepAssertion(
            'Zip everything in the zip directory up',
            true,
            null,
            'E2E_TESTS',
            'Zipping everything',
        ),
        utils.getStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'E2E_TESTS',
            'Configuring AWS credentials',
        ),
        utils.getStepAssertion(
            'Schedule AWS Device Farm test run',
            true,
            null,
            'E2E_TESTS',
            'Scheduling AWS test run',
        ),
        utils.getStepAssertion(
            'Unzip AWS Device Farm results',
            true,
            null,
            'E2E_TESTS',
            'Unzipping test results',
        ),
        utils.getStepAssertion(
            'Print AWS Device Farm run results',
            true,
            null,
            'E2E_TESTS',
            'Printing test results',
        ),
        utils.getStepAssertion(
            'Set output of AWS Device Farm into GitHub ENV',
            true,
            null,
            'E2E_TESTS',
            'Setting AWS output',
        ),
        utils.getStepAssertion(
            'Get merged pull request',
            true,
            null,
            'E2E_TESTS',
            'Getting merged pull request',
        ),
        utils.getStepAssertion(
            'Leave output of AWS Device Farm as a PR comment',
            true,
            null,
            'E2E_TESTS',
            'Leaving comment with test results',
        ),
        utils.getStepAssertion(
            'Check if test failed, if so leave a deploy blocker label',
            true,
            null,
            'E2E_TESTS',
            'Checking if tests failed',
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

const assertChooseDeployActionsJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Get merged pull request',
            true,
            null,
            'CHOOSE_DEPLOY_ACTIONS',
            'Getting merged pull request',
            [{key: 'github_token', value: '***'}],
        ),
        utils.getStepAssertion(
            'Check if StagingDeployCash is locked',
            true,
            null,
            'CHOOSE_DEPLOY_ACTIONS',
            'Checking StagingDeployCash',
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
        utils.getStepAssertion(
            'Check if merged pull request was an automated PR',
            true,
            '',
        ),
        utils.getStepAssertion(
            'Check if merged pull request has `CP Staging` label',
            true,
            '',
        ),
        utils.getStepAssertion(
            'Check if merged pull request should trigger a deploy',
            true,
            '',
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

const assertSkipDeployJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Comment on deferred PR',
            true,
            null,
            'SKIP_DEPLOY',
            'Skipping deploy',
            [{key: 'github_token', value: '***'}, {key: 'number', value: '123'}, {key: 'body', value: ':hand: This PR was not deployed to staging yet because QA is ongoing. It will be automatically deployed to staging after the next production release.'}],
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

const assertCreateNewVersionJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Create new version',
            true,
            null,
            'CREATE_NEW_VERSION',
            'Creating new version',
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

const assertUpdateStagingJobExecuted = (workflowResult, didExecute = true, shouldCp = false) => {
    const steps = [
        utils.getStepAssertion(
            'Run turnstyle',
            true,
            null,
            'UPDATE_STAGING',
            'Running turnstyle',
            [{key: 'poll-interval-seconds', value: '10'}, {key: 'GITHUB_TOKEN', value: '***'}],
        ),
    ];
    if (shouldCp) {
        steps.push(
            utils.getStepAssertion(
                'Cherry-pick PR to staging',
                true,
                null,
                'UPDATE_STAGING',
                'Cherry picking',
                [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'WORKFLOW', value: 'cherryPick.yml'}, {key: 'INPUTS', value: '{ PULL_REQUEST_NUMBER: 123, NEW_VERSION: 1.2.3 }'}],
            ),
        );
    } else {
        steps.push(
            utils.getStepAssertion(
                'Update staging branch from main',
                true,
                null,
                'UPDATE_STAGING',
                'Updating staging branch',
                [{key: 'TARGET_BRANCH', value: 'staging'}, {key: 'OS_BOTIFY_TOKEN', value: '***'}, {key: 'GPG_PASSPHRASE', value: '***'}],
            ),
        );
    }
    steps.push(
        utils.getStepAssertion(
            'Checkout staging',
            true,
            null,
            'UPDATE_STAGING',
            'Checking out staging',
            [{key: 'ref', value: 'staging'}, {key: 'fetch-depth', value: '0'}],
        ),
        utils.getStepAssertion(
            'Tag staging',
            true,
            null,
            'UPDATE_STAGING',
            'Tagging staging',
        ),
        utils.getStepAssertion(
            'Update StagingDeployCash',
            true,
            null,
            'UPDATE_STAGING',
            'Updating StagingDeployCash',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'NPM_VERSION', value: '1.2.3'}],
        ),
        utils.getStepAssertion(
            'Find open StagingDeployCash',
            true,
            null,
            'UPDATE_STAGING',
            'Finding open StagingDeployCash',
            null,
            [{key: 'GITHUB_TOKEN', value: '***'}],
        ),
    );
    if (shouldCp) {
        steps.push(
            utils.getStepAssertion(
                'Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
                true,
                null,
                'UPDATE_STAGING',
                'Commenting in StagingDeployCash',
                null,
                [{key: 'GITHUB_TOKEN', value: '***'}],
            ),
            utils.getStepAssertion(
                'Wait for staging deploys to finish',
                true,
                null,
                'UPDATE_STAGING',
                'Waiting for staging deploy to finish',
                [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'TAG', value: '1.2.3'}],
            ),
            utils.getStepAssertion(
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
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

module.exports = {
    assertLintJobExecuted,
    assertTestJobExecuted,
    assertIsExpensifyEmployeeJobExecuted,
    assertNewContributorWelcomeMessageJobExecuted,
    assertE2ETestsJobExecuted,
    assertChooseDeployActionsJobExecuted,
    assertSkipDeployJobExecuted,
    assertCreateNewVersionJobExecuted,
    assertUpdateStagingJobExecuted,
};
