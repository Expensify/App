import type {Step} from '@kie/act-js';
import {createStepAssertion} from '../utils/utils';

function assertVerifyActorJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('Check if user is deployer', true, null, 'VALIDATE_ACTOR', 'Checking if the user is a deployer', [], [{key: 'GITHUB_TOKEN', value: '***'}])] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertDeployChecklistJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [createStepAssertion('deployChecklist', true, null, 'DEPLOY_CHECKLIST', 'Run deployChecklist')] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertAndroidJobExecuted(workflowResult: Step[], didExecute = true, isProduction = true, isSuccessful = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'ANDROID', 'Checking out'),
        createStepAssertion('Configure MapBox SDK', true, null, 'ANDROID', 'Configure MapBox SDK'),
        createStepAssertion('Setup Node', true, null, 'ANDROID', 'Setting up Node'),
        createStepAssertion(
            'Setup Java',
            true,
            null,
            'ANDROID',
            'Setup Java',
            [
                {key: 'distribution', value: 'oracle'},
                {key: 'java-version', value: '17'},
            ],
            [],
        ),
        createStepAssertion('Setup Ruby', true, null, 'ANDROID', 'Setting up Ruby', [
            {key: 'ruby-version', value: '2.7'},
            {key: 'bundler-cache', value: 'true'},
        ]),
        createStepAssertion('Decrypt keystore', true, null, 'ANDROID', 'Decrypting keystore', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion('Decrypt json key', true, null, 'ANDROID', 'Decrypting JSON key', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion('Set version in ENV', true, null, 'ANDROID', 'Setting version in ENV'),
    ];

    if (!isProduction) {
        steps.push(
            createStepAssertion('Run Fastlane beta', true, null, 'ANDROID', 'Running Fastlane beta', null, [
                {key: 'MYAPP_UPLOAD_STORE_PASSWORD', value: '***'},
                {key: 'MYAPP_UPLOAD_KEY_PASSWORD', value: '***'},
            ]),
        );
    } else {
        steps.push(createStepAssertion('Run Fastlane production', true, null, 'ANDROID', 'Running Fastlane production', null, [{key: 'VERSION', value: '1.2.3'}]));
    }
    steps.push(
        createStepAssertion('Archive Android sourcemaps', true, null, 'ANDROID', 'Archiving Android sourcemaps', [
            {key: 'name', value: 'android-sourcemap'},
            {key: 'path', value: 'android/app/build/generated/sourcemaps/react/release/*.map'},
        ]),
    );
    if (!isProduction) {
        steps.push(
            createStepAssertion('Upload Android version to GitHub artifacts', true, null, 'ANDROID', 'Upload Android version to GitHub artifacts', [
                {key: 'name', value: 'app-production-release.aab'},
                {key: 'path', value: 'android/app/build/outputs/bundle/productionRelease/app-production-release.aab'},
            ]),
            createStepAssertion('Upload Android version to Browser Stack', true, null, 'ANDROID', 'Uploading Android version to Browser Stack', null, [{key: 'BROWSERSTACK', value: '***'}]),
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
        createStepAssertion(
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
    ] as const;

    failProdSteps.forEach((expectedStep) => {
        if (didExecute && isProduction && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertDesktopJobExecuted(workflowResult: Step[], didExecute = true, isProduction = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'DESKTOP', 'Checking out'),
        createStepAssertion('Setup Node', true, null, 'DESKTOP', 'Setting up Node'),
        createStepAssertion('Decrypt Developer ID Certificate', true, null, 'DESKTOP', 'Decrypting developer id certificate', null, [{key: 'DEVELOPER_ID_SECRET_PASSPHRASE', value: '***'}]),
    ];

    if (isProduction) {
        steps.push(
            createStepAssertion('Build production desktop app', true, null, 'DESKTOP', 'Building production desktop app', null, [
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
            createStepAssertion('Build staging desktop app', true, null, 'DESKTOP', 'Building staging desktop app', null, [
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
}

function assertIOSJobExecuted(workflowResult: Step[], didExecute = true, isProduction = true, isSuccessful = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'IOS', 'Checking out'),
        createStepAssertion('Configure MapBox SDK', true, null, 'IOS', 'Configure MapBox SDK'),
        createStepAssertion('Setup Node', true, null, 'IOS', 'Setting up Node'),
        createStepAssertion('Setup Ruby', true, null, 'IOS', 'Setting up Ruby', [
            {key: 'ruby-version', value: '2.7'},
            {key: 'bundler-cache', value: 'true'},
        ]),
        createStepAssertion('Cache Pod dependencies', true, null, 'IOS', 'Cache Pod dependencies', [
            {key: 'path', value: 'ios/Pods'},
            {key: 'key', value: 'Linux-pods-cache-'},
            {key: 'restore-keys', value: 'Linux-pods-cache-'},
        ]),
        createStepAssertion('Compare Podfile.lock and Manifest.lock', true, null, 'IOS', 'Compare Podfile.lock and Manifest.lock'),
        createStepAssertion('Install cocoapods', true, null, 'IOS', 'Installing cocoapods', [
            {key: 'timeout_minutes', value: '10'},
            {key: 'max_attempts', value: '5'},
            {key: 'command', value: 'cd ios && bundle exec pod install'},
        ]),
        createStepAssertion('Decrypt AppStore profile', true, null, 'IOS', 'Decrypting profile', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion('Decrypt AppStore Notification Service profile', true, null, 'IOS', 'Decrypting profile', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion('Decrypt certificate', true, null, 'IOS', 'Decrypting certificate', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
        createStepAssertion('Decrypt App Store Connect API key', true, null, 'IOS', 'Decrypting App Store API key', null, [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}]),
    ];

    if (!isProduction) {
        steps.push(
            createStepAssertion('Run Fastlane', true, null, 'IOS', 'Running Fastlane', null, [
                {key: 'APPLE_CONTACT_EMAIL', value: '***'},
                {key: 'APPLE_CONTACT_PHONE', value: '***'},
                {key: 'APPLE_DEMO_EMAIL', value: '***'},
                {key: 'APPLE_DEMO_PASSWORD', value: '***'},
            ]),
        );
    }
    steps.push(
        createStepAssertion('Archive iOS sourcemaps', true, null, 'IOS', 'Archiving sourcemaps', [
            {key: 'name', value: 'ios-sourcemap'},
            {key: 'path', value: 'main.jsbundle.map'},
        ]),
    );
    if (!isProduction) {
        steps.push(
            createStepAssertion('Upload iOS version to GitHub artifacts', true, null, 'IOS', 'Upload iOS version to GitHub artifacts', [
                {key: 'name', value: 'New Expensify.ipa'},
                {key: 'path', value: '/Users/runner/work/App/App/New Expensify.ipa'},
            ]),
            createStepAssertion('Upload iOS version to Browser Stack', true, null, 'IOS', 'Uploading version to Browser Stack', null, [{key: 'BROWSERSTACK', value: '***'}]),
        );
    } else {
        steps.push(
            createStepAssertion('Set iOS version in ENV', true, null, 'IOS', 'Setting iOS version'),
            createStepAssertion('Run Fastlane for App Store release', true, null, 'IOS', 'Running Fastlane for release', null, [{key: 'VERSION', value: '1.2.3'}]),
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
        createStepAssertion(
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
    ] as const;

    failProdSteps.forEach((expectedStep) => {
        if (didExecute && isProduction && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertWebJobExecuted(workflowResult: Step[], didExecute = true, isProduction = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'WEB', 'Checking out'),
        createStepAssertion('Setup Node', true, null, 'WEB', 'Setting up Node'),
        createStepAssertion('Setup Cloudflare CLI', true, null, 'WEB', 'Setting up Cloudflare CLI'),
        createStepAssertion('Configure AWS Credentials', true, null, 'WEB', 'Configuring AWS credentials', [
            {key: 'aws-access-key-id', value: '***'},
            {key: 'aws-secret-access-key', value: '***'},
            {key: 'aws-region', value: 'us-east-1'},
        ]),
    ];

    if (isProduction) {
        steps.push(
            createStepAssertion('Build web for production', true, null, 'WEB', 'Building web for production'),
            createStepAssertion('Build storybook docs for production', true, null, 'WEB', 'Build storybook docs for production'),
            createStepAssertion('Deploy production to S3', true, null, 'WEB', 'Deploying production to S3'),
            createStepAssertion('Purge production Cloudflare cache', true, null, 'WEB', 'Purging production Cloudflare cache', null, [{key: 'CF_API_KEY', value: '***'}]),
        );
    } else {
        steps.push(
            createStepAssertion('Build web for staging', true, null, 'WEB', 'Building web for staging'),
            createStepAssertion('Build storybook docs for staging', true, null, 'WEB', 'Build storybook docs for staging'),
            createStepAssertion('Deploy staging to S3', true, null, 'WEB', 'Deploying staging to S3'),
            createStepAssertion('Purge staging Cloudflare cache', true, null, 'WEB', 'Purging staging Cloudflare cache', null, [{key: 'CF_API_KEY', value: '***'}]),
        );
    }

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertPostSlackOnFailureJobExecuted(workflowResult: Step[], didExecute = true) {
    const steps = [
        createStepAssertion('Post Slack message on failure', true, null, 'POST_SLACK_FAIL', 'Posting Slack message on platform deploy failure', [{key: 'SLACK_WEBHOOK', value: '***'}]),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

function assertPostSlackOnSuccessJobExecuted(workflowResult: Step[], didExecute = true, isProduction = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'POST_SLACK_SUCCESS', 'Checking out'),
        createStepAssertion('Set version', true, null, 'POST_SLACK_SUCCESS', 'Setting version'),
        createStepAssertion(
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
        createStepAssertion(
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
            createStepAssertion(
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
}

function assertPostGithubCommentJobExecuted(workflowResult: Step[], didExecute = true, isProduction = true, didDeploy = true) {
    const steps = [
        createStepAssertion('Checkout', true, null, 'POST_GITHUB_COMMENT', 'Checking out'),
        createStepAssertion('Setup Node', true, null, 'POST_GITHUB_COMMENT', 'Setting up Node'),
        createStepAssertion('Set version', true, null, 'POST_GITHUB_COMMENT', 'Setting version'),
        createStepAssertion('Get Release Pull Request List', true, null, 'POST_GITHUB_COMMENT', 'Getting release pull request list', [
            {key: 'TAG', value: '1.2.3'},
            {key: 'GITHUB_TOKEN', value: '***'},
            {key: 'IS_PRODUCTION_DEPLOY', value: isProduction ? 'true' : 'false'},
        ]),
        createStepAssertion('Comment on issues', true, null, 'POST_GITHUB_COMMENT', 'Commenting on issues', [
            {key: 'PR_LIST', value: '[1.2.1, 1.2.2]'},
            {key: 'IS_PRODUCTION_DEPLOY', value: isProduction ? 'true' : 'false'},
            {key: 'DEPLOY_VERSION', value: '1.2.3'},
            {key: 'GITHUB_TOKEN', value: '***'},
            {key: 'ANDROID', value: didDeploy ? 'success' : ''},
            {key: 'DESKTOP', value: didDeploy ? 'success' : ''},
            {key: 'IOS', value: didDeploy ? 'success' : ''},
            {key: 'WEB', value: didDeploy ? 'success' : ''},
        ]),
    ] as const;

    steps.forEach((expectedStep) => {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });
}

export default {
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
