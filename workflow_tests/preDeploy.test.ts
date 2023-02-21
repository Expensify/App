import {MockGithub} from '@kie/mock-github';
import {Act} from '@kie/act-js';
import path from 'path';

let mockGithub: MockGithub;

beforeEach(async () => {
    // create a local repository and copy required files
    mockGithub = new MockGithub({
        repo: {
            testWorkflowsRepo: {
                files: [
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
                ],
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

const WIP_MOCK_STEPS = {
    lint: [
        {
            uses: 'Expensify/App/.github/workflows/lint.yml@main',
            mockWith: 'echo [MOCK] Running lint workflow',
        },
    ],
    test: [
        {
            uses: 'Expensify/App/.github/workflows/test.yml@main',
            mockWith: 'echo [MOCK] Running test workflow',
        },
    ],
    confirmPassingBuild: [
        {
            uses: 'Expensify/App/.github/actions/composite/announceFailedWorkflowInSlack@main',
            mockWith: 'echo [MOCK] Announcing failed workflow in slack',
        },
        {
            run: 'exit 1',
            mockWith: 'echo [MOCK] Exiting with failed status',
        },
    ],
    chooseDeployActions: [
        {
            uses: 'actions-ecosystem/action-get-merged-pull-request@59afe90821bb0b555082ce8ff1e36b03f91553d9',
            mockWith: 'echo [MOCK] Getting merged pull request',
        },
        {
            uses: 'Expensify/App/.github/actions/javascript/isStagingDeployLocked@main',
            mockWith: 'echo [MOCK] Checking StagingDeployCash',
        },
        {
            run: 'echo "IS_AUTOMATED_PR=${{ github.actor == \'OSBotify\' }}" >> "$GITHUB_OUTPUT"',
            mockWith: 'echo [MOCK] Checking for automated PR',
        },
        {
            run: 'echo "HAS_CP_LABEL=${{ contains(steps.getMergedPullRequest.outputs.labels, \'CP Staging\') }}" >> "$GITHUB_OUTPUT"',
            mockWith: 'echo [MOCK] Checking CP Staging',
        },
        {
            run: 'echo "SHOULD_DEPLOY=${{ fromJSON(steps.hasCherryPickLabel.outputs.HAS_CP_LABEL) || (!fromJSON(steps.isStagingDeployLocked.outputs.IS_LOCKED) && !fromJSON(steps.isAutomatedPullRequest.outputs.IS_AUTOMATED_PR)) }}" >> "$GITHUB_OUTPUT"',
            mockWith: 'echo [MOCK] Checking deploy trigger',
        },
    ],
    skipDeploy: [
        {
            uses: 'actions-ecosystem/action-create-comment@cd098164398331c50e7dfdd0dfa1b564a1873fac',
            mockWith: 'echo [MOCK] Skipping deploy',
        },
    ],
    createNewVersion: [
        {
            uses: 'Expensify/App/.github/workflows/createNewVersion.yml@main',
            mockWith: 'echo [MOCK] Creating new version',
        },
    ],
    updateStaging: [
        {
            uses: 'softprops/turnstyle@ca99add00ff0c9cbc697d22631d2992f377e5bd5',
            mockWith: 'echo [MOCK] Running turnstyle',
        },
        {
            uses: 'Expensify/App/.github/actions/composite/updateProtectedBranch@main',
            mockWith: 'echo [MOCK] Updating staging branch',
        },
        {
            uses: 'Expensify/App/.github/actions/javascript/triggerWorkflowAndWait@main',
            mockWith: 'echo [MOCK] Cherry picking',
        },
        {
            uses: 'actions/checkout@93ea575cb5d8a053eaa0ac8fa3b40d7e05a33cc8',
            mockWith: 'echo [MOCK] Checking out staging',
        },
        {
            run: 'git tag ${{ needs.createNewVersion.outputs.NEW_VERSION }}',
            mockWith: 'echo [MOCK] Tagging staging',
        },
        {
            uses: 'Expensify/App/.github/actions/javascript/createOrUpdateStagingDeploy@main',
            mockWith: 'echo [MOCK] Updating StagingDeployCash',
        },
        {
            run: 'echo "STAGING_DEPLOY_CASH=$(gh issue list --label StagingDeployCash --json number --jq \'.[0].number\')" >> "$GITHUB_OUTPUT"',
            mockWith: 'echo [MOCK] Finding open StagingDeployCash',
        },
        {
            name: 'Wait for staging deploys to finish',
            mockWith: 'echo [MOCK] Waiting for staging deploy to finish',
        },
        {
            name: 'Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
            mockWith: 'echo [MOCK] Commenting in StagingDeployCash',
        },
        {
            name: 'Comment in StagingDeployCash to alert Applause that cherry-picked pull request has been deployed.',
            mockWith: 'echo [MOCK] Commenting in StagingDeployCash',
        },
        {
            uses: 'Expensify/App/.github/actions/composite/announceFailedWorkflowInSlack@main',
            mockWith: 'echo [MOCK] Announcing failed workflow in slack',
        },
    ],
    isExpensifyEmployee: [
        {
            name: 'Get merged pull request',
            mockWith: 'echo [MOCK] Getting merged pull request',
        },
        {
            name: 'Check whether the actor is member of Expensify/expensify team',
            mockWith: 'echo [MOCK] Checking actor\'s Expensify membership',
        },
    ],
    newContributorWelcomeMessage: [
        {
            uses: 'actions/checkout@93ea575cb5d8a053eaa0ac8fa3b40d7e05a33cc8',
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
            uses: 'actions-ecosystem/action-create-comment@cd098164398331c50e7dfdd0dfa1b564a1873fac',
            mockWith: 'echo [MOCK] Creating comment',
        },
    ],
    'e2e-tests': [
        {
            uses: 'actions/checkout@93ea575cb5d8a053eaa0ac8fa3b40d7e05a33cc8',
            mockWith: 'echo [MOCK] Checking out',
        },
        {
            uses: 'Expensify/App/.github/actions/composite/setupNode@main',
            mockWith: 'echo [MOCK] Setting up node',
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
    ],
};

test('test preDeploy push to main', async () => {
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
