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
        mockWith: 'echo [MOCK] [LINT] Running lint workflow',
    },
];

const TEST_JOB_MOCK_STEPS = [
    {
        name: 'Run test workflow',
        mockWith: 'echo [MOCK] [TEST] Running test workflow',
    },
];

const CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS = [
    {
        name: 'Announce failed workflow in Slack',
        mockWith: 'echo [MOCK] [CONFIRM_PASSING_BUILD] Announcing failed workflow in slack',
    },
    {
        name: 'Exit failed workflow',
        mockWith: 'echo [MOCK] [CONFIRM_PASSING_BUILD] Exiting with failed status',
    },
];

const CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS = [
    {
        name: 'Get merged pull request',
        mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Getting merged pull request\n'
            + 'echo "number=1" >> "$GITHUB_OUTPUT"',
    },
    {
        name: 'Check if StagingDeployCash is locked',
        mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Checking StagingDeployCash\n'
            + 'echo "IS_LOCKED=false" >> "$GITHUB_OUTPUT"',
    },
    {
        name: 'Check if merged pull request was an automated PR',
        mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Checking for automated PR\n'
            + 'echo "IS_AUTOMATED_PR=false" >> "$GITHUB_OUTPUT"',
    },
    {
        name: 'Check if merged pull request has `CP Staging` label',
        mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Checking CP Staging\n'
            + 'echo "HAS_CP_LABEL=false" >> "$GITHUB_OUTPUT"',
    },
    {
        name: 'Check if merged pull request should trigger a deploy',
        mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Checking deploy trigger\n'
            + 'echo "SHOULD_DEPLOY=true" >> "$GITHUB_OUTPUT"',
    },
];

const SKIP_DEPLOY_JOB_MOCK_STEPS = [
    {
        name: 'Comment on deferred PR',
        mockWith: 'echo [MOCK] [SKIP_DEPLOY] Skipping deploy',
    },
];

const CREATE_NEW_VERSION_JOB_MOCK_STEPS = [
    {
        name: 'Create new version',
        mockWith: 'echo [MOCK] [CREATE_NEW_VERSION] Creating new version',
    },
];

const UPDATE_STAGING_JOB_MOCK_STEPS = [
    {
        name: 'Run turnstyle',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Running turnstyle',
    },
    {
        name: 'Update staging branch from main',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Updating staging branch',
    },
    {
        name: 'Cherry-pick PR to staging',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Cherry picking',
    },
    {
        name: 'Checkout staging',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Checking out staging',
    },
    {
        name: 'Tag staging',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Tagging staging',
    },
    {
        name: 'Update StagingDeployCash',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Updating StagingDeployCash',
    },
    {
        name: 'Find open StagingDeployCash',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Finding open StagingDeployCash\n'
            + 'echo "STAGING_DEPLOY_CASH=1234" >> "$GITHUB_OUTPUT"',
    },
    {
        name: 'Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Commenting in StagingDeployCash',
    },
    {
        name: 'Wait for staging deploys to finish',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Waiting for staging deploy to finish',
    },
    {
        name: 'Comment in StagingDeployCash to alert Applause that cherry-picked pull request has been deployed.',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Commenting in StagingDeployCash',
    },
    {
        name: 'Announce failed workflow in Slack',
        mockWith: 'echo [MOCK] [UPDATE_STAGING] Announcing failed workflow in slack',
    },
];

const IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS = [
    {
        name: 'Get merged pull request',
        mockWith: 'echo [MOCK] [IS_EXPENSIFY_EMPLOYEE] Getting merged pull request\n'
            + 'echo "author=Dummy Author" >> "$GITHUB_OUTPUT"',
    },
    {
        name: 'Check whether the actor is member of Expensify/expensify team',
        mockWith: 'echo [MOCK] [IS_EXPENSIFY_EMPLOYEE] Checking actors Expensify membership\n'
            + 'echo "isTeamMember=true" >> "$GITHUB_OUTPUT"',
    },
];

const NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS = [
    {
        name: 'Checkout',
        mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Checking out',
    },
    {
        name: 'Get merged pull request',
        mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Getting merged pull request',
    },
    {
        name: 'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
        mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Getting PR count',
    },
    {
        name: 'Comment on ${{ steps.getMergedPullRequest.outputs.author }}\\\'s first pull request!',
        mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Creating comment',
    },
];

