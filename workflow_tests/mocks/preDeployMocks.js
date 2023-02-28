const utils = require('../utils');

// lint
const LINT_WORKFLOW_MOCK_STEP = utils.getMockStep(
    'Run lint workflow',
    'Running lint workflow',
    'LINT',
);
const LINT_JOB_MOCK_STEPS = [
    LINT_WORKFLOW_MOCK_STEP,
];

// test
const TEST_WORKFLOW_MOCK_STEP = utils.getMockStep(
    'Run test workflow',
    'Running test workflow',
    'TEST',
);
const TEST_JOB_MOCK_STEPS = [
    TEST_WORKFLOW_MOCK_STEP,
];

// confirm_passing_build
const ANNOUNCE_IN_SLACK_MOCK_STEP = utils.getMockStep(
    'Announce failed workflow in Slack',
    'Announcing failed workflow in slack',
    'CONFIRM_PASSING_BUILD',
    ['SLACK_WEBHOOK'],
);
const CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS = [
    ANNOUNCE_IN_SLACK_MOCK_STEP,

    // 2nd step runs normally
];

// choose_deploy_actions
const GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY__CP_LABEL = utils.getMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'CHOOSE_DEPLOY_ACTIONS',
    ['github_token'],
    null,
    {number: '123', labels: '[\'CP Staging\']'},
);
const GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY = utils.getMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'CHOOSE_DEPLOY_ACTIONS',
    ['github_token'],
    null,
    {number: '123', labels: '[]'},
);
const CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP__LOCKED = utils.getMockStep(
    'Check if StagingDeployCash is locked',
    'Checking StagingDeployCash',
    'CHOOSE_DEPLOY_ACTIONS',
    ['GITHUB_TOKEN'],
    null,
    {IS_LOCKED: true},
);
const CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP__UNLOCKED = utils.getMockStep(
    'Check if StagingDeployCash is locked',
    'Checking StagingDeployCash',
    'CHOOSE_DEPLOY_ACTIONS',
    ['GITHUB_TOKEN'],
    null,
    {IS_LOCKED: false},
);
const CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_LOCKED = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY,
    CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP__LOCKED,

    // steps 3-5 run normally
];
const CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_LOCKED = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY__CP_LABEL,
    CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP__LOCKED,

    // steps 3-5 run normally
];
const CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY,
    CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP__UNLOCKED,

    // steps 3-5 run normally
];
const CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY__CP_LABEL,
    CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP__UNLOCKED,

    // steps 3-5 run normally
];

// skip_deploy
const COMMENT_ON_DEFERRED_PR_MOCK_STEP = utils.getMockStep(
    'Comment on deferred PR',
    'Skipping deploy',
    'SKIP_DEPLOY',
    ['github_token', 'number', 'body'],
);
const SKIP_DEPLOY_JOB_MOCK_STEPS = [
    COMMENT_ON_DEFERRED_PR_MOCK_STEP,
];

// create_new_version
const CREATE_NEW_VERSION_MOCK_STEP = utils.getMockStep(
    'Create new version',
    'Creating new version',
    'CREATE_NEW_VERSION',
    null,
    null,
    {NEW_VERSION: '1.2.3'},
);
const CREATE_NEW_VERSION_JOB_MOCK_STEPS = [
    CREATE_NEW_VERSION_MOCK_STEP,
];

