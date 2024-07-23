/* eslint-disable @typescript-eslint/naming-convention */
import {createMockStep} from '../utils/utils';

// validateActor
const PLATFORM_DEPLOY__VALIDATE_ACTOR__CHECK_USER_DEPLOYER__TEAM_MEMBER__STEP_MOCK = createMockStep(
    'Check if user is deployer',
    'Checking if the user is a deployer',
    'VALIDATE_ACTOR',
    [],
    ['GITHUB_TOKEN'],
    {IS_DEPLOYER: true},
);
const PLATFORM_DEPLOY__VALIDATE_ACTOR__CHECK_USER_DEPLOYER__OUTSIDER__STEP_MOCK = createMockStep(
    'Check if user is deployer',
    'Checking if the user is a deployer',
    'VALIDATE_ACTOR',
    [],
    ['GITHUB_TOKEN'],
    {IS_DEPLOYER: false},
);
const PLATFORM_DEPLOY__VALIDATE_ACTOR__TEAM_MEMBER__STEP_MOCKS = [PLATFORM_DEPLOY__VALIDATE_ACTOR__CHECK_USER_DEPLOYER__TEAM_MEMBER__STEP_MOCK];
const PLATFORM_DEPLOY__VALIDATE_ACTOR__OUTSIDER__STEP_MOCKS = [PLATFORM_DEPLOY__VALIDATE_ACTOR__CHECK_USER_DEPLOYER__OUTSIDER__STEP_MOCK];

// deployChecklist
const PLATFORM_DEPLOY__DEPLOY_CHECKLIST__STEP_MOCK = createMockStep('deployChecklist', 'Run deployChecklist', 'DEPLOY_CHECKLIST');
const PLATFORM_DEPLOY__DEPLOY_CHECKLIST__STEP_MOCKS = [PLATFORM_DEPLOY__DEPLOY_CHECKLIST__STEP_MOCK];

