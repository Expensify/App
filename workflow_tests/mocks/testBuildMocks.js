const utils = require('../utils/utils');

// validateactor
const TESTBUILD__VALIDATEACTOR__IS_TEAM_MEMBER__TRUE__STEP_MOCK = utils.createMockStep('Is Expensify employee', 'Is Expensify employee', 'VALIDATEACTOR', [], ['GITHUB_TOKEN'], {
    IS_EXPENSIFY_EMPLOYEE: true,
});
const TESTBUILD__VALIDATEACTOR__IS_TEAM_MEMBER__FALSE__STEP_MOCK = utils.createMockStep('Is Expensify employee', 'Is Expensify employee', 'VALIDATEACTOR', [], ['GITHUB_TOKEN'], {
    IS_EXPENSIFY_EMPLOYEE: false,
});
const TESTBUILD__VALIDATEACTOR__SET_HAS_READY_TO_BUILD_LABEL_FLAG__TRUE__STEP_MOCK = utils.createMockStep(
    'Set HAS_READY_TO_BUILD_LABEL flag',
    'Set HAS_READY_TO_BUILD_LABEL flag',
    'VALIDATEACTOR',
    [],
    ['PULL_REQUEST_NUMBER', 'GITHUB_TOKEN'],
    {HAS_READY_TO_BUILD_LABEL: true},
);
const TESTBUILD__VALIDATEACTOR__SET_HAS_READY_TO_BUILD_LABEL_FLAG__FALSE__STEP_MOCK = utils.createMockStep(
    'Set HAS_READY_TO_BUILD_LABEL flag',
    'Set HAS_READY_TO_BUILD_LABEL flag',
    'VALIDATEACTOR',
    [],
    ['PULL_REQUEST_NUMBER', 'GITHUB_TOKEN'],
    {HAS_READY_TO_BUILD_LABEL: false},
);
const TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS = [
    TESTBUILD__VALIDATEACTOR__IS_TEAM_MEMBER__TRUE__STEP_MOCK,
    TESTBUILD__VALIDATEACTOR__SET_HAS_READY_TO_BUILD_LABEL_FLAG__TRUE__STEP_MOCK,
];
const TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_NO_FLAG__STEP_MOCKS = [
    TESTBUILD__VALIDATEACTOR__IS_TEAM_MEMBER__TRUE__STEP_MOCK,
    TESTBUILD__VALIDATEACTOR__SET_HAS_READY_TO_BUILD_LABEL_FLAG__FALSE__STEP_MOCK,
];
const TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_HAS_FLAG__STEP_MOCKS = [
    TESTBUILD__VALIDATEACTOR__IS_TEAM_MEMBER__FALSE__STEP_MOCK,
    TESTBUILD__VALIDATEACTOR__SET_HAS_READY_TO_BUILD_LABEL_FLAG__TRUE__STEP_MOCK,
];
const TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_NO_FLAG__STEP_MOCKS = [
    TESTBUILD__VALIDATEACTOR__IS_TEAM_MEMBER__FALSE__STEP_MOCK,
    TESTBUILD__VALIDATEACTOR__SET_HAS_READY_TO_BUILD_LABEL_FLAG__FALSE__STEP_MOCK,
];

// getbranchref
const TESTBUILD__GETBRANCHREF__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'GETBRANCHREF', [], []);
const TESTBUILD__GETBRANCHREF__CHECK_IF_PULL_REQUEST_NUMBER_IS_CORRECT__STEP_MOCK = utils.createMockStep(
    'Check if pull request number is correct',
    'Check if pull request number is correct',
    'GETBRANCHREF',
    [],
    ['GITHUB_TOKEN'],
    {REF: 'test-ref'},
);
const TESTBUILD__GETBRANCHREF__STEP_MOCKS = [TESTBUILD__GETBRANCHREF__CHECKOUT__STEP_MOCK, TESTBUILD__GETBRANCHREF__CHECK_IF_PULL_REQUEST_NUMBER_IS_CORRECT__STEP_MOCK];

