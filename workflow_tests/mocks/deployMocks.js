const utils = require('../utils/utils');

const VALIDATE__GET_MERGED_PR__STEP_MOCK = utils.getMockStep(
    'Get merged pull request',
    'Getting merged PR',
    'VALIDATE',
    ['github_token'],
    [],
    {author: 'Dummy Author'},
);
const VALIDATE__GET_MERGED_PR__OSBOTIFY__STEP_MOCK = utils.getMockStep(
    'Get merged pull request',
    'Getting merged PR',
    'VALIDATE',
    ['github_token'],
    [],
    {author: 'OSBotify'},
);

const VALIDATE_STEP_MOCKS = [
    VALIDATE__GET_MERGED_PR__STEP_MOCK,

    // 2nd step normal
];
const VALIDATE__OSBOTIFY__STEP_MOCKS = [
    VALIDATE__GET_MERGED_PR__OSBOTIFY__STEP_MOCK,

    // 2nd step normal
];

const DEPLOY_STAGING__CHECKOUT__STEP_MOCK = utils.getMockStep(
    'Checkout staging branch',
    'Checking out staging branch',
    'DEPLOY_STAGING',
    ['ref', 'token'],
);
const DEPLOY_STAGING__SETUP_GIT__STEP_MOCK = utils.getMockStep(
    'Setup git for OSBotify',
    'Setting up git for OSBotify',
    'DEPLOY_STAGING',
    ['GPG_PASSPHRASE'],
);
const DEPLOY_STAGING__TAG_VERSION__STEP_MOCK = utils.getMockStep(
    'Tag version',
    'Tagging new version',
    'DEPLOY_STAGING',
);
const DEPLOY_STAGING__PUSH_TAG__STEP_MOCK = utils.getMockStep(
    '🚀 Push tags to trigger staging deploy 🚀',
    'Pushing tag to trigger staging deploy',
    'DEPLOY_STAGING',
);
const DEPLOY_STAGING_STEP_MOCKS = [
    DEPLOY_STAGING__CHECKOUT__STEP_MOCK,
    DEPLOY_STAGING__SETUP_GIT__STEP_MOCK,
    DEPLOY_STAGING__TAG_VERSION__STEP_MOCK,
    DEPLOY_STAGING__PUSH_TAG__STEP_MOCK,
];

const DEPLOY_PRODUCTION__CHECKOUT__STEP_MOCK = utils.getMockStep(
    'Checkout',
    'Checking out',
    'DEPLOY_PRODUCTION',
    ['fetch-depth', 'token'],
);
const DEPLOY_PRODUCTION__SETUP_GIT__STEP_MOCK = utils.getMockStep(
    'Setup git for OSBotify',
    'Setting up git for OSBotify',
    'DEPLOY_PRODUCTION',
    ['GPG_PASSPHRASE'],
);
const DEPLOY_PRODUCTION__CHECKOUT_PRODUCTION__STEP_MOCK = utils.getMockStep(
    'Checkout production branch',
    'Checking out production branch',
    'DEPLOY_PRODUCTION',
);
const DEPLOY_PRODUCTION__CURRENT_APP_VERSION__STEP_MOCK = utils.getMockStep(
    'Get current app version',
    'Getting current app version',
    'DEPLOY_PRODUCTION',
    null,
    null,
    null,
    {PRODUCTION_VERSION: '1.2.3'},
);
const DEPLOY_PRODUCTION__RELEASE_PR_LIST__STEP_MOCK = utils.getMockStep(
    'Get Release Pull Request List',
    'Getting release PR list',
    'DEPLOY_PRODUCTION',
    ['TAG', 'GITHUB_TOKEN', 'IS_PRODUCTION_DEPLOY'],
    null,
    {PR_LIST: '["1.2.1", "1.2.2"]'},
);
const DEPLOY_PRODUCTION__GENERATE_RELEASE_BODY__STEP_MOCK = utils.getMockStep(
    'Generate Release Body',
    'Generating release body',
    'DEPLOY_PRODUCTION',
    ['PR_LIST'],
    null,
    {RELEASE_BODY: 'Release body'},
);
const DEPLOY_PRODUCTION__CREATE_RELEASE__STEP_MOCK = utils.getMockStep(
    '🚀 Create release to trigger production deploy 🚀',
    'Creating release to trigger production deploy',
    'DEPLOY_PRODUCTION',
    ['tag_name', 'body'],
    ['GITHUB_TOKEN'],
);
const DEPLOY_PRODUCTION_STEP_MOCKS = [
    DEPLOY_PRODUCTION__CHECKOUT__STEP_MOCK,
    DEPLOY_PRODUCTION__SETUP_GIT__STEP_MOCK,
    DEPLOY_PRODUCTION__CHECKOUT_PRODUCTION__STEP_MOCK,
    DEPLOY_PRODUCTION__CURRENT_APP_VERSION__STEP_MOCK,
    DEPLOY_PRODUCTION__RELEASE_PR_LIST__STEP_MOCK,
    DEPLOY_PRODUCTION__GENERATE_RELEASE_BODY__STEP_MOCK,
    DEPLOY_PRODUCTION__CREATE_RELEASE__STEP_MOCK,
];

module.exports = {
    VALIDATE_STEP_MOCKS,
    VALIDATE__OSBOTIFY__STEP_MOCKS,
    DEPLOY_STAGING_STEP_MOCKS,
    DEPLOY_PRODUCTION_STEP_MOCKS,
};