const E2E_TESTS_JOB_MOCK_STEPS = [
    {
        name: 'Checkout',
        mockWith: 'echo [MOCK] [E2E_TESTS] Checking out',
    },
    {
        name: 'Setup node',
        mockWith: 'echo [MOCK] [E2E_TESTS] Setting up node',
    },
    {
        name: 'Setup ruby',
        mockWith: 'echo [MOCK] [E2E_TESTS] Setting up ruby',
    },
    {
        name: 'Gradle cache',
        mockWith: 'echo [MOCK] [E2E_TESTS] Building with gradle',
    },
    {
        name: 'Make zip directory for everything to send to AWS Device Farm',
        mockWith: 'echo [MOCK] [E2E_TESTS] Creating zip directory',
    },
    {
        name: 'Checkout "Compare" commit',
        mockWith: 'echo [MOCK] [E2E_TESTS] Checking out compare commit',
    },
    {
        name: 'Install node packages',
        mockWith: 'echo [MOCK] [E2E_TESTS] Installing node packages',
    },
    {
        name: 'Build "Compare" APK',
        mockWith: 'echo [MOCK] [E2E_TESTS] Building compare apk',
    },
    {
        name: 'Copy "Compare" APK',
        mockWith: 'echo [MOCK] [E2E_TESTS] Copying compare apk',
    },
    {
        name: 'Checkout "Baseline" commit (last release)',
        mockWith: 'echo [MOCK] [E2E_TESTS] Checking out baseline commit',
    },
    {
        name: 'Install node packages',
        mockWith: 'echo [MOCK] [E2E_TESTS] Installing node packages',
    },
    {
        name: 'Build "Baseline" APK',
        mockWith: 'echo [MOCK] [E2E_TESTS] Building baseline apk',
    },
    {
        name: 'Copy "Baseline" APK',
        mockWith: 'echo [MOCK] [E2E_TESTS] Copying baseline apk',
    },
    {
        name: 'Checkout previous branch for source code to run on AWS Device farm',
        mockWith: 'echo [MOCK] [E2E_TESTS] Checking out previous branch',
    },
    {
        name: 'Copy e2e code into zip folder',
        mockWith: 'echo [MOCK] [E2E_TESTS] Copying e2e tests',
    },
    {
        name: 'Zip everything in the zip directory up',
        mockWith: 'echo [MOCK] [E2E_TESTS] Zipping everything',
    },
    {
        name: 'Configure AWS Credentials',
        mockWith: 'echo [MOCK] [E2E_TESTS] Configuring AWS credentials',
    },
    {
        name: 'Schedule AWS Device Farm test run',
        mockWith: 'echo [MOCK] [E2E_TESTS] Scheduling AWS test run',
    },
    {
        name: 'Unzip AWS Device Farm results',
        mockWith: 'echo [MOCK] [E2E_TESTS] Unzipping test results',
    },
    {
        name: 'Print AWS Device Farm run results',
        mockWith: 'echo [MOCK] [E2E_TESTS] Printing test results',
    },
    {
        name: 'Set output of AWS Device Farm into GitHub ENV',
        mockWith: 'echo [MOCK] [E2E_TESTS] Setting AWS output',
    },
    {
        name: 'Get merged pull request',
        mockWith: 'echo [MOCK] [E2E_TESTS] Getting merged pull request',
    },
    {
        name: 'Leave output of AWS Device Farm as a PR comment',
        mockWith: 'echo [MOCK] [E2E_TESTS] Leaving comment with test results',
    },
    {
        name: 'Check if test failed, if so leave a deploy blocker label',
        mockWith: 'echo [MOCK] [E2E_TESTS] Checking if tests failed',
    },
];

const WIP_MOCK_STEPS = {
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

test('test workflow preDeploy push to main', async () => {
    // get path to the local test repo
    const repoPath = mockGithub.repo.getPath('testWorkflowsRepo') || '';

    // get path to the workflow file under test
    const workflowPath = path.join(repoPath, '.github', 'workflows', 'preDeploy.yml');

    // instantiate Act in the context of the test repo and given workflow file
    let act = new Act(repoPath, workflowPath);

    // set run parameters
    act = act
        .setEvent({
            pull_request: {
                head: {
                    ref: 'main',
                },
            },
        })
        .setSecret('OS_BOTIFY_TOKEN', 'dummy_token')
        .setGithubToken('dummy_github_token');

    // run an event and get the result
    const result = await act
        .runEvent('push', {
            workflowFile: path.join(repoPath, '.github', 'workflows'),
            mockSteps: WIP_MOCK_STEPS,
        });

    console.debug(`RunEvent result: ${JSON.stringify(result, null, '\t')}`);

    // assert results
    // expect(result)...;
}, 300000);
