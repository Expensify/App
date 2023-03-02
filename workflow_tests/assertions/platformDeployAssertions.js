const utils = require('../utils');

const assertVerifyActorJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Check if user is deployer',
            true,
            null,
            'VALIDATE_ACTOR',
            'Checking if the user is a deployer',
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'team', value: 'mobile-deployers'}],
        ),
    ];
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

const assertAndroidJobExecuted = (workflowResult, didExecute = true, isProduction = true, isSuccessful = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'ANDROID',
            'Checking out',
            [{key: 'fetch-depth', value: '0'}],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'ANDROID',
            'Setting up Node',
        ),
        utils.getStepAssertion(
            'Setup Ruby',
            true,
            null,
            'ANDROID',
            'Setting up Ruby',
            [{key: 'ruby-version', value: '2.7'}, {key: 'bundler-cache', value: 'true'}],
        ),
        utils.getStepAssertion(
            'Decrypt keystore',
            true,
            null,
            'ANDROID',
            'Decrypting keystore',
            null,
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Decrypt json key',
            true,
            null,
            'ANDROID',
            'Decrypting JSON key',
            null,
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Set version in ENV',
            true,
            null,
            'ANDROID',
            'Setting version in ENV',
        ),
    ];
    if (!isProduction) {
        steps.push(
            utils.getStepAssertion(
                'Run Fastlane beta',
                true,
                null,
                'ANDROID',
                'Running Fastlane beta',
                null,
                [{key: 'MYAPP_UPLOAD_STORE_PASSWORD', value: '***'}, {key: 'MYAPP_UPLOAD_KEY_PASSWORD', value: '***'}],
            ),
        );
    } else {
        steps.push(
            utils.getStepAssertion(
                'Run Fastlane production',
                true,
                null,
                'ANDROID',
                'Running Fastlane production',
                null,
                [{key: 'VERSION', value: '1.2.3'}],
            ),
        );
    }
    steps.push(
        utils.getStepAssertion(
            'Archive Android sourcemaps',
            true,
            null,
            'ANDROID',
            'Archiving Android sourcemaps',
            [{key: 'name', value: 'android-sourcemap'}, {key: 'path', value: 'android/app/build/generated/sourcemaps/react/release/*.map'}],
        ),
    );
    if (!isProduction) {
        steps.push(
            utils.getStepAssertion(
                'Upload Android version to Browser Stack',
                true,
                null,
                'ANDROID',
                'Uploading Android version to Browser Stack',
                null,
                [{key: 'BROWSERSTACK', value: '***'}],
            ),
        );
    }
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }

    const failProdSteps = [
        utils.getStepAssertion(
            'Warn deployers if Android production deploy failed',
            true,
            null,
            'ANDROID',
            'Warning deployers of failed production deploy',
            [{key: 'status', value: 'custom'}, {key: 'custom_payload', value: '{\n  channel: \'#deployer\',\n  attachments: [{\n    color: "#DB4545",\n    pretext: `<!subteam^S4TJJ3PSL>`,\n    text: `💥 Android production deploy failed. Please manually submit 1.2.3 in the <https://play.google.com/console/u/0/developers/8765590895836334604/app/4973041797096886180/releases/overview|Google Play Store>. 💥`,\n  }]\n}'}],
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'SLACK_WEBHOOK_URL', value: '***'}],
        ),
    ];
    if (didExecute && isProduction && !isSuccessful) {
        expect(workflowResult).toEqual(expect.arrayContaining(failProdSteps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(failProdSteps));
    }
};