// update_staging
const RUN_TURNSTYLE_MOCK_STEP = utils.getMockStep(
    'Run turnstyle',
    'Running turnstyle',
    'UPDATE_STAGING',
    ['poll-interval-seconds'],
    ['GITHUB_TOKEN'],
);
const UPDATE_STAGING_BRANCH_MOCK_STEP = utils.getMockStep(
    'Update staging branch from main',
    'Updating staging branch',
    'UPDATE_STAGING',
    ['TARGET_BRANCH', 'OS_BOTIFY_TOKEN', 'GPG_PASSPHRASE'],
);
const CHERRYPICK_PR_MOCK_STEP = utils.getMockStep(
    'Cherry-pick PR to staging',
    'Cherry picking',
    'UPDATE_STAGING',
    ['GITHUB_TOKEN', 'WORKFLOW', 'INPUTS'],
);
const CHECKOUT_STAGING_MOCK_STEP = utils.getMockStep(
    'Checkout staging',
    'Checking out staging',
    'UPDATE_STAGING',
    ['ref', 'fetch-depth'],
);
const TAG_STAGING_MOCK_STEP = utils.getMockStep(
    'Tag staging',
    'Tagging staging',
    'UPDATE_STAGING',
);
const UPDATE_STAGINGDEPLOYCASH_MOCK_STEP = utils.getMockStep(
    'Update StagingDeployCash',
    'Updating StagingDeployCash',
    'UPDATE_STAGING',
    ['GITHUB_TOKEN', 'NPM_VERSION'],
);
const FIND_OPEN_STAGINGDEPLOYCASH_MOCK_STEP = utils.getMockStep(
    'Find open StagingDeployCash',
    'Finding open StagingDeployCash',
    'UPDATE_STAGING',
    null,
    ['GITHUB_TOKEN'],
    {STAGING_DEPLOY_CASH: '1234'},
);
const COMMENT_TO_ALERT_APPLAUSE_CHERRYPICK_MOCK_STEP = utils.getMockStep(
    'Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
    'Commenting in StagingDeployCash',
    'UPDATE_STAGING',
    null,
    ['GITHUB_TOKEN'],
);
const WAIT_FOR_STAGING_DEPLOYS_MOCK_STEP = utils.getMockStep(
    'Wait for staging deploys to finish',
    'Waiting for staging deploy to finish',
    'UPDATE_STAGING',
    ['GITHUB_TOKEN', 'TAG'],
);
const COMMENT_TO_ALERT_APPLAUSE_DEPLOY_MOCK_STEP = utils.getMockStep(
    'Comment in StagingDeployCash to alert Applause that cherry-picked pull request has been deployed.',
    'Commenting in StagingDeployCash',
    'UPDATE_STAGING',
    null,
    ['GITHUB_TOKEN'],
);
const ANNOUNCE_FAILED_WORKFLOW_IN_SLACK_MOCK_STEP = utils.getMockStep(
    'Announce failed workflow in Slack',
    'Announcing failed workflow in Slack',
    'UPDATE_STAGING',
    ['SLACK_WEBHOOK'],
);
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
const GET_MERGED_PULL_REQUEST_MOCK_STEP__IS_EXPENSIFY_EMPLOYEE = utils.getMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'IS_EXPENSIFY_EMPLOYEE',
    ['github_token'],
    null,
    {author: 'Dummy Author'},
);
const CHECK_TEAM_MEMBERSHIP_MOCK_STEP__TRUE = utils.getMockStep(
    'Check whether the actor is member of Expensify/expensify team',
    'Checking actors Expensify membership',
    'IS_EXPENSIFY_EMPLOYEE',
    ['GITHUB_TOKEN', 'username', 'team'],
    null,
    {isTeamMember: true},
);
const IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__IS_EXPENSIFY_EMPLOYEE,
    CHECK_TEAM_MEMBERSHIP_MOCK_STEP__TRUE,
];
const CHECK_TEAM_MEMBERSHIP_MOCK_STEP__FALSE = utils.getMockStep(
    'Check whether the actor is member of Expensify/expensify team',
    'Checking actors Expensify membership',
    'IS_EXPENSIFY_EMPLOYEE',
    ['GITHUB_TOKEN', 'username', 'team'],
    null,
    {isTeamMember: false},
);
const IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__FALSE = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__IS_EXPENSIFY_EMPLOYEE,
    CHECK_TEAM_MEMBERSHIP_MOCK_STEP__FALSE,
];

// new_contributor_welcome_message
const CHECKOUT_MOCK_STEP = utils.getMockStep(
    'Checkout',
    'Checking out',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['token'],
    null,
    {author: 'Dummy Author'},
);
const CHECKOUT_MOCK_STEP__OSBOTIFY = utils.getMockStep(
    'Checkout',
    'Checking out',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['token'],
    null,
    {author: 'OSBotify'},
);
const GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE = utils.getMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['github_token'],
    null,
    {number: '12345', author: 'Dummy Author'},
);
const GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE__OSBOTIFY = utils.getMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['github_token'],
    null,
    {number: '12345', author: 'OSBotify'},
);
const GET_PR_COUNT_MOCK_STEP__1 = utils.getMockStep(
    'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
    'Getting PR count',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    null,
    ['GITHUB_TOKEN'],
    null,
    {PR_COUNT: '1'},
);
const GET_PR_COUNT_MOCK_STEP__10 = utils.getMockStep(
    'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
    'Getting PR count',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    null,
    ['GITHUB_TOKEN'],
    null,
    {PR_COUNT: '10'},
);
const COMMENT_ON_FIRST_PULL_REQUEST_MOCK_STEP = utils.getMockStep(
    'Comment on ${{ steps.getMergedPullRequest.outputs.author }}\\\'s first pull request!',
    'Creating comment',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['github_token', 'number', 'body'],
);
const NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS = [
    CHECKOUT_MOCK_STEP,
    GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE,
    GET_PR_COUNT_MOCK_STEP__10,
    COMMENT_ON_FIRST_PULL_REQUEST_MOCK_STEP,
];
const NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__ONE_PR = [
    CHECKOUT_MOCK_STEP,
    GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE,
    GET_PR_COUNT_MOCK_STEP__1,
    COMMENT_ON_FIRST_PULL_REQUEST_MOCK_STEP,
];
const NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__OSBOTIFY = [
    CHECKOUT_MOCK_STEP__OSBOTIFY,
    GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE__OSBOTIFY,
    GET_PR_COUNT_MOCK_STEP__10,
    COMMENT_ON_FIRST_PULL_REQUEST_MOCK_STEP,
];