// android
const PLATFORM_DEPLOY__ANDROID__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checking out', 'ANDROID');
const PLATFORM_DEPLOY__ANDROID__CONFIGURE_MAPBOX_SDK__STEP_MOCK = createMockStep('Configure MapBox SDK', 'Configure MapBox SDK', 'ANDROID');
const PLATFORM_DEPLOY__ANDROID__SETUP_NODE__STEP_MOCK = createMockStep('Setup Node', 'Setting up Node', 'ANDROID');
const PLATFORM_DEPLOY__ANDROID__SETUP_JAVA__STEP_MOCK = createMockStep('Setup Java', 'Setup Java', 'ANDROID', ['distribution', 'java-version'], []);
const PLATFORM_DEPLOY__ANDROID__SETUP_RUBY__STEP_MOCK = createMockStep('Setup Ruby', 'Setting up Ruby', 'ANDROID', ['ruby-version', 'bundler-cache']);
const PLATFORM_DEPLOY__ANDROID__DECRYPT_KEYSTORE__STEP_MOCK = createMockStep('Decrypt keystore', 'Decrypting keystore', 'ANDROID', null, ['LARGE_SECRET_PASSPHRASE']);
const PLATFORM_DEPLOY__ANDROID__DECRYPT_JSON_KEY__STEP_MOCK = createMockStep('Decrypt json key', 'Decrypting JSON key', 'ANDROID', null, ['LARGE_SECRET_PASSPHRASE']);
const PLATFORM_DEPLOY__ANDROID__SET_VERSION__STEP_MOCK = createMockStep('Set version in ENV', 'Setting version in ENV', 'ANDROID', null, null, null, {VERSION_CODE: '1.2.3'});
const PLATFORM_DEPLOY__ANDROID__FASTLANE__STEP_MOCK = createMockStep('Run Fastlane', 'Running Fastlane', 'ANDROID', null, [
    'RUBYOPT',
    'MYAPP_UPLOAD_STORE_PASSWORD',
    'MYAPP_UPLOAD_KEY_PASSWORD',
    'VERSION',
]);
const PLATFORM_DEPLOY__ANDROID__ARCHIVE_SOURCEMAPS__STEP_MOCK = createMockStep('Archive Android sourcemaps', 'Archiving Android sourcemaps', 'ANDROID', ['name', 'path']);
const PLATFORM_DEPLOY__ANDROID__UPLOAD_TO_GITHUB_ARTIFACTS__STEP_MOCK = createMockStep('Upload Android build to GitHub artifacts', 'Uploading Android build to GitHub artifacts', 'ANDROID', [
    'name',
    'path',
]);
const PLATFORM_DEPLOY__ANDROID__UPLOAD_TO_BROWSER_STACK__STEP_MOCK = createMockStep('Upload Android build to Browser Stack', 'Uploading Android build to Browser Stack', 'ANDROID', null, [
    'BROWSERSTACK',
]);
const PLATFORM_DEPLOY__ANDROID__UPLOAD_TO_GH_RELEASE__STEP_MOCK = createMockStep('Upload Android build to GitHub Release', 'Uploading Android build to GitHub Release', 'ANDROID', null, [
    'GITHUB_TOKEN',
]);
const PLATFORM_DEPLOY__ANDROID__WARN_DEPLOYERS__STEP_MOCK = createMockStep(
    'Warn deployers if Android production deploy failed',
    'Warning deployers of failed production deploy',
    'ANDROID',
    ['status'],
    ['GITHUB_TOKEN', 'SLACK_WEBHOOK_URL'],
);
const PLATFORM_DEPLOY__ANDROID__STEP_MOCKS = [
    PLATFORM_DEPLOY__ANDROID__CHECKOUT__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__CONFIGURE_MAPBOX_SDK__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__SETUP_NODE__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__SETUP_JAVA__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__SETUP_RUBY__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__DECRYPT_KEYSTORE__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__DECRYPT_JSON_KEY__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__SET_VERSION__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__FASTLANE__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__ARCHIVE_SOURCEMAPS__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__UPLOAD_TO_GITHUB_ARTIFACTS__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__UPLOAD_TO_BROWSER_STACK__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__UPLOAD_TO_GH_RELEASE__STEP_MOCK,
    PLATFORM_DEPLOY__ANDROID__WARN_DEPLOYERS__STEP_MOCK,
];

// desktop
const PLATFORM_DEPLOY__DESKTOP__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checking out', 'DESKTOP');
const PLATFORM_DEPLOY__DESKTOP__SETUP_NODE__STEP_MOCK = createMockStep('Setup Node', 'Setting up Node', 'DESKTOP');
const PLATFORM_DEPLOY__DESKTOP__DECRYPT_ID__STEP_MOCK = createMockStep('Decrypt Developer ID Certificate', 'Decrypting developer id certificate', 'DESKTOP', null, [
    'DEVELOPER_ID_SECRET_PASSPHRASE',
]);
const PLATFORM_DEPLOY__DESKTOP__BUILD__STEP_MOCK = createMockStep('Build desktop app', 'Building desktop app', 'DESKTOP', null, [
    'CSC_LINK',
    'CSC_KEY_PASSWORD',
    'APPLE_ID',
    'APPLE_APP_SPECIFIC_PASSWORD',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
]);
const PLATFORM_DEPLOY__DESKTOP__UPLOAD_WORKFLOW__STEP_MOCK = createMockStep('Upload desktop build to GitHub Workflow', 'Uploading desktop build to GitHub Workflow', 'DESKTOP', [
    'name',
    'path',
]);
const PLATFORM_DEPLOY__DESKTOP__UPLOAD_GH_RELEASE__STEP_MOCK = createMockStep('Upload desktop build to GitHub Release', 'Uploading desktop build to GitHub Release', 'DESKTOP', null, [
    'GITHUB_TOKEN',
]);
const PLATFORM_DEPLOY__DESKTOP__ARCHIVE_SOURCEMAPS__STEP_MOCK = createMockStep('Archive desktop sourcemaps', 'Archiving desktop sourcemaps', 'DESKTOP', ['name', 'path']);
const PLATFORM_DEPLOY__DESKTOP__STEP_MOCKS = [
    PLATFORM_DEPLOY__DESKTOP__CHECKOUT__STEP_MOCK,
    PLATFORM_DEPLOY__DESKTOP__SETUP_NODE__STEP_MOCK,
    PLATFORM_DEPLOY__DESKTOP__DECRYPT_ID__STEP_MOCK,
    PLATFORM_DEPLOY__DESKTOP__BUILD__STEP_MOCK,
    PLATFORM_DEPLOY__DESKTOP__UPLOAD_WORKFLOW__STEP_MOCK,
    PLATFORM_DEPLOY__DESKTOP__UPLOAD_GH_RELEASE__STEP_MOCK,
    PLATFORM_DEPLOY__DESKTOP__ARCHIVE_SOURCEMAPS__STEP_MOCK,
];