const assertDesktopJobExecuted = (workflowResult, didExecute = true, isProduction = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'DESKTOP',
            'Checking out',
            [{key: 'fetch-depth', value: '0'}],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'DESKTOP',
            'Setting up Node',
        ),
        utils.getStepAssertion(
            'Decrypt Developer ID Certificate',
            true,
            null,
            'DESKTOP',
            'Decrypting developer id certificate',
            null,
            [{key: 'DEVELOPER_ID_SECRET_PASSPHRASE', value: '***'}],
        ),
    ];
    if (isProduction) {
        steps.push(
            utils.getStepAssertion(
                'Build production desktop app',
                true,
                null,
                'DESKTOP',
                'Building production desktop app',
                null,
                [{key: 'CSC_LINK', value: '***'}, {key: 'CSC_KEY_PASSWORD', value: '***'}, {key: 'APPLE_ID', value: '***'}, {key: 'APPLE_ID_PASSWORD', value: '***'}, {key: 'AWS_ACCESS_KEY_ID', value: '***'}, {key: 'AWS_SECRET_ACCESS_KEY', value: '***'}],
            ),
        );
    } else {
        steps.push(
            utils.getStepAssertion(
                'Build staging desktop app',
                true,
                null,
                'DESKTOP',
                'Building staging desktop app',
                null,
                [{key: 'CSC_LINK', value: '***'}, {key: 'CSC_KEY_PASSWORD', value: '***'}, {key: 'APPLE_ID', value: '***'}, {key: 'APPLE_ID_PASSWORD', value: '***'}, {key: 'AWS_ACCESS_KEY_ID', value: '***'}, {key: 'AWS_SECRET_ACCESS_KEY', value: '***'}],
            ),
        );
    }

    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

const assertIOSJobExecuted = (workflowResult, didExecute = true, isProduction = true, isSuccessful = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'IOS',
            'Checking out',
            [{key: 'fetch-depth', value: '0'}],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'IOS',
            'Setting up Node',
        ),
        utils.getStepAssertion(
            'Setup Ruby',
            true,
            null,
            'IOS',
            'Setting up Ruby',
            [{key: 'ruby-version', value: '2.7'}, {key: 'bundler-cache', value: 'true'}],
        ),
        utils.getStepAssertion(
            'Install cocoapods',
            true,
            null,
            'IOS',
            'Installing cocoapods',
            [{key: 'timeout_minutes', value: '10'}, {key: 'max_attempts', value: '5'}, {key: 'command', value: 'cd ios && pod install'}],
        ),
        utils.getStepAssertion(
            'Decrypt profile',
            true,
            null,
            'IOS',
            'Decrypting profile',
            null,
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Decrypt certificate',
            true,
            null,
            'IOS',
            'Decrypting certificate',
            null,
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
        utils.getStepAssertion(
            'Decrypt App Store Connect API key',
            true,
            null,
            'IOS',
            'Decrypting App Store API key',
            null,
            [{key: 'LARGE_SECRET_PASSPHRASE', value: '***'}],
        ),
    ];
    if (!isProduction) {
        steps.push(
            utils.getStepAssertion(
                'Run Fastlane',
                true,
                null,
                'IOS',
                'Running Fastlane',
                null,
                [{key: 'APPLE_CONTACT_EMAIL', value: '***'}, {key: 'APPLE_CONTACT_PHONE', value: '***'}, {key: 'APPLE_DEMO_EMAIL', value: '***'}, {key: 'APPLE_DEMO_PASSWORD', value: '***'}],
            ),
        );
    }
    steps.push(
        utils.getStepAssertion(
            'Archive iOS sourcemaps',
            true,
            null,
            'IOS',
            'Archiving sourcemaps',
            [{key: 'name', value: 'ios-sourcemap'}, {key: 'path', value: 'main.jsbundle.map'}],
        ),
    );
    if (!isProduction) {
        steps.push(
            utils.getStepAssertion(
                'Upload iOS version to Browser Stack',
                true,
                null,
                'IOS',
                'Uploading version to Browser Stack',
                null,
                [{key: 'BROWSERSTACK', value: '***'}],
            ),
        );
    } else {
        steps.push(
            utils.getStepAssertion(
                'Set iOS version in ENV',
                true,
                null,
                'IOS',
                'Setting iOS version',
            ),
            utils.getStepAssertion(
                'Run Fastlane for App Store release',
                true,
                null,
                'IOS',
                'Running Fastlane for release',
                null,
                [{key: 'VERSION', value: '1.2.3'}],
            ),
        );
    }
    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }

    const failProdSteps = [
        utils.getStepAssertion(
            'Warn deployers if iOS production deploy failed',
            true,
            null,
            'IOS',
            'Warning developers of failed deploy',
            [{key: 'status', value: 'custom'}, {key: 'custom_payload', value: '{\n  channel: \'#deployer\',\n  attachments: [{\n    color: "#DB4545",\n    pretext: `<!subteam^S4TJJ3PSL>`,\n    text: `💥 iOS production deploy failed. Please manually submit 1.2.3 in the <https://appstoreconnect.apple.com/apps/1530278510/appstore|App Store>. 💥`,\n  }]\n}'}],
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'SLACK_WEBHOOK_URL', value: '***'}],
        ),
    ];
    if (didExecute && isProduction && !isSuccessful) {
        expect(workflowResult).toEqual(expect.arrayContaining(failProdSteps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(failProdSteps));
    }
};

