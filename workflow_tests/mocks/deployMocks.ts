/* eslint-disable @typescript-eslint/naming-convention */
import type {StepIdentifier} from '@kie/act-js';
import {createMockStep} from '../utils/utils';

const DEPLOY_STAGING__CHECKOUT__STEP_MOCK = createMockStep('Checkout staging branch', 'Checking out staging branch', 'DEPLOY_STAGING', ['ref', 'token']);
const DEPLOY_STAGING__SETUP_GIT__STEP_MOCK = createMockStep('Setup git for OSBotify', 'Setting up git for OSBotify', 'DEPLOY_STAGING', [
    'GPG_PASSPHRASE',
    'OS_BOTIFY_APP_ID',
    'OS_BOTIFY_PRIVATE_KEY',
]);
const DEPLOY_STAGING__TAG_VERSION__STEP_MOCK = createMockStep('Tag version', 'Tagging new version', 'DEPLOY_STAGING');
const DEPLOY_STAGING__PUSH_TAG__STEP_MOCK = createMockStep('🚀 Push tags to trigger staging deploy 🚀', 'Pushing tag to trigger staging deploy', 'DEPLOY_STAGING');
const DEPLOY_STAGING__WARN_DEPLOYERS__STEP_MOCK = createMockStep('Warn deployers if staging deploy failed', 'Warning deployers in slack for workflow failure', 'DEPLOY_STAGING');
const DEPLOY_STAGING_STEP_MOCKS = [
    DEPLOY_STAGING__CHECKOUT__STEP_MOCK,
    DEPLOY_STAGING__SETUP_GIT__STEP_MOCK,
    DEPLOY_STAGING__TAG_VERSION__STEP_MOCK,
    DEPLOY_STAGING__PUSH_TAG__STEP_MOCK,
    DEPLOY_STAGING__WARN_DEPLOYERS__STEP_MOCK,
] as const satisfies StepIdentifier[];

const DEPLOY_PRODUCTION__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checking out', 'DEPLOY_PRODUCTION', ['ref', 'token']);
const DEPLOY_PRODUCTION__SETUP_GIT__STEP_MOCK = createMockStep(
    'Setup git for OSBotify',
    'Setting up git for OSBotify',
    'DEPLOY_PRODUCTION',
    ['GPG_PASSPHRASE', 'OS_BOTIFY_APP_ID', 'OS_BOTIFY_PRIVATE_KEY'],
    null,
    {OS_BOTIFY_API_TOKEN: 'os_botify_api_token'},
);
const DEPLOY_PRODUCTION__CURRENT_APP_VERSION__STEP_MOCK = createMockStep('Get current app version', 'Getting current app version', 'DEPLOY_PRODUCTION', null, null, null, {
    PRODUCTION_VERSION: '1.2.3',
});
const DEPLOY_PRODUCTION__RELEASE_PR_LIST__STEP_MOCK = createMockStep(
    'Get Release Pull Request List',
    'Getting release PR list',
    'DEPLOY_PRODUCTION',
    ['TAG', 'GITHUB_TOKEN', 'IS_PRODUCTION_DEPLOY'],
    null,
    {PR_LIST: '["1.2.1", "1.2.2"]'},
);
const DEPLOY_PRODUCTION__GENERATE_RELEASE_BODY__STEP_MOCK = createMockStep('Generate Release Body', 'Generating release body', 'DEPLOY_PRODUCTION', ['PR_LIST'], null, {
    RELEASE_BODY: 'Release body',
});
const DEPLOY_PRODUCTION__CREATE_RELEASE__STEP_MOCK = createMockStep(
    '🚀 Create release to trigger production deploy 🚀',
    'Creating release to trigger production deploy',
    'DEPLOY_PRODUCTION',
    [],
    ['GITHUB_TOKEN'],
);
const DEPLOY_PRODUCTION__WARN_DEPLOYERS__STEP_MOCK = createMockStep('Warn deployers if production deploy failed', 'Warning deployers in slack for workflow failure', 'DEPLOY_STAGING');
const DEPLOY_PRODUCTION_STEP_MOCKS = [
    DEPLOY_PRODUCTION__CHECKOUT__STEP_MOCK,
    DEPLOY_PRODUCTION__SETUP_GIT__STEP_MOCK,
    DEPLOY_PRODUCTION__CURRENT_APP_VERSION__STEP_MOCK,
    DEPLOY_PRODUCTION__RELEASE_PR_LIST__STEP_MOCK,
    DEPLOY_PRODUCTION__GENERATE_RELEASE_BODY__STEP_MOCK,
    DEPLOY_PRODUCTION__CREATE_RELEASE__STEP_MOCK,
    DEPLOY_PRODUCTION__WARN_DEPLOYERS__STEP_MOCK,
] as const satisfies StepIdentifier[];

export default {DEPLOY_STAGING_STEP_MOCKS, DEPLOY_PRODUCTION_STEP_MOCKS};