// ios
const PLATFORM_DEPLOY__IOS__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checking out', 'IOS');
const PLATFORM_DEPLOY__IOS__CONFIGURE_MAPBOX_SDK__STEP_MOCK = createMockStep('Configure MapBox SDK', 'Configure MapBox SDK', 'IOS');
const PLATFORM_DEPLOY__IOS__SETUP_NODE__STEP_MOCK = createMockStep('Setup Node', 'Setting up Node', 'IOS');
const PLATFORM_DEPLOY__IOS__SETUP_RUBY__STEP_MOCK = createMockStep('Setup Ruby', 'Setting up Ruby', 'IOS', ['ruby-version', 'bundler-cache']);
const PLATFORM_DEPLOY__IOS__CACHE_POD_DEPENDENCIES__STEP_MOCK = createMockStep('Cache Pod dependencies', 'Cache Pod dependencies', 'IOS', ['path', 'key', 'restore-keys'], [], {
    'cache-hit': false,
});
const PLATFORM_DEPLOY__IOS__COMPARE_PODFILE_AND_MANIFEST__STEP_MOCK = createMockStep('Compare Podfile.lock and Manifest.lock', 'Compare Podfile.lock and Manifest.lock', 'IOS', [], [], {
    IS_PODFILE_SAME_AS_MANIFEST: false,
});
const PLATFORM_DEPLOY__IOS__COCOAPODS__STEP_MOCK = createMockStep('Install cocoapods', 'Installing cocoapods', 'IOS', ['timeout_minutes', 'max_attempts', 'command']);
const PLATFORM_DEPLOY__IOS__DECRYPT_APPSTORE_PROFILE__STEP_MOCK = createMockStep('Decrypt AppStore profile', 'Decrypting profile', 'IOS', null, ['LARGE_SECRET_PASSPHRASE']);
const PLATFORM_DEPLOY__IOS__DECRYPT_APPSTORE_NSE_PROFILE__STEP_MOCK = createMockStep('Decrypt AppStore Notification Service profile', 'Decrypting profile', 'IOS', null, [
    'LARGE_SECRET_PASSPHRASE',
]);
const PLATFORM_DEPLOY__IOS__DECRYPT_CERTIFICATE__STEP_MOCK = createMockStep('Decrypt certificate', 'Decrypting certificate', 'IOS', null, ['LARGE_SECRET_PASSPHRASE']);
const PLATFORM_DEPLOY__IOS__DECRYPT_APP_STORE_API_KEY__STEP_MOCK = createMockStep('Decrypt App Store Connect API key', 'Decrypting App Store API key', 'IOS', null, [
    'LARGE_SECRET_PASSPHRASE',
]);
const PLATFORM_DEPLOY__IOS__SET_VERSION__STEP_MOCK = createMockStep('Set iOS version in ENV', 'Setting iOS version', 'IOS', null, null, null, {IOS_VERSION: '1.2.3'});
const PLATFORM_DEPLOY__IOS__FASTLANE__STEP_MOCK = createMockStep('Run Fastlane', 'Running Fastlane', 'IOS', null, [
    'APPLE_CONTACT_EMAIL',
    'APPLE_CONTACT_PHONE',
    'APPLE_DEMO_EMAIL',
    'APPLE_DEMO_PASSWORD',
    'VERSION',
]);
const PLATFORM_DEPLOY__IOS__ARCHIVE_SOURCEMAPS__STEP_MOCK = createMockStep('Archive iOS sourcemaps', 'Archiving sourcemaps', 'IOS', ['name', 'path']);
const PLATFORM_DEPLOY__IOS__UPLOAD_TO_GITHUB_ARTIFACTS__STEP_MOCK = createMockStep('Upload iOS build to GitHub artifacts', 'Uploading iOS build to GitHub artifacts', 'IOS', [
    'name',
    'path',
]);
const PLATFORM_DEPLOY__IOS__UPLOAD_BROWSERSTACK__STEP_MOCK = createMockStep('Upload iOS build to Browser Stack', 'Uploading build to Browser Stack', 'IOS', null, ['BROWSERSTACK']);
const PLATFORM_DEPLOY__IOS__UPLOAD_TO_GH_RELEASE__STEP_MOCK = createMockStep('Upload iOS build to GitHub Release', 'Uploading iOS build to GitHub Release', 'IOS', null, ['GITHUB_TOKEN']);
const PLATFORM_DEPLOY__IOS__WARN_FAIL__STEP_MOCK = createMockStep(
    'Warn deployers if iOS production deploy failed',
    'Warning developers of failed deploy',
    'IOS',
    ['status'],
    ['GITHUB_TOKEN', 'SLACK_WEBHOOK_URL'],
);
const PLATFORM_DEPLOY__IOS__STEP_MOCKS = [
    PLATFORM_DEPLOY__IOS__CHECKOUT__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__CONFIGURE_MAPBOX_SDK__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__SETUP_NODE__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__SETUP_RUBY__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__CACHE_POD_DEPENDENCIES__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__COMPARE_PODFILE_AND_MANIFEST__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__COCOAPODS__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__DECRYPT_APPSTORE_PROFILE__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__DECRYPT_APPSTORE_NSE_PROFILE__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__DECRYPT_CERTIFICATE__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__DECRYPT_APP_STORE_API_KEY__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__SET_VERSION__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__FASTLANE__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__ARCHIVE_SOURCEMAPS__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__UPLOAD_TO_GITHUB_ARTIFACTS__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__UPLOAD_BROWSERSTACK__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__UPLOAD_TO_GH_RELEASE__STEP_MOCK,
    PLATFORM_DEPLOY__IOS__WARN_FAIL__STEP_MOCK,
];