const assertWebJobExecuted = (workflowResult, didExecute = true, isProduction = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'WEB',
            'Checking out',
            [{key: 'fetch-depth', value: '0'}],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'WEB',
            'Setting up Node',
        ),
        utils.getStepAssertion(
            'Setup Cloudflare CLI',
            true,
            null,
            'WEB',
            'Setting up Cloudflare CLI',
        ),
        utils.getStepAssertion(
            'Configure AWS Credentials',
            true,
            null,
            'WEB',
            'Configuring AWS credentials',
            [{key: 'AWS_ACCESS_KEY_ID', value: '***'}, {key: 'AWS_SECRET_ACCESS_KEY', value: '***'}],
        ),
    ];
    if (isProduction) {
        steps.push(
            utils.getStepAssertion(
                'Build web for production',
                true,
                null,
                'WEB',
                'Building web for production',
            ),
        );
    } else {
        steps.push(
            utils.getStepAssertion(
                'Build web for staging',
                true,
                null,
                'WEB',
                'Building web for staging',
            ),
        );
    }
    steps.push(
        utils.getStepAssertion(
            'Build docs',
            true,
            null,
            'WEB',
            'Building docs',
        ),
    );
    if (isProduction) {
        steps.push(
            utils.getStepAssertion(
                'Deploy production to S3',
                true,
                null,
                'WEB',
                'Deploying production to S3',
            ),
            utils.getStepAssertion(
                'Purge production Cloudflare cache',
                true,
                null,
                'WEB',
                'Purging production Cloudflare cache',
                null,
                [{key: 'CF_API_KEY', value: '***'}],
            ),
        );
    } else {
        steps.push(
            utils.getStepAssertion(
                'Deploy staging to S3',
                true,
                null,
                'WEB',
                'Deploying staging to S3',
            ),
            utils.getStepAssertion(
                'Purge staging Cloudflare cache',
                true,
                null,
                'WEB',
                'Purging staging Cloudflare cache',
                null,
                [{key: 'CF_API_KEY', value: '***'}],
            ),
        );
    }

    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