// android
const TESTBUILD__ANDROID__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'ANDROID', ['ref'], []);
const TESTBUILD__ANDROID__CREATE_ENV_ADHOC__STEP_MOCK = utils.createMockStep(
    'Create .env.adhoc file based on staging and add PULL_REQUEST_NUMBER env to it',
    'Creating .env.adhoc file based on staging',
    'ANDROID',
    [],
    [],
);
const TESTBUILD__ANDROID__SETUP_NODE__STEP_MOCK = utils.createMockStep('Setup Node', 'Setup Node', 'ANDROID', [], []);
const TESTBUILD__ANDROID__SETUP_RUBY__STEP_MOCK = utils.createMockStep('Setup Ruby', 'Setup Ruby', 'ANDROID', ['ruby-version', 'bundler-cache'], []);
const TESTBUILD__ANDROID__DECRYPT_KEYSTORE__STEP_MOCK = utils.createMockStep('Decrypt keystore', 'Decrypt keystore', 'ANDROID', [], ['LARGE_SECRET_PASSPHRASE']);
const TESTBUILD__ANDROID__DECRYPT_JSON_KEY__STEP_MOCK = utils.createMockStep('Decrypt json key', 'Decrypt json key', 'ANDROID', [], ['LARGE_SECRET_PASSPHRASE']);
const TESTBUILD__ANDROID__CONFIGURE_AWS_CREDENTIALS__STEP_MOCK = utils.createMockStep(
    'Configure AWS Credentials',
    'Configure AWS Credentials',
    'ANDROID',
    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    [],
);
const TESTBUILD__ANDROID__CONFIGURE_MAPBOX_SDK__STEP_MOCK = utils.createMockStep('Configure MapBox SDK', 'Configure MapBox SDK', 'ANDROID');
const TESTBUILD__ANDROID__RUN_FASTLANE_BETA_TEST__STEP_MOCK = utils.createMockStep(
    'Run Fastlane beta test',
    'Run Fastlane beta test',
    'ANDROID',
    [],
    ['S3_ACCESS_KEY', 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET', 'S3_REGION', 'MYAPP_UPLOAD_STORE_PASSWORD', 'MYAPP_UPLOAD_KEY_PASSWORD'],
);
const TESTBUILD__ANDROID__UPLOAD_ARTIFACT__STEP_MOCK = utils.createMockStep('Upload Artifact', 'Upload Artifact', 'ANDROID', ['name', 'path'], []);
const TESTBUILD__ANDROID__STEP_MOCKS = [
    TESTBUILD__ANDROID__CHECKOUT__STEP_MOCK,
    TESTBUILD__ANDROID__CREATE_ENV_ADHOC__STEP_MOCK,
    TESTBUILD__ANDROID__SETUP_NODE__STEP_MOCK,
    TESTBUILD__ANDROID__SETUP_RUBY__STEP_MOCK,
    TESTBUILD__ANDROID__DECRYPT_KEYSTORE__STEP_MOCK,
    TESTBUILD__ANDROID__DECRYPT_JSON_KEY__STEP_MOCK,
    TESTBUILD__ANDROID__CONFIGURE_AWS_CREDENTIALS__STEP_MOCK,
    TESTBUILD__ANDROID__CONFIGURE_MAPBOX_SDK__STEP_MOCK,
    TESTBUILD__ANDROID__RUN_FASTLANE_BETA_TEST__STEP_MOCK,
    TESTBUILD__ANDROID__UPLOAD_ARTIFACT__STEP_MOCK,
];

// ios
const TESTBUILD__IOS__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'IOS', ['ref'], []);
const TESTBUILD__IOS__CONFIGURE_MAPBOX_SDK__STEP_MOCK = utils.createMockStep('Configure MapBox SDK', 'Configure MapBox SDK', 'IOS');
const TESTBUILD__IOS__CREATE_ENV_ADHOC__STEP_MOCK = utils.createMockStep(
    'Create .env.adhoc file based on staging and add PULL_REQUEST_NUMBER env to it',
    'Creating .env.adhoc file based on staging',
    'IOS',
    [],
    [],
);
const TESTBUILD__IOS__SETUP_NODE__STEP_MOCK = utils.createMockStep('Setup Node', 'Setup Node', 'IOS', [], []);
const TESTBUILD__IOS__SETUP_XCODE__STEP_MOCK = utils.createMockStep('Setup XCode', 'Setup XCode', 'IOS', [], []);
const TESTBUILD__IOS__SETUP_RUBY__STEP_MOCK = utils.createMockStep('Setup Ruby', 'Setup Ruby', 'IOS', ['ruby-version', 'bundler-cache'], []);
const TESTBUILD__IOS__CACHE_POD_DEPENDENCIES__STEP_MOCK = utils.createMockStep('Cache Pod dependencies', 'Cache Pod dependencies', 'IOS', ['path', 'key', 'restore-keys'], [], {
    'cache-hit': false,
});
const TESTBUILD__IOS__COMPARE_PODFILE_AND_MANIFEST__STEP_MOCK = utils.createMockStep('Compare Podfile.lock and Manifest.lock', 'Compare Podfile.lock and Manifest.lock', 'IOS', [], [], {
    IS_PODFILE_SAME_AS_MANIFEST: false,
});
const TESTBUILD__IOS__INSTALL_COCOAPODS__STEP_MOCK = utils.createMockStep('Install cocoapods', 'Install cocoapods', 'IOS', ['timeout_minutes', 'max_attempts', 'command'], []);
const TESTBUILD__IOS__DECRYPT_PROFILE__STEP_MOCK = utils.createMockStep('Decrypt profile', 'Decrypt profile', 'IOS', [], ['LARGE_SECRET_PASSPHRASE']);
const TESTBUILD__IOS__DECRYPT_CERTIFICATE__STEP_MOCK = utils.createMockStep('Decrypt certificate', 'Decrypt certificate', 'IOS', [], ['LARGE_SECRET_PASSPHRASE']);
const TESTBUILD__IOS__CONFIGURE_AWS_CREDENTIALS__STEP_MOCK = utils.createMockStep(
    'Configure AWS Credentials',
    'Configure AWS Credentials',
    'IOS',
    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    [],
);
const TESTBUILD__IOS__RUN_FASTLANE__STEP_MOCK = utils.createMockStep('Run Fastlane', 'Run Fastlane', 'IOS', [], ['S3_ACCESS_KEY', 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET', 'S3_REGION']);
const TESTBUILD__IOS__UPLOAD_ARTIFACT__STEP_MOCK = utils.createMockStep('Upload Artifact', 'Upload Artifact', 'IOS', ['name', 'path'], []);
const TESTBUILD__IOS__STEP_MOCKS = [
    TESTBUILD__IOS__CHECKOUT__STEP_MOCK,
    TESTBUILD__IOS__CONFIGURE_MAPBOX_SDK__STEP_MOCK,
    TESTBUILD__IOS__CREATE_ENV_ADHOC__STEP_MOCK,
    TESTBUILD__IOS__SETUP_NODE__STEP_MOCK,
    TESTBUILD__IOS__SETUP_XCODE__STEP_MOCK,
    TESTBUILD__IOS__SETUP_RUBY__STEP_MOCK,
    TESTBUILD__IOS__CACHE_POD_DEPENDENCIES__STEP_MOCK,
    TESTBUILD__IOS__COMPARE_PODFILE_AND_MANIFEST__STEP_MOCK,
    TESTBUILD__IOS__INSTALL_COCOAPODS__STEP_MOCK,
    TESTBUILD__IOS__DECRYPT_PROFILE__STEP_MOCK,
    TESTBUILD__IOS__DECRYPT_CERTIFICATE__STEP_MOCK,
    TESTBUILD__IOS__CONFIGURE_AWS_CREDENTIALS__STEP_MOCK,
    TESTBUILD__IOS__RUN_FASTLANE__STEP_MOCK,
    TESTBUILD__IOS__UPLOAD_ARTIFACT__STEP_MOCK,
];

// desktop
const TESTBUILD__DESKTOP__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'DESKTOP', ['ref'], []);
const TESTBUILD__DESKTOP__CREATE_ENV_ADHOC__STEP_MOCK = utils.createMockStep(
    'Create .env.adhoc file based on staging and add PULL_REQUEST_NUMBER env to it',
    'Creating .env.adhoc file based on staging',
    'DESKTOP',
    [],
    [],
);
const TESTBUILD__DESKTOP__SETUP_NODE__STEP_MOCK = utils.createMockStep('Setup Node', 'Setup Node', 'DESKTOP', [], []);
const TESTBUILD__DESKTOP__DECRYPT_DEVELOPER_ID_CERTIFICATE__STEP_MOCK = utils.createMockStep(
    'Decrypt Developer ID Certificate',
    'Decrypt Developer ID Certificate',
    'DESKTOP',
    [],
    ['DEVELOPER_ID_SECRET_PASSPHRASE'],
);
const TESTBUILD__DESKTOP__CONFIGURE_AWS_CREDENTIALS__STEP_MOCK = utils.createMockStep(
    'Configure AWS Credentials',
    'Configure AWS Credentials',
    'DESKTOP',
    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    [],
);
const TESTBUILD__DESKTOP__BUILD_DESKTOP_APP_FOR_TESTING__STEP_MOCK = utils.createMockStep(
    'Build desktop app for testing',
    'Build desktop app for testing',
    'DESKTOP',
    [],
    ['CSC_LINK', 'CSC_KEY_PASSWORD', 'APPLE_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
);
const TESTBUILD__DESKTOP__STEP_MOCKS = [
    TESTBUILD__DESKTOP__CHECKOUT__STEP_MOCK,
    TESTBUILD__DESKTOP__CREATE_ENV_ADHOC__STEP_MOCK,
    TESTBUILD__DESKTOP__SETUP_NODE__STEP_MOCK,
    TESTBUILD__DESKTOP__DECRYPT_DEVELOPER_ID_CERTIFICATE__STEP_MOCK,
    TESTBUILD__DESKTOP__CONFIGURE_AWS_CREDENTIALS__STEP_MOCK,
    TESTBUILD__DESKTOP__BUILD_DESKTOP_APP_FOR_TESTING__STEP_MOCK,
];

// web
const TESTBUILD__WEB__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'WEB', ['ref'], []);
const TESTBUILD__WEB__CREATE_ENV_ADHOC__STEP_MOCK = utils.createMockStep(
    'Create .env.adhoc file based on staging and add PULL_REQUEST_NUMBER env to it',
    'Creating .env.adhoc file based on staging',
    'WEB',
    [],
    [],
);
const TESTBUILD__WEB__SETUP_NODE__STEP_MOCK = utils.createMockStep('Setup Node', 'Setup Node', 'WEB', [], []);
const TESTBUILD__WEB__CONFIGURE_AWS_CREDENTIALS__STEP_MOCK = utils.createMockStep(
    'Configure AWS Credentials',
    'Configure AWS Credentials',
    'WEB',
    ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    [],
);
const TESTBUILD__WEB__BUILD_WEB_FOR_TESTING__STEP_MOCK = utils.createMockStep('Build web for testing', 'Build web for testing', 'WEB', [], []);
const TESTBUILD__WEB__BUILD_DOCS__STEP_MOCK = utils.createMockStep('Build docs', 'Build docs', 'WEB', [], []);
const TESTBUILD__WEB__DEPLOY_TO_S3_FOR_INTERNAL_TESTING__STEP_MOCK = utils.createMockStep('Deploy to S3 for internal testing', 'Deploy to S3 for internal testing', 'WEB', [], []);
const TESTBUILD__WEB__STEP_MOCKS = [
    TESTBUILD__WEB__CHECKOUT__STEP_MOCK,
    TESTBUILD__WEB__CREATE_ENV_ADHOC__STEP_MOCK,
    TESTBUILD__WEB__SETUP_NODE__STEP_MOCK,
    TESTBUILD__WEB__CONFIGURE_AWS_CREDENTIALS__STEP_MOCK,
    TESTBUILD__WEB__BUILD_WEB_FOR_TESTING__STEP_MOCK,
    TESTBUILD__WEB__BUILD_DOCS__STEP_MOCK,
    TESTBUILD__WEB__DEPLOY_TO_S3_FOR_INTERNAL_TESTING__STEP_MOCK,
];

// postgithubcomment
const TESTBUILD__POSTGITHUBCOMMENT__CHECKOUT__STEP_MOCK = utils.createMockStep('Checkout', 'Checkout', 'POSTGITHUBCOMMENT', ['ref'], []);
const TESTBUILD__POSTGITHUBCOMMENT__DOWNLOAD_ARTIFACT__STEP_MOCK = utils.createMockStep('Download Artifact', 'Download Artifact', 'POSTGITHUBCOMMENT', [], []);
const TESTBUILD__POSTGITHUBCOMMENT__READ_JSONS_WITH_ANDROID_PATHS__STEP_MOCK = utils.createMockStep(
    'Read JSONs with android paths',
    'Read JSONs with android paths',
    'POSTGITHUBCOMMENT',
    [],
    [],
    {android_path: 'http://dummy.android.link'},
);
const TESTBUILD__POSTGITHUBCOMMENT__READ_JSONS_WITH_IOS_PATHS__STEP_MOCK = utils.createMockStep('Read JSONs with iOS paths', 'Read JSONs with iOS paths', 'POSTGITHUBCOMMENT', [], [], {
    ios_path: 'http://dummy.ios.link',
});
const TESTBUILD__POSTGITHUBCOMMENT__MAINTAIN_COMMENT__STEP_MOCK = utils.createMockStep(
    'maintain-comment',
    'maintain-comment',
    'POSTGITHUBCOMMENT',
    ['token', 'body-include', 'number', 'delete'],
    [],
);
const TESTBUILD__POSTGITHUBCOMMENT__PUBLISH_LINKS_TO_APPS_FOR_DOWNLOAD__STEP_MOCK = utils.createMockStep(
    'Publish links to apps for download',
    'Publish links to apps for download',
    'POSTGITHUBCOMMENT',
    ['PR_NUMBER', 'GITHUB_TOKEN', 'ANDROID', 'DESKTOP', 'IOS', 'WEB', 'ANDROID_LINK', 'DESKTOP_LINK', 'IOS_LINK', 'WEB_LINK'],
    [],
);
const TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS = [
    TESTBUILD__POSTGITHUBCOMMENT__CHECKOUT__STEP_MOCK,
    TESTBUILD__POSTGITHUBCOMMENT__DOWNLOAD_ARTIFACT__STEP_MOCK,
    TESTBUILD__POSTGITHUBCOMMENT__READ_JSONS_WITH_ANDROID_PATHS__STEP_MOCK,
    TESTBUILD__POSTGITHUBCOMMENT__READ_JSONS_WITH_IOS_PATHS__STEP_MOCK,
    TESTBUILD__POSTGITHUBCOMMENT__MAINTAIN_COMMENT__STEP_MOCK,
    TESTBUILD__POSTGITHUBCOMMENT__PUBLISH_LINKS_TO_APPS_FOR_DOWNLOAD__STEP_MOCK,
];

module.exports = {
    TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
    TESTBUILD__VALIDATEACTOR__TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
    TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_HAS_FLAG__STEP_MOCKS,
    TESTBUILD__VALIDATEACTOR__NO_TEAM_MEMBER_NO_FLAG__STEP_MOCKS,
    TESTBUILD__GETBRANCHREF__STEP_MOCKS,
    TESTBUILD__ANDROID__STEP_MOCKS,
    TESTBUILD__IOS__STEP_MOCKS,
    TESTBUILD__DESKTOP__STEP_MOCKS,
    TESTBUILD__WEB__STEP_MOCKS,
    TESTBUILD__POSTGITHUBCOMMENT__STEP_MOCKS,
};
