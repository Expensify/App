const utils = require('../utils/utils');

// lint
const LINT_WORKFLOW_MOCK_STEP = utils.createMockStep(
    'Run lint workflow',
    'Running lint workflow',
    'LINT',
);
const LINT_JOB_MOCK_STEPS = [
    LINT_WORKFLOW_MOCK_STEP,
];

// test
const TEST_WORKFLOW_MOCK_STEP = utils.createMockStep(
    'Run test workflow',
    'Running test workflow',
    'TEST',
);
const TEST_JOB_MOCK_STEPS = [
    TEST_WORKFLOW_MOCK_STEP,
];

// confirm_passing_build
const ANNOUNCE_IN_SLACK_MOCK_STEP = utils.createMockStep(
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
const GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY__CP_LABEL = utils.createMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'CHOOSE_DEPLOY_ACTIONS',
    ['github_token'],
    null,
    {number: '123', labels: '[\'CP Staging\']'},
);
const GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY = utils.createMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'CHOOSE_DEPLOY_ACTIONS',
    ['github_token'],
    null,
    {number: '123', labels: '[]'},
);
const CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP__LOCKED = utils.createMockStep(
    'Check if StagingDeployCash is locked',
    'Checking StagingDeployCash',
    'CHOOSE_DEPLOY_ACTIONS',
    ['GITHUB_TOKEN'],
    null,
    {IS_LOCKED: true},
);
const CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP__UNLOCKED = utils.createMockStep(
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
const COMMENT_ON_DEFERRED_PR_MOCK_STEP = utils.createMockStep(
    'Comment on deferred PR',
    'Skipping deploy',
    'SKIP_DEPLOY',
    ['github_token', 'number', 'body'],
);
const SKIP_DEPLOY_JOB_MOCK_STEPS = [
    COMMENT_ON_DEFERRED_PR_MOCK_STEP,
];

// create_new_version
const CREATE_NEW_VERSION_MOCK_STEP = utils.createMockStep(
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
const RUN_TURNSTYLE_MOCK_STEP = utils.createMockStep(
    'Run turnstyle',
    'Running turnstyle',
    'UPDATE_STAGING',
    ['poll-interval-seconds'],
    ['GITHUB_TOKEN'],
);
const UPDATE_STAGING_BRANCH_MOCK_STEP = utils.createMockStep(
    'Update staging branch from main',
    'Updating staging branch',
    'UPDATE_STAGING',
    ['TARGET_BRANCH', 'OS_BOTIFY_TOKEN', 'GPG_PASSPHRASE'],
);
const CHERRYPICK_PR_MOCK_STEP = utils.createMockStep(
    'Cherry-pick PR to staging',
    'Cherry picking',
    'UPDATE_STAGING',
    ['GITHUB_TOKEN', 'WORKFLOW', 'INPUTS'],
);
const CHECKOUT_STAGING_MOCK_STEP = utils.createMockStep(
    'Checkout staging',
    'Checking out staging',
    'UPDATE_STAGING',
    ['ref', 'fetch-depth'],
);
const TAG_STAGING_MOCK_STEP = utils.createMockStep(
    'Tag staging',
    'Tagging staging',
    'UPDATE_STAGING',
);
const UPDATE_STAGINGDEPLOYCASH_MOCK_STEP = utils.createMockStep(
    'Update StagingDeployCash',
    'Updating StagingDeployCash',
    'UPDATE_STAGING',
    ['GITHUB_TOKEN', 'NPM_VERSION'],
);
const FIND_OPEN_STAGINGDEPLOYCASH_MOCK_STEP = utils.createMockStep(
    'Find open StagingDeployCash',
    'Finding open StagingDeployCash',
    'UPDATE_STAGING',
    null,
    ['GITHUB_TOKEN'],
    {STAGING_DEPLOY_CASH: '1234'},
);
const COMMENT_TO_ALERT_APPLAUSE_CHERRYPICK_MOCK_STEP = utils.createMockStep(
    'Comment in StagingDeployCash to alert Applause that a new pull request has been cherry-picked',
    'Commenting in StagingDeployCash',
    'UPDATE_STAGING',
    null,
    ['GITHUB_TOKEN'],
);
const WAIT_FOR_STAGING_DEPLOYS_MOCK_STEP = utils.createMockStep(
    'Wait for staging deploys to finish',
    'Waiting for staging deploy to finish',
    'UPDATE_STAGING',
    ['GITHUB_TOKEN', 'TAG'],
);
const COMMENT_TO_ALERT_APPLAUSE_DEPLOY_MOCK_STEP = utils.createMockStep(
    'Comment in StagingDeployCash to alert Applause that cherry-picked pull request has been deployed.',
    'Commenting in StagingDeployCash',
    'UPDATE_STAGING',
    null,
    ['GITHUB_TOKEN'],
);
const ANNOUNCE_FAILED_WORKFLOW_IN_SLACK_MOCK_STEP = utils.createMockStep(
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
const GET_MERGED_PULL_REQUEST_MOCK_STEP__IS_EXPENSIFY_EMPLOYEE = utils.createMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'IS_EXPENSIFY_EMPLOYEE',
    ['github_token'],
    null,
    {author: 'Dummy Author'},
);
const CHECK_TEAM_MEMBERSHIP_MOCK_STEP__TRUE = utils.createMockStep(
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
const CHECK_TEAM_MEMBERSHIP_MOCK_STEP__FALSE = utils.createMockStep(
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
const CHECKOUT_MOCK_STEP = utils.createMockStep(
    'Checkout',
    'Checking out',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['token'],
    null,
    {author: 'Dummy Author'},
);
const CHECKOUT_MOCK_STEP__OSBOTIFY = utils.createMockStep(
    'Checkout',
    'Checking out',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['token'],
    null,
    {author: 'OSBotify'},
);
const GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE = utils.createMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['github_token'],
    null,
    {number: '12345', author: 'Dummy Author'},
);
const GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE__OSBOTIFY = utils.createMockStep(
    'Get merged pull request',
    'Getting merged pull request',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    ['github_token'],
    null,
    {number: '12345', author: 'OSBotify'},
);
const GET_PR_COUNT_MOCK_STEP__1 = utils.createMockStep(
    // eslint-disable-next-line no-template-curly-in-string
    'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
    'Getting PR count',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    null,
    ['GITHUB_TOKEN'],
    null,
    {PR_COUNT: '1'},
);
const GET_PR_COUNT_MOCK_STEP__10 = utils.createMockStep(
    // eslint-disable-next-line no-template-curly-in-string
    'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
    'Getting PR count',
    'NEW_CONTRIBUTOR_WELCOME_MESSAGE',
    null,
    ['GITHUB_TOKEN'],
    null,
    {PR_COUNT: '10'},
);
const COMMENT_ON_FIRST_PULL_REQUEST_MOCK_STEP = utils.createMockStep(
    // eslint-disable-next-line no-template-curly-in-string
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

const PREDEPLOY__E2EPERFORMANCETESTS__PERFORM_E2E_TESTS__MOCK_STEP = utils.createMockStep(
    'Perform E2E tests',
    'Perform E2E tests',
    'E2EPERFORMANCETESTS',
);
const PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS = [
    PREDEPLOY__E2EPERFORMANCETESTS__PERFORM_E2E_TESTS__MOCK_STEP,
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
    PREDEPLOY__E2EPERFORMANCETESTS__MOCK_STEPS,
};