const assertPostSlackOnFailureJobExecuted = (workflowResult, didExecute = true) => {
    const steps = [
        utils.getStepAssertion(
            'Post Slack message on failure',
            true,
            null,
            'POST_SLACK_FAIL',
            'Posting Slack message on platform deploy failure',
            [{key: 'SLACK_WEBHOOK', value: '***'}],
        ),
    ];

    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

const assertPostSlackOnSuccessJobExecuted = (workflowResult, didExecute = true, isProduction = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'POST_SLACK_SUCCESS',
            'Checking out',
        ),
        utils.getStepAssertion(
            'Set version',
            true,
            null,
            'POST_SLACK_SUCCESS',
            'Setting version',
        ),
        utils.getStepAssertion(
            'Announces the deploy in the #announce Slack room',
            true,
            null,
            'POST_SLACK_SUCCESS',
            'Posting message to #announce channel',
            [{key: 'status', value: 'custom'}, {key: 'custom_payload', value: isProduction ? '{\n  channel: \'#announce\',\n  attachments: [{\n    color: \'good\',\n    text: `🎉️ Successfully deployed App <https://github.com/Expensify/App/releases/tag/1.2.3|1.2.3> to production 🎉️`,\n  }]\n}' : '{\n  channel: \'#announce\',\n  attachments: [{\n    color: \'good\',\n    text: `🎉️ Successfully deployed App <https://github.com/Expensify/App/releases/tag/1.2.3|1.2.3> to staging 🎉️`,\n  }]\n}'}],
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'SLACK_WEBHOOK_URL', value: '***'}],
        ),
        utils.getStepAssertion(
            'Announces the deploy in the #deployer Slack room',
            true,
            null,
            'POST_SLACK_SUCCESS',
            'Posting message to #deployer channel',
            [{key: 'status', value: 'custom'}, {key: 'custom_payload', value: isProduction ? '{\n  channel: \'#announce\',\n  attachments: [{\n    color: \'good\',\n    text: `🎉️ Successfully deployed App <https://github.com/Expensify/App/releases/tag/1.2.3|1.2.3> to production 🎉️`,\n  }]\n}' : '{\n  channel: \'#announce\',\n  attachments: [{\n    color: \'good\',\n    text: `🎉️ Successfully deployed App <https://github.com/Expensify/App/releases/tag/1.2.3|1.2.3> to staging 🎉️`,\n  }]\n}'}],
            [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'SLACK_WEBHOOK_URL', value: '***'}],
        ),
    ];
    if (isProduction) {
        steps.push(
            utils.getStepAssertion(
                'Announces the deploy in the #expensify-open-source Slack room',
                true,
                null,
                'POST_SLACK_SUCCESS',
                'Posting message to #expensify-open-source channel',
                [{key: 'status', value: 'custom'}, {
                    key: 'custom_payload',
                    value: '{\n  channel: \'#announce\',\n  attachments: [{\n    color: \'good\',\n    text: `🎉️ Successfully deployed App <https://github.com/Expensify/App/releases/tag/1.2.3|1.2.3> to production 🎉️`,\n  }]\n}',
                }],
                [{key: 'GITHUB_TOKEN', value: '***'}, {key: 'SLACK_WEBHOOK_URL', value: '***'}],
            ),
        );
    }

    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

const assertPostGithubCommentJobExecuted = (workflowResult, didExecute = true, isProduction = true) => {
    const steps = [
        utils.getStepAssertion(
            'Checkout',
            true,
            null,
            'POST_GITHUB_COMMENT',
            'Checking out',
            [{key: 'fetch-depth', value: '0'}],
        ),
        utils.getStepAssertion(
            'Setup Node',
            true,
            null,
            'POST_GITHUB_COMMENT',
            'Setting up Node',
        ),
        utils.getStepAssertion(
            'Set version',
            true,
            null,
            'POST_GITHUB_COMMENT',
            'Setting version',
        ),
        utils.getStepAssertion(
            'Get Release Pull Request List',
            true,
            null,
            'POST_GITHUB_COMMENT',
            'Getting release pull request list',
            [{key: 'TAG', value: '1.2.3'}, {key: 'GITHUB_TOKEN', value: '***'}, {key: 'IS_PRODUCTION_DEPLOY', value: isProduction ? 'true' : 'false'}],
        ),
        utils.getStepAssertion(
            'Comment on issues',
            true,
            null,
            'POST_GITHUB_COMMENT',
            'Commenting on issues',
            [{key: 'PR_LIST', value: '[1.2.1, 1.2.2]'}, {key: 'IS_PRODUCTION_DEPLOY', value: isProduction ? 'true' : 'false'}, {key: 'DEPLOY_VERSION', value: '1.2.3'}, {key: 'GITHUB_TOKEN', value: '***'}, {key: 'ANDROID', value: 'success'}, {key: 'DESKTOP', value: ''}, {key: 'IOS', value: ''}, {key: 'WEB', value: 'success'}], // unsupported runners for desktop and ios
        ),
    ];

    if (didExecute) {
        expect(workflowResult).toEqual(expect.arrayContaining(steps));
    } else {
        expect(workflowResult).not.toEqual(expect.arrayContaining(steps));
    }
};

module.exports = {
    assertVerifyActorJobExecuted,
    assertAndroidJobExecuted,
    assertDesktopJobExecuted,
    assertIOSJobExecuted,
    assertWebJobExecuted,
    assertPostSlackOnFailureJobExecuted,
    assertPostSlackOnSuccessJobExecuted,
    assertPostGithubCommentJobExecuted,
};