// web
const PLATFORM_DEPLOY__WEB__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checking out', 'WEB');
const PLATFORM_DEPLOY__WEB__SETUP_NODE__STEP_MOCK = createMockStep('Setup Node', 'Setting up Node', 'WEB');
const PLATFORM_DEPLOY__WEB__CLOUDFLARE__STEP_MOCK = createMockStep('Setup Cloudflare CLI', 'Setting up Cloudflare CLI', 'WEB');
const PLATFORM_DEPLOY__WEB__AWS_CREDENTIALS__STEP_MOCK = createMockStep('Configure AWS Credentials', 'Configuring AWS credentials', 'WEB', [
    'aws-access-key-id',
    'aws-secret-access-key',
    'aws-region',
]);
const PLATFORM_DEPLOY__WEB__BUILD__STEP_MOCK = createMockStep('Build web', 'Building web', 'WEB');
const PLATFORM_DEPLOY__WEB__BUILD_STORYBOOK_DOCS__STEP_MOCK = createMockStep('Build storybook docs', 'Build storybook docs', 'WEB');
const PLATFORM_DEPLOY__WEB__DEPLOY_S3__STEP_MOCK = createMockStep('Deploy to S3', 'Deploying to S3', 'WEB');
const PLATFORM_DEPLOY__WEB__PURGE_CLOUDFLARE_CACHE__STEP_MOCK = createMockStep('Purge Cloudflare cache', 'Purging Cloudflare cache', 'WEB', null, ['CF_API_KEY']);
const PLATFORM_DEPLOY__WEB__ARCHIVE_SOURCEMAPS__STEP_MOCK = createMockStep('Archive web sourcemaps', 'Archiving web sourcemaps', 'WEB', ['name', 'path']);
const PLATFORM_DEPLOY__WEB__STEP_MOCKS = [
    PLATFORM_DEPLOY__WEB__CHECKOUT__STEP_MOCK,
    PLATFORM_DEPLOY__WEB__SETUP_NODE__STEP_MOCK,
    PLATFORM_DEPLOY__WEB__CLOUDFLARE__STEP_MOCK,
    PLATFORM_DEPLOY__WEB__AWS_CREDENTIALS__STEP_MOCK,
    PLATFORM_DEPLOY__WEB__BUILD__STEP_MOCK,
    PLATFORM_DEPLOY__WEB__BUILD_STORYBOOK_DOCS__STEP_MOCK,
    PLATFORM_DEPLOY__WEB__DEPLOY_S3__STEP_MOCK,
    PLATFORM_DEPLOY__WEB__ARCHIVE_SOURCEMAPS__STEP_MOCK,
    PLATFORM_DEPLOY__WEB__PURGE_CLOUDFLARE_CACHE__STEP_MOCK,
];

