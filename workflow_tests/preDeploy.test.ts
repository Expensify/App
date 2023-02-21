import {MockGithub} from '@kie/mock-github';
import {Act} from '@kie/act-js';
import path from 'path';

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

const LINT_JOB_MOCK_STEPS = [
    {
        name: 'Run lint workflow',
        mockWith: 'echo [MOCK] Running lint workflow',
    },
];

const TEST_JOB_MOCK_STEPS = [
    {
        name: 'Run test workflow',
        mockWith: 'echo [MOCK] Running test workflow',
    },
];

const CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS = [
    {
        name: 'Announce failed workflow in Slack',
        mockWith: 'echo [MOCK] Announcing failed workflow in slack',
    },
    {
        name: 'Exit failed workflow',
        mockWith: 'echo [MOCK] Exiting with failed status',
    },
];

const CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS = [
    {
        name: 'Get merged pull request',
        mockWith: 'echo [MOCK] Getting merged pull request',
    },
    {
        name: 'Check if StagingDeployCash is locked',
        mockWith: 'echo [MOCK] Checking StagingDeployCash',
    },
    {
        name: 'Check if merged pull request was an automated PR',
        mockWith: 'echo [MOCK] Checking for automated PR',
    },
    {
        name: 'Check if merged pull request has `CP Staging` label',
        mockWith: 'echo [MOCK] Checking CP Staging',
    },
    {
        name: 'Check if merged pull request should trigger a deploy',
        mockWith: 'echo [MOCK] Checking deploy trigger',
    },
];

const SKIP_DEPLOY_MOCK_STEPS = [
    {
        name: 'Comment on deferred PR',
        mockWith: 'echo [MOCK] Skipping deploy',
    },
];

const CREATE_NEW_VERSION_JOB_MOCK_STEPS = [
    {
        name: 'Create new version',
        mockWith: 'echo [MOCK] Creating new version',
    },
];

const UPDATE_STAGING_JOB_MOCK_STEPS = [
    {
        name: 'Run turnstyle',
        mockWith: 'echo [MOCK] Running turnstyle',
    },
    {
        name: 'Update staging branch from main',
        mockWith: 'echo [MOCK] Updating staging branch',
    },
    {
        name: 'Cherry-pick PR to staging',
        mockWith: 'echo [MOCK] Cherry picking',
    },
    {
        name: 'Checkout staging',
        mockWith: 'echo [MOCK] Checking out staging',
    },
    {
        name: 'Tag staging',
        mockWith: 'echo [MOCK] Tagging staging',
    },
    {
        name: 'Update StagingDeployCash',
        mockWith: 'echo [MOCK] Updating StagingDeployCash',
    },
    {
        name: 'Find open StagingDeployCash',
        mockWith: 'echo [MOCK] Finding open StagingDeployCash',
    },
    {
        name: 'Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
        mockWith: 'echo [MOCK] Commenting in StagingDeployCash',
    },
    {
        name: 'Wait for staging deploys to finish',
        mockWith: 'echo [MOCK] Waiting for staging deploy to finish',
    },
    {
        name: 'Comment in StagingDeployCash to alert Applause that cherry-picked pull request has been deployed.',
        mockWith: 'echo [MOCK] Commenting in StagingDeployCash',
    },
    {
        name: 'Announce failed workflow in Slack',
        mockWith: 'echo [MOCK] Announcing failed workflow in slack',
    },
];

const IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS = [
    {
        name: 'Get merged pull request',
        mockWith: 'echo [MOCK] Getting merged pull request',
    },
    {
        name: 'Check whether the actor is member of Expensify/expensify team',
        mockWith: 'echo [MOCK] Checking actor\'s Expensify membership',
    },
];

const NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS = [
    {
        name: 'Checkout',
        mockWith: 'echo [MOCK] Checking out',
    },
    {
        name: 'Get merged pull request',
        mockWith: 'echo [MOCK] Getting merged pull request',
    },
    {
        name: 'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
        mockWith: 'echo [MOCK] Getting PR count',
    },
    {
        name: 'Comment on ${{ steps.getMergedPullRequest.outputs.author }}\'s first pull request!',
        mockWith: 'echo [MOCK] Creating comment',
    },
];

