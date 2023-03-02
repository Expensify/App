const path = require('path');
const kieActJs = require('@kie/act-js');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils');
const assertions = require('./assertions/platformDeployAssertions');
const mocks = require('./mocks/platformDeployMocks');

let mockGithub;
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
        src: path.resolve(__dirname, '..', '.github', 'workflows', 'platformDeploy.yml'),
        dest: '.github/workflows/platformDeploy.yml',
    },
];

beforeEach(async () => {
    // create a local repository and copy required files
    mockGithub = new kieMockGithub.MockGithub({
        repo: {
            testPlatformDeployWorkflowRepo: {
                files: FILES_TO_COPY_INTO_TEST_REPO,
                pushedBranches: [],
            },
        },
    });

    await mockGithub.setup();
});

afterEach(async () => {
    await mockGithub.teardown();
});

describe('test workflow platformDeploy', () => {
    test('test', async () => {
        const repoPath = mockGithub.repo.getPath('testPlatformDeployWorkflowRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', 'platformDeploy.yml');
        let act = new kieActJs.Act(repoPath, workflowPath);
        act = utils.setUpActParams(
            act,
            'push',
            {
                ref: 'refs/tags/1.2.3',
            },
            {
                OS_BOTIFY_TOKEN: 'dummy_token',
                GITHUB_ACTOR: 'Dummy Author',
                LARGE_SECRET_PASSPHRASE: '3xtr3m3ly_53cr3t_p455w0rd',
                MYAPP_UPLOAD_STORE_PASSWORD: 'dummy_store_password',
                MYAPP_UPLOAD_KEY_PASSWORD: 'dummy_key_password',
                BROWSERSTACK: 'dummy_browserstack',
                SLACK_WEBHOOK: 'dummy_slack_webhook',
                DEVELOPER_ID_SECRET_PASSPHRASE: 'dummy_secret_passphrase',
                CSC_LINK: 'dummy_csc_link',
                CSC_KEY_PASSWORD: 'dummy_csc_key_pass',
                APPLE_ID: 'dummy_apple_id',
                APPLE_ID_PASSWORD: 'dummy_apple_id_pass',
                AWS_ACCESS_KEY_ID: 'dummy_aws_access_key_id',
                AWS_SECRET_ACCESS_KEY: 'dummy_aws_secret_access_key',
                APPLE_CONTACT_EMAIL: 'dummy@email.com',
                APPLE_CONTACT_PHONE: '123456789',
                APPLE_DEMO_EMAIL: 'dummy.demo@email.com',
                APPLE_DEMO_PASSWORD: 'dummy_password',
                CLOUDFLARE_TOKEN: 'dummy_cloudflare_token',
            },
            'dummy_github_token',
            {
                AS_REPO: 'App',
            },
        );
        const testMockSteps = {
            validateActor: mocks.PLATFORM_DEPLOY__VALIDATE_ACTOR__TEAM_MEMBER__STEP_MOCKS,
            android: mocks.PLATFORM_DEPLOY__ANDROID__STEP_MOCKS,
            desktop: mocks.PLATFORM_DEPLOY__DESKTOP__STEP_MOCKS,
            iOS: mocks.PLATFORM_DEPLOY__IOS__STEP_MOCKS,
            web: mocks.PLATFORM_DEPLOY__WEB__STEP_MOCKS,
            postSlackMessageOnFailure: mocks.PLATFORM_DEPLOY__POST_SLACK_FAIL__STEP_MOCKS,
            postSlackMessageOnSuccess: mocks.PLATFORM_DEPLOY__POST_SLACK_SUCCESS__STEP_MOCKS,
            postGithubComment: mocks.PLATFORM_DEPLOY__POST_GITHUB_COMMENT__STEP_MOCKS,
        };
        const result = await act
            .runEvent('push', {
                workflowFile: path.join(repoPath, '.github', 'workflows'),
                mockSteps: testMockSteps,
            });

        assertions.assertVerifyActorJobExecuted(result);
        assertions.assertAndroidJobExecuted(result, true, false, true);
        assertions.assertDesktopJobExecuted(result, false); // act does not support macos-12 runner
        assertions.assertIOSJobExecuted(result, false); // act does not support macos-12 runner
        assertions.assertWebJobExecuted(result, true, false);
        assertions.assertPostSlackOnFailureJobExecuted(result, false);
        assertions.assertPostSlackOnSuccessJobExecuted(result, false); // since desktop and iOS don't run - this one doesn't either
        assertions.assertPostGithubCommentJobExecuted(result, true, false);
    }, 120000);
});