// post slack message on failure
const PLATFORM_DEPLOY__POST_SLACK_FAIL__POST_SLACK__STEP_MOCK = createMockStep('Post Slack message on failure', 'Posting Slack message on platform deploy failure', 'POST_SLACK_FAIL', [
    'SLACK_WEBHOOK',
]);
const PLATFORM_DEPLOY__POST_SLACK_FAIL__STEP_MOCKS = [PLATFORM_DEPLOY__POST_SLACK_FAIL__POST_SLACK__STEP_MOCK];

// post slack message on success
const PLATFORM_DEPLOY__POST_SLACK_SUCCESS__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checking out', 'POST_SLACK_SUCCESS');
const PLATFORM_DEPLOY__POST_SLACK_SUCCESS__SET_VERSION__STEP_MOCK = createMockStep('Set version', 'Setting version', 'POST_SLACK_SUCCESS', null, null, null, {VERSION: '1.2.3'});
const PLATFORM_DEPLOY__POST_SLACK_SUCCESS__ANNOUNCE_CHANNEL__STEP_MOCK = createMockStep(
    'Announces the deploy in the #announce Slack room',
    'Posting message to \\#announce channel',
    'POST_SLACK_SUCCESS',
    ['status'],
    ['GITHUB_TOKEN', 'SLACK_WEBHOOK_URL'],
);
const PLATFORM_DEPLOY__POST_SLACK_SUCCESS__DEPLOYER_CHANNEL__STEP_MOCK = createMockStep(
    'Announces the deploy in the #deployer Slack room',
    'Posting message to \\#deployer channel',
    'POST_SLACK_SUCCESS',
    ['status'],
    ['GITHUB_TOKEN', 'SLACK_WEBHOOK_URL'],
);
const PLATFORM_DEPLOY__POST_SLACK_SUCCESS__EXPENSIFY_CHANNEL__STEP_MOCK = createMockStep(
    'Announces a production deploy in the #expensify-open-source Slack room',
    'Posting message to \\#expensify-open-source channel',
    'POST_SLACK_SUCCESS',
    ['status'],
    ['GITHUB_TOKEN', 'SLACK_WEBHOOK_URL'],
);
const PLATFORM_DEPLOY__POST_SLACK_SUCCESS__STEP_MOCKS = [
    PLATFORM_DEPLOY__POST_SLACK_SUCCESS__CHECKOUT__STEP_MOCK,
    PLATFORM_DEPLOY__POST_SLACK_SUCCESS__SET_VERSION__STEP_MOCK,
    PLATFORM_DEPLOY__POST_SLACK_SUCCESS__ANNOUNCE_CHANNEL__STEP_MOCK,
    PLATFORM_DEPLOY__POST_SLACK_SUCCESS__DEPLOYER_CHANNEL__STEP_MOCK,
    PLATFORM_DEPLOY__POST_SLACK_SUCCESS__EXPENSIFY_CHANNEL__STEP_MOCK,
];

