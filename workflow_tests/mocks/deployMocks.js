const utils = require('../utils/utils');

const DEPLOY_STAGING__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout staging branch', 'Checking out staging branch', 'DEPLOY_STAGING', ['ref', 'token']);
const DEPLOY_STAGING__SETUP_GIT__STEP_MOCK = utils.createMockStep('Setup git for OSBotify', 'Setting up git for OSBotify', 'DEPLOY_STAGING', [
    'GPG_PASSPHRASE',
    'OS_BOTIFY_APP_ID',
    'OS_BOTIFY_PRIVATE_KEY',
]);
const DEPLOY_STAGING__TAG_VERSION__STEP_MOCK = utils.createMockStep('Tag version', 'Tagging new version', 'DEPLOY_STAGING');
const DEPLOY_STAGING__PUSH_TAG__STEP_MOCK = utils.createMockStep('🚀 Push tags to trigger staging deploy 🚀', 'Pushing tag to trigger staging deploy', 'DEPLOY_STAGING');
const DEPLOY_STAGING_STEP_MOCKS = [DEPLOY_STAGING__CHECKOUT__STEP_MOCK, DEPLOY_STAGING__SETUP_GIT__STEP_MOCK, DEPLOY_STAGING__TAG_VERSION__STEP_MOCK, DEPLOY_STAGING__PUSH_TAG__STEP_MOCK];

const DEPLOY_PRODUCTION__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checking out', 'DEPLOY_PRODUCTION', ['ref', 'token']);
const DEPLOY_PRODUCTION__SETUP_GIT__STEP_MOCK = utils.createMockStep(
    'Setup git for OSBotify',
    'Setting up git for OSBotify',
    'DEPLOY_PRODUCTION',
    ['GPG_PASSPHRASE', 'OS_BOTIFY_APP_ID', 'OS_BOTIFY_PRIVATE_KEY'],
    null,
    {OS_BOTIFY_API_TOKEN: 'os_botify_api_token'},
);
const DEPLOY_PRODUCTION__CURRENT_APP_VERSION__STEP_MOCK = utils.createMockStep('Get current app version', 'Getting current app version', 'DEPLOY_PRODUCTION', null, null, null, {
    PRODUCTION_VERSION: '1.2.3',
});
const DEPLOY_PRODUCTION__RELEASE_PR_LIST__STEP_MOCK = utils.createMockStep(
    'Get Release Pull Request List',
    'Getting release PR list',
    'DEPLOY_PRODUCTION',
    ['TAG', 'GITHUB_TOKEN', 'IS_PRODUCTION_DEPLOY'],
    null,
    {PR_LIST: '["1.2.1", "1.2.2"]'},
);
const DEPLOY_PRODUCTION__GENERATE_RELEASE_BODY__STEP_MOCK = utils.createMockStep('Generate Release Body', 'Generating release body', 'DEPLOY_PRODUCTION', ['PR_LIST'], null, {
    RELEASE_BODY: 'Release body',
});
const DEPLOY_PRODUCTION__CREATE_RELEASE__STEP_MOCK = utils.createMockStep(
    '🚀 Create release to trigger production deploy 🚀',
    'Creating release to trigger production deploy',
    'DEPLOY_PRODUCTION',
    ['tag_name', 'body'],
    ['GITHUB_TOKEN'],
);
const DEPLOY_PRODUCTION_STEP_MOCKS = [
    DEPLOY_PRODUCTION__CHECKOUT__STEP_MOCK,
    DEPLOY_PRODUCTION__SETUP_GIT__STEP_MOCK,
    DEPLOY_PRODUCTION__CURRENT_APP_VERSION__STEP_MOCK,
    DEPLOY_PRODUCTION__RELEASE_PR_LIST__STEP_MOCK,
    DEPLOY_PRODUCTION__GENERATE_RELEASE_BODY__STEP_MOCK,
    DEPLOY_PRODUCTION__CREATE_RELEASE__STEP_MOCK,
];

module.exports = {
    DEPLOY_STAGING_STEP_MOCKS,
    DEPLOY_PRODUCTION_STEP_MOCKS,
};