// e2e_tests
// these steps are not getting executed anyway, since Act does not support the selected runner
const CHECKOUT_MOCK_STEP__E2E_TESTS = utils.getMockStep(
    'Checkout',
    'Checking out',
    'E2E_TESTS',
);
const SETUP_NODE_MOCK_STEP = utils.getMockStep(
    'Setup node',
    'Setting up node',
    'E2E_TESTS',
);
const SETUP_RUBY_MOCK_STEP = utils.getMockStep(
    'Setup ruby',
    'Setting up ruby',
    'E2E_TESTS',
);
const GRADLE_CACHE_MOCK_STEP = utils.getMockStep(
    'Gradle cache',
    'Building with gradle',
    'E2E_TESTS',
);
const MAKE_ZIP_MOCK_STEP = utils.getMockStep(
    'Make zip directory for everything to send to AWS Device Farm',
    'Creating zip directory',
    'E2E_TESTS',
);
const CHECKOUT_COMPARE_MOCK_STEP = utils.getMockStep(
    'Checkout "Compare" commit',
    'Checking out compare commit',
    'E2E_TESTS',
);
const INSTALL_NODE_PACKAGES_MOCK_STEP = utils.getMockStep(
    'Install node packages',
    'Installing node packages',
    'E2E_TESTS',
);
const BUILD_COMPARE_APK_MOCK_STEP = utils.getMockStep(
    'Build "Compare" APK',
    'Building compare apk',
    'E2E_TESTS',
);
const COPY_COMPARE_APK_MOCK_STEP = utils.getMockStep(
    'Copy "Compare" APK',
    'Copying compare apk',
    'E2E_TESTS',
);
const CHECKOUT_BASELINE_COMMIT_MOCK_STEP = utils.getMockStep(
    'Checkout "Baseline" commit (last release)',
    'Checking out baseline commit',
    'E2E_TESTS',
);
const BUILD_BASELINE_APK_MOCK_STEP = utils.getMockStep(
    'Build "Baseline" APK',
    'Building baseline apk',
    'E2E_TESTS',
);
const COPY_BASELINE_APK_MOCK_STEP = utils.getMockStep(
    'Copy "Baseline" APK',
    'Copying baseline apk',
    'E2E_TESTS',
);
const CHECKOUT_PREVIOUS_BRANCH_MOCK_STEP = utils.getMockStep(
    'Checkout previous branch for source code to run on AWS Device farm',
    'Checking out previous branch',
    'E2E_TESTS',
);
const COPY_E2E_CODE_MOCK_STEP = utils.getMockStep(
    'Copy e2e code into zip folder',
    'Copying e2e tests',
    'E2E_TESTS',
);
const ZIP_EVERYTHING_MOCK_STEP = utils.getMockStep(
    'Zip everything in the zip directory up',
    'Zipping everything',
    'E2E_TESTS',
);
const CONFIGURE_AWS_CREDENTIALS_MOCK_STEP = utils.getMockStep(
    'Configure AWS Credentials',
    'Configuring AWS credentials',
    'E2E_TESTS',
);
const SCHEDULE_AWS_DEVICE_FARM_MOCK_STEP = utils.getMockStep(
    'Schedule AWS Device Farm test run',
    'Scheduling AWS test run',
    'E2E_TESTS',
);
const UNZIP_AWS_DEVICE_FARM_RESULTS_MOCK_STEP = utils.getMockStep(
    'Unzip AWS Device Farm results',
    'Unzipping test results',
    'E2E_TESTS',
);
const PRINT_AWS_DEVICE_FARM_RESULTS_MOCK_STEP = utils.getMockStep(
    'Print AWS Device Farm run results',
    'Printing test results',
    'E2E_TESTS',
);
const SET_OUTPUT_OF_AWS_DEVICE_FARM_MOCK_STEP = utils.getMockStep(
    'Set output of AWS Device Farm into GitHub ENV',
    'Setting AWS output',
    'E2E_TESTS',
);
const GET_MERGED_PULL_REQUEST_MOCK_STEP__E2E_TESTS = utils.getMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'E2E_TESTS',
);
const LEAVE_COMMENT_WITH_AWS_DEVICE_FARM_OUTPUT_MOCK_STEP = utils.getMockStep(
    'Leave output of AWS Device Farm as a PR comment',
    'Leaving comment with test results',
    'E2E_TESTS',
);
const CHECK_IF_TESTS_FAILED_MOCK_STEP = utils.getMockStep(
    'Check if test failed, if so leave a deploy blocker label',
    'Checking if tests failed',
    'E2E_TESTS',
);
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

module.exports = {
    LINT_JOB_MOCK_STEPS,
    TEST_JOB_MOCK_STEPS,
    CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
    CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_LOCKED,
    CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_LOCKED,
    CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__STAGING_UNLOCKED,
    CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS__CP_LABEL__STAGING_UNLOCKED,
    SKIP_DEPLOY_JOB_MOCK_STEPS,
    CREATE_NEW_VERSION_JOB_MOCK_STEPS,
    UPDATE_STAGING_JOB_MOCK_STEPS,
    IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE,
    IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__FALSE,
    NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__MANY_PRS,
    NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__ONE_PR,
    NEW_CONTRIBUTOR_WELCOME_MESSAGE_JOB_MOCK_STEPS__OSBOTIFY,
    E2E_TESTS_JOB_MOCK_STEPS,
};