// post github comment
const PLATFORM_DEPLOY__POST_GIHUB_COMMENT__CHECKOUT__STEP_MOCK = createMockStep('Checkout', 'Checking out', 'POST_GITHUB_COMMENT');
const PLATFORM_DEPLOY__POST_GIHUB_COMMENT__SETUP_NODE__STEP_MOCK = createMockStep('Setup Node', 'Setting up Node', 'POST_GITHUB_COMMENT');
const PLATFORM_DEPLOY__POST_GIHUB_COMMENT__SET_VERSION__STEP_MOCK = createMockStep('Set version', 'Setting version', 'POST_GITHUB_COMMENT', null, null, null, {VERSION: '1.2.3'});
const PLATFORM_DEPLOY__POST_GIHUB_COMMENT__GET_PR_LIST__STEP_MOCK = createMockStep(
    'Get Release Pull Request List',
    'Getting release pull request list',
    'POST_GITHUB_COMMENT',
    ['TAG', 'GITHUB_TOKEN', 'IS_PRODUCTION_DEPLOY'],
    null,
    {PR_LIST: '[1.2.1, 1.2.2]'},
);
const PLATFORM_DEPLOY__POST_GIHUB_COMMENT__COMMENT__STEP_MOCK = createMockStep('Comment on issues', 'Commenting on issues', 'POST_GITHUB_COMMENT', [
    'PR_LIST',
    'IS_PRODUCTION_DEPLOY',
    'DEPLOY_VERSION',
    'GITHUB_TOKEN',
    'ANDROID',
    'DESKTOP',
    'IOS',
    'WEB',
]);
const PLATFORM_DEPLOY__POST_GITHUB_COMMENT__STEP_MOCKS = [
    PLATFORM_DEPLOY__POST_GIHUB_COMMENT__CHECKOUT__STEP_MOCK,
    PLATFORM_DEPLOY__POST_GIHUB_COMMENT__SETUP_NODE__STEP_MOCK,
    PLATFORM_DEPLOY__POST_GIHUB_COMMENT__SET_VERSION__STEP_MOCK,
    PLATFORM_DEPLOY__POST_GIHUB_COMMENT__GET_PR_LIST__STEP_MOCK,
    PLATFORM_DEPLOY__POST_GIHUB_COMMENT__COMMENT__STEP_MOCK,
];

export default {
    PLATFORM_DEPLOY__VALIDATE_ACTOR__TEAM_MEMBER__STEP_MOCKS,
    PLATFORM_DEPLOY__VALIDATE_ACTOR__OUTSIDER__STEP_MOCKS,
    PLATFORM_DEPLOY__ANDROID__STEP_MOCKS,
    PLATFORM_DEPLOY__DESKTOP__STEP_MOCKS,
    PLATFORM_DEPLOY__IOS__STEP_MOCKS,
    PLATFORM_DEPLOY__WEB__STEP_MOCKS,
    PLATFORM_DEPLOY__POST_SLACK_FAIL__STEP_MOCKS,
    PLATFORM_DEPLOY__POST_SLACK_SUCCESS__STEP_MOCKS,
    PLATFORM_DEPLOY__POST_GITHUB_COMMENT__STEP_MOCKS,
    PLATFORM_DEPLOY__DEPLOY_CHECKLIST__STEP_MOCKS,
};
