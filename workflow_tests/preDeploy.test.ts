import {MockGithub} from '@kie/mock-github';
import {Act} from '@kie/act-js';
import path from 'path';
import {string} from 'prop-types';

let mockGithub: MockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    {
        src: path.resolve(__dirname, '..', '.github', 'actions'),
        dest: '.github/actions',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'libs'),
        dest: '.github/libs',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'scripts'),
        dest: '.github/scripts',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'preDeploy.yml'),
        dest: '.github/workflows/preDeploy.yml',
    },
    {
        src: path.resolve(__dirname, '..', '.github', '.eslintrc.js'),
        dest: '.github/.eslintrc.js',
    },
    {
        src: path.resolve(__dirname, '..', '.github', 'actionlint.yaml'),
        dest: '.github/actionlint.yaml',
    },
];

beforeEach(async () => {
    // create a local repository and copy required files
    mockGithub = new MockGithub({
        repo: {
            testWorkflowsRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

// lint
const LINT_WORKFLOW_MOCK_STEP = {
    name: 'Run lint workflow',
    mockWith: 'echo [MOCK] [LINT] Running lint workflow',
};
const LINT_JOB_MOCK_STEPS = [
    LINT_WORKFLOW_MOCK_STEP,
];

// test
const TEST_WORKFLOW_MOCK_STEP = {
    name: 'Run test workflow',
    mockWith: 'echo [MOCK] [TEST] Running test workflow',
};
const TEST_JOB_MOCK_STEPS = [
    TEST_WORKFLOW_MOCK_STEP,
];

// confirm_passing_build
const ANNOUNCE_IN_SLACK_MOCK_STEP = {
    name: 'Announce failed workflow in Slack',
    mockWith: 'echo [MOCK] [CONFIRM_PASSING_BUILD] Announcing failed workflow in slack, SLACK_WEBHOOK=${{ secrets.SLACK_WEBHOOK }}',
};
const CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS = [
    ANNOUNCE_IN_SLACK_MOCK_STEP,
];

// choose_deploy_actions
const GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY = {
    name: 'Get merged pull request',
    mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Getting merged pull request, GITHUB_TOKEN=${{ github.token }}\n'
        + 'echo "number=123" >> "$GITHUB_OUTPUT"\n'
        + 'echo "labels=[\'CP Staging\']" >> "$GITHUB_OUTPUT"\n',
};
const CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP = {
    name: 'Check if StagingDeployCash is locked',
    mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Checking StagingDeployCash, GITHUB_TOKEN=${{ github.token }}\n'
        + 'echo "IS_LOCKED=true" >> "$GITHUB_OUTPUT"',
};
const CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY,
    CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP,
];

// skip_deploy
const COMMENT_ON_DEFERRED_PR_MOCK_STEP = {
    name: 'Comment on deferred PR',
    mockWith: 'echo [MOCK] [SKIP_DEPLOY] Skipping deploy, GITHUB_TOKEN=${{ secrets.OS_BOTIFY_TOKEN }}, NUMBER=${{ needs.chooseDeployActions.outputs.MERGED_PR }}, BODY=:hand: This PR was not deployed to staging yet because QA is ongoing. It will be automatically deployed to staging after the next production release.',
};
const SKIP_DEPLOY_JOB_MOCK_STEPS = [
    COMMENT_ON_DEFERRED_PR_MOCK_STEP,
];

// create_new_version
const CREATE_NEW_VERSION_MOCK_STEP = {
    name: 'Create new version',
    mockWith: 'echo [MOCK] [CREATE_NEW_VERSION] Creating new version',
};
const CREATE_NEW_VERSION_JOB_MOCK_STEPS = [
    CREATE_NEW_VERSION_MOCK_STEP,
];

// update_staging
const RUN_TURNSTYLE_MOCK_STEP = {
    name: 'Run turnstyle',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Running turnstyle',
};
const UPDATE_STAGING_BRANCH_MOCK_STEP = {
    name: 'Update staging branch from main',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Updating staging branch',
};
const CHERRYPICK_PR_MOCK_STEP = {
    name: 'Cherry-pick PR to staging',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Cherry picking',
};
const CHECKOUT_STAGING_MOCK_STEP = {
    name: 'Checkout staging',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Checking out staging',
};
const TAG_STAGING_MOCK_STEP = {
    name: 'Tag staging',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Tagging staging',
};
const UPDATE_STAGINGDEPLOYCASH_MOCK_STEP = {
    name: 'Update StagingDeployCash',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Updating StagingDeployCash',
};
const FIND_OPEN_STAGINGDEPLOYCASH_MOCK_STEP = {
    name: 'Find open StagingDeployCash',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Finding open StagingDeployCash\n'
        + 'echo "STAGING_DEPLOY_CASH=1234" >> "$GITHUB_OUTPUT"',
};
const COMMENT_TO_ALERT_APPLAUSE_CHERRYPICK_MOCK_STEP = {
    name: 'Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Commenting in StagingDeployCash',
};
const WAIT_FOR_STAGING_DEPLOYS_MOCK_STEP = {
    name: 'Wait for staging deploys to finish',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Waiting for staging deploy to finish',
};
const COMMENT_TO_ALERT_APPLAUSE_DEPLOY_MOCK_STEP = {
    name: 'Comment in StagingDeployCash to alert Applause that cherry-picked pull request has been deployed.',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Commenting in StagingDeployCash',
};
const ANNOUNCE_FAILED_WORKFLOW_IN_SLACK_MOCK_STEP = {
    name: 'Announce failed workflow in Slack',
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Announcing failed workflow in slack',
};
const UPDATE_STAGING_JOB_MOCK_STEPS = [
    RUN_TURNSTYLE_MOCK_STEP,
    UPDATE_STAGING_BRANCH_MOCK_STEP,
    CHERRYPICK_PR_MOCK_STEP,
    CHECKOUT_STAGING_MOCK_STEP,
    TAG_STAGING_MOCK_STEP,
    UPDATE_STAGINGDEPLOYCASH_MOCK_STEP,
    FIND_OPEN_STAGINGDEPLOYCASH_MOCK_STEP,
    COMMENT_TO_ALERT_APPLAUSE_CHERRYPICK_MOCK_STEP,
    WAIT_FOR_STAGING_DEPLOYS_MOCK_STEP,
    COMMENT_TO_ALERT_APPLAUSE_DEPLOY_MOCK_STEP,
    ANNOUNCE_FAILED_WORKFLOW_IN_SLACK_MOCK_STEP,
];

// is_expensify_employee
const GET_MERGED_PULL_REQUEST_MOCK_STEP__IS_EXPENSIFY_EMPLOYEE = {
    name: 'Get merged pull request',
    mockWith: 'echo [MOCK] [IS_EXPENSIFY_EMPLOYEE] Getting merged pull request\n'
        + 'echo "author=Dummy Author" >> "$GITHUB_OUTPUT"',
};
const CHECK_TEAM_MEMBERSHIP_MOCK_STEP = {
    name: 'Check whether the actor is member of Expensify/expensify team',
    mockWith: 'echo [MOCK] [IS_EXPENSIFY_EMPLOYEE] Checking actors Expensify membership\n'
        + 'echo "isTeamMember=true" >> "$GITHUB_OUTPUT"',
};
const IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__IS_EXPENSIFY_EMPLOYEE,
    CHECK_TEAM_MEMBERSHIP_MOCK_STEP,
];

// new_contributor_welcome_message
const CHECKOUT_MOCK_STEP = {
    name: 'Checkout',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Checking out',
};
const GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE = {
    name: 'Get merged pull request',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Getting merged pull request',
};
const GET_PR_COUNT_MOCK_STEP = {
    name: 'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Getting PR count',
};
const COMMENT_ON_FIRST_PULL_REQUEST_MOCK_STEP = {
    name: 'Comment on ${{ steps.getMergedPullRequest.outputs.author }}\\\'s first pull request!',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Creating comment',
};
const NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS = [
    CHECKOUT_MOCK_STEP,
    GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE,
    GET_PR_COUNT_MOCK_STEP,
    COMMENT_ON_FIRST_PULL_REQUEST_MOCK_STEP,
];

// e2e_tests
const CHECKOUT_MOCK_STEP__E2E_TESTS = {
    name: 'Checkout',
    mockWith: 'echo [MOCK] [E2E_TESTS] Checking out',
};
const SETUP_NODE_MOCK_STEP = {
    name: 'Setup node',
    mockWith: 'echo [MOCK] [E2E_TESTS] Setting up node',
};
const SETUP_RUBY_MOCK_STEP = {
    name: 'Setup ruby',
    mockWith: 'echo [MOCK] [E2E_TESTS] Setting up ruby',
};
const GRADLE_CACHE_MOCK_STEP = {
    name: 'Gradle cache',
    mockWith: 'echo [MOCK] [E2E_TESTS] Building with gradle',
};
const MAKE_ZIP_MOCK_STEP = {
    name: 'Make zip directory for everything to send to AWS Device Farm',
    mockWith: 'echo [MOCK] [E2E_TESTS] Creating zip directory',
};
const CHECKOUT_COMPARE_MOCK_STEP = {
    name: 'Checkout "Compare" commit',
    mockWith: 'echo [MOCK] [E2E_TESTS] Checking out compare commit',
};
const INSTALL_NODE_PACKAGES_MOCK_STEP = {
    name: 'Install node packages',
    mockWith: 'echo [MOCK] [E2E_TESTS] Installing node packages',
};
const BUILD_COMPARE_APK_MOCK_STEP = {
    name: 'Build "Compare" APK',
    mockWith: 'echo [MOCK] [E2E_TESTS] Building compare apk',
};
const COPY_COMPARE_APK_MOCK_STEP = {
    name: 'Copy "Compare" APK',
    mockWith: 'echo [MOCK] [E2E_TESTS] Copying compare apk',
};
const CHECKOUT_BASELINE_COMMIT_MOCK_STEP = {
    name: 'Checkout "Baseline" commit (last release)',
    mockWith: 'echo [MOCK] [E2E_TESTS] Checking out baseline commit',
};
const BUILD_BASELINE_APK_MOCK_STEP = {
    name: 'Build "Baseline" APK',
    mockWith: 'echo [MOCK] [E2E_TESTS] Building baseline apk',
};
const COPY_BASELINE_APK_MOCK_STEP = {
    name: 'Copy "Baseline" APK',
    mockWith: 'echo [MOCK] [E2E_TESTS] Copying baseline apk',
};
const CHECKOUT_PREVIOUS_BRANCH_MOCK_STEP = {
    name: 'Checkout previous branch for source code to run on AWS Device farm',
    mockWith: 'echo [MOCK] [E2E_TESTS] Checking out previous branch',
};
const COPY_E2E_CODE_MOCK_STEP = {
    name: 'Copy e2e code into zip folder',
    mockWith: 'echo [MOCK] [E2E_TESTS] Copying e2e tests',
};
const ZIP_EVERYTHING_MOCK_STEP = {
    name: 'Zip everything in the zip directory up',
    mockWith: 'echo [MOCK] [E2E_TESTS] Zipping everything',
};
const CONFIGURE_AWS_CREDENTIALS_MOCK_STEP = {
    name: 'Configure AWS Credentials',
    mockWith: 'echo [MOCK] [E2E_TESTS] Configuring AWS credentials',
};
const SCHEDULE_AWS_DEVICE_FARM_MOCK_STEP = {
    name: 'Schedule AWS Device Farm test run',
    mockWith: 'echo [MOCK] [E2E_TESTS] Scheduling AWS test run',
};
const UNZIP_AWS_DEVICE_FARM_RESULTS_MOCK_STEP = {
    name: 'Unzip AWS Device Farm results',
    mockWith: 'echo [MOCK] [E2E_TESTS] Unzipping test results',
};
const PRINT_AWS_DEVICE_FARM_RESULTS_MOCK_STEP = {
    name: 'Print AWS Device Farm run results',
    mockWith: 'echo [MOCK] [E2E_TESTS] Printing test results',
};
const SET_OUTPUT_OF_AWS_DEVICE_FARM_MOCK_STEP = {
    name: 'Set output of AWS Device Farm into GitHub ENV',
    mockWith: 'echo [MOCK] [E2E_TESTS] Setting AWS output',
};
const GET_MERGED_PULL_REQUEST_MOCK_STEP__E2E_TESTS = {
    name: 'Get merged pull request',
    mockWith: 'echo [MOCK] [E2E_TESTS] Getting merged pull request',
};
const LEAVE_COMMENT_WITH_AWS_DEVICE_FARM_OUTPUT_MOCK_STEP = {
    name: 'Leave output of AWS Device Farm as a PR comment',
    mockWith: 'echo [MOCK] [E2E_TESTS] Leaving comment with test results',
};
const CHECK_IF_TESTS_FAILED_MOCK_STEP = {
    name: 'Check if test failed, if so leave a deploy blocker label',
    mockWith: 'echo [MOCK] [E2E_TESTS] Checking if tests failed',
};
const E2E_TESTS_JOB_MOCK_STEPS = [
    CHECKOUT_MOCK_STEP__E2E_TESTS,
    SETUP_NODE_MOCK_STEP,
    SETUP_RUBY_MOCK_STEP,
    GRADLE_CACHE_MOCK_STEP,
    MAKE_ZIP_MOCK_STEP,
    CHECKOUT_COMPARE_MOCK_STEP,
    INSTALL_NODE_PACKAGES_MOCK_STEP,
    BUILD_COMPARE_APK_MOCK_STEP,
    COPY_COMPARE_APK_MOCK_STEP,
    CHECKOUT_BASELINE_COMMIT_MOCK_STEP,
    INSTALL_NODE_PACKAGES_MOCK_STEP,
    BUILD_BASELINE_APK_MOCK_STEP,
    COPY_BASELINE_APK_MOCK_STEP,
    CHECKOUT_PREVIOUS_BRANCH_MOCK_STEP,
    COPY_E2E_CODE_MOCK_STEP,
    ZIP_EVERYTHING_MOCK_STEP,
    CONFIGURE_AWS_CREDENTIALS_MOCK_STEP,
    SCHEDULE_AWS_DEVICE_FARM_MOCK_STEP,
    UNZIP_AWS_DEVICE_FARM_RESULTS_MOCK_STEP,
    PRINT_AWS_DEVICE_FARM_RESULTS_MOCK_STEP,
    SET_OUTPUT_OF_AWS_DEVICE_FARM_MOCK_STEP,
    GET_MERGED_PULL_REQUEST_MOCK_STEP__E2E_TESTS,
    LEAVE_COMMENT_WITH_AWS_DEVICE_FARM_OUTPUT_MOCK_STEP,
    CHECK_IF_TESTS_FAILED_MOCK_STEP,
];

// all together
const MOCK_STEPS = {
    lint: LINT_JOB_MOCK_STEPS,
    test: TEST_JOB_MOCK_STEPS,
    confirmPassingBuild: CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
    chooseDeployActions: CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS,
    skipDeploy: SKIP_DEPLOY_JOB_MOCK_STEPS,
    createNewVersion: CREATE_NEW_VERSION_JOB_MOCK_STEPS,
    updateStaging: UPDATE_STAGING_JOB_MOCK_STEPS,
    isExpensifyEmployee: IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS,
    newContributorWelcomeMessage: NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS,
    'e2e-tests': E2E_TESTS_JOB_MOCK_STEPS,
};

// assertion helper methods
const assertLintJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
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
const assertTestJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
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
const assertIsExpensifyEmployeeJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [{
        name: 'Main Get merged pull request',
        status: 0,
        output: '[MOCK] [IS_EXPENSIFY_EMPLOYEE] Getting merged pull request',
    },
    {
        name: 'Main Check whether the actor is member of Expensify/expensify team',
        status: 0,
        output: '[MOCK] [IS_EXPENSIFY_EMPLOYEE] Checking actors Expensify membership',
    }];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};
const assertE2ETestsJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
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
const assertChooseDeployActionsJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
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
const assertSkipDeployJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [
        {
            name: 'Main Comment on deferred PR',
            status: 0,
            output: '[MOCK] [SKIP_DEPLOY] Skipping deploy, GITHUB_TOKEN=, NUMBER=123, BODY=:hand: This PR was not deployed to staging yet because QA is ongoing. It will be automatically deployed to staging after the next production release.',
        },
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(steps);
    }
};
const assertCreateNewVersionJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
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
const assertUpdateStagingJobExecuted = (workflowResult: Array<Object>, didExecute: Boolean = true) => {
    const steps = [
        {
            name: 'Main Run turnstyle',
            status: 0,
            output: '[MOCK] [UPDATE_STAGING] Running turnstyle',
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

const setUpActParams = (act: Act, event?: string, event_options?: any, secrets?: Array<Object>, github_token?: string) => {
    let updated_act = act;

    if (event && event_options) {
        updated_act = updated_act.setEvent({
            event: event_options,
        });
    }

    if (secrets) {
        for (const [key, value] of Object.entries(secrets)) {
            updated_act = updated_act.setSecret(key, String(value));
        }
    }

    if (github_token) {
        updated_act = updated_act.setGithubToken(github_token);
    }

    return updated_act;
};

describe('test workflow preDeploy', () => {
    test('push to main', async () => {
        // get path to the local test repo
        const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';

        // get path to the workflow file under test
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');

        // instantiate Act in the context of the test repo and given workflow file
        let act = new Act(repoPath, workflowPath);

        // set run parameters
        act = setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            [{OS_BOTIFY_TOKEN: 'dummy_token', GITHUB_ACTOR: 'Dummy Tester', SLACK_WEBHOOK: 'dummy_slack_webhook'}],
            'dummy_github_token',
        );

        // set up mocks
        const mocks = MOCK_STEPS;

        // run an event and get the result
        const result = await act
            .runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: mocks,
            });

        // assert results (some steps can run in parallel to each other so the order is not assured
        // therefore we can check which steps have been executed, but not the set job order
        assertLintJobExecuted(result);
        assertTestJobExecuted(result);
        assertIsExpensifyEmployeeJobExecuted(result);
        assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
        assertChooseDeployActionsJobExecuted(result);
        assertSkipDeployJobExecuted(result, false);
        assertCreateNewVersionJobExecuted(result);
        assertUpdateStagingJobExecuted(result);
    }, 60000);

    test('lint job failed', async () => {
        const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
        let act = new Act(repoPath, workflowPath);
        act = setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            [{OS_BOTIFY_TOKEN: 'dummy_token', GITHUB_ACTOR: 'Dummy Tester', SLACK_WEBHOOK: 'dummy_slack_webhook'}],
            'dummy_github_token',
        );
        const mocks = {
            lint: [
                {
                    name: 'Run lint workflow',
                    mockWith: 'echo [MOCK] [LINT] Running lint workflow\n'
                        + 'echo [MOCK] [LINT] Lint workflow failed\n'
                        + 'exit 1',
                },
            ],
            test: TEST_JOB_MOCK_STEPS,
            confirmPassingBuild: CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
            chooseDeployActions: CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS,
            skipDeploy: SKIP_DEPLOY_JOB_MOCK_STEPS,
            createNewVersion: CREATE_NEW_VERSION_JOB_MOCK_STEPS,
            updateStaging: UPDATE_STAGING_JOB_MOCK_STEPS,
            isExpensifyEmployee: IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS,
            newContributorWelcomeMessage: NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS,
            'e2e-tests': E2E_TESTS_JOB_MOCK_STEPS,
        };
        const result = await act
            .runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: mocks,
            });
        expect(result).toEqual(expect.arrayContaining(
            [{
                name: 'Main Run lint workflow',
                status: 1,
                output: '[MOCK] [LINT] Running lint workflow\n'
                    + '[MOCK] [LINT] Lint workflow failed',
            }],
        ));
        assertTestJobExecuted(result);
        assertIsExpensifyEmployeeJobExecuted(result);
        expect(result).toEqual(expect.arrayContaining(
            [
                {
                    name: 'Main Announce failed workflow in Slack',
                    status: 0,
                    output: '[MOCK] [CONFIRM_PASSING_BUILD] Announcing failed workflow in slack, SLACK_WEBHOOK=', // no access to secrets
                },
                {
                    name: 'Main Exit failed workflow',
                    status: 1,
                    output: '',
                },
            ],
        ));
        assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
        assertChooseDeployActionsJobExecuted(result, false);
        assertSkipDeployJobExecuted(result, false);
        assertCreateNewVersionJobExecuted(result, false);
        assertUpdateStagingJobExecuted(result, false);
    }, 60000);

    test('test job failed', async () => {
        const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');
        let act = new Act(repoPath, workflowPath);
        act = setUpActParams(
            act,
            'pull_request',
            {head: {ref: 'main'}},
            [{OS_BOTIFY_TOKEN: 'dummy_token', GITHUB_ACTOR: 'Dummy Tester', SLACK_WEBHOOK: 'dummy_slack_webhook'}],
            'dummy_github_token',
        );
        const mocks = {
            lint: LINT_JOB_MOCK_STEPS,
            test: [
                {
                    name: 'Run test workflow',
                    mockWith: 'echo [MOCK] [TEST] Running test workflow\n'
                        + 'echo [MOCK] [TEST] Test workflow failed\n'
                        + 'exit 1',
                },
            ],
            confirmPassingBuild: CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
            chooseDeployActions: CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS,
            skipDeploy: SKIP_DEPLOY_JOB_MOCK_STEPS,
            createNewVersion: CREATE_NEW_VERSION_JOB_MOCK_STEPS,
            updateStaging: UPDATE_STAGING_JOB_MOCK_STEPS,
            isExpensifyEmployee: IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS,
            newContributorWelcomeMessage: NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS,
            'e2e-tests': E2E_TESTS_JOB_MOCK_STEPS,
        };
        const result = await act
            .runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: mocks,
            });
        assertLintJobExecuted(result);
        expect(result).toEqual(expect.arrayContaining(
            [{
                name: 'Main Run test workflow',
                status: 1,
                output: '[MOCK] [TEST] Running test workflow\n'
                    + '[MOCK] [TEST] Test workflow failed',
            }],
        ));
        assertIsExpensifyEmployeeJobExecuted(result);
        expect(result).toEqual(expect.arrayContaining(
            [
                {
                    name: 'Main Announce failed workflow in Slack',
                    status: 0,
                    output: '[MOCK] [CONFIRM_PASSING_BUILD] Announcing failed workflow in slack, SLACK_WEBHOOK=', // no access to secrets
                },
                {
                    name: 'Main Exit failed workflow',
                    status: 1,
                    output: '',
                },
            ],
        ));
        assertE2ETestsJobExecuted(result, false); // Act does not support ubuntu-20.04-64core runner and omits the job
        assertChooseDeployActionsJobExecuted(result, false);
        assertSkipDeployJobExecuted(result, false);
        assertCreateNewVersionJobExecuted(result, false);
        assertUpdateStagingJobExecuted(result, false);
    }, 60000);
});
