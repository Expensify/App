const utils = require('../utils/utils');

const assertVerifyActorJobExecuted = (workflowResult, username, didExecute = true) => {
    const steps = [utils.createStepAssertion('Check if user is deployer', true, null, 'VALIDATE_ACTOR', 'Checking if the user is a deployer', [], [{key: 'GITHUB_TOKEN', value: '***'}])];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertDeployChecklistJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [utils.createStepAssertion('deployChecklist', true, null, 'DEPLOY_CHECKLIST', 'Run deployChecklist')];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertAndroidJobExecuted = (workflowResult, didExecute = true, isProduction = true, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'ANDROID', 'Checking out'),
        utils.createStepAssertion('Configure MapBox SDK', true, null, 'ANDROID', 'Configure MapBox SDK'),
        utils.createStepAssertion('Setup Node', true, null, 'ANDROID', 'Setting up Node'),
        utils.createStepAssertion('Setup Ruby', true, null, 'ANDROID', 'Setting up Ruby', [
            {key: 'ruby-version', value: '2.7'},
            {key: 'bundler-cache', value: 'true'},
        ]),
        utils.createStepAssertion('Decrypt keystore', true, null, 'ANDROID', 'Decrypting keystore', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        utils.createStepAssertion('Decrypt json key', true, null, 'ANDROID', 'Decrypting JSON key', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        utils.createStepAssertion('Set version in ENV', true, null, 'ANDROID', 'Setting version in ENV'),
    ];
    if (!isProduction) {
        steps.push(
            utils.createStepAssertion('Run Fastlane beta', true, null, 'ANDROID', 'Running Fastlane beta', null, [
                {key: 'MYAPP_UPLOAD_STORE_PASSWORD', value: '***'},
                {key: 'MYAPP_UPLOAD_KEY_PASSWORD', value: '***'},
            ]),
        );
    } else {
        steps.push(utils.createStepAssertion('Run Fastlane production', true, null, 'ANDROID', 'Running Fastlane production', null, [{key: 'VERSION', value: '1.2.3'}]));
    }
    steps.push(
        utils.createStepAssertion('Archive Android sourcemaps', true, null, 'ANDROID', 'Archiving Android sourcemaps', [
            {key: 'name', value: 'android-sourcemap'},
            {key: 'path', value: 'android/app/build/generated/sourcemaps/react/release/*.map'},
        ]),
    );
    if (!isProduction) {
        steps.push(
            utils.createStepAssertion('Upload Android version to GitHub artifacts', true, null, 'ANDROID', 'Upload Android version to GitHub artifacts', [
                {key: 'name', value: 'app-production-release.aab'},
                {key: 'path', value: 'android/app/build/outputs/bundle/productionRelease/app-production-release.aab'},
            ]),
            utils.createStepAssertion('Upload Android version to Browser Stack', true, null, 'ANDROID', 'Uploading Android version to Browser Stack', null, [
                {key: 'BROWSERSTACK', value: '***'},
            ]),
        );
    }

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failProdSteps = [
        utils.createStepAssertion(
            'Warn deployers if Android production deploy failed',
            true,
            null,
            'ANDROID',
            'Warning deployers of failed production deploy',
            [{key: 'status', value: 'custom'}],
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'SLACK_WEBHOOK_URL', value: '***'},
            ],
        ),
    ];

    failProdSteps.forEach((expectedStep) => {
        if (didExecute && isProduction && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertDesktopJobExecuted = (workflowResult, didExecute = true, isProduction = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'DESKTOP', 'Checking out'),
        utils.createStepAssertion('Setup Node', true, null, 'DESKTOP', 'Setting up Node'),
        utils.createStepAssertion('Decrypt Developer ID Certificate', true, null, 'DESKTOP', 'Decrypting developer id certificate', null, [
            {key: 'DEVELOPER_ID_SECRET_PASSPHRASE', value: '***'},
        ]),
    ];
    if (isProduction) {
        steps.push(
            utils.createStepAssertion('Build production desktop app', true, null, 'DESKTOP', 'Building production desktop app', null, [
                {key: 'CSC_LINK', value: '***'},
                {key: 'CSC_KEY_PASSWORD', value: '***'},
                {key: 'APPLE_ID', value: '***'},
                {key: 'APPLE_APP_SPECIFIC_PASSWORD', value: '***'},
                {key: 'AWS_ACCESS_KEY_ID', value: '***'},
                {key: 'AWS_SECRET_ACCESS_KEY', value: '***'},
            ]),
        );
    } else {
        steps.push(
            utils.createStepAssertion('Build staging desktop app', true, null, 'DESKTOP', 'Building staging desktop app', null, [
                {key: 'CSC_LINK', value: '***'},
                {key: 'CSC_KEY_PASSWORD', value: '***'},
                {key: 'APPLE_ID', value: '***'},
                {key: 'APPLE_APP_SPECIFIC_PASSWORD', value: '***'},
                {key: 'AWS_ACCESS_KEY_ID', value: '***'},
                {key: 'AWS_SECRET_ACCESS_KEY', value: '***'},
            ]),
        );
    }

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertIOSJobExecuted = (workflowResult, didExecute = true, isProduction = true, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'IOS', 'Checking out'),
        utils.createStepAssertion('Configure MapBox SDK', true, null, 'IOS', 'Configure MapBox SDK'),
        utils.createStepAssertion('Setup Node', true, null, 'IOS', 'Setting up Node'),
        utils.createStepAssertion('Setup Ruby', true, null, 'IOS', 'Setting up Ruby', [
            {key: 'ruby-version', value: '2.7'},
            {key: 'bundler-cache', value: 'true'},
        ]),
        utils.createStepAssertion('Cache Pod dependencies', true, null, 'IOS', 'Cache Pod dependencies', [
            {key: 'path', value: 'ios/Pods'},
            {key: 'key', value: 'Linux-pods-cache-'},
            {key: 'restore-keys', value: 'Linux-pods-cache-'},
        ]),
        utils.createStepAssertion('Compare Podfile.lock and Manifest.lock', true, null, 'IOS', 'Compare Podfile.lock and Manifest.lock'),
        utils.createStepAssertion('Install cocoapods', true, null, 'IOS', 'Installing cocoapods', [
            {key: 'timeout_minutes', value: '10'},
            {key: 'max_attempts', value: '5'},
            {key: 'command', value: 'cd ios && bundle exec pod install'},
        ]),
        utils.createStepAssertion('Decrypt profile', true, null, 'IOS', 'Decrypting profile', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        utils.createStepAssertion('Decrypt certificate', true, null, 'IOS', 'Decrypting certificate', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        utils.createStepAssertion('Decrypt App Store Connect API key', true, null, 'IOS', 'Decrypting App Store API key', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
    ];
    if (!isProduction) {
        steps.push(
            utils.createStepAssertion('Run Fastlane', true, null, 'IOS', 'Running Fastlane', null, [
                {key: 'APPLE_CONTACT_EMAIL', value: '***'},
                {key: 'APPLE_CONTACT_PHONE', value: '***'},
                {key: 'APPLE_DEMO_EMAIL', value: '***'},
                {key: 'APPLE_DEMO_PASSWORD', value: '***'},
            ]),
        );
    }
    steps.push(
        utils.createStepAssertion('Archive iOS sourcemaps', true, null, 'IOS', 'Archiving sourcemaps', [
            {key: 'name', value: 'ios-sourcemap'},
            {key: 'path', value: 'main.jsbundle.map'},
        ]),
    );
    if (!isProduction) {
        steps.push(
            utils.createStepAssertion('Upload iOS version to GitHub artifacts', true, null, 'IOS', 'Upload iOS version to GitHub artifacts', [
                {key: 'name', value: 'New Expensify.ipa'},
                {key: 'path', value: '/Users/runner/work/App/App/New Expensify.ipa'},
            ]),
            utils.createStepAssertion('Upload iOS version to Browser Stack', true, null, 'IOS', 'Uploading version to Browser Stack', null, [{key: 'BROWSERSTACK', value: '***'}]),
        );
    } else {
        steps.push(
            utils.createStepAssertion('Set iOS version in ENV', true, null, 'IOS', 'Setting iOS version'),
            utils.createStepAssertion('Run Fastlane for App Store release', true, null, 'IOS', 'Running Fastlane for release', null, [{key: 'VERSION', value: '1.2.3'}]),
        );
    }

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failProdSteps = [
        utils.createStepAssertion(
            'Warn deployers if iOS production deploy failed',
            true,
            null,
            'IOS',
            'Warning developers of failed deploy',
            [{key: 'status', value: 'custom'}],
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'SLACK_WEBHOOK_URL', value: '***'},
            ],
        ),
    ];

    failProdSteps.forEach((expectedStep) => {
        if (didExecute && isProduction && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertWebJobExecuted = (workflowResult, didExecute = true, isProduction = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'WEB', 'Checking out'),
        utils.createStepAssertion('Setup Node', true, null, 'WEB', 'Setting up Node'),
        utils.createStepAssertion('Setup Cloudflare CLI', true, null, 'WEB', 'Setting up Cloudflare CLI'),
        utils.createStepAssertion('Configure AWS Credentials', true, null, 'WEB', 'Configuring AWS credentials', [
            {key: 'AWS_ACCESS_KEY_ID', value: '***'},
            {key: 'AWS_SECRET_ACCESS_KEY', value: '***'},
        ]),
    ];
    if (isProduction) {
        steps.push(
            utils.createStepAssertion('Build web for production', true, null, 'WEB', 'Building web for production'),
            utils.createStepAssertion('Build storybook docs for production', true, null, 'WEB', 'Build storybook docs for production'),
            utils.createStepAssertion('Deploy production to S3', true, null, 'WEB', 'Deploying production to S3'),
            utils.createStepAssertion('Purge production Cloudflare cache', true, null, 'WEB', 'Purging production Cloudflare cache', null, [{key: 'CF_API_KEY', value: '***'}]),
        );
    } else {
        steps.push(
            utils.createStepAssertion('Build web for staging', true, null, 'WEB', 'Building web for staging'),
            utils.createStepAssertion('Build storybook docs for staging', true, null, 'WEB', 'Build storybook docs for staging'),
            utils.createStepAssertion('Deploy staging to S3', true, null, 'WEB', 'Deploying staging to S3'),
            utils.createStepAssertion('Purge staging Cloudflare cache', true, null, 'WEB', 'Purging staging Cloudflare cache', null, [{key: 'CF_API_KEY', value: '***'}]),
        );
    }

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertPostSlackOnFailureJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.createStepAssertion('Post Slack message on failure', true, null, 'POST_SLACK_FAIL', 'Posting Slack message on platform deploy failure', [{key: 'SLACK_WEBHOOK', value: '***'}]),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertPostSlackOnSuccessJobExecuted = (workflowResult, didExecute = true, isProduction = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'POST_SLACK_SUCCESS', 'Checking out'),
        utils.createStepAssertion('Set version', true, null, 'POST_SLACK_SUCCESS', 'Setting version'),
        utils.createStepAssertion(
            'Announces the deploy in the #announce Slack room',
            true,
            null,
            'POST_SLACK_SUCCESS',
            'Posting message to #announce channel',
            [{key: 'status', value: 'custom'}],
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'SLACK_WEBHOOK_URL', value: '***'},
            ],
        ),
        utils.createStepAssertion(
            'Announces the deploy in the #deployer Slack room',
            true,
            null,
            'POST_SLACK_SUCCESS',
            'Posting message to #deployer channel',
            [{key: 'status', value: 'custom'}],
            [
                {key: 'GITHUB_TOKEN', value: '***'},
                {key: 'SLACK_WEBHOOK_URL', value: '***'},
            ],
        ),
    ];
    if (isProduction) {
        steps.push(
            utils.createStepAssertion(
                'Announces the deploy in the #expensify-open-source Slack room',
                true,
                null,
                'POST_SLACK_SUCCESS',
                'Posting message to #expensify-open-source channel',
                [{key: 'status', value: 'custom'}],
                [
                    {key: 'GITHUB_TOKEN', value: '***'},
                    {key: 'SLACK_WEBHOOK_URL', value: '***'},
                ],
            ),
        );
    }

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

const assertPostGithubCommentJobExecuted = (workflowResult, didExecute = true, isProduction = true, didDeploy = true) => {
    const steps = [
        utils.createStepAssertion('Checkout', true, null, 'POST_GITHUB_COMMENT', 'Checking out'),
        utils.createStepAssertion('Setup Node', true, null, 'POST_GITHUB_COMMENT', 'Setting up Node'),
        utils.createStepAssertion('Set version', true, null, 'POST_GITHUB_COMMENT', 'Setting version'),
        utils.createStepAssertion('Get Release Pull Request List', true, null, 'POST_GITHUB_COMMENT', 'Getting release pull request list', [
            {key: 'TAG', value: '1.2.3'},
            {key: 'GITHUB_TOKEN', value: '***'},
            {key: 'IS_PRODUCTION_DEPLOY', value: isProduction ? 'true' : 'false'},
        ]),
        utils.createStepAssertion('Comment on issues', true, null, 'POST_GITHUB_COMMENT', 'Commenting on issues', [
            {key: 'PR_LIST', value: '[1.2.1, 1.2.2]'},
            {key: 'IS_PRODUCTION_DEPLOY', value: isProduction ? 'true' : 'false'},
            {key: 'DEPLOY_VERSION', value: '1.2.3'},
            {key: 'GITHUB_TOKEN', value: '***'},
            {key: 'ANDROID', value: didDeploy ? 'success' : ''},
            {key: 'DESKTOP', value: didDeploy ? 'success' : ''},
            {key: 'IOS', value: didDeploy ? 'success' : ''},
            {key: 'WEB', value: didDeploy ? 'success' : ''},
        ]),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
};

module.exports = {
    assertVerifyActorJobExecuted,
    assertDeployChecklistJobExecuted,
    assertAndroidJobExecuted,
    assertDesktopJobExecuted,
    assertIOSJobExecuted,
    assertWebJobExecuted,
    assertPostSlackOnFailureJobExecuted,
    assertPostSlackOnSuccessJobExecuted,
    assertPostGithubCommentJobExecuted,
};
