export const assertLintJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [{
        name: 'Main Run lint workflow',
        status: 0,
        output: '[MOCK] [LINT] Running lint workflow',
    }];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

export const assertTestJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [{
        name: 'Main Run test workflow',
        status: 0,
        output: '[MOCK] [TEST] Running test workflow',
    }];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

export const assertIsExpensifyEmployeeJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [{
        name: 'Main Get merged pull request',
        status: 0,
        output: '[MOCK] [IS_EXPENSIFY_EMPLOYEE] Getting merged pull request, GITHUB_TOKEN=***',
    },
    {
        name: 'Main Check whether the actor is member of Expensify/expensify team',
        status: 0,
        output: '[MOCK] [IS_EXPENSIFY_EMPLOYEE] Checking actors Expensify membership, GITHUB_TOKEN=***, USERNAME=Dummy Author, TEAM=Expensify/expensify',
    }];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

export const assertE2ETestsJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [
        {
            name: 'Main Checkout',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Checking out',
        },
        {
            name: 'Main Setup node',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Setting up node',
        },
        {
            name: 'Main Setup ruby',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Setting up ruby',
        },
        {
            name: 'Main Gradle cache',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Building with gradle',
        },
        {
            name: 'Make zip directory for everything to send to AWS Device Farm',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Creating zip directory',
        },
        {
            name: 'Checkout "Compare" commit',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Checking out compare commit',
        },
        {
            name: 'Install node packages',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Installing node packages',
        },
        {
            name: 'Build "Compare" APK',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Building compare apk',
        },
        {
            name: 'Copy "Compare" APK',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Copying compare apk',
        },
        {
            name: 'Checkout "Baseline" commit (last release)',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Checking out baseline commit',
        },
        {
            name: 'Install node packages',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Installing node packages',
        },
        {
            name: 'Build "Baseline" APK',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Building baseline apk',
        },
        {
            name: 'Copy "Baseline" APK',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Copying baseline apk',
        },
        {
            name: 'Checkout previous branch for source code to run on AWS Device farm',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Checking out previous branch',
        },
        {
            name: 'Copy e2e code into zip folder',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Copying e2e tests',
        },
        {
            name: 'Zip everything in the zip directory up',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Zipping everything',
        },
        {
            name: 'Configure AWS Credentials',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Configuring AWS credentials',
        },
        {
            name: 'Schedule AWS Device Farm test run',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Scheduling AWS test run',
        },
        {
            name: 'Unzip AWS Device Farm results',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Unzipping test results',
        },
        {
            name: 'Print AWS Device Farm run results',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Printing test results',
        },
        {
            name: 'Set output of AWS Device Farm into GitHub ENV',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Setting AWS output',
        },
        {
            name: 'Get merged pull request',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Getting merged pull request',
        },
        {
            name: 'Leave output of AWS Device Farm as a PR comment',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Leaving comment with test results',
        },
        {
            name: 'Check if test failed, if so leave a deploy blocker label',
            status: 0,
            output: '[MOCK] [E2E_TESTS] Checking if tests failed',
        },
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

export const assertChooseDeployActionsJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [
        {
            name: 'Main Get merged pull request',
            status: 0,
            output: '[MOCK] [CHOOSE_DEPLOY_ACTIONS] Getting merged pull request, GITHUB_TOKEN=***', // no access to secrets
        },
        {
            name: 'Main Check if StagingDeployCash is locked',
            status: 0,

            output: '[MOCK] [CHOOSE_DEPLOY_ACTIONS] Checking StagingDeployCash, GITHUB_TOKEN=***', // no access to secrets
        },
        {
            name: 'Main Check if merged pull request was an automated PR',
            status: 0,
            output: '',
        },
        {
            name: 'Main Check if merged pull request has `CP Staging` label',
            status: 0,
            output: '',
        },
        {
            name: 'Main Check if merged pull request should trigger a deploy',
            status: 0,
            output: '',
        },
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

export const assertSkipDeployJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [
        {
            name: 'Main Comment on deferred PR',
            status: 0,
            output: '[MOCK] [SKIP_DEPLOY] Skipping deploy, GITHUB_TOKEN=***, NUMBER=123, BODY=:hand: This PR was not deployed to staging yet because QA is ongoing. It will be automatically deployed to staging after the next production release.',
        },
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

export const assertCreateNewVersionJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [
        {
            name: 'Main Create new version',
            status: 0,
            output: '[MOCK] [CREATE_NEW_VERSION] Creating new version',
        },
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};

export const assertUpdateStagingJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [
        {
            name: 'Main Run turnstyle',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Running turnstyle, POLL_INTERVAL_SECONDS=10, GITHUB_TOKEN=***',
        },
        {
            name: 'Main Cherry-pick PR to staging',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Cherry picking',
        },
        {
            name: 'Main Checkout staging',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Checking out staging',
        },
        {
            name: 'Main Tag staging',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Tagging staging',
        },
        {
            name: 'Main Update StagingDeployCash',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Updating StagingDeployCash',
        },
        {
            name: 'Main Find open StagingDeployCash',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Finding open StagingDeployCash',
        },
        {
            name: 'Main Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Commenting in StagingDeployCash',
        },
        {
            name: 'Main Wait for staging deploys to finish',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Waiting for staging deploy to finish',
        },
        {
            name: 'Main Comment in StagingDeployCash to alert Applause that cherry-picked pull request has been deployed.',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Commenting in StagingDeployCash',
        },
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};