const E2E_TESTS_JOB_MOCK_STEPS = [
    {
        name: 'Checkout',
        mockWith: 'echo [MOCK] Checking out',
    },
    {
        name: 'Setup node',
        mockWith: 'echo [MOCK] Setting up node',
    },
    {
        name: 'Setup ruby',
        mockWith: 'echo [MOCK] Setting up ruby',
    },
    {
        name: 'Gradle cache',
        mockWith: 'echo [MOCK] Building with gradle',
    },
    {
        name: 'Make zip directory for everything to send to AWS Device Farm',
        mockWith: 'echo [MOCK] Creating zip directory',
    },
    {
        name: 'Checkout "Compare" commit',
        mockWith: 'echo [MOCK] Checking out compare commit',
    },
    {
        name: 'Install node packages',
        mockWith: 'echo [MOCK] Installing node packages',
    },
    {
        name: 'Build "Compare" APK',
        mockWith: 'echo [MOCK] Building compare apk',
    },
    {
        name: 'Copy "Compare" APK',
        mockWith: 'echo [MOCK] Copying compare apk',
    },
    {
        name: 'Checkout "Baseline" commit (last release)',
        mockWith: 'echo [MOCK] Checking out baseline commit',
    },
    {
        name: 'Install node packages',
        mockWith: 'echo [MOCK] Installing node packages',
    },
    {
        name: 'Build "Baseline" APK',
        mockWith: 'echo [MOCK] Building baseline apk',
    },
    {
        name: 'Copy "Baseline" APK',
        mockWith: 'echo [MOCK] Copying baseline apk',
    },
    {
        name: 'Checkout previous branch for source code to run on AWS Device farm',
        mockWith: 'echo [MOCK] Checking out previous branch',
    },
    {
        name: 'Copy e2e code into zip folder',
        mockWith: 'echo [MOCK] Copying e2e tests',
    },
    {
        name: 'Zip everything in the zip directory up',
        mockWith: 'echo [MOCK] Zipping everything',
    },
    {
        name: 'Configure AWS Credentials',
        mockWith: 'echo [MOCK] Configuring AWS credentials',
    },
    {
        name: 'Schedule AWS Device Farm test run',
        mockWith: 'echo [MOCK] Scheduling AWS test run',
    },
    {
        name: 'Unzip AWS Device Farm results',
        mockWith: 'echo [MOCK] Unzipping test results',
    },
    {
        name: 'Print AWS Device Farm run results',
        mockWith: 'echo [MOCK] Printing test results',
    },
    {
        name: 'Set output of AWS Device Farm into GitHub ENV',
        mockWith: 'echo [MOCK] Setting AWS output',
    },
    {
        name: 'Get merged pull request',
        mockWith: 'echo [MOCK] Getting merged pull request',
    },
    {
        name: 'Leave output of AWS Device Farm as a PR comment',
        mockWith: 'echo [MOCK] Leaving comment with test results',
    },
    {
        name: 'Check if test failed, if so leave a deploy blocker label',
        mockWith: 'echo [MOCK] Checking if tests failed',
    },
];

const WIP_MOCK_STEPS = {
    lint: LINT_JOB_MOCK_STEPS,
    test: TEST_JOB_MOCK_STEPS,
    confirmPassingBuild: CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
    chooseDeployActions: CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS,
    skipDeploy: SKIP_DEPLOY_MOCK_STEPS,
    createNewVersion: CREATE_NEW_VERSION_JOB_MOCK_STEPS,
    updateStaging: UPDATE_STAGING_JOB_MOCK_STEPS,
    isExpensifyEmployee: IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS,
    newContributorWelcomeMessage: NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS,
    'e2e-tests': E2E_TESTS_JOB_MOCK_STEPS,
};

test('test workflow preDeploy push to main', async () => {
    // get path to the local test repo
    const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';

    // get path to the workflow file under test
    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');

    // instantiate Act in the context of the test repo and given workflow file
    const act = new Act(repoPath, workflowPath);

    // run an event and get the result
    const result = await act.runEvent('push', {
        workflowFile: path.join(repoPath, '.github', 'workflows'),
        mockSteps: WIP_MOCK_STEPS,
    });

    console.debug(`RunEvent result: ${JSON.stringify(result, null, '\t')}`);

    // assert results
    // expect(result)...;
});
