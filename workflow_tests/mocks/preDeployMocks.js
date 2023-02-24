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
    mockWith: 'echo [MOCK] [CONFIRM_PASSING_BUILD] Announcing failed workflow in slack, SLACK_WEBHOOK=${{ inputs.SLACK_WEBHOOK }}',
};
const CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS = [
    ANNOUNCE_IN_SLACK_MOCK_STEP,

    // 2nd step runs normally
];

// choose_deploy_actions
const GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY = {
    name: 'Get merged pull request',
    mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Getting merged pull request, GITHUB_TOKEN=${{ inputs.github_token }}\n'
        + 'echo "number=123" >> "$GITHUB_OUTPUT"\n'
        + 'echo "labels=[\'CP Staging\']" >> "$GITHUB_OUTPUT"\n',
};

const CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP = {
    name: 'Check if StagingDeployCash is locked',
    mockWith: 'echo [MOCK] [CHOOSE_DEPLOY_ACTIONS] Checking StagingDeployCash, GITHUB_TOKEN=${{ inputs.GITHUB_TOKEN }}\n'
        + 'echo "IS_LOCKED=true" >> "$GITHUB_OUTPUT"',
};
const CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__CHOOSE_DEPLOY,
    CHECK_IF_STAGINGDEPLOYCASH_IS_LOCKED_MOCK_STEP,

    // steps 3-5 run normally
];

// skip_deploy
const COMMENT_ON_DEFERRED_PR_MOCK_STEP = {
    name: 'Comment on deferred PR',
    mockWith: 'echo [MOCK] [SKIP_DEPLOY] Skipping deploy, GITHUB_TOKEN=${{ inputs.github_token }}, NUMBER=${{ inputs.number }}, BODY=${{ inputs.body }}',
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
    mockWith: 'echo [MOCK] [UPDATE_STAGING] Running turnstyle, POLL_INTERVAL_SECONDS=${{ inputs.poll-interval-seconds }}, GITHUB_TOKEN=${{ env.GITHUB_TOKEN }}',
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
    mockWith: 'echo [MOCK] [IS_EXPENSIFY_EMPLOYEE] Getting merged pull request, GITHUB_TOKEN=${{ inputs.github_token }}\n'
        + 'echo "author=Dummy Author" >> "$GITHUB_OUTPUT"',
};
const CHECK_TEAM_MEMBERSHIP_MOCK_STEP__TRUE = {
    name: 'Check whether the actor is member of Expensify/expensify team',
    mockWith: 'echo [MOCK] [IS_EXPENSIFY_EMPLOYEE] Checking actors Expensify membership, GITHUB_TOKEN=${{ inputs.GITHUB_TOKEN }}, USERNAME=${{ inputs.username }}, TEAM=${{ inputs.team }}\n'
        + 'echo "isTeamMember=true" >> "$GITHUB_OUTPUT"',
};
const IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__TRUE = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__IS_EXPENSIFY_EMPLOYEE,
    CHECK_TEAM_MEMBERSHIP_MOCK_STEP__TRUE,
];
const CHECK_TEAM_MEMBERSHIP_MOCK_STEP__FALSE = {
    name: 'Check whether the actor is member of Expensify/expensify team',
    mockWith: 'echo [MOCK] [IS_EXPENSIFY_EMPLOYEE] Checking actors Expensify membership, GITHUB_TOKEN=${{ inputs.GITHUB_TOKEN }}, USERNAME=${{ inputs.username }}, TEAM=${{ inputs.team }}\n'
        + 'echo "isTeamMember=false" >> "$GITHUB_OUTPUT"',
};
const IS_EXPENSIFY_EMPLOYEE_JOB_MOCK_STEPS__FALSE = [
    GET_MERGED_PULL_REQUEST_MOCK_STEP__IS_EXPENSIFY_EMPLOYEE,
    CHECK_TEAM_MEMBERSHIP_MOCK_STEP__FALSE,
];

// new_contributor_welcome_message
const CHECKOUT_MOCK_STEP = {
    name: 'Checkout',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Checking out, TOKEN=${{ inputs.token }}\n'
        + 'echo "author=Dummy Author" >> "$GITHUB_OUTPUT"',
};
const CHECKOUT_MOCK_STEP__OSBOTIFY = {
    name: 'Checkout',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Checking out, TOKEN=${{ inputs.token }}\n'
        + 'echo "author=OSBotify" >> "$GITHUB_OUTPUT"',
};
const GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE = {
    name: 'Get merged pull request',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Getting merged pull request, GITHUB_TOKEN=${{ inputs.github_token }}\n'
        + 'echo "number=12345" >> "$GITHUB_OUTPUT"\n'
        + 'echo "author=Dummy Author" >> "$GITHUB_OUTPUT"',
};
const GET_MERGED_PULL_REQUEST_MOCK_STEP__WELCOME_MESSAGE__OSBOTIFY = {
    name: 'Get merged pull request',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Getting merged pull request, GITHUB_TOKEN=${{ inputs.github_token }}\n'
        + 'echo "number=12345" >> "$GITHUB_OUTPUT"\n'
        + 'echo "author=OSBotify" >> "$GITHUB_OUTPUT"',
};
const GET_PR_COUNT_MOCK_STEP__1 = {
    name: 'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Getting PR count, GITHUB_TOKEN=${{ env.GITHUB_TOKEN }}\n'
        + 'echo "PR_COUNT=1" >> "$GITHUB_ENV"',
};
const GET_PR_COUNT_MOCK_STEP__10 = {
    name: 'Get PR count for ${{ steps.getMergedPullRequest.outputs.author }}',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Getting PR count, GITHUB_TOKEN=${{ env.GITHUB_TOKEN }}\n'
        + 'echo "PR_COUNT=10" >> "$GITHUB_ENV"',
};
const COMMENT_ON_FIRST_PULL_REQUEST_MOCK_STEP = {
    name: 'Comment on ${{ steps.getMergedPullRequest.outputs.author }}\\\'s first pull request!',
    mockWith: 'echo [MOCK] [NEW_CONTRIBUTOR_WELCOME_MESSAGE] Creating comment, GITHUB_TOKEN=${{ inputs.github_token }}, NUMBER=${{ inputs.number }}, BODY="${{ inputs.body }}"',
};
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

module.exports = {
    LINT_JOB_MOCK_STEPS,
    TEST_JOB_MOCK_STEPS,
    CONFIRM_PASSING_BUILD_JOB_MOCK_STEPS,
    CHOOSE_DEPLOY_ACTIONS_JOB_MOCK_STEPS,
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
